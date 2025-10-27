#!/bin/bash

# Test Runner Script for Task Scheduler
# Usage: ./run_tests.sh [unit|integration|frontend|e2e|all]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    if ! command_exists python3; then
        print_error "Python 3 is required but not installed"
        exit 1
    fi

    if ! command_exists npm; then
        print_error "npm is required but not installed"
        exit 1
    fi

    if [ "$1" = "e2e" ] || [ "$1" = "all" ]; then
        if ! command_exists docker; then
            print_error "Docker is required for E2E tests"
            exit 1
        fi

        if ! docker compose version >/dev/null 2>&1; then
            print_error "Docker Compose is required for E2E tests"
            exit 1
        fi
    fi

    print_status "Prerequisites check passed"
}

# Setup test environment
setup_environment() {
    print_status "Setting up test environment..."

    # Install Python dependencies
    if [ -f "src/requirements.txt" ]; then
        print_status "Installing Python dependencies..."
        pip install -r src/requirements.txt
    fi

    # Install frontend dependencies
    if [ -f "client/package.json" ]; then
        print_status "Installing frontend dependencies..."
        cd client
        npm install
        cd ..
    fi

    # Setup test database
    print_status "Setting up test database..."
    export TEST_DATABASE_URL="sqlite:///.dev/test.db"

    print_status "Test environment setup complete"
}

# Run backend unit tests
run_backend_unit_tests() {
    print_status "Running backend unit tests..."
    pytest tests/unit/ -v --tb=short --cov=backend --cov-report=term-missing
}

# Run backend integration tests
run_backend_integration_tests() {
    print_status "Running backend integration tests..."
    pytest tests/integration/ -v --tb=short
}

# Run frontend tests
run_frontend_tests() {
    print_status "Running frontend tests..."
    cd client
    npm run test:run
    cd ..
}

# Run E2E tests
run_e2e_tests() {
    print_status "Running E2E tests..."

    # Start the application
    print_status "Starting application with Docker..."
    docker compose -f docker/docker-compose.yaml up -d --build

    # Wait for services to be ready
    print_status "Waiting for services to be ready..."
    sleep 30

    # Check if services are running
    if ! docker compose -f docker/docker-compose.yaml ps | grep -q "Up"; then
        print_error "Failed to start services"
        docker compose -f docker/docker-compose.yaml logs
        docker compose -f docker/docker-compose.yaml down
        exit 1
    fi

    # Run E2E tests
    cd client
    npm run test:e2e
    TEST_EXIT_CODE=$?
    cd ..

    # Stop the application
    print_status "Stopping application..."
    docker compose -f docker/docker-compose.yaml down

    if [ $TEST_EXIT_CODE -ne 0 ]; then
        print_error "E2E tests failed"
        exit $TEST_EXIT_CODE
    fi
}

# Run all tests
run_all_tests() {
    print_status "Running all tests..."

    # Backend tests
    run_backend_unit_tests
    run_backend_integration_tests

    # Frontend tests
    run_frontend_tests

    # E2E tests
    run_e2e_tests

    print_status "All tests completed successfully!"
}

# Cleanup function
cleanup() {
    print_status "Cleaning up..."

    # Remove test database file
    if [ -f ".dev/test.db" ]; then
        rm .dev/test.db
    fi

    # Stop any running containers
    if docker compose version >/dev/null 2>&1; then
        docker compose -f docker/docker-compose.yaml down 2>/dev/null || true
    fi
}

# Main script logic
main() {
    local test_type=${1:-all}

    print_status "Starting test runner for: $test_type"

    # Set up cleanup trap
    trap cleanup EXIT

    # Check prerequisites
    check_prerequisites "$test_type"

    # Setup environment
    setup_environment

    # Run tests based on type
    case "$test_type" in
        "unit")
            run_backend_unit_tests
            ;;
        "integration")
            run_backend_integration_tests
            ;;
        "backend")
            run_backend_unit_tests
            run_backend_integration_tests
            ;;
        "frontend")
            run_frontend_tests
            ;;
        "e2e")
            run_e2e_tests
            ;;
        "all")
            run_all_tests
            ;;
        *)
            print_error "Unknown test type: $test_type"
            echo "Usage: $0 [unit|integration|backend|frontend|e2e|all]"
            exit 1
            ;;
    esac

    print_status "Test run completed successfully!"
}

# Parse command line arguments
if [ $# -gt 1 ]; then
    print_error "Too many arguments"
    echo "Usage: $0 [unit|integration|backend|frontend|e2e|all]"
    exit 1
fi

# Run main function
main "$@"