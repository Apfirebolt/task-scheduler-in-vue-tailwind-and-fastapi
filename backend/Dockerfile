# syntax=docker/dockerfile:1
FROM python:3.10-slim AS base

WORKDIR /app

# Copy requirements and install dependencies
COPY requirements.txt .
RUN pip install --no-cache-dir --upgrade -r requirements.txt

# Copy application code
COPY ./backend ./backend
COPY main.py .
COPY alembic.ini .
COPY alembic ./alembic

# Environment variables for database connection
# DATABASE_USERNAME, DATABASE_PASSWORD, DATABASE_HOST and DATABASE_NAME will be passed by docker‑compose
ENV PYTHONUNBUFFERED=1

CMD ["sh", "-c", "alembic upgrade head && uvicorn main:app --host 0.0.0.0 --port 8000"]
