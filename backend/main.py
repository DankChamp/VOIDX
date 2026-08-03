import logging
from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy import text

from config import validate_config
from database import init_db, async_session
from routes.auth_routes import router as auth_router
from routes.user_routes import router as user_router
from routes.chat_routes import router as chat_router
from routes.forum_routes import router as forum_router
from routes.plan_routes import router as plan_router
from routes.announcement_routes import router as announcement_router
from routes.dashboard_routes import router as dashboard_router

logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
)
logger = logging.getLogger("voidx")


@asynccontextmanager
async def lifespan(app: FastAPI):
    validate_config()
    await init_db()
    logger.info("VOIDX backend started")
    yield


app = FastAPI(title="VOIDX", lifespan=lifespan)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(auth_router)
app.include_router(user_router)
app.include_router(chat_router)
app.include_router(forum_router)
app.include_router(plan_router)
app.include_router(announcement_router)
app.include_router(dashboard_router)


@app.get("/api/health")
async def health():
    try:
        async with async_session() as db:
            await db.execute(text("SELECT 1"))
        return {"status": "ok", "database": "connected"}
    except Exception as e:
        logger.error(f"Health check failed: {e}")
        return {"status": "error", "database": str(e)}
