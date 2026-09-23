from pydantic import BaseModel
from app.models.models import OrderStatus

class OrderStatusUpdate(BaseModel):
    status: OrderStatus
    note: str = None
