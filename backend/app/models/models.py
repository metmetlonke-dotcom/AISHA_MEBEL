from sqlalchemy import Column, Integer, String, Boolean, DateTime, ForeignKey, Text, Float, BigInteger, Enum as SQLEnum
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from app.db.base import Base
import enum

class UserRole(enum.Enum):
    CUSTOMER = "customer"
    ADMIN = "admin"

class OrderStatus(enum.Enum):
    NEW = "new"
    CONTACTED = "contacted"
    CONFIRMED = "confirmed"
    IN_PRODUCTION = "in_production"
    READY = "ready"
    DELIVERING = "delivering"
    DELIVERED = "delivered"
    CANCELLED = "cancelled"

class User(Base):
    __tablename__ = "users"
    id = Column(Integer, primary_key=True, index=True)
    telegram_id = Column(BigInteger, unique=True, index=True, nullable=True)
    username = Column(String, unique=True, index=True, nullable=True)
    password_hash = Column(String, nullable=True)
    role = Column(SQLEnum(UserRole), default=UserRole.CUSTOMER, nullable=False)
    
    first_name = Column(String, nullable=True)
    last_name = Column(String, nullable=True)
    phone = Column(String, nullable=True)
    address = Column(String, nullable=True)
    location_lat = Column(Float, nullable=True)
    location_lon = Column(Float, nullable=True)
    
    is_blocked = Column(Boolean, default=False)
    block_reason = Column(String, nullable=True)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    orders = relationship("Order", back_populates="customer", foreign_keys="Order.customer_id")
    favorites = relationship("Favorite", back_populates="user")
    cart_items = relationship("CartItem", back_populates="user")

class Category(Base):
    __tablename__ = "categories"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    icon = Column(String, nullable=True)
    sort_order = Column(Integer, default=0)
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    products = relationship("Product", back_populates="category")

class Product(Base):
    __tablename__ = "products"
    id = Column(Integer, primary_key=True, index=True)
    category_id = Column(Integer, ForeignKey("categories.id"), nullable=False)
    name = Column(String, nullable=False, index=True)
    description = Column(Text, nullable=True)
    price = Column(BigInteger, nullable=False)
    old_price = Column(BigInteger, nullable=True)
    
    dimensions = Column(String, nullable=True)
    material = Column(String, nullable=True)
    colors = Column(String, nullable=True)
    
    stock_quantity = Column(Integer, default=0)
    is_new = Column(Boolean, default=False)
    is_popular = Column(Boolean, default=False)
    is_promotion = Column(Boolean, default=False)
    
    delivery_info = Column(Text, nullable=True)
    assembly_info = Column(Text, nullable=True)
    
    is_active = Column(Boolean, default=True)
    is_deleted = Column(Boolean, default=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())

    category = relationship("Category", back_populates="products")
    images = relationship("ProductImage", back_populates="product", cascade="all, delete-orphan")
    favorites = relationship("Favorite", back_populates="product")

class ProductImage(Base):
    __tablename__ = "product_images"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    image_url = Column(String, nullable=False)
    is_main = Column(Boolean, default=False)
    sort_order = Column(Integer, default=0)
    
    product = relationship("Product", back_populates="images")

class Favorite(Base):
    __tablename__ = "favorites"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="favorites")
    product = relationship("Product", back_populates="favorites")

class CartItem(Base):
    __tablename__ = "cart_items"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    quantity = Column(Integer, default=1)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    user = relationship("User", back_populates="cart_items")
    product = relationship("Product")

class Order(Base):
    __tablename__ = "orders"
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    customer_address = Column(String, nullable=True)
    location_lat = Column(Float, nullable=True)
    location_lon = Column(Float, nullable=True)
    
    total_amount = Column(BigInteger, nullable=False)
    
    requires_delivery = Column(Boolean, default=False)
    requires_assembly = Column(Boolean, default=False)
    customer_note = Column(Text, nullable=True)
    internal_note = Column(Text, nullable=True)
    
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.NEW, nullable=False)
    estimated_ready_date = Column(DateTime(timezone=True), nullable=True)
    
    source = Column(String, default="telegram_bot") # telegram_bot, web_app, admin_manual
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    customer = relationship("User", back_populates="orders", foreign_keys=[customer_id])
    items = relationship("OrderItem", back_populates="order", cascade="all, delete-orphan")
    status_history = relationship("OrderStatusHistory", back_populates="order", cascade="all, delete-orphan")

class OrderItem(Base):
    __tablename__ = "order_items"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=True)
    
    product_name = Column(String, nullable=False)
    unit_price = Column(BigInteger, nullable=False)
    quantity = Column(Integer, nullable=False)
    subtotal = Column(BigInteger, nullable=False)
    
    order = relationship("Order", back_populates="items")
    product = relationship("Product")

class OrderStatusHistory(Base):
    __tablename__ = "order_status_history"
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("orders.id"), nullable=False)
    status = Column(SQLEnum(OrderStatus), nullable=False)
    note = Column(Text, nullable=True)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    order = relationship("Order", back_populates="status_history")
    created_by = relationship("User")

class StockMovement(Base):
    __tablename__ = "stock_movements"
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("products.id"), nullable=False)
    old_quantity = Column(Integer, nullable=False)
    new_quantity = Column(Integer, nullable=False)
    reason = Column(String, nullable=False)
    created_by_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    product = relationship("Product")
    created_by = relationship("User")

class Banner(Base):
    __tablename__ = "banners"
    id = Column(Integer, primary_key=True, index=True)
    title = Column(String, nullable=True)
    subtitle = Column(String, nullable=True)
    image_url = Column(String, nullable=False)
    button_text = Column(String, nullable=True)
    button_link = Column(String, nullable=True)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class FAQ(Base):
    __tablename__ = "faqs"
    id = Column(Integer, primary_key=True, index=True)
    question = Column(String, nullable=False)
    answer = Column(Text, nullable=False)
    is_active = Column(Boolean, default=True)
    sort_order = Column(Integer, default=0)
    created_at = Column(DateTime(timezone=True), server_default=func.now())

class SystemSetting(Base):
    __tablename__ = "settings"
    key = Column(String, primary_key=True, index=True)
    value = Column(Text, nullable=True)
    description = Column(String, nullable=True)

class AuditLog(Base):
    __tablename__ = "audit_logs"
    id = Column(Integer, primary_key=True, index=True)
    actor_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    action = Column(String, nullable=False)
    entity_name = Column(String, nullable=False)
    entity_id = Column(String, nullable=True)
    old_value = Column(Text, nullable=True)
    new_value = Column(Text, nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    actor = relationship("User")

class IndividualOrder(Base):
    __tablename__ = "individual_orders"
    id = Column(Integer, primary_key=True, index=True)
    customer_id = Column(Integer, ForeignKey("users.id"), nullable=True)
    
    customer_name = Column(String, nullable=False)
    customer_phone = Column(String, nullable=False)
    customer_address = Column(String, nullable=True)
    
    furniture_type = Column(String, nullable=True)
    dimensions = Column(String, nullable=True)
    material = Column(String, nullable=True)
    colors = Column(String, nullable=True)
    design = Column(String, nullable=True)
    quantity = Column(Integer, default=1)
    
    reference_image_url = Column(String, nullable=True)
    customer_note = Column(Text, nullable=True)
    internal_note = Column(Text, nullable=True)
    
    status = Column(SQLEnum(OrderStatus), default=OrderStatus.NEW, nullable=False)
    
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    updated_at = Column(DateTime(timezone=True), onupdate=func.now())
    
    customer = relationship("User", foreign_keys=[customer_id])
