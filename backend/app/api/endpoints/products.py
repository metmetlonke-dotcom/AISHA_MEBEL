from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, or_, and_, desc
from typing import List, Optional
from app.db.database import get_db
from app.models.models import Product, Category, ProductImage, Favorite
from app.schemas.schemas import ProductResponse, ProductCreate
from app.api.deps import get_current_admin

router = APIRouter()

@router.get("/", response_model=List[ProductResponse])
async def get_products(
    db: AsyncSession = Depends(get_db),
    skip: int = 0,
    limit: int = 50,
    category_id: Optional[int] = None,
    search: Optional[str] = None,
    is_new: Optional[bool] = None,
    is_popular: Optional[bool] = None,
    is_promotion: Optional[bool] = None,
    available: Optional[bool] = None
):
    query = select(Product).filter(Product.is_deleted == False, Product.is_active == True)
    
    if category_id:
        query = query.filter(Product.category_id == category_id)
    if search:
        query = query.filter(Product.name.ilike(f"%{search}%"))
    if is_new is not None:
        query = query.filter(Product.is_new == is_new)
    if is_popular is not None:
        query = query.filter(Product.is_popular == is_popular)
    if is_promotion is not None:
        query = query.filter(Product.is_promotion == is_promotion)
    if available is not None:
        if available:
            query = query.filter(Product.stock_quantity > 0)
        else:
            query = query.filter(Product.stock_quantity <= 0)
            
    # Include category and images
    # We will let sqlalchemy lazy load or we could eagerly load. For simplicity in async we should eagerly load:
    from sqlalchemy.orm import selectinload
    query = query.options(selectinload(Product.category), selectinload(Product.images))
    
    query = query.order_by(Product.id.desc()).offset(skip).limit(limit)
    
    result = await db.execute(query)
    return result.scalars().all()

@router.get("/{product_id}", response_model=ProductResponse)
async def get_product(product_id: int, db: AsyncSession = Depends(get_db)):
    from sqlalchemy.orm import selectinload
    result = await db.execute(
        select(Product)
        .filter(Product.id == product_id, Product.is_deleted == False)
        .options(selectinload(Product.category), selectinload(Product.images))
    )
    product = result.scalars().first()
    if not product:
        raise HTTPException(status_code=404, detail="Product not found")
    return product

# Admin endpoints
@router.post("/", response_model=ProductResponse)
async def create_product(
    product_in: ProductCreate, 
    db: AsyncSession = Depends(get_db),
    current_admin = Depends(get_current_admin)
):
    new_product = Product(**product_in.model_dump())
    db.add(new_product)
    await db.commit()
    await db.refresh(new_product)
    return new_product

# ... Add other CRUD ...
