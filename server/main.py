from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

from db.database import init_db
from routes.router import router

def create_app() -> FastAPI:
    app= FastAPI(
        title = 'DeepAuto ChatBot API',
        description = 'DeepAuto ChatBot API Server',
        version = '0.0.1'
    )
    app.include_router(router, prefix= "/api")
    app.add_middleware(
        CORSMiddleware,
        allow_origins= [
            'http://localhost:3000',
            'http://127.0.0.1:3000'
        ],
        allow_methods= ['*'],
        allow_headers= ['*']
    )
    return app

app = create_app()

@app.on_event("startup")
async def app_startup():
    await init_db()