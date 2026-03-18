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
from app.entities import vendor_account  # noqa: E402,F401
from app.entities import category  # noqa: E402,F401
from app.entities import login_otp  # noqa: E402,F401
from app.entities import payment  # noqa: E402,F401
from app.entities import ad  # noqa: E402,F401
from app.entities import ad_favorite  # noqa: E402,F401
from app.entities import ad_interaction  # noqa: E402,F401
from app.entities import ad_tier  # noqa: E402,F401
from app.entities import vendor_refresh_token  # noqa: E402,F401
from app.entities import admin_account  # noqa: E402,F401
from app.entities import game_user  # noqa: E402,F401
from app.entities import game_score  # noqa: E402,F401
from app.entities import referral_reward  # noqa: E402,F401
from app.entities import notification_installation  # noqa: E402,F401
from app.entities import notification_token  # noqa: E402,F401
from app.entities import notification_preference  # noqa: E402,F401
from app.entities import notification_delivery  # noqa: E402,F401
