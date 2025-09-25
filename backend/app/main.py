from contextlib import asynccontextmanager

from fastapi import FastAPI

from .database import create_tables
from backend.app.api.flights import router as flight_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating database tables...")
    await create_tables()
    print("Database tables created successfully!")
    yield

app = FastAPI(
    title="Flight API",
    description="API для управления данными о полетах дронов",
    version="1.0.0",
    lifespan=lifespan
)

app.include_router(flight_router)

@app.get("/health", description='Health check', tags=['Health check'])
async def health_check():
    return {"status": "healthy"}
