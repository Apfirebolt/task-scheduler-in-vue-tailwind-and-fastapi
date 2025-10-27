import pytest
from datetime import datetime, date
from sqlalchemy.orm import Session

from backend.tasks import model


@pytest.mark.unit
class TestTaskModel:
    """Unit tests for task database model"""

    def test_task_model_creation(self, db_session):
        """Test creating a task in the database"""
        task = model.Task(
            title="Test Task",
            description="Test Description",
            status="pending",
            createdDate=datetime.now(),
            dueDate=datetime(2024, 12, 31)
        )

        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        assert task.id is not None
        assert task.title == "Test Task"
        assert task.description == "Test Description"
        assert task.status == "pending"
        assert task.createdDate is not None
        assert task.dueDate == datetime(2024, 12, 31)

    def test_task_model_str_representation(self, db_session):
        """Test string representation of task model"""
        task = model.Task(
            title="Test Task",
            description="Test Description",
            status="pending",
            createdDate=datetime.now(),
            dueDate=datetime(2024, 12, 31)
        )

        db_session.add(task)
        db_session.commit()

        expected_str = f"Task(id={task.id}, title='Test Task', status='pending')"
        assert str(task) == expected_str

    def test_task_model_repr(self, db_session):
        """Test repr representation of task model"""
        task = model.Task(
            title="Test Task",
            description="Test Description",
            status="pending",
            createdDate=datetime.now(),
            dueDate=datetime(2024, 12, 31)
        )

        db_session.add(task)
        db_session.commit()

        expected_repr = f"<Task(id={task.id}, title='Test Task', status='pending')>"
        assert repr(task) == expected_repr

    def test_task_model_with_null_due_date(self, db_session):
        """Test creating task with default due date (model uses default=datetime.now)"""
        task = model.Task(
            title="Task without due date",
            description="No due date",
            status="pending",
            createdDate=datetime.now()
            # dueDate will use default value from model
        )

        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        # Model has default=datetime.now, so dueDate should not be None
        assert task.dueDate is not None
        assert isinstance(task.dueDate, datetime)

    def test_task_model_different_statuses(self, db_session):
        """Test creating tasks with different statuses"""
        statuses = ["pending", "in-progress", "completed", "cancelled"]
        created_tasks = []

        for status in statuses:
            task = model.Task(
                title=f"Task {status}",
                description=f"Task with status {status}",
                status=status,
                createdDate=datetime.now(),
                dueDate=datetime(2024, 12, 31)
            )
            db_session.add(task)
            created_tasks.append(task)

        db_session.commit()

        for i, task in enumerate(created_tasks):
            assert task.status == statuses[i]
            assert task.id is not None

    def test_task_model_ordering_by_created_date(self, db_session):
        """Test that tasks are ordered by creation date"""
        base_time = datetime(2024, 1, 1, 12, 0, 0)
        tasks = []

        for i in range(3):
            task = model.Task(
                title=f"Task {i}",
                description=f"Task {i}",
                status="pending",
                createdDate=base_time.replace(hour=12 + i),
                dueDate=datetime(2024, 12, 31)
            )
            db_session.add(task)
            tasks.append(task)

        db_session.commit()

        # Query tasks ordered by created date (default ordering)
        queried_tasks = db_session.query(model.Task).all()
        assert len(queried_tasks) == 3

        # Verify they are in chronological order
        for i in range(1, len(queried_tasks)):
            assert queried_tasks[i].createdDate >= queried_tasks[i-1].createdDate

    def test_task_model_update(self, db_session):
        """Test updating a task"""
        task = model.Task(
            title="Original Title",
            description="Original Description",
            status="pending",
            createdDate=datetime.now(),
            dueDate=datetime(2024, 12, 31)
        )

        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        # Update the task
        task.title = "Updated Title"
        task.status = "completed"
        db_session.commit()
        db_session.refresh(task)

        assert task.title == "Updated Title"
        assert task.status == "completed"
        assert task.description == "Original Description"  # Unchanged

    def test_task_model_delete(self, db_session):
        """Test deleting a task"""
        task = model.Task(
            title="Task to Delete",
            description="This task will be deleted",
            status="pending",
            createdDate=datetime.now(),
            dueDate=datetime(2024, 12, 31)
        )

        db_session.add(task)
        db_session.commit()
        task_id = task.id

        # Delete the task
        db_session.delete(task)
        db_session.commit()

        # Verify task is deleted
        deleted_task = db_session.query(model.Task).filter_by(id=task_id).first()
        assert deleted_task is None

    def test_task_model_with_date_fields(self, db_session):
        """Test task model with various date formats"""
        now = datetime.now()
        future_date = now.replace(year=now.year + 1)  # Ensure future date

        task = model.Task(
            title="Task with dates",
            description="Testing date fields",
            status="pending",
            createdDate=now,
            dueDate=future_date
        )

        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        assert isinstance(task.createdDate, datetime)
        assert isinstance(task.dueDate, datetime)
        assert task.createdDate <= task.dueDate

    def test_task_model_long_title(self, db_session):
        """Test task with very long title"""
        long_title = "A" * 500  # 500 character title

        task = model.Task(
            title=long_title,
            description="Task with long title",
            status="pending",
            createdDate=datetime.now(),
            dueDate=datetime(2024, 12, 31)
        )

        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        assert len(task.title) == 500
        assert task.title == long_title

    def test_task_model_long_description(self, db_session):
        """Test task with very long description"""
        long_description = "This is a very long description. " * 100  # 3300 character description

        task = model.Task(
            title="Task with long description",
            description=long_description,
            status="pending",
            createdDate=datetime.now(),
            dueDate=datetime(2024, 12, 31)
        )

        db_session.add(task)
        db_session.commit()
        db_session.refresh(task)

        assert len(task.description) == len(long_description)
        assert task.description == long_description