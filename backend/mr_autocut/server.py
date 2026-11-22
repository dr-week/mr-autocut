"""FastAPI server for MR-AutoCut FilmCraft extension."""
from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from .api.routes_core import router as core_router
from .api.routes_engine import router as engine_router
from .api.routes_fx import router as fx_router
from .api.routes_media import router as media_router
from .api.routes_youtube import router as yt_router

app = FastAPI(title="MR-AutoCut Engine", version="0.4.0")
app.add_middleware(CORSMiddleware, allow_origins=["*"], allow_credentials=True, allow_methods=["*"], allow_headers=["*"])
for r in (core_router, media_router, engine_router, fx_router, yt_router): app.include_router(r)
