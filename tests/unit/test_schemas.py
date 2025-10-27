import pytest
from datetime import date, datetime
from pydantic import ValidationError

from backend.tasks import schema


@pytest.mark.unit
class TestTaskSchemas:
    """Unit tests for task schemas"""

    def test_task_base_schema_valid(self):
        """Test TaskBase schema with valid data"""
        task_data = {
            "title": "Test Task",
            "description": "Test Description",
            "status": "pending",
            "dueDate": datetime(2024, 12, 31)
        }

        task = schema.TaskBase(**task_data)

        assert task.title == "Test Task"
        assert task.description == "Test Description"
        assert task.status == "pending"
        assert task.dueDate == datetime(2024, 12, 31)

    def test_task_base_schema_with_id(self):
        """Test TaskBase schema with ID"""
        task_data = {
            "id": 1,
            "title": "Test Task",
            "description": "Test Description",
            "status": "pending",
            "dueDate": datetime(2024, 12, 31)
        }

        task = schema.TaskBase(**task_data)

        assert task.id == 1
        assert task.title == "Test Task"

    def test_task_base_schema_missing_required_fields(self):
        """Test TaskBase schema validation with missing required fields"""
        task_data = {
            "title": "Test Task"
            # Missing description, status, dueDate
        }

        with pytest.raises(ValidationError):
            schema.TaskBase(**task_data)

    def test_task_update_schema_valid(self):
        """Test TaskUpdate schema with valid data"""
        task_data = {
            "title": "Updated Title",
            "description": "Updated Description",
            "status": "completed",
            "dueDate": datetime(2024, 12, 31)
        }

        task_update = schema.TaskUpdate(**task_data)

        assert task_update.title == "Updated Title"
        assert task_update.description == "Updated Description"
        assert task_update.status == "completed"
        assert task_update.dueDate == datetime(2024, 12, 31)

    def test_task_update_schema_partial_data(self):
        """Test TaskUpdate schema with partial data"""
        task_data = {
            "title": "Updated Title Only"
        }

        task_update = schema.TaskUpdate(**task_data)

        assert task_update.title == "Updated Title Only"
        assert task_update.description is None
        assert task_update.status is None
        assert task_update.dueDate is None

    def test_task_update_schema_empty_data(self):
        """Test TaskUpdate schema with empty data"""
        task_update = schema.TaskUpdate()

        assert task_update.title is None
        assert task_update.description is None
        assert task_update.status is None
        assert task_update.dueDate is None

    def test_task_list_schema_valid(self):
        """Test TaskList schema with valid data"""
        task_data = {
            "id": 1,
            "title": "Test Task",
            "description": "Test Description",
            "status": "pending",
            "createdDate": datetime(2024, 1, 1),
            "dueDate": datetime(2024, 12, 31)
        }

        task_list = schema.TaskList(**task_data)

        assert task_list.id == 1
        assert task_list.title == "Test Task"
        assert task_list.description == "Test Description"
        assert task_list.status == "pending"
        assert task_list.createdDate == datetime(2024, 1, 1)
        assert task_list.dueDate == datetime(2024, 12, 31)

    def test_task_list_schema_missing_required_fields(self):
        """Test TaskList schema validation with missing required fields"""
        task_data = {
            "title": "Test Task"
            # Missing id, description, status, createdDate, dueDate
        }

        with pytest.raises(ValidationError):
            schema.TaskList(**task_data)

    def test_invalid_date_format(self):
        """Test schema validation with invalid date format"""
        task_data = {
            "title": "Test Task",
            "description": "Test Description",
            "status": "pending",
            "dueDate": "invalid-date"
        }

        with pytest.raises(ValidationError):
            schema.TaskBase(**task_data)

    def test_empty_strings_validation(self):
        """Test schema validation with empty strings"""
        task_data = {
            "title": "",
            "description": "",
            "status": "",
            "dueDate": datetime(2024, 12, 31)
        }

        task = schema.TaskBase(**task_data)
        assert task.title == ""
        assert task.description == ""
        assert task.status == ""