from sqlalchemy.orm import declarative_base

# Base class for all ORM models
Base = declarative_base()

# Import models here so Alembic can discover metadata for autogenerate
from app.models import admin  # noqa: E402,F401
