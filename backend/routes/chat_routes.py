import json
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, WebSocket, WebSocketDisconnect, Query, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db, async_session
from models import User, ChatMessage
from schemas import ChatMessageOut, ChatSend
from auth import get_current_user, verify_token_ws
from ai_sanitizer import sanitize_message

logger = logging.getLogger("voidx")
router = APIRouter(prefix="/api/chat", tags=["chat"])

active_connections: list[dict] = []


@router.get("/messages", response_model=list[ChatMessageOut])
async def get_messages(
    limit: int = 50,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    capped = min(limit, 200)
    result = await db.execute(
        select(ChatMessage).order_by(ChatMessage.created_at.desc()).limit(capped)
    )
    messages = result.scalars().all()
    messages.reverse()
    out = []
    for m in messages:
        out.append(ChatMessageOut(
            id=m.id,
            user_id=m.user_id,
            username=m.user.username,
            content_sanitized=m.content_sanitized,
            created_at=m.created_at,
        ))
    return out


async def broadcast_message(payload: dict):
    stale = []
    snapshot = list(active_connections)
    for conn in snapshot:
        try:
            await conn["ws"].send_text(json.dumps(payload))
        except Exception:
            logger.warning(f"Removing stale WebSocket connection")
            stale.append(conn)
    for conn in stale:
        try:
            active_connections.remove(conn)
        except ValueError:
            pass


async def verify_ws_user_allowed(user: User) -> bool:
    if user.role == "leader":
        return True
    async with async_session() as db:
        result = await db.execute(select(User).where(User.id == user.id))
        fresh = result.scalar_one_or_none()
        return fresh is not None and fresh.chat_allowed


_last_message_time: dict[int, float] = {}


def check_rate_limit(user_id: int) -> bool:
    now = datetime.now(timezone.utc).timestamp()
    last = _last_message_time.get(user_id, 0)
    if now - last < 1.0:
        return False
    _last_message_time[user_id] = now
    return True


@router.post("/send", response_model=ChatMessageOut)
async def send_message(
    body: ChatSend,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    if user.role != "leader" and not user.chat_allowed:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Chat access not granted")
    if not check_rate_limit(user.id):
        raise HTTPException(status_code=429, detail="Too many messages. Slow down.")
    sanitized = await sanitize_message(body.content)
    msg = ChatMessage(user_id=user.id, content_sanitized=sanitized)
    db.add(msg)
    await db.commit()
    await db.refresh(msg)

    payload = {
        "type": "message",
        "id": msg.id,
        "user_id": msg.user_id,
        "username": user.username,
        "content": sanitized,
        "created_at": msg.created_at.isoformat() if msg.created_at else "",
    }
    await broadcast_message(payload)

    return ChatMessageOut(
        id=msg.id,
        user_id=msg.user_id,
        username=user.username,
        content_sanitized=sanitized,
        created_at=msg.created_at,
    )


@router.websocket("/ws")
async def chat_websocket(websocket: WebSocket, token: str = Query(...)):
    async with async_session() as db:
        user = await verify_token_ws(token, db)
        if not user:
            await websocket.close(code=1008)
            return
        if user.role != "leader" and not user.chat_allowed:
            await websocket.close(code=1008, reason="Chat access not granted")
            return

        await websocket.accept()
        conn = {"ws": websocket, "user": user}
        active_connections.append(conn)

        try:
            last_permit_check = datetime.now(timezone.utc).timestamp()
            while True:
                raw = await websocket.receive_text()

                if datetime.now(timezone.utc).timestamp() - last_permit_check > 60:
                    if not await verify_ws_user_allowed(user):
                        await websocket.send_text(json.dumps({
                            "type": "error",
                            "message": "Chat access revoked by leader.",
                        }))
                        await websocket.close(code=1008, reason="Access revoked")
                        return
                    last_permit_check = datetime.now(timezone.utc).timestamp()

                try:
                    data = json.loads(raw)
                except json.JSONDecodeError:
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Invalid message format.",
                    }))
                    continue

                content = data.get("content", "")
                if not content.strip():
                    continue

                if not check_rate_limit(user.id):
                    await websocket.send_text(json.dumps({
                        "type": "error",
                        "message": "Too many messages. Slow down.",
                    }))
                    continue

                sanitized = await sanitize_message(content)

                msg = ChatMessage(user_id=user.id, content_sanitized=sanitized)
                db.add(msg)
                await db.commit()
                await db.refresh(msg)

                payload = {
                    "type": "message",
                    "id": msg.id,
                    "user_id": user.id,
                    "username": user.username,
                    "content": sanitized,
                    "created_at": msg.created_at.isoformat() if msg.created_at else "",
                }

                await broadcast_message(payload)
        except WebSocketDisconnect:
            pass
        except Exception as e:
            logger.warning(f"WebSocket error: {e}")
        finally:
            active_connections[:] = [c for c in active_connections if c.get("ws") != websocket]
