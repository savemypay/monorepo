import logging

from fastapi import FastAPI
import uvicorn

from app.core.config import APPLICATION_PORT, APPLICATION_HOST
from app.routes.foo import foo_router

app = FastAPI()
app.include_router(foo_router)

if __name__ == '__main__':
    print("APPLICATION_PORT", APPLICATION_PORT)
    print("APPLICATION_HOST", APPLICATION_HOST )
    uvicorn.run(app, host=APPLICATION_HOST, port=APPLICATION_PORT)