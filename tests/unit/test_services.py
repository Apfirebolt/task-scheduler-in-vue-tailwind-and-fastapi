import pytest
from datetime import date, datetime
from fastapi import HTTPException

from backend.tasks import model, services, schema


@pytest.mark.unit
class TestTaskServices:
    """Unit tests for task services"""

    @pytest.mark.asyncio
    async def test_create_new_task_success(self, db_session):
        """Test successful task creation"""
        request = schema.TaskBase(
            title="Test Task",
            description="Test Description",
            status="pending",
            dueDate=datetime(2024, 12, 31)
        )

        result = await services.create_new_task(request, db_session)

        assert result.title == "Test Task"
        assert result.description == "Test Description"
        assert result.status == "pending"
        assert result.dueDate == datetime(2024, 12, 31)
        assert result.id is not None
        assert result.createdDate is not None

    @pytest.mark.asyncio
    async def test_get_task_listing_empty(self, db_session):
        """Test getting task list when database is empty"""
        result = await services.get_task_listing(db_session)
        assert result == []

    @pytest.mark.asyncio
    async def test_get_task_listing_with_tasks(self, db_session, sample_task):
        """Test getting task list when database has tasks"""
        result = await services.get_task_listing(db_session)
        assert len(result) == 1
        assert result[0].id == sample_task.id
        assert result[0].title == "Sample Task"

    @pytest.mark.asyncio
    async def test_get_task_by_id_success(self, db_session, sample_task):
        """Test successful task retrieval by ID"""
        result = await services.get_task_by_id(sample_task.id, db_session)
        assert result.id == sample_task.id
        assert result.title == "Sample Task"

    @pytest.mark.asyncio
    async def test_get_task_by_id_not_found(self, db_session):
        """Test task retrieval with non-existent ID"""
        with pytest.raises(HTTPException) as exc_info:
            await services.get_task_by_id(999, db_session)

        assert exc_info.value.status_code == 404
        assert "task Not Found" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_delete_task_by_id_success(self, db_session, sample_task):
        """Test successful task deletion"""
        await services.delete_task_by_id(sample_task.id, db_session)

        # Verify task is deleted
        deleted_task = db_session.query(model.Task).filter_by(id=sample_task.id).first()
        assert deleted_task is None

    @pytest.mark.asyncio
    async def test_delete_task_by_id_not_found(self, db_session):
        """Test task deletion with non-existent ID (should not raise exception)"""
        # This should not raise an exception based on current implementation
        await services.delete_task_by_id(999, db_session)

    @pytest.mark.asyncio
    async def test_update_task_by_id_success(self, db_session, sample_task):
        """Test successful task update"""
        request = schema.TaskUpdate(
            title="Updated Title",
            description="Updated Description",
            status="completed"
        )

        result = await services.update_task_by_id(request, sample_task.id, db_session)

        assert result.title == "Updated Title"
        assert result.description == "Updated Description"
        assert result.status == "completed"
        assert result.dueDate == sample_task.dueDate  # Should remain unchanged

    @pytest.mark.asyncio
    async def test_update_task_by_id_partial_update(self, db_session, sample_task):
        """Test partial task update"""
        request = schema.TaskUpdate(title="Partially Updated Title")

        result = await services.update_task_by_id(request, sample_task.id, db_session)

        assert result.title == "Partially Updated Title"
        assert result.description == sample_task.description  # Should remain unchanged
        assert result.status == sample_task.status  # Should remain unchanged

    @pytest.mark.asyncio
    async def test_update_task_by_id_not_found(self, db_session):
        """Test task update with non-existent ID"""
        request = schema.TaskUpdate(title="Updated Title")

        with pytest.raises(HTTPException) as exc_info:
            await services.update_task_by_id(request, 999, db_session)

        assert exc_info.value.status_code == 404
        assert "task Not Found" in str(exc_info.value.detail)

    @pytest.mark.asyncio
    async def test_create_task_with_all_fields(self, db_session):
        """Test creating task with all possible fields"""
        request = schema.TaskBase(
            title="Complete Task",
            description="Complete Description",
            status="in-progress",
            dueDate=datetime(2025, 1, 15)
        )

        result = await services.create_new_task(request, db_session)

        assert result.title == "Complete Task"
        assert result.description == "Complete Description"
        assert result.status == "in-progress"
        assert result.dueDate == datetime(2025, 1, 15)
        assert isinstance(result.createdDate, datetime)