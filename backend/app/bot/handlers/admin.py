from aiogram import Router, F, types
from app.db.database import AsyncSessionLocal
from app.models.models import Order, OrderStatus, OrderStatusHistory, User
from sqlalchemy import select
from app.bot.keyboards.admin_kb import get_status_change_keyboard, get_new_order_keyboard
from app.notifications.telegram import notify_customer_status_change

router = Router()

@router.callback_query(F.data.startswith("change_status_"))
async def change_status_prompt(callback: types.CallbackQuery):
    order_id = int(callback.data.split("_")[2])
    # Tizimdagi rolni tekshirish shartmi? Hozircha bu botga faqat admin yozadi deb faraz qilinadi, lekin aniqroq bo'lishi uchun
    # biz faqat buttonlarni yuborilgan message'ni o'zgartiramiz
    await callback.message.edit_reply_markup(reply_markup=get_status_change_keyboard(order_id))
    await callback.answer()

@router.callback_query(F.data.startswith("cancel_status_change_"))
async def cancel_status_change(callback: types.CallbackQuery):
    order_id = int(callback.data.split("_")[3])
    # Revert to original keyboard
    # In a real scenario we'd need customer TG ID if we want to restore the specific "Mijoz bilan bog'lanish" button perfectly,
    # but we can fetch it from DB.
    async with AsyncSessionLocal() as session:
        order = await session.get(Order, order_id)
        if order:
            customer = await session.get(User, order.customer_id)
            tg_id = customer.telegram_id if customer else None
            await callback.message.edit_reply_markup(reply_markup=get_new_order_keyboard(order_id, tg_id, order.customer_phone))
    await callback.answer()

@router.callback_query(F.data.startswith("set_status_"))
async def set_order_status(callback: types.CallbackQuery):
    # data format: set_status_{order_id}_{status_code}
    parts = callback.data.split("_")
    order_id = int(parts[2])
    status_code = "_".join(parts[3:])
    
    status_map = {
        "contacted": OrderStatus.CONTACTED,
        "confirmed": OrderStatus.CONFIRMED,
        "in_production": OrderStatus.IN_PRODUCTION,
        "ready": OrderStatus.READY,
        "delivering": OrderStatus.DELIVERING,
        "delivered": OrderStatus.DELIVERED,
        "cancelled": OrderStatus.CANCELLED,
    }
    
    new_status = status_map.get(status_code)
    if not new_status:
        await callback.answer("Noma'lum status!", show_alert=True)
        return
        
    async with AsyncSessionLocal() as session:
        order = await session.get(Order, order_id)
        if not order:
            await callback.answer("Buyurtma topilmadi!", show_alert=True)
            return
            
        order.status = new_status
        
        # Log history
        history = OrderStatusHistory(
            order_id=order.id,
            status=new_status,
            note="Bot orqali o'zgartirildi"
        )
        session.add(history)
        await session.commit()
        
        # Update message
        text = callback.message.text
        # Replace the old status text in the message if possible, or just append
        # For simplicity, we just notify
        # Restore keyboard & notify customer
        customer = None
        if order.customer_id:
            customer = await session.get(User, order.customer_id)
        if not customer and order.customer_phone:
            clean_phone = order.customer_phone.replace("+", "").replace(" ", "").strip()
            if len(clean_phone) >= 7:
                from sqlalchemy import select
                u_res = await session.execute(
                    select(User).filter(
                        (User.phone == order.customer_phone) |
                        (User.phone.endswith(clean_phone[-7:]))
                    )
                )
                customer = u_res.scalars().first()

        tg_id = customer.telegram_id if customer else None
        
        if tg_id:
            try:
                await notify_customer_status_change(
                    customer_telegram_id=tg_id,
                    order_number=order.order_number,
                    new_status=new_status.value,
                    note="Admin tomonidan o'zgartirildi"
                )
            except Exception as e:
                pass
                
        await callback.message.edit_reply_markup(reply_markup=get_new_order_keyboard(order_id, tg_id, order.customer_phone))
        await callback.answer(f"Holat yangilandi: {new_status.value}")
