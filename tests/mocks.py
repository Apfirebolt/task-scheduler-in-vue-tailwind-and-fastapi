"""
Mock utilities for testing
"""
from unittest.mock import MagicMock
from datetime import datetime, date
from backend.tasks import model, schema


def mock_task_object(**kwargs):
    """Create a mock task object"""
    defaults = {
        "id": 1,
        "title": "Mock Task",
        "description": "Mock Description",
        "status": "pending",
        "createdDate": datetime.now(),
        "dueDate": date(2024, 12, 31)
    }
    defaults.update(kwargs)

    task = MagicMock(spec=model.Task)
    for key, value in defaults.items():
        setattr(task, key, value)
    return task


def mock_task_data(**kwargs):
    """Create mock task data for API requests"""
    defaults = {
        "title": "Mock Task",
        "description": "Mock Description",
        "status": "pending",
        "dueDate": "2024-12-31"
    }
    defaults.update(kwargs)
    return schema.TaskBase(**defaults)


def mock_task_update_data(**kwargs):
    """Create mock task update data"""
    defaults = {
        "title": "Updated Title",
        "description": "Updated Description",
        "status": "completed",
        "dueDate": "2024-12-31"
    }
    defaults.update(kwargs)
    return schema.TaskUpdate(**defaults)


class MockDatabase:
    """Mock database session for testing"""

    def __init__(self):
        self.data = []
        self.committed = False
        self.rolled_back = False

    def add(self, obj):
        self.data.append(obj)

    def commit(self):
        self.committed = True

    def rollback(self):
        self.rolled_back = True

    def refresh(self, obj):
        pass

    def query(self, model_class):
        return MockQuery(self.data, model_class)


class MockQuery:
    """Mock query builder for testing"""

    def __init__(self, data, model_class):
        self.data = data
        self.model_class = model_class
        self._filters = []

    def filter(self, *args):
        new_query = MockQuery(self.data, self.model_class)
        new_query._filters = self._filters + list(args)
        return new_query

    def filter_by(self, **kwargs):
        filtered_data = []
        for item in self.data:
            match = True
            for key, value in kwargs.items():
                if not hasattr(item, key) or getattr(item, key) != value:
                    match = False
                    break
            if match:
                filtered_data.append(item)

        new_query = MockQuery(filtered_data, self.model_class)
        new_query._filters = self._filters
        return new_query

    def first(self):
        return self.data[0] if self.data else None

    def all(self):
        return self.data

    def delete(self):
        # Mock delete operation
        return len(self.data)


def create_mock_db_session():
    """Create a mock database session"""
    return MockDatabase()


def setup_axios_mock(mock_axios):
    """Setup axios mock with common responses"""
    # Setup default responses
    mock_axios.get.return_value = {
        data: [],
        status: 200,
        statusText: 'OK'
    }

    mock_axios.post.return_value = {
        data: { id: 1, title: 'Test Task' },
        status: 201,
        statusText: 'Created'
    }

    mock_axios.patch.return_value = {
        data: { id: 1, title: 'Updated Task' },
        status: 200,
        statusText: 'OK'
    }

    mock_axios.delete.return_value = {
        status: 204,
        statusText: 'No Content'
    }