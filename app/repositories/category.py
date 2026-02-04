from sqlalchemy.orm import Session

from app.entities.category import Category


class CategoryRepository:
    @staticmethod
    def get_by_id(db: Session, category_id: int) -> Category | None:
        return db.query(Category).filter(Category.id == category_id).first()

    @staticmethod
    def create(db: Session, name: str, description: str | None = None) -> Category:
        category = Category(name=name, description=description)
        db.add(category)
        db.commit()
        db.refresh(category)
        return category
