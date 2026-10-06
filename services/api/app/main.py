"""IGNIS FastAPI main application entrypoint (PRD v1.1 | ARCHITECTURE.md §4)."""

import uuid
from contextlib import asynccontextmanager
from typing import AsyncGenerator

from fastapi import FastAPI, Request
from fastapi.exceptions import RequestValidationError
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from starlette.middleware.base import BaseHTTPMiddleware

from .api.experiments import router as experiments_router
from .api.presets import router as presets_router
from .config import settings
from .errors import ErrorCode, IgnisException


class RequestIDMiddleware(BaseHTTPMiddleware):
    """Assigns an X-Request-ID header to every incoming HTTP request."""

    async def dispatch(self, request: Request, call_next):
        req_id = request.headers.get("x-request-id", str(uuid.uuid4()))
        request.state.request_id = req_id
        response = await call_next(request)
        response.headers["x-request-id"] = req_id
        return response


@asynccontextmanager
async def lifespan(app: FastAPI) -> AsyncGenerator[None, None]:
    """Startup and shutdown lifecycle."""
    yield


app = FastAPI(
    title=settings.PROJECT_NAME,
    version=settings.VERSION,
    description="Scientific Microgravity Combustion Intelligence Platform API",
    lifespan=lifespan,
)

# Cross-Origin Resource Sharing (CORS)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Request ID tracing middleware
app.add_middleware(RequestIDMiddleware)


# Exception Handlers
@app.exception_handler(IgnisException)
async def ignis_exception_handler(request: Request, exc: IgnisException):
    return JSONResponse(
        status_code=exc.status_code,
        content=exc.to_dict(),
    )


@app.exception_handler(RequestValidationError)
async def validation_exception_handler(request: Request, exc: RequestValidationError):
    return JSONResponse(
        status_code=422,
        content={
            "error": {
                "code": ErrorCode.VALIDATION_ERROR.value,
                "message": "Invalid request parameters or payload.",
                "details": {"errors": exc.errors()},
            }
        },
    )


@app.exception_handler(Exception)
async def unhandled_exception_handler(request: Request, exc: Exception):
    return JSONResponse(
        status_code=500,
        content={
            "error": {
                "code": ErrorCode.INTERNAL_SERVER_ERROR.value,
                "message": "An unexpected server error occurred.",
                "details": {"error_type": type(exc).__name__},
            }
        },
    )


# Health check
@app.get("/health", tags=["system"])
@app.get(f"{settings.API_V1_PREFIX}/health", tags=["system"])
async def health_check():
    return {
        "status": "healthy",
        "service": "IGNIS API",
        "version": settings.VERSION,
        "environment": settings.ENVIRONMENT,
    }


# Register v1 Routers
app.include_router(experiments_router, prefix=settings.API_V1_PREFIX)
app.include_router(presets_router, prefix=settings.API_V1_PREFIX)
