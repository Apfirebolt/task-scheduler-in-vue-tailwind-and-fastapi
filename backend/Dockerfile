# syntax=docker/dockerfile:1
FROM python:3.10-slim AS base

# Install system dependencies
RUN apt-get update && apt-get install -y \
    netcat-openbsd \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

# Copy requirements and install dependencies
COPY src/requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy test requirements if they exist (for testing)
COPY src/requirements-test.txt* ./
RUN if [ -f requirements-test.txt ]; then pip install --no-cache-dir -r requirements-test.txt; fi

# Copy application code
COPY backend ./backend
COPY src/main.py .
COPY config/alembic.ini .
COPY alembic ./alembic

# Environment variables for database connection
# DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_HOST and DATABASE_NAME will be passed by docker‑compose
ENV PYTHONUNBUFFERED=1

CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000"]
