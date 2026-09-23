from pydantic import BaseModel, ConfigDict
from typing import List, Optional, Any
from datetime import datetime
from app.models.models import UserRole, OrderStatus

# User Schemas
class UserBase(BaseModel):
    first_name: Optional[str] = None
    last_name: Optional[str] = None
    phone: Optional[str] = None
    address: Optional[str] = None
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None

class UserCreate(UserBase):
    telegram_id: int
    username: Optional[str] = None

class UserResponse(UserBase):
    id: int
    telegram_id: Optional[int]
    username: Optional[str]
    role: UserRole
    is_blocked: bool
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)

# Admin Schemas
class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: str

class AdminLogin(BaseModel):
    username: str
    password: str

# Category Schemas
class CategoryBase(BaseModel):
    name: str
    icon: Optional[str] = None
    sort_order: int = 0
    is_active: bool = True

class CategoryCreate(CategoryBase):
    pass

class CategoryResponse(CategoryBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)

# Product Schemas
class ProductImageBase(BaseModel):
    image_url: str
    is_main: bool = False
    sort_order: int = 0

class ProductImageResponse(ProductImageBase):
    id: int
    
    model_config = ConfigDict(from_attributes=True)

class ProductBase(BaseModel):
    name: str
    category_id: int
    price: int
    old_price: Optional[int] = None
    description: Optional[str] = None
    dimensions: Optional[str] = None
    material: Optional[str] = None
    colors: Optional[str] = None
    stock_quantity: int = 0
    is_new: bool = False
    is_popular: bool = False
    is_promotion: bool = False
    delivery_info: Optional[str] = None
    assembly_info: Optional[str] = None
    is_active: bool = True

class ProductCreate(ProductBase):
    pass

class ProductResponse(ProductBase):
    id: int
    category: Optional[CategoryResponse]
    images: List[ProductImageResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

# Order Schemas
class OrderItemCreate(BaseModel):
    product_id: int
    quantity: int

class OrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    customer_address: Optional[str] = None
    location_lat: Optional[float] = None
    location_lon: Optional[float] = None
    requires_delivery: bool = False
    requires_assembly: bool = False
    customer_note: Optional[str] = None
    items: List[OrderItemCreate]

class OrderItemResponse(BaseModel):
    id: int
    product_id: Optional[int] = None
    product_name: str
    unit_price: int
    quantity: int
    subtotal: int
    
    model_config = ConfigDict(from_attributes=True)

class OrderResponse(BaseModel):
    id: int
    order_number: str
    customer_name: str
    customer_phone: str
    customer_address: Optional[str] = None
    requires_delivery: bool = False
    requires_assembly: bool = False
    customer_note: Optional[str] = None
    total_amount: int
    status: OrderStatus
    created_at: datetime
    items: List[OrderItemResponse] = []
    
    model_config = ConfigDict(from_attributes=True)

class IndividualOrderCreate(BaseModel):
    customer_name: str
    customer_phone: str
    furniture_type: str
    dimensions: Optional[str] = None
    material: Optional[str] = None
    colors: Optional[str] = None
    design: Optional[str] = None
    quantity: int = 1
    reference_image_url: Optional[str] = None
    customer_note: Optional[str] = None

class IndividualOrderResponse(IndividualOrderCreate):
    id: int
    status: OrderStatus
    created_at: datetime
    
    model_config = ConfigDict(from_attributes=True)
