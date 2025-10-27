#!/bin/bash

# Docker-based Test Runner for Task Scheduler
# Usage: ./run-docker-tests.sh [unit|integration|frontend|e2e|performance|all]

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
PURPLE='\033[0;35m'
NC='\033[0m' # No Color

# Configuration
COMPOSE_FILE="docker-compose.test.yaml"
LOG_DIR="./logs/test-logs"
REPORT_DIR="./test-reports"

# Function to print colored output
print_header() {
    echo -e "${BLUE}========================================${NC}"
    echo -e "${BLUE}$1${NC}"
    echo -e "${BLUE}========================================${NC}"
}

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

print_test_section() {
    echo -e "\n${PURPLE}🧪 $1${NC}"
}

# Function to check if command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check prerequisites
check_prerequisites() {
    print_status "Checking prerequisites..."

    if ! command_exists docker; then
        print_error "Docker is required but not installed"
        exit 1
    fi

    if ! docker compose version >/dev/null 2>&1; then
        print_error "Docker Compose is required but not installed"
        exit 1
    fi

    if [ ! -f "$COMPOSE_FILE" ]; then
        print_error "Docker Compose file not found: $COMPOSE_FILE"
        exit 1
    fi

    print_status "Prerequisites check passed"
}

# Setup test environment
setup_environment() {
    print_status "Setting up test environment..."

    # Create necessary directories
    mkdir -p "$LOG_DIR"/{backend,frontend,performance,e2e}
    mkdir -p "$REPORT_DIR"/{backend,frontend,performance,e2e}

    # Clean up any existing containers
    docker compose -f "$COMPOSE_FILE" down -v 2>/dev/null || true

    # Clean up test database
    docker volume rm task-scheduler-in-vue-tailwind-and-fastapi_test_postgres_data 2>/dev/null || true

    print_status "Test environment setup complete"
}

# Function to run specific test service
run_test_service() {
    local service=$1
    local description=$2

    print_test_section "Running $description..."

    # Start supporting services first if needed
    if [[ "$service" == *"e2e"* ]] || [[ "$service" == *"performance"* ]]; then
        print_status "Starting application services..."
        docker compose -f "$COMPOSE_FILE" up -d test-db backend frontend
        print_status "Waiting for services to be ready..."
        sleep 30
    fi

    # Run the test service
    if docker compose -f "$COMPOSE_FILE" up --build --abort-on-container-exit "$service"; then
        print_status "$description completed successfully!"
        return 0
    else
        print_error "$description failed!"
        show_service_logs "$service"
        return 1
    fi
}

# Function to show service logs
show_service_logs() {
    local service=$1
    print_warning "Showing logs for $service:"
    docker compose -f "$COMPOSE_FILE" logs --tail=50 "$service"
}

# Function to collect test artifacts
collect_artifacts() {
    print_status "Collecting test artifacts..."

    # Create timestamp for this test run
    TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
    ARTIFACT_DIR="$REPORT_DIR/run-$TIMESTAMP"
    mkdir -p "$ARTIFACT_DIR"

    # Copy logs from containers
    docker compose -f "$COMPOSE_FILE" cp test-backend:/app/reports "$ARTIFACT_DIR/backend" 2>/dev/null || true
    docker compose -f "$COMPOSE_FILE" cp test-frontend:/app/reports "$ARTIFACT_DIR/frontend" 2>/dev/null || true
    docker compose -f "$COMPOSE_FILE" cp test-e2e:/app/reports "$ARTIFACT_DIR/e2e" 2>/dev/null || true
    docker compose -f "$COMPOSE_FILE" cp test-performance:/app/reports "$ARTIFACT_DIR/performance" 2>/dev/null || true

    # Copy Docker logs
    docker compose -f "$COMPOSE_FILE" logs --no-color > "$ARTIFACT_DIR/docker-compose.log"

    print_status "Test artifacts collected in: $ARTIFACT_DIR"
}

# Function to generate test summary
generate_test_summary() {
    local exit_code=$1
    local timestamp=$(date +"%Y-%m-%d %H:%M:%S")

    print_header "Test Summary"
    echo "Test Run: $timestamp"
    echo "Exit Code: $exit_code"
    echo "Reports Location: $ARTIFACT_DIR"

    if [ -d "$ARTIFACT_DIR/backend" ]; then
        echo "Backend Reports: Available"
        [ -f "$ARTIFACT_DIR/backend/report.html" ] && echo "  - HTML Report: $ARTIFACT_DIR/backend/report.html"
        [ -f "$ARTIFACT_DIR/backend/coverage/index.html" ] && echo "  - Coverage Report: $ARTIFACT_DIR/backend/coverage/index.html"
    fi

    if [ -d "$ARTIFACT_DIR/frontend" ]; then
        echo "Frontend Reports: Available"
        [ -f "$ARTIFACT_DIR/frontend/coverage-frontend/index.html" ] && echo "  - Coverage Report: $ARTIFACT_DIR/frontend/coverage-frontend/index.html"
    fi

    if [ -d "$ARTIFACT_DIR/e2e" ]; then
        echo "E2E Reports: Available"
        [ -f "$ARTIFACT_DIR/e2e/playwright/index.html" ] && echo "  - Playwright Report: $ARTIFACT_DIR/e2e/playwright/index.html"
    fi

    if [ -d "$ARTIFACT_DIR/performance" ]; then
        echo "Performance Reports: Available"
        [ -f "$ARTIFACT_DIR/performance/performance-report.html" ] && echo "  - Performance Report: $ARTIFACT_DIR/performance/performance-report.html"
    fi
}

