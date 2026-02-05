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

AWS_REGION = os.getenv("AWS_REGION", "us-east-1")

SMSCOUNTRY_API_KEY = os.getenv("SMSCOUNTRY_API_KEY", "")
SMSCOUNTRY_SENDER = os.getenv("SMSCOUNTRY_SENDER", "")
