"""
Main FastAPI Application for B2B Monetization API
Integrates all API routes and middleware
"""

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
import os
from contextlib import asynccontextmanager

from database.connection import init_db
from api.v1 import compatibility, partners

# Environment variables
ENVIRONMENT = os.getenv("ENVIRONMENT", "development")
ALLOWED_ORIGINS = os.getenv("ALLOWED_ORIGINS", "*").split(",")


@asynccontextmanager
async def lifespan(app: FastAPI):
    """Lifespan events for startup and shutdown"""
    # Startup
    print("Initializing database...")
    try:
        init_db()
        print("Database initialized successfully")
    except Exception as e:
        print(f"Warning: Database initialization failed: {e}")
        print("Continuing without database (for testing)")
    
    yield
    
    # Shutdown
    print("Shutting down...")


# Create FastAPI app
app = FastAPI(
    title="Soulmate Compatibility B2B API",
    description="B2B API for compatibility calculation, partner management, and monetization",
    version="1.0.0",
    lifespan=lifespan,
)

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=ALLOWED_ORIGINS if "*" not in ALLOWED_ORIGINS else ["*"],
    allow_credentials=True,
    allow_methods=["GET", "POST", "PUT", "DELETE", "PATCH"],
    allow_headers=["*"],
)


# Include API routers
app.include_router(compatibility.router)
app.include_router(partners.router)

# Import and include analytics and auth routers
try:
    from api.v1 import analytics, auth as auth_router
    app.include_router(analytics.router)
    app.include_router(auth_router.router)
except ImportError as e:
    print(f"Warning: Analytics or auth modules not available: {e}")

# Import Stripe webhook handler (optional)
try:
    from api.v1 import stripe_webhook
    app.include_router(stripe_webhook.router)
except ImportError as e:
    print(f"Warning: Stripe webhook module not available: {e}")


# Health check endpoint
@app.get("/")
async def root():
    """Root endpoint"""
    return {
        "message": "Soulmate Compatibility B2B API",
        "version": "1.0.0",
        "status": "running",
        "environment": ENVIRONMENT,
    }


@app.get("/health")
async def health():
    """Health check endpoint"""
    return {
        "status": "healthy",
        "service": "soulmate-b2b-api",
    }


# Error handlers
@app.exception_handler(404)
async def not_found_handler(request: Request, exc):
    return JSONResponse(
        status_code=404,
        content={"detail": "Endpoint not found"}
    )


@app.exception_handler(500)
async def internal_error_handler(request: Request, exc):
    return JSONResponse(
        status_code=500,
        content={"detail": "Internal server error"}
    )


if __name__ == "__main__":
    import uvicorn
    port = int(os.getenv("PORT", 8000))
    uvicorn.run(app, host="0.0.0.0", port=port)

