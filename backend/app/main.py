from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.config import settings
from app.models.database import engine, Base
from app.routers import auth, entities, relationships, graph, transactions, cases, ai, audit

# Initialize Database Tables
Base.metadata.create_all(bind=engine)

app = FastAPI(
    title="CrimeGraph AI — AI-Powered Criminal Network Analysis System",
    description="Classified Law Enforcement & Intelligence Analysis Graph Platform. Connecting Evidence. Revealing Patterns. Supporting Investigations.",
    version="1.0.0",
    docs_url="/docs",
    redoc_url="/redoc"
)

# Enable CORS for Next.js frontend
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000", "http://127.0.0.1:3000", "*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Mount Routers
app.include_router(auth.router, prefix=settings.API_PREFIX)
app.include_router(entities.router, prefix=settings.API_PREFIX)
app.include_router(relationships.router, prefix=settings.API_PREFIX)
app.include_router(graph.router, prefix=settings.API_PREFIX)
app.include_router(transactions.router, prefix=settings.API_PREFIX)
app.include_router(cases.router, prefix=settings.API_PREFIX)
app.include_router(ai.router, prefix=settings.API_PREFIX)
app.include_router(audit.router, prefix=settings.API_PREFIX)

@app.get("/")
def root():
    return {
        "system": "CrimeGraph AI Analytical Engine",
        "status": "ONLINE // ALL SYSTEMS NOMINAL",
        "tagline": "Connecting Evidence. Revealing Patterns. Supporting Investigations.",
        "documentation": "/docs",
        "classification": "CONFIDENTIAL // LAW ENFORCEMENT SENSITIVE"
    }

@app.get("/health")
def health_check():
    return {"status": "healthy", "database": "connected"}
