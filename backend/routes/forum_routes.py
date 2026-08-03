from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User, ForumThread, ForumReply
from schemas import ForumThreadCreate, ForumThreadOut, ForumThreadDetail, ForumReplyOut, ForumReplyCreate
from auth import get_current_user
from ai_sanitizer import sanitize_message

router = APIRouter(prefix="/api/forum", tags=["forum"])


@router.get("/threads", response_model=list[ForumThreadOut])
async def list_threads(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(
            ForumThread,
            func.count(ForumReply.id).label("reply_count"),
        )
        .outerjoin(ForumReply, ForumReply.thread_id == ForumThread.id)
        .group_by(ForumThread.id)
        .order_by(ForumThread.created_at.desc())
    )
    rows = result.all()
    out = []
    for thread, reply_count in rows:
        out.append(ForumThreadOut(
            id=thread.id,
            user_id=thread.user_id,
            username=thread.user.username,
            title=thread.title,
            content_sanitized=thread.content_sanitized,
            is_locked=thread.is_locked,
            created_at=thread.created_at,
            reply_count=reply_count,
        ))
    return out


@router.post("/threads", response_model=ForumThreadOut, status_code=status.HTTP_201_CREATED)
async def create_thread(
    body: ForumThreadCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    sanitized_title = await sanitize_message(body.title)
    sanitized_content = await sanitize_message(body.content)
    thread = ForumThread(
        user_id=user.id,
        title=sanitized_title,
        content_sanitized=sanitized_content,
    )
    db.add(thread)
    await db.commit()
    await db.refresh(thread)
    return ForumThreadOut(
        id=thread.id,
        user_id=thread.user_id,
        username=user.username,
        title=sanitized_title,
        content_sanitized=sanitized_content,
        is_locked=False,
        created_at=thread.created_at,
        reply_count=0,
    )


@router.get("/threads/{thread_id}", response_model=ForumThreadDetail)
async def get_thread(
    thread_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(ForumThread).where(ForumThread.id == thread_id))
    thread = result.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    replies_out = []
    for r in thread.replies:
        replies_out.append(ForumReplyOut(
            id=r.id,
            thread_id=r.thread_id,
            user_id=r.user_id,
            username=r.user.username,
            content_sanitized=r.content_sanitized,
            created_at=r.created_at,
        ))
    return ForumThreadDetail(
        id=thread.id,
        user_id=thread.user_id,
        username=thread.user.username,
        title=thread.title,
        content_sanitized=thread.content_sanitized,
        is_locked=thread.is_locked,
        created_at=thread.created_at,
        replies=replies_out,
    )


@router.post("/threads/{thread_id}/replies", response_model=ForumReplyOut, status_code=status.HTTP_201_CREATED)
async def reply_to_thread(
    thread_id: int,
    body: ForumReplyCreate,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(ForumThread).where(ForumThread.id == thread_id))
    thread = result.scalar_one_or_none()
    if not thread:
        raise HTTPException(status_code=404, detail="Thread not found")
    if thread.is_locked:
        raise HTTPException(status_code=403, detail="Thread is locked")
    sanitized = await sanitize_message(body.content)
    reply = ForumReply(
        thread_id=thread_id,
        user_id=user.id,
        content_sanitized=sanitized,
    )
    db.add(reply)
    await db.commit()
    await db.refresh(reply)
    return ForumReplyOut(
        id=reply.id,
        thread_id=reply.thread_id,
        user_id=reply.user_id,
        username=user.username,
        content_sanitized=sanitized,
        created_at=reply.created_at,
    )