# Cleanup function
cleanup() {
    print_status "Cleaning up test environment..."

    # Stop and remove containers
    docker compose -f "$COMPOSE_FILE" down

    # Ask user if they want to remove volumes
    if [ "$1" = "--clean-volumes" ]; then
        print_warning "Removing test volumes..."
        docker compose -f "$COMPOSE_FILE" down -v
        docker volume prune -f
    fi

    print_status "Cleanup complete"
}

# Run backend unit tests
run_backend_unit_tests() {
    run_test_service "test-backend" "Backend Unit & Integration Tests"
}

# Run frontend tests
run_frontend_tests() {
    run_test_service "test-frontend" "Frontend Unit Tests"
}

# Run E2E tests
run_e2e_tests() {
    run_test_service "test-e2e" "End-to-End Tests"
}

# Run performance tests
run_performance_tests() {
    run_test_service "test-performance" "Performance Tests"
}

# Run all tests
run_all_tests() {
    print_test_section "Running Complete Test Suite..."

    local test_exit_code=0

    # Backend tests
    if ! run_backend_unit_tests; then
        test_exit_code=1
    fi

    # Frontend tests
    if ! run_frontend_tests; then
        test_exit_code=1
    fi

    # E2E tests
    if ! run_e2e_tests; then
        test_exit_code=1
    fi

    # Performance tests
    if ! run_performance_tests; then
        test_exit_code=1
    fi

    return $test_exit_code
}

# Function to show usage
show_usage() {
    echo "Docker-based Test Runner for Task Scheduler"
    echo ""
    echo "Usage: $0 [COMMAND] [OPTIONS]"
    echo ""
    echo "Commands:"
    echo "  unit         Run backend unit and integration tests"
    echo "  frontend     Run frontend unit tests"
    echo "  e2e          Run end-to-end tests"
    echo "  performance  Run performance tests"
    echo "  all          Run all test suites (default)"
    echo ""
    echo "Options:"
    echo "  --clean-volumes  Remove Docker volumes after tests"
    echo "  --help           Show this help message"
    echo ""
    echo "Examples:"
    echo "  $0 all                    # Run all tests"
    echo "  $0 unit                   # Run only backend tests"
    echo "  $0 e2e --clean-volumes   # Run E2E tests and clean volumes"
}

# Main script logic
main() {
    local test_type=${1:-all}
    local clean_volumes=""

    # Parse arguments
    while [[ $# -gt 0 ]]; do
        case $1 in
            --clean-volumes)
                clean_volumes="--clean-volumes"
                shift
                ;;
            --help)
                show_usage
                exit 0
                ;;
            *)
                if [[ "$test_type" == "all" ]]; then
                    test_type="$1"
                fi
                shift
                ;;
        esac
    done

    print_header "Docker Test Runner: $test_type"

    # Set up cleanup trap
    trap "cleanup $clean_volumes" EXIT

    # Check prerequisites
    check_prerequisites

    # Setup environment
    setup_environment

    # Run tests based on type
    local test_exit_code=0
    case "$test_type" in
        "unit")
            if ! run_backend_unit_tests; then
                test_exit_code=1
            fi
            ;;
        "frontend")
            if ! run_frontend_tests; then
                test_exit_code=1
            fi
            ;;
        "e2e")
            if ! run_e2e_tests; then
                test_exit_code=1
            fi
            ;;
        "performance")
            if ! run_performance_tests; then
                test_exit_code=1
            fi
            ;;
        "all")
            if ! run_all_tests; then
                test_exit_code=1
            fi
            ;;
        *)
            print_error "Unknown test type: $test_type"
            show_usage
            exit 1
            ;;
    esac

    # Collect artifacts and generate summary
    collect_artifacts
    generate_test_summary $test_exit_code

    if [ $test_exit_code -eq 0 ]; then
        print_status "🎉 All tests completed successfully!"
        exit 0
    else
        print_error "❌ Some tests failed. Check the logs for details."
        exit 1
    fi
}

# Parse command line arguments
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi