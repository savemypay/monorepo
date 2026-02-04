import os
from dotenv import load_dotenv

load_dotenv()

APPLICATION_HOST = os.getenv('APPLICATION_HOST', None)
APPLICATION_PORT = int(os.getenv('APPLICATION_PORT', None))

JWT_SECRET_KEY = os.getenv('JWT_SECRET_KEY', None)
JWT_ALGORITHM= os.getenv('JWT_ALGORITHM', None)
JWT_ACCESS_TOKEN_EXPIRE_MINUTES= int(os.getenv('JWT_ACCESS_TOKEN_EXPIRE_MINUTES', 30))


ALLOWED_ORIGINS = os.getenv(
    "ALLOWED_ORIGINS",
    "https://yourdomain.com"
).split(",")

ALLOWED_HOSTS = os.getenv(
    "ALLOWED_HOSTS",
    "yourdomain.com,localhost,127.0.0.1"
).split(",")
