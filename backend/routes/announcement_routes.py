from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User, Announcement
from schemas import AnnouncementOut, AnnouncementCreate
from auth import get_current_user, require_leader

router = APIRouter(prefix="/api/announcements", tags=["announcements"])


@router.get("/", response_model=list[AnnouncementOut])
async def list_announcements(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(
        select(Announcement).order_by(Announcement.is_pinned.desc(), Announcement.created_at.desc())
    )
    announcements = result.scalars().all()
    return [
        AnnouncementOut(
            id=a.id,
            title=a.title,
            content=a.content,
            is_pinned=a.is_pinned,
            created_at=a.created_at,
            author=a.user.username,
        )
        for a in announcements
    ]


@router.post("/", response_model=AnnouncementOut)
async def create_announcement(
    body: AnnouncementCreate,
    db: AsyncSession = Depends(get_db),
    leader: User = Depends(require_leader),
):
    announcement = Announcement(
        user_id=leader.id,
        title=body.title,
        content=body.content,
        is_pinned=body.is_pinned,
    )
    db.add(announcement)
    await db.commit()
    await db.refresh(announcement)
    return AnnouncementOut(
        id=announcement.id,
        title=announcement.title,
        content=announcement.content,
        is_pinned=announcement.is_pinned,
        created_at=announcement.created_at,
        author=leader.username,
    )


@router.delete("/{announcement_id}")
async def delete_announcement(
    announcement_id: int,
    db: AsyncSession = Depends(get_db),
    leader: User = Depends(require_leader),
):
    result = await db.execute(select(Announcement).where(Announcement.id == announcement_id))
    announcement = result.scalar_one_or_none()
    if not announcement:
        raise HTTPException(status_code=404, detail="Announcement not found")
    await db.delete(announcement)
    await db.commit()
    return {"ok": True}
