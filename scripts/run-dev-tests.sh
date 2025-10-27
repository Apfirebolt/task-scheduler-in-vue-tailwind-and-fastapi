#!/bin/bash

# Development Test Runner Script
# This script provides easy access to various testing scenarios using development containers

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show usage
show_usage() {
    echo "Development Test Runner for Task Scheduler"
    echo ""
    echo "Usage: $0 [command] [options]"
    echo ""
    echo "Commands:"
    echo "  setup                    Build and start development containers"
    echo "  backend [test-type]      Run backend tests"
    echo "  frontend [test-type]     Run frontend tests"
    echo "  e2e [test-type]          Run E2E tests"
    echo "  performance              Run performance tests"
    echo "  coverage                 Generate coverage reports"
    echo "  lint                     Run linting and code quality checks"
    echo "  clean                    Stop and remove development containers"
    echo "  logs [service]           Show logs for a service"
    echo ""
    echo "Backend test types:"
    echo "  unit                     Run unit tests only"
    echo "  integration              Run integration tests only"
    echo "  all                      Run all tests (default)"
    echo "  coverage                 Run tests with coverage"
    echo ""
    echo "Frontend test types:"
    echo "  unit                     Run unit tests only"
    echo "  e2e                      Run E2E tests only"
    echo "  all                      Run all tests (default)"
    echo "  coverage                 Run tests with coverage"
    echo ""
    echo "E2E test types:"
    echo "  chrome                   Run on Chrome only"
    echo "  firefox                  Run on Firefox only"
    echo "  webkit                   Run on Safari only"
    echo "  mobile                   Run on mobile devices"
    echo "  all                      Run on all browsers (default)"
    echo ""
    echo "Examples:"
    echo "  $0 setup                  # Start development environment"
    echo "  $0 backend unit           # Run backend unit tests"
    echo "  $0 frontend coverage      # Run frontend tests with coverage"
    echo "  $0 e2e chrome             # Run E2E tests on Chrome"
    echo "  $0 performance            # Run performance tests"
    echo ""
}

# Setup development environment
setup_dev() {
    print_status "Setting up development environment..."

    # Build and start containers
    docker compose -f docker-compose.dev.yaml up --build -d db
    print_status "Waiting for database to be ready..."

    # Wait for database
    until docker compose -f docker-compose.dev.yaml exec -T db pg_isready -U scheduler -d scheduler; do
        echo "Waiting for database..."
        sleep 2
    done

    # Start backend and frontend
    docker compose -f docker-compose.dev.yaml up --build -d backend-dev frontend-dev

    print_success "Development environment is ready!"
    print_status "Backend API: http://localhost:8001"
    print_status "Frontend: http://localhost:3001"
    print_status "Database: localhost:5432"
}

# Run backend tests
run_backend_tests() {
    local test_type=${1:-all}

    print_status "Running backend tests: $test_type"

    case $test_type in
        "unit")
            docker compose -f docker-compose.dev.yaml exec backend-dev python -m pytest tests/unit/ -v --cov=backend --cov-report=html --cov-report=term-missing
            ;;
        "integration")
            docker compose -f docker-compose.dev.yaml exec backend-dev python -m pytest tests/integration/ -v --cov=backend --cov-report=html --cov-report=term-missing
            ;;
        "coverage")
            docker compose -f docker-compose.dev.yaml exec backend-dev python -m pytest tests/ -v --cov=backend --cov-report=html --cov-report=xml --cov-report=term-missing
            ;;
        "all"|*)
            docker compose -f docker-compose.dev.yaml exec backend-dev python -m pytest tests/ -v --cov=backend --cov-report=html --cov-report=term-missing
            ;;
    esac

    print_success "Backend tests completed!"
}

# Run frontend tests
run_frontend_tests() {
    local test_type=${1:-all}

    print_status "Running frontend tests: $test_type"

    case $test_type in
        "unit")
            docker compose -f docker-compose.dev.yaml exec frontend-dev npm run test:unit
            ;;
        "coverage")
            docker compose -f docker-compose.dev.yaml exec frontend-dev npm run test:coverage
            ;;
        "all"|*)
            docker compose -f docker-compose.dev.yaml exec frontend-dev npm run test
            ;;
    esac

    print_success "Frontend tests completed!"
}

