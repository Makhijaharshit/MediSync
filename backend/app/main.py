import os
import sys

# Configure PaddleOCR cache paths inside project root before any dependencies load
_project_root = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
os.environ.setdefault("PADDLE_PDX_CACHE_HOME", os.path.join(_project_root, ".paddlex"))
os.environ.setdefault("PADDLE_HOME", os.path.join(_project_root, ".paddle"))
os.environ.setdefault("PADDLE_PDX_DISABLE_MODEL_SOURCE_CHECK", "True")
os.makedirs(os.environ["PADDLE_PDX_CACHE_HOME"], exist_ok=True)
os.makedirs(os.environ["PADDLE_HOME"], exist_ok=True)

from contextlib import asynccontextmanager
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from backend.app.core.config import settings
from backend.app.core.database import engine, Base, SessionLocal
from backend.app.db.seed import init_db
from backend.app.routers import auth, documents, timeline, emergency, doctor, audit

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Initialize database tables and seed single admin account into PostgreSQL
    init_db()
    yield

app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    lifespan=lifespan,
    docs_url="/api/docs",
    redoc_url="/api/redoc",
    openapi_url="/api/openapi.json",
)

# CORS Middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Include Routers
app.include_router(auth.router, prefix=settings.API_V1_STR)
app.include_router(documents.router, prefix=settings.API_V1_STR)
app.include_router(timeline.router, prefix=settings.API_V1_STR)
app.include_router(emergency.router, prefix=settings.API_V1_STR)
app.include_router(doctor.router, prefix=settings.API_V1_STR)
app.include_router(audit.router, prefix=settings.API_V1_STR)

@app.get("/")
def root():
    return {
        "status": "healthy",
        "service": "MedSync Clinical Platform API",
        "version": settings.VERSION,
        "docs": "/api/docs"
    }

@app.get("/health")
def health_check():
    return {"status": "ok"}
