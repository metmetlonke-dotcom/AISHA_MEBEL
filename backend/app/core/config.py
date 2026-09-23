from pydantic_settings import BaseSettings, SettingsConfigDict
from typing import Optional

class Settings(BaseSettings):
    BOT_TOKEN: str
    DATABASE_URL: str
    REDIS_URL: str
    
    ADMIN_INITIAL_USERNAME: str
    ADMIN_INITIAL_PASSWORD: str
    
    SECRET_KEY: str
    JWT_SECRET: str
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 * 7 # 7 days
    
    # Comma-separated admin telegram IDs
    ADMIN_TELEGRAM_IDS: str = ""
    
    OBJECT_STORAGE_ENDPOINT: Optional[str] = None
    OBJECT_STORAGE_BUCKET: Optional[str] = None
    OBJECT_STORAGE_ACCESS_KEY: Optional[str] = None
    OBJECT_STORAGE_SECRET_KEY: Optional[str] = None
    
    COMPANY_TELEGRAM: str = "@zjxkdjbd"
    COMPANY_PHONE_1: str = "880606040"
    COMPANY_PHONE_2: str = "934124604"
    
    APP_URL: Optional[str] = None
    WEB_APP_URL: Optional[str] = None

    model_config = SettingsConfigDict(env_file=".env", env_file_encoding="utf-8", extra="ignore")

settings = Settings()
