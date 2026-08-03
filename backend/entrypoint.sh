#!/bin/sh
set -e
# Seed once (creates the `voidx` leader if missing; idempotent). Output goes to
# container logs the first time — grab the password from `docker logs` / Render logs.
if [ "${SEED:-true}" = "true" ]; then
  python seed.py || echo "[entrypoint] seed skipped (non-fatal)"
fi
exec uvicorn main:app --host 0.0.0.0 --port 8000
