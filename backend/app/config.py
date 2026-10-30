import os
from pydantic import BaseModel

class Settings(BaseModel):
    PROJECT_NAME: str = "CrimeGraph AI Backend"
    VERSION: str = "1.0.0"
    API_PREFIX: str = "/api"
    
    # Database: Default to local SQLite fallback if PostgreSQL is not specified
    DATABASE_URL: str = os.getenv("DATABASE_URL", "sqlite:///./crimegraph.db")
    
    # Security & JWT
    SECRET_KEY: str = os.getenv("SECRET_KEY", "crimegraph-ai-classified-super-secret-key-314a")
    ALGORITHM: str = "HS256"
    ACCESS_TOKEN_EXPIRE_MINUTES: int = 60 * 24 # 24 hours
    
    # Optional LLM Key
    OPENAI_API_KEY: str = os.getenv("OPENAI_API_KEY", "")
    
    # Environment
    DEMO_MODE: bool = os.getenv("DEMO_MODE", "true").lower() == "true"

settings = Settings()
