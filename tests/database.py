"""
Database utilities for testing
"""
import os
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from backend.tasks import model

# Test database configuration
TEST_DATABASE_URL = os.getenv(
    "TEST_DATABASE_URL",
    "sqlite:///./test.db"
)

def create_test_engine():
    """Create test database engine"""
    return create_engine(
        TEST_DATABASE_URL,
        connect_args={"check_same_thread": False} if "sqlite" in TEST_DATABASE_URL else {},
        echo=False
    )

def create_test_session(engine):
    """Create test database session"""
    TestingSessionLocal = sessionmaker(
        autocommit=False,
        autoflush=False,
        bind=engine
    )
    return TestingSessionLocal()

def setup_test_database(engine):
    """Create all tables for testing"""
    model.Base.metadata.create_all(bind=engine)

def teardown_test_database(engine):
    """Drop all tables after testing"""
    model.Base.metadata.drop_all(bind=engine)

def create_sample_task(session, **kwargs):
    """Create a sample task for testing"""
    from datetime import datetime, date

    defaults = {
        "title": "Test Task",
        "description": "Test Description",
        "status": "pending",
        "createdDate": datetime.now(),
        "dueDate": date(2024, 12, 31)
    }
    defaults.update(kwargs)

    task = model.Task(**defaults)
    session.add(task)
    session.commit()
    session.refresh(task)
    return task

def create_multiple_tasks(session, count=3):
    """Create multiple sample tasks"""
    tasks = []
    for i in range(count):
        task = create_sample_task(
            session,
            title=f"Task {i+1}",
            description=f"Description for task {i+1}",
            status=["pending", "in-progress", "completed"][i % 3]
        )
        tasks.append(task)
    return tasks