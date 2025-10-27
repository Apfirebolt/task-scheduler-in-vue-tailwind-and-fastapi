#!/bin/bash
set -e

# Create log directory structure
mkdir -p /app/logs/{backend,frontend,performance,e2e}
mkdir -p /app/reports/{backend,frontend,performance,e2e}

# Function to wait for service
wait_for_service() {
    local host=$1
    local port=$2
    local service=$3

    echo "Waiting for $service ($host:$port)..."
    while ! nc -z $host $port; do
        echo "  $service is not ready yet. Retrying in 5 seconds..."
        sleep 5
    done
    echo "$service is ready!"
}

# Check if we need to wait for database
if [ "$DATABASE_HOST" ]; then
    wait_for_service $DATABASE_HOST 5432 "Database"
fi

# Check if we need to wait for backend API
if [ "$API_URL" ]; then
    # Extract host and port from API_URL
    API_HOST=$(echo $API_URL | sed 's/http\:\/\/://g' | cut -d':' -f1)
    API_PORT=$(echo $API_URL | sed 's/http\:\/\/://g' | cut -d':' -f2)
    wait_for_service $API_HOST $API_PORT "Backend API"
fi

# Run database migrations if needed
if [ "$DATABASE_HOST" ] && [ -f "alembic.ini" ]; then
    echo "Running database migrations..."
    alembic upgrade head
fi

# Execute the main command
exec "$@"