import logging

from fastapi import FastAPI
import uvicorn
import os
from dotenv import load_dotenv

from app.routes.foo import foo_router
load_dotenv()
app = FastAPI()


APPLICATION_HOST = os.getenv('APPLICATION_HOST', None)
APPLICATION_PORT = int(os.getenv('APPLICATION_PORT', None))

app.include_router(foo_router)


if __name__ == '__main__':
    print("APPLICATION_PORT", APPLICATION_PORT)
    print("APPLICATION_HOST", APPLICATION_HOST )
    uvicorn.run(app, host=APPLICATION_HOST, port=APPLICATION_PORT)