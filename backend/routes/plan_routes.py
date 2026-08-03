from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from database import get_db
from models import User, Plan
from schemas import PlanOut, PlanCreate
from auth import get_current_user, require_leader

router = APIRouter(prefix="/api/plans", tags=["plans"])


@router.get("/", response_model=list[PlanOut])
async def list_plans(
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(Plan).order_by(Plan.created_at.desc()))
    plans = result.scalars().all()
    return [
        PlanOut(
            id=p.id,
            title=p.title,
            content=p.content,
            created_at=p.created_at,
            updated_at=p.updated_at,
            author=p.user.username,
        )
        for p in plans
    ]


@router.get("/{plan_id}", response_model=PlanOut)
async def get_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    user: User = Depends(get_current_user),
):
    result = await db.execute(select(Plan).where(Plan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return PlanOut(
        id=plan.id,
        title=plan.title,
        content=plan.content,
        created_at=plan.created_at,
        updated_at=plan.updated_at,
        author=plan.user.username,
    )


@router.post("/", response_model=PlanOut)
async def create_plan(
    body: PlanCreate,
    db: AsyncSession = Depends(get_db),
    leader: User = Depends(require_leader),
):
    plan = Plan(
        user_id=leader.id,
        title=body.title,
        content=body.content,
    )
    db.add(plan)
    await db.commit()
    await db.refresh(plan)
    return PlanOut(
        id=plan.id,
        title=plan.title,
        content=plan.content,
        created_at=plan.created_at,
        updated_at=plan.updated_at,
        author=leader.username,
    )


@router.put("/{plan_id}", response_model=PlanOut)
async def update_plan(
    plan_id: int,
    body: PlanCreate,
    db: AsyncSession = Depends(get_db),
    leader: User = Depends(require_leader),
):
    result = await db.execute(select(Plan).where(Plan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    plan.title = body.title
    plan.content = body.content
    await db.commit()
    await db.refresh(plan)
    return PlanOut(
        id=plan.id,
        title=plan.title,
        content=plan.content,
        created_at=plan.created_at,
        updated_at=plan.updated_at,
        author=plan.user.username,
    )


@router.delete("/{plan_id}")
async def delete_plan(
    plan_id: int,
    db: AsyncSession = Depends(get_db),
    leader: User = Depends(require_leader),
):
    result = await db.execute(select(Plan).where(Plan.id == plan_id))
    plan = result.scalar_one_or_none()
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    await db.delete(plan)
    await db.commit()
    return {"ok": True}
