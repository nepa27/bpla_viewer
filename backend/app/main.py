from contextlib import asynccontextmanager

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from sqladmin import Admin

from .database import create_tables, async_engine
from backend.app.admin.admin import FlightAdmin, RegionAdmin, UploadView, UploadFileView
from backend.app.api.flights import router as flight_router
from backend.app.api.polygons import router as polygon_router
from backend.app.api.export import router as export_router


@asynccontextmanager
async def lifespan(app: FastAPI):
    print("Creating database tables...")
    await create_tables()
    print("Database tables created successfully!")
    yield


app = FastAPI(
    title="Flight API + Admin Panel",
    description="""
    ## Flight API
    API для управления данными о полетах дронов

    ## Админ-панель
    - URL: [/admin](http://localhost:8000/admin)
    - Доступные модели: Полеты (Flights), Регионы (Regions)
    - Функционал: CRUD операции, управление данными

    ## Документация
    - Swagger UI: [/docs](http://localhost:8000/docs)
    - ReDoc: [/redoc](http://localhost:8000/redoc)
    """,
    version="1.0.0",
    lifespan=lifespan,
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "OPTIONS", "DELETE", "PATCH", "PUT"],
    allow_headers=[
        "Content-Type",
        "Set-Cookie",
        "Access-Control-Allow-Headers",
        "Access-Control-Allow-Origin",
        "Authorization",
    ],
)

admin = Admin(
    app=app,
    engine=async_engine,
    title="Flight Admin",
)
admin.add_view(UploadView)
admin.add_view(UploadFileView)
admin.add_view(FlightAdmin)
admin.add_view(RegionAdmin)

app.include_router(flight_router)
app.include_router(polygon_router)
app.include_router(export_router)


@app.get("/health", description="Health check", tags=["Health check"])
async def health_check():
    return {"status": "healthy"}
