from fastapi import Depends, HTTPException, status, Header
from fastapi.security import OAuth2PasswordBearer
from jose import jwt, JWTError
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select
from app.core.config import settings
from app.db.database import get_db
from app.models.models import User, UserRole
import urllib.parse
import hmac
import hashlib
import json

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/auth/login", auto_error=False)

def verify_telegram_web_app_data(init_data: str, bot_token: str) -> dict:
    """Verifies the init data from Telegram Web App."""
    try:
        parsed_data = dict(urllib.parse.parse_qsl(init_data))
        if "hash" not in parsed_data:
            return None
            
        hash_val = parsed_data.pop("hash")
        
        # Sort items
        data_check_string = "\n".join(
            f"{k}={v}" for k, v in sorted(parsed_data.items())
        )
        
        secret_key = hmac.new("WebAppData".encode(), bot_token.encode(), hashlib.sha256).digest()
        calculated_hash = hmac.new(secret_key, data_check_string.encode(), hashlib.sha256).hexdigest()
        
        if calculated_hash == hash_val:
            if "user" in parsed_data:
                return json.loads(parsed_data["user"])
    except Exception as e:
        pass
    return None

async def get_current_user(
    db: AsyncSession = Depends(get_db),
    x_telegram_init_data: str = Header(None),
    token: str = Depends(oauth2_scheme)
) -> User:
    # First, try to authenticate via Telegram Init Data (for customers)
    if x_telegram_init_data:
        user_data = verify_telegram_web_app_data(x_telegram_init_data, settings.BOT_TOKEN)
        if user_data and "id" in user_data:
            result = await db.execute(select(User).filter(User.telegram_id == user_data["id"]))
            user = result.scalars().first()
            if not user:
                user = User(
                    telegram_id=user_data["id"],
                    first_name=user_data.get("first_name", "Mijoz"),
                    last_name=user_data.get("last_name"),
                    username=user_data.get("username"),
                    role=UserRole.CUSTOMER
                )
                db.add(user)
                await db.commit()
                await db.refresh(user)
            return user
                
    # If not Telegram, try JWT (for admins or other purposes)
    if token:
        try:
            payload = jwt.decode(token, settings.JWT_SECRET, algorithms=[settings.ALGORITHM])
            username: str = payload.get("sub")
            if username:
                result = await db.execute(select(User).filter(User.username == username))
                user = result.scalars().first()
                if user:
                    return user
        except JWTError:
            pass
            
    raise HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )

async def get_optional_user(
    db: AsyncSession = Depends(get_db),
    x_telegram_init_data: str = Header(None),
    token: str = Depends(oauth2_scheme)
) -> User | None:
    try:
        return await get_current_user(db, x_telegram_init_data, token)
    except Exception:
        return None

async def get_current_admin(
    current_user: User = Depends(get_current_user)
) -> User:
    if current_user.role != UserRole.ADMIN:
        raise HTTPException(status_code=403, detail="The user doesn't have enough privileges")
    return current_user
