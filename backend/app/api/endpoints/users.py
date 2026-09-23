from fastapi import APIRouter, Depends
from app.schemas.schemas import UserResponse
from app.api.deps import get_current_user

router = APIRouter()

@router.get("/me", response_model=UserResponse)
async def get_me(current_user = Depends(get_current_user)):
    return current_user
