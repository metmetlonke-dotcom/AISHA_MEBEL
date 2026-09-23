from aiogram import Router, F, types
from aiogram.filters.command import CommandStart
from aiogram.fsm.context import FSMContext
from aiogram.fsm.state import State, StatesGroup
from aiogram.types import ReplyKeyboardMarkup, KeyboardButton, ReplyKeyboardRemove

from app.bot.keyboards.customer_kb import get_main_menu_keyboard, get_contact_keyboard, get_back_keyboard
from app.db.database import AsyncSessionLocal
from app.models.models import User, UserRole
from sqlalchemy import select

router = Router()

class Registration(StatesGroup):
    waiting_for_name = State()
    waiting_for_phone = State()

async def get_or_create_user(session, telegram_id, message: types.Message):
    result = await session.execute(select(User).filter(User.telegram_id == telegram_id))
    user = result.scalars().first()
    if not user:
        user = User(
            telegram_id=telegram_id,
            username=message.from_user.username,
            role=UserRole.CUSTOMER
        )
        session.add(user)
        await session.flush()
    return user

async def show_main_menu(message: types.Message, name: str):
    from app.bot.handlers.admin_panel import is_admin
    admin_status = is_admin(message.from_user.id)
    
    text = (
        f"Assalomu alaykum, {name}!\n\n"
        "🏢 <b>AISHA MEBEL</b> botiga xush kelibsiz.\n"
        "Biz orqali eng zamonaviy va sifatli mebellarni xarid qilishingiz mumkin.\n\n"
        "👇 Iltimos, quyidagi menyudan kerakli bo'limni tanlang yoki to'g'ridan-to'g'ri Web App'ga kiring:"
    )
    await message.answer(text, reply_markup=get_main_menu_keyboard(is_admin_user=admin_status), parse_mode="HTML")

@router.message(CommandStart())
async def cmd_start(message: types.Message, state: FSMContext):
    async with AsyncSessionLocal() as session:
        user = await get_or_create_user(session, message.from_user.id, message)
        
        # If user has no phone or name, start registration
        if not user.first_name or not user.phone:
            await message.answer(
                "Assalomu alaykum! Xush kelibsiz.\n"
                "Iltimos, ism va familiyangizni kiriting:",
                reply_markup=ReplyKeyboardRemove()
            )
            await state.set_state(Registration.waiting_for_name)
            await session.commit()
            return
            
        await session.commit()
        await show_main_menu(message, user.first_name)

@router.message(Registration.waiting_for_name)
async def process_name(message: types.Message, state: FSMContext):
    name = message.text.strip()
    if len(name) < 2:
        await message.answer("Iltimos, to'liqroq ism kiriting.")
        return

    async with AsyncSessionLocal() as session:
        user = await get_or_create_user(session, message.from_user.id, message)
        user.first_name = name
        await session.commit()

    kb = ReplyKeyboardMarkup(
        keyboard=[[KeyboardButton(text="📱 Telefon raqamni yuborish", request_contact=True)]],
        resize_keyboard=True,
        one_time_keyboard=True
    )
    await message.answer(
        "Rahmat! Endi buyurtmalaringizni yetkazib berish uchun telefon raqamingizni yuboring:",
        reply_markup=kb
    )
    await state.set_state(Registration.waiting_for_phone)

@router.message(Registration.waiting_for_phone, F.contact)
async def process_phone(message: types.Message, state: FSMContext):
    phone = message.contact.phone_number
    
    async with AsyncSessionLocal() as session:
        user = await get_or_create_user(session, message.from_user.id, message)
        user.phone = phone
        name = user.first_name
        await session.commit()

    await state.clear()
    
    # Remove reply keyboard
    msg = await message.answer("Ma'lumotlaringiz saqlandi! 🎉", reply_markup=ReplyKeyboardRemove())
    await msg.delete() # Clean up the "saqlandi" message quietly
    
    await show_main_menu(message, name)

@router.message(Registration.waiting_for_phone)
async def process_phone_invalid(message: types.Message):
    await message.answer("Iltimos, pastdagi '📱 Telefon raqamni yuborish' tugmasini bosing.")

@router.callback_query(F.data == "about_us")
async def about_us_handler(callback: types.CallbackQuery):
    text = (
        "🏢 <b>AISHA MEBEL</b> haqida\n\n"
        "Biz 8 yillik tajribaga ega bo'lgan mebel ishlab chiqaruvchi kompaniyamiz.\n"
        "Andijon viloyati, Izboskan tumanida joylashgan fabrikamiz orqali barcha turdagi mebellarni:\n"
        "🛏️ Yotoqxona\n"
        "🍽️ Oshxona\n"
        "🚪 Shkaf va boshqalarni tayyorlaymiz.\n\n"
        "Mijozlarimiz uchun eng yuqori sifat va tezkor xizmatni kafolatlaymiz!"
    )
    await callback.message.edit_text(text, reply_markup=get_back_keyboard(), parse_mode="HTML")

@router.callback_query(F.data == "contact_us")
async def contact_us_handler(callback: types.CallbackQuery):
    text = (
        "📞 <b>Biz bilan aloqa</b>\n\n"
        "📍 <b>Manzil:</b> Andijon viloyati, Izboskan tumani, Poytug' shahri\n"
        "⏰ <b>Ish vaqti:</b> 08:00 - 18:00\n\n"
        "📱 <b>Telefonlar:</b>\n"
        "+998 88 060 60 40\n"
        "+998 93 412 46 04\n\n"
        "Savollaringiz bo'lsa, bemalol murojaat qiling!"
    )
    await callback.message.edit_text(text, reply_markup=get_contact_keyboard(), parse_mode="HTML")

@router.callback_query(F.data == "back_to_main")
async def back_to_main_handler(callback: types.CallbackQuery):
    async with AsyncSessionLocal() as session:
        result = await session.execute(select(User).filter(User.telegram_id == callback.from_user.id))
        user = result.scalars().first()
        name = user.first_name if user else callback.from_user.full_name
        
    from app.bot.handlers.admin_panel import is_admin
    admin_status = is_admin(callback.from_user.id)
        
    text = (
        f"Assalomu alaykum, {name}!\n\n"
        "🏢 <b>AISHA MEBEL</b> botiga xush kelibsiz.\n"
        "Biz orqali eng zamonaviy va sifatli mebellarni xarid qilishingiz mumkin.\n\n"
        "👇 Iltimos, quyidagi menyudan kerakli bo'limni tanlang yoki to'g'ridan-to'g'ri Web App'ga kiring:"
    )
    await callback.message.edit_text(text, reply_markup=get_main_menu_keyboard(is_admin_user=admin_status), parse_mode="HTML")
