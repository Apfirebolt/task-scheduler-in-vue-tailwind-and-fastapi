# Start from a small, supported Python base image

# --- Builder stage: build Vue client ---
FROM node:20 AS client-builder
WORKDIR /client
COPY client/package.json client/package-lock.json ./
RUN npm ci
COPY client/ ./
RUN npm run build

# --- Final stage: Python backend + static client ---
FROM python:3.11-slim
ENV PYTHONUNBUFFERED=1
WORKDIR /app

# Install minimal OS deps (ca-certificates) and cleanup lists to keep image small
RUN apt-get update \
    && apt-get install -y --no-install-recommends ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy requirements first to leverage Docker cache
COPY requirements.txt ./
RUN pip install --no-cache-dir -r requirements.txt

# Copy backend and FastAPI app
COPY backend/ ./backend/
COPY main.py ./main.py

# Copy built static files only
COPY --from=client-builder /client/dist ./client/dist

# Create a less-privileged user and switch to it
RUN useradd --create-home appuser && chown -R appuser /app
USER appuser

EXPOSE 8000
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]
