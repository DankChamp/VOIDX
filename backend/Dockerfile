# syntax=docker/dockerfile:1
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# The backend uses flat imports (e.g. `from config import ...`) that only
# resolve when the process runs with backend/ on sys.path, i.e. from the
# backend/ directory. Mirror the dev command `cd backend && uvicorn main:app`.
WORKDIR /app/backend

# Install deps first for layer cache.
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source (and create script).
COPY backend/ ./

# Ensure a leader account exists (idempotent; only seeds on first run).
COPY backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

ENV DATABASE_URL=sqlite+aiosqlite:///./voidx.db
EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
