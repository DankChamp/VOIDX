from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User
from schemas import UserCreate, UserUpdate, UserOut
from auth import hash_password, get_current_user, require_leader

router = APIRouter(prefix="/api/users", tags=["users"])


@router.get("/", response_model=list[UserOut])
async def list_users(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(require_leader),
):
    result = await db.execute(select(User).order_by(User.created_at.desc()))
    users = result.scalars().all()
    return [UserOut.model_validate(u) for u in users]


@router.post("/", response_model=UserOut, status_code=status.HTTP_201_CREATED)
async def create_user(
    body: UserCreate,
    db: AsyncSession = Depends(get_db),
    leader: User = Depends(require_leader),
):
    if len(body.username.strip()) < 2:
        raise HTTPException(status_code=400, detail="Username must be at least 2 characters")
    if len(body.password) < 4:
        raise HTTPException(status_code=400, detail="Password must be at least 4 characters")
    existing = await db.execute(select(User).where(User.username == body.username.strip()))
    if existing.scalar_one_or_none():
        raise HTTPException(status_code=400, detail="Username already exists")
    user = User(
        username=body.username.strip(),
        password_hash=hash_password(body.password),
        role="member",
        chat_allowed=body.chat_allowed,
    )
    db.add(user)
    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)


@router.patch("/{user_id}", response_model=UserOut)
async def update_user(
    user_id: int,
    body: UserUpdate,
    db: AsyncSession = Depends(get_db),
    leader: User = Depends(require_leader),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if body.chat_allowed is not None:
        user.chat_allowed = body.chat_allowed
    await db.commit()
    await db.refresh(user)
    return UserOut.model_validate(user)


@router.delete("/{user_id}", status_code=status.HTTP_204_NO_CONTENT)
async def delete_user(
    user_id: int,
    db: AsyncSession = Depends(get_db),
    leader: User = Depends(require_leader),
):
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        raise HTTPException(status_code=404, detail="User not found")
    if user.role == "leader":
        raise HTTPException(status_code=400, detail="Cannot delete the leader")
    await db.delete(user)
    await db.commit()
