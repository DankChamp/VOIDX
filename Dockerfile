# syntax=docker/dockerfile:1
FROM python:3.12-slim
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# The backend uses flat imports (e.g. `from config import ...`) that only
# resolve when run from the backend/ directory. This mirrors the dev command
# `cd backend && uvicorn main:app`. Build context = repo root, so COPY uses
# backend/ paths.
WORKDIR /app/backend

# Install deps first (layer cache).
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source + entrypoint.
COPY backend/ ./
COPY backend/entrypoint.sh /entrypoint.sh
RUN chmod +x /entrypoint.sh

# Idempotent: seeds the leader account on first boot, then serves.
ENV DATABASE_URL=sqlite+aiosqlite:///./voidx.db
EXPOSE 8000
ENTRYPOINT ["/entrypoint.sh"]
