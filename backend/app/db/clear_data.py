import asyncio
from sqlalchemy import delete
from app.db.database import AsyncSessionLocal
from app.models.models import Category, Product, ProductImage

async def clear_data():
    async with AsyncSessionLocal() as session:
        await session.execute(delete(ProductImage))
        await session.execute(delete(Product))
        await session.execute(delete(Category))
        await session.commit()
        print("All demo products and categories deleted successfully.")

if __name__ == "__main__":
    asyncio.run(clear_data())
