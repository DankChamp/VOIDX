import asyncio
import sys

from database import init_db, async_session
from models import User
from auth import hash_password


async def seed():
    await init_db()
    async with async_session() as session:
        from sqlalchemy import select
        result = await session.execute(select(User).where(User.role == "leader"))
        if result.scalar_one_or_none():
            print("Leader account already exists.")
            return

        import secrets
        password = secrets.token_urlsafe(12)
        user = User(
            username="voidx",
            password_hash=hash_password(password),
            role="leader",
            chat_allowed=True,
        )
        session.add(user)
        await session.commit()
        print(f"Leader account created:")
        print(f"  Username: voidx")
        print(f"  Password: {password}")
        print(f"  SAVE THIS PASSWORD — it will not be shown again.")


if __name__ == "__main__":
    asyncio.run(seed())
