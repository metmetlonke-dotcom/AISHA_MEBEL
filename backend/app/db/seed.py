import asyncio
from app.db.database import engine
from app.models.models import Base

async def seed_database():
    # Only ensure tables are created, do not insert fake data
    async with engine.begin() as conn:
        await conn.run_sync(Base.metadata.create_all)
    print("Database tables initialized cleanly without demo data.")

if __name__ == "__main__":
    asyncio.run(seed_database())
