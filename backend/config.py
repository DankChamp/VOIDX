import os
import sys
from dotenv import load_dotenv

load_dotenv()

GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")
SECRET_KEY = os.getenv("SECRET_KEY", "")
DATABASE_URL = os.getenv("DATABASE_URL", "sqlite+aiosqlite:///./voidx.db")
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 60 * 24 * 7
_FALLBACK_KEY = "dev-fallback-key-do-not-use-in-production"


def validate_config():
    global SECRET_KEY
    if not SECRET_KEY:
        print("WARNING: SECRET_KEY is not set. Using insecure fallback for development.", file=sys.stderr)
        print("Set SECRET_KEY in .env or environment variables.", file=sys.stderr)
        SECRET_KEY = _FALLBACK_KEY
