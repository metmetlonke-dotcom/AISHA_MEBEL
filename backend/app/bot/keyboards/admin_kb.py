from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton
from aiogram.utils.keyboard import InlineKeyboardBuilder
from app.core.config import settings

def get_new_order_keyboard(order_id: int, customer_telegram_id: int = None, phone: str = None) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    
    app_url = settings.APP_URL or "https://admin.aisha-mebel.uz"
    
    # 👤 Mijoz bilan bog‘lanish (Telegram url if customer_telegram_id exists)
    if customer_telegram_id:
        builder.row(InlineKeyboardButton(text="👤 Mijoz bilan bog‘lanish", url=f"tg://user?id={customer_telegram_id}"))
    
    # 📞 Qo‘ng‘iroq qilish
    if phone:
        # We can't really make a direct call button, but we can just display the number or use url tel:
        # Telegram client usually handles tel: links poorly in inline buttons, better to just let them copy from text, 
        # but let's try a share link or just skip the button since the number is in text. 
        # Actually URL with tel: works on some clients. Let's omit and just use the text.
        pass
        
    # 🔄 Statusni o‘zgartirish (Callback)
    builder.row(InlineKeyboardButton(text="🔄 Statusni o‘zgartirish", callback_data=f"change_status_{order_id}"))
    
    return builder.as_markup()

def get_main_admin_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="📊 Statistika", callback_data="admin_stats"))
    builder.row(
        InlineKeyboardButton(text="🗂 Kategoriyalar", callback_data="admin_cats"),
        InlineKeyboardButton(text="🛋 Mahsulotlar", callback_data="admin_prods")
    )
    builder.row(InlineKeyboardButton(text="🗑 Barcha ma'lumotlarni tozalash", callback_data="admin_purge_data"))
    return builder.as_markup()

def get_cancel_admin_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="❌ Bekor qilish", callback_data="admin_cancel"))
    return builder.as_markup()

def get_status_change_keyboard(order_id: int) -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    # Statuslar: NEW, CONTACTED, CONFIRMED, IN_PRODUCTION, READY, DELIVERING, DELIVERED, CANCELLED
    statuses = [
        ("📞 Bog‘lanildi", "contacted"),
        ("✅ Tasdiqlandi", "confirmed"),
        ("🔨 Ishlab chiqarilmoqda", "in_production"),
        ("📦 Tayyor", "ready"),
        ("🚚 Yetkazilmoqda", "delivering"),
        ("✅ Yetkazildi", "delivered"),
        ("❌ Bekor qilish", "cancelled")
    ]
    
    for text, status_code in statuses:
        builder.row(InlineKeyboardButton(text=text, callback_data=f"set_status_{order_id}_{status_code}"))
        
    builder.row(InlineKeyboardButton(text="◀️ Bekor qilish", callback_data=f"cancel_status_change_{order_id}"))
    return builder.as_markup()