# Run E2E tests
run_e2e_tests() {
    local test_type=${1:-all}

    print_status "Running E2E tests: $test_type"

    case $test_type in
        "chrome")
            docker compose -f docker-compose.dev.yaml exec frontend-dev npm run test:e2e:chrome
            ;;
        "firefox")
            docker compose -f docker-compose.dev.yaml exec frontend-dev npm run test:e2e:firefox
            ;;
        "webkit")
            docker compose -f docker-compose.dev.yaml exec frontend-dev npm run test:e2e:safari
            ;;
        "mobile")
            docker compose -f docker-compose.dev.yaml exec frontend-dev npm run test:e2e:mobile
            ;;
        "all"|*)
            docker compose -f docker-compose.dev.yaml exec frontend-dev npm run test:e2e
            ;;
    esac

    print_success "E2E tests completed!"
}

# Run performance tests
run_performance_tests() {
    print_status "Running performance tests..."

    # Start performance test service
    docker compose -f docker-compose.dev.yaml --profile performance up --build performance-test

    print_success "Performance tests completed!"
    print_status "Check performance-reports volume for HTML report"
}

# Generate coverage reports
generate_coverage() {
    print_status "Generating comprehensive coverage reports..."

    # Backend coverage
    docker compose -f docker-compose.dev.yaml exec backend-dev python -m pytest tests/ -v --cov=backend --cov-report=html --cov-report=xml --cov-report=term-missing

    # Frontend coverage
    docker compose -f docker-compose.dev.yaml exec frontend-dev npm run test:coverage

    print_success "Coverage reports generated!"
    print_status "Backend coverage: backend-dev:/app/htmlcov"
    print_status "Frontend coverage: frontend-dev:/app/coverage"
}

# Run linting and code quality checks
run_linting() {
    print_status "Running linting and code quality checks..."

    # Backend linting
    docker compose -f docker-compose.dev.yaml exec backend-dev black --check .
    docker compose -f docker-compose.dev.yaml exec backend-dev isort --check-only .
    docker compose -f docker-compose.dev.yaml exec backend-dev flake8 .
    docker compose -f docker-compose.dev.yaml exec backend-dev mypy .
    docker compose -f docker-compose.dev.yaml exec backend-dev bandit -r .
    docker compose -f docker-compose.dev.yaml exec backend-dev safety check

    # Frontend linting (if configured)
    # docker compose -f docker-compose.dev.yaml exec frontend-dev npm run lint

    print_success "Linting completed!"
}

# Clean up development environment
clean_dev() {
    print_status "Cleaning up development environment..."
    docker compose -f docker-compose.dev.yaml down --volumes --remove-orphans
    docker compose -f docker-compose.dev.yaml --profile testing down --volumes --remove-orphans
    docker compose -f docker-compose.dev.yaml --profile performance down --volumes --remove-orphans
    print_success "Development environment cleaned up!"
}

# Show logs
show_logs() {
    local service=${1:-}

    if [ -z "$service" ]; then
        docker compose -f docker-compose.dev.yaml logs -f
    else
        docker compose -f docker-compose.dev.yaml logs -f "$service"
    fi
}

# Main script logic
case "${1:-}" in
    "setup")
        setup_dev
        ;;
    "backend")
        run_backend_tests "${2:-all}"
        ;;
    "frontend")
        run_frontend_tests "${2:-all}"
        ;;
    "e2e")
        run_e2e_tests "${2:-all}"
        ;;
    "performance")
        run_performance_tests
        ;;
    "coverage")
        generate_coverage
        ;;
    "lint")
        run_linting
        ;;
    "clean")
        clean_dev
        ;;
    "logs")
        show_logs "${2:-}"
        ;;
    "help"|"--help"|"-h"|"")
        show_usage
        ;;
    *)
        print_error "Unknown command: $1"
        show_usage
        exit 1
        ;;
esac