import pytest
import asyncio
import sys
import os
from pathlib import Path

# Add project root to Python path
project_root = Path(__file__).parent.parent
sys.path.insert(0, str(project_root))

from fastapi.testclient import TestClient
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from sqlalchemy.pool import StaticPool

from main import app
from backend import db
from backend.tasks import model

# Test database configuration - use PostgreSQL in Docker, SQLite locally
def get_test_database_url():
    """Determine test database URL based on environment"""
    # Check if running in Docker/test environment
    if os.getenv("PYTEST_CURRENT_TEST") or os.getenv("DOCKER_CONTAINER"):
        # Use PostgreSQL for Docker/integration tests
        db_user = os.getenv("DATABASE_USERNAME", "test_scheduler")
        db_pass = os.getenv("DATABASE_PASSWORD", "test_scheduler")
        db_host = os.getenv("DATABASE_HOST", "test-db")
        db_name = os.getenv("DATABASE_NAME", "test_scheduler")
        return f"postgresql://{db_user}:{db_pass}@{db_host}/{db_name}"
    else:
        # Use SQLite for local development
        return "sqlite:///./test.db"

SQLALCHEMY_DATABASE_URL = get_test_database_url()

# Configure engine based on database type
if "sqlite" in SQLALCHEMY_DATABASE_URL:
    engine = create_engine(
        SQLALCHEMY_DATABASE_URL,
        connect_args={"check_same_thread": False},
        poolclass=StaticPool,
    )
else:
    # PostgreSQL configuration
    engine = create_engine(SQLALCHEMY_DATABASE_URL)

TestingSessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def override_get_db():
    """Override database dependency for testing"""
    try:
        db = TestingSessionLocal()
        yield db
    finally:
        db.close()


@pytest.fixture(scope="session")
def event_loop():
    """Create an instance of the default event loop for the test session."""
    loop = asyncio.get_event_loop_policy().new_event_loop()
    yield loop
    loop.close()


@pytest.fixture(scope="function")
def db_session():
    """Create a fresh database session for each test"""
    model.Base.metadata.create_all(bind=engine)
    session = TestingSessionLocal()
    try:
        yield session
    finally:
        session.close()
        model.Base.metadata.drop_all(bind=engine)


@pytest.fixture(scope="function")
def client(db_session):
    """Create a test client with database override"""
    app.dependency_overrides[db.get_db] = lambda: db_session
    with TestClient(app) as test_client:
        yield test_client
    app.dependency_overrides.clear()


@pytest.fixture
def sample_task_data():
    """Sample task data for testing"""
    return {
        "title": "Test Task",
        "description": "This is a test task",
        "status": "pending",
        "dueDate": "2024-12-31T00:00:00"
    }


@pytest.fixture
def sample_task(db_session):
    """Create a sample task in the database"""
    from datetime import date, datetime
    task = model.Task(
        title="Sample Task",
        description="This is a sample task",
        status="pending",
        createdDate=datetime.now(),
        dueDate=datetime(2024, 12, 31)
    )
    db_session.add(task)
    db_session.commit()
    db_session.refresh(task)
    return task