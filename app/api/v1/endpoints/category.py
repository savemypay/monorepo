from fastapi import APIRouter, Depends, status
from sqlalchemy.orm import Session

from app.api.dependencies import get_db
from app.repositories.category import CategoryRepository
from app.utils.response import success_response

router = APIRouter(prefix="/categories", tags=["categories"])


@router.get("", status_code=status.HTTP_200_OK)
def list_categories(db: Session = Depends(get_db)):
    categories = CategoryRepository.list_all(db)
    data = [
        {
            "id": c.id,
            "name": c.name,
            "description": c.description,
        }
        for c in categories
    ]
    return success_response(data=data, message="Categories fetched")
