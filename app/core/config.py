import os
from dotenv import load_dotenv

load_dotenv()

APPLICATION_HOST = os.getenv("APPLICATION_HOST", "0.0.0.0")
APPLICATION_PORT = int(os.getenv("APPLICATION_PORT", "8001"))

DATABASE_URL = os.getenv("DATABASE_URL", "sqlite:///./app.db")

ROOT_PATH = os.getenv("ROOT_PATH", "")

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY", "change_me")
JWT_ALGORITHM = os.getenv("JWT_ALGORITHM", "HS256")
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))

ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "http://localhost:3000,http://127.0.0.1:3000"
).split(",")

ALLOWED_HOSTS = os.getenv(
    "ALLOWED_HOSTS",
    "localhost,127.0.0.1"
).split(",")

# Notification settings
SMS_PROVIDER = os.getenv("SMS_PROVIDER", "console")  # options: sns, smscountry, console
EMAIL_PROVIDER = os.getenv("EMAIL_PROVIDER", "console")  # options: ses, console
PUSH_PROVIDER = os.getenv("PUSH_PROVIDER", "console")  # options: firebase, console
REALTIME_PROVIDER = os.getenv("REALTIME_PROVIDER", "noop")  # options: websocket, noop
FIREBASE_PROJECT_ID = os.getenv("FIREBASE_PROJECT_ID", "")
FIREBASE_CREDENTIALS_FILE = os.getenv("FIREBASE_CREDENTIALS_FILE", "")
FIREBASE_CREDENTIALS_JSON = os.getenv("FIREBASE_CREDENTIALS_JSON", "")
NOTIFICATION_BATCH_SIZE = int(os.getenv("NOTIFICATION_BATCH_SIZE", "100"))
NOTIFICATION_MAX_DELIVERY_ATTEMPTS = int(os.getenv("NOTIFICATION_MAX_DELIVERY_ATTEMPTS", "3"))

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")
FROM_EMAIL = os.getenv("FROM_EMAIL", "")

SMSCOUNTRY_API_KEY = os.getenv("SMSCOUNTRY_API_KEY", "")
SMSCOUNTRY_SENDER = os.getenv("SMSCOUNTRY_SENDER", "")

# OTP settings
OTP_TTL_MINUTES = int(os.getenv("OTP_TTL_MINUTES", "5"))
OTP_RESEND_COOLDOWN_SECONDS = int(os.getenv("OTP_RESEND_COOLDOWN_SECONDS", "30"))
OTP_MAX_ATTEMPTS = int(os.getenv("OTP_MAX_ATTEMPTS", "5"))
OTP_CODE_LENGTH = int(os.getenv("OTP_CODE_LENGTH", "6"))
OTP_PEPPER = os.getenv("OTP_PEPPER", "")

# JWT / Refresh tokens
JWT_ACCESS_TOKEN_EXPIRE_MINUTES = int(os.getenv("JWT_ACCESS_TOKEN_EXPIRE_MINUTES", "30"))
REFRESH_TOKEN_EXPIRE_DAYS = int(os.getenv("REFRESH_TOKEN_EXPIRE_DAYS", "30"))
REFRESH_TOKEN_PEPPER = os.getenv("REFRESH_TOKEN_PEPPER", "")
REGISTER_REFERRAL_POINTS = int(os.getenv("REGISTER_REFERRAL_POINTS", "10"))

# Game auth settings
GAME_ACCESS_TOKEN_EXPIRE_DAYS = int(os.getenv("GAME_ACCESS_TOKEN_EXPIRE_DAYS", "3650"))
GAME_LEADERBOARD_CACHE_TTL_SECONDS = int(os.getenv("GAME_LEADERBOARD_CACHE_TTL_SECONDS", "10"))

# Payment providers
PAYMENT_PROVIDER = os.getenv("PAYMENT_PROVIDER", "mock")  # options: stripe, razorpay, adyen, mock
PAYMENT_IDEMPOTENCY_HEADER = os.getenv("PAYMENT_IDEMPOTENCY_HEADER", "Idempotency-Key")
PAYMENT_CURRENCY = os.getenv("PAYMENT_CURRENCY", "INR")

# Stripe settings
STRIPE_API_KEY = os.getenv("STRIPE_API_KEY", "")
STRIPE_WEBHOOK_SECRET = os.getenv("STRIPE_WEBHOOK_SECRET", "")

# Razorpay settings
RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID", "")
RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET", "")
RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET", "")

# S3 uploads
S3_BUCKET = os.getenv("S3_BUCKET", "")
S3_PUBLIC_BASE_URL = os.getenv("S3_PUBLIC_BASE_URL", "")
