import asyncio
from app.db.database import AsyncSessionLocal
from app.models.models import User, UserRole
from app.core.security import get_password_hash
from app.core.config import settings

async def create_admin():
    async with AsyncSessionLocal() as session:
        # Check if admin already exists
        from sqlalchemy import select
        result = await session.execute(select(User).filter(User.username == settings.ADMIN_INITIAL_USERNAME))
        admin = result.scalars().first()
        if not admin:
            if not settings.ADMIN_INITIAL_PASSWORD:
                print("ADMIN_INITIAL_PASSWORD is not set in environment.")
                return
            new_admin = User(
                username=settings.ADMIN_INITIAL_USERNAME,
                password_hash=get_password_hash(settings.ADMIN_INITIAL_PASSWORD),
                role=UserRole.ADMIN,
                first_name="Rahbar"
            )
            session.add(new_admin)
            await session.commit()
            print("Admin created successfully.")
        else:
            print("Admin already exists.")

if __name__ == "__main__":
    asyncio.run(create_admin())
