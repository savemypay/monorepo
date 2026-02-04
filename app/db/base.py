from sqlalchemy.orm import declarative_base

# Base class for all ORM models
Base = declarative_base()

# Import models here so Alembic can discover metadata for autogenerate
from app.entities import admin  # noqa: E402,F401
from app.entities import user  # noqa: E402,F401
from app.entities import role  # noqa: E402,F401
from app.entities import user_role  # noqa: E402,F401
from app.entities import refresh_token  # noqa: E402,F401
from app.entities import password_reset  # noqa: E402,F401
from app.entities import customer_interest  # noqa: E402,F401
from app.entities import vendor  # noqa: E402,F401
from app.entities import category  # noqa: E402,F401
