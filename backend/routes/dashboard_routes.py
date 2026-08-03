from fastapi import APIRouter, Depends
from sqlalchemy import select, func
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User, Announcement, Plan
from schemas import DashboardOut
from auth import get_current_user

router = APIRouter(prefix="/api/dashboard", tags=["dashboard"])


@router.get("/", response_model=DashboardOut)
async def get_dashboard(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    member_count_result = await db.execute(select(func.count(User.id)))
    member_count = member_count_result.scalar() or 0

    announcement_result = await db.execute(select(func.count(Announcement.id)))
    announcement_count = announcement_result.scalar() or 0

    plan_result = await db.execute(select(func.count(Plan.id)))
    plan_count = plan_result.scalar() or 0

    return DashboardOut(
        member_count=member_count,
        announcement_count=announcement_count,
        plan_count=plan_count,
    )
