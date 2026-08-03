# syntax=docker/dockerfile:1
FROM python:3.12-slim AS base
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

WORKDIR /app

# Install deps first (layer cache). requirements.txt lives at backend/.
COPY backend/requirements.txt ./requirements.txt
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend source. Run as module from repo root so `backend.` imports resolve.
COPY backend/ ./backend/

# Seed data dir is created at runtime; make sure app can write voidx.db here.
ENV DATABASE_URL=sqlite+aiosqlite:///./voidx.db
EXPOSE 8000

# NOTE: do not run uvicorn in multiple workers with SQLite — keep concurrency to 1 proc.
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
