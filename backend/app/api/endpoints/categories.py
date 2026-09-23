from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from typing import List
from app.db.database import get_db
from app.models.models import Category
from app.schemas.schemas import CategoryResponse, CategoryCreate
from app.api.deps import get_current_admin

router = APIRouter()

@router.get("/", response_model=List[CategoryResponse])
async def get_categories(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Category)
        .filter(Category.is_deleted == False, Category.is_active == True)
        .order_by(Category.sort_order)
    )
    return result.scalars().all()

@router.post("/", response_model=CategoryResponse)
async def create_category(
    category_in: CategoryCreate, 
    db: AsyncSession = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    new_category = Category(**category_in.model_dump())
    db.add(new_category)
    await db.commit()
    await db.refresh(new_category)
    return new_category
