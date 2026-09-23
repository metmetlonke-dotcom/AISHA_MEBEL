import time
from aiogram.types import InlineKeyboardMarkup, InlineKeyboardButton, WebAppInfo
from aiogram.utils.keyboard import InlineKeyboardBuilder, ReplyKeyboardBuilder
from app.core.config import settings

def get_main_menu_keyboard(is_admin_user: bool = False) -> InlineKeyboardMarkup:
    base_url = settings.WEB_APP_URL or "https://google.com" # Fallback for local
    v = int(time.time())
    
    builder = InlineKeyboardBuilder()
    
    # Katta CTA
    builder.row(InlineKeyboardButton(text="🛍 WEB APP'NI OCHISH", web_app=WebAppInfo(url=f"{base_url}?v={v}")))
    
    # Asosiy menyu
    builder.row(
        InlineKeyboardButton(text="🛍 Katalog", web_app=WebAppInfo(url=f"{base_url}/catalog?v={v}")),
        InlineKeyboardButton(text="📐 Individual buyurtma", web_app=WebAppInfo(url=f"{base_url}/custom-order?v={v}"))
    )
    builder.row(
        InlineKeyboardButton(text="🛒 Savatcha", web_app=WebAppInfo(url=f"{base_url}/cart?v={v}")),
        InlineKeyboardButton(text="📦 Buyurtmalarim", web_app=WebAppInfo(url=f"{base_url}/orders?v={v}"))
    )
    
    # Info
    builder.row(
        InlineKeyboardButton(text="🏢 Biz haqimizda", callback_data="about_us"),
        InlineKeyboardButton(text="📞 Aloqa", callback_data="contact_us")
    )
    
    if is_admin_user:
        builder.row(InlineKeyboardButton(text="⚙️ Admin Panel", callback_data="open_admin_panel"))
        
    return builder.as_markup()

def get_contact_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="💬 Telegramga yozish", url=f"https://t.me/{settings.COMPANY_TELEGRAM.replace('@', '')}"))
    builder.row(InlineKeyboardButton(text="📍 Xaritada ochish", url="https://maps.google.com/?q=Andijon,Izboskan,Poytug"))
    builder.row(InlineKeyboardButton(text="◀️ Orqaga", callback_data="back_to_main"))
    return builder.as_markup()

def get_back_keyboard() -> InlineKeyboardMarkup:
    builder = InlineKeyboardBuilder()
    builder.row(InlineKeyboardButton(text="◀️ Orqaga", callback_data="back_to_main"))
    return builder.as_markup()
