import pytest
from datetime import datetime
from sqlalchemy.exc import IntegrityError

from backend.tasks import model
from backend.db import get_db


@pytest.mark.integration
@pytest.mark.database
class TestDatabaseIntegration:
    """Integration tests for database operations"""

    def test_database_connection(self, db_session):
        """Test database connection and session creation"""
        # Simple query to test connection
        count = db_session.query(model.Task).count()
        assert isinstance(count, int)

    def test_create_multiple_tasks_transaction(self, db_session):
        """Test creating multiple tasks in a single transaction"""
        tasks = []
        for i in range(5):
            task = model.Task(
                title=f"Batch Task {i}",
                description=f"Description for batch task {i}",
                status="pending",
                createdDate=datetime.now(),
                dueDate=datetime(2024, 12, 31)
            )
            tasks.append(task)
            db_session.add(task)

        # Commit all tasks at once
        db_session.commit()

        # Verify all tasks were created
        all_tasks = db_session.query(model.Task).all()
        assert len(all_tasks) == 5

        # Verify task data
        for i, task in enumerate(all_tasks):
            assert task.title == f"Batch Task {i}"
            assert task.description == f"Description for batch task {i}"

    def test_transaction_rollback(self, db_session):
        """Test transaction rollback on error"""
        # Create a valid task and commit it first
        valid_task = model.Task(
            title="Valid Task",
            description="This is valid",
            status="pending",
            createdDate=datetime.now(),
            dueDate=datetime(2024, 12, 31)
        )
        db_session.add(valid_task)
        db_session.commit()

        # Begin a new transaction scenario
        try:
            # Create a task that we'll intentionally rollback
            rollback_task = model.Task(
                title="Rollback Task",
                description="This should be rolled back",
                status="pending",
                createdDate=datetime.now(),
                dueDate=datetime(2024, 12, 31)
            )
            db_session.add(rollback_task)

            # Force a database error by executing invalid SQL directly
            # This will cause a transaction rollback
            db_session.execute("INVALID SQL STATEMENT TO FORCE ERROR")
            db_session.commit()

        except Exception as e:
            # Rollback the transaction - this should rollback the rollback_task
            db_session.rollback()
            # Verify we caught an error as expected
            assert any(keyword in str(e).lower() for keyword in ["syntax", "error", "invalid"])

        # The valid task should still exist since it was committed before the transaction
        existing_tasks = db_session.query(model.Task).filter_by(title="Valid Task").all()
        assert len(existing_tasks) == 1

        # The rollback task should not exist due to the rollback
        rolled_back_tasks = db_session.query(model.Task).filter_by(title="Rollback Task").all()
        assert len(rolled_back_tasks) == 0

    def test_database_constraints(self, db_session):
        """Test database constraints and uniqueness"""
        # Create first task
        task1 = model.Task(
            title="Unique Task",
            description="First instance",
            status="pending",
            createdDate=datetime.now(),
            dueDate=datetime(2024, 12, 31)
        )
        db_session.add(task1)
        db_session.commit()

        # Create second task with same title (should be allowed unless there's a unique constraint)
        task2 = model.Task(
            title="Unique Task",  # Same title as task1
            description="Second instance",
            status="in-progress",
            createdDate=datetime.now(),
            dueDate=datetime(2024, 12, 31)
        )
        db_session.add(task2)
        db_session.commit()

        # Both tasks should exist if there's no unique constraint on title
        all_tasks = db_session.query(model.Task).filter_by(title="Unique Task").all()
        assert len(all_tasks) == 2

    def test_query_with_filters(self, db_session):
        """Test querying with various filters"""
        # Create tasks with different statuses
        statuses = ["pending", "in-progress", "completed"]
        for i, status in enumerate(statuses):
            task = model.Task(
                title=f"Task {i}",
                description=f"Task with status {status}",
                status=status,
                createdDate=datetime.now(),
                dueDate=datetime(2024, 12, 31)
            )
            db_session.add(task)

        db_session.commit()

        # Query by status
        pending_tasks = db_session.query(model.Task).filter_by(status="pending").all()
        in_progress_tasks = db_session.query(model.Task).filter_by(status="in-progress").all()
        completed_tasks = db_session.query(model.Task).filter_by(status="completed").all()

        assert len(pending_tasks) == 1
        assert len(in_progress_tasks) == 1
        assert len(completed_tasks) == 1
        assert pending_tasks[0].status == "pending"
        assert in_progress_tasks[0].status == "in-progress"
        assert completed_tasks[0].status == "completed"

    def test_query_with_ordering(self, db_session):
        """Test querying with different ordering"""
        base_time = datetime(2024, 1, 1, 12, 0, 0)

        # Create tasks with different creation times
        for i in range(3):
            task = model.Task(
                title=f"Task {i}",
                description=f"Task created at hour {i}",
                status="pending",
                createdDate=base_time.replace(hour=12 + i),
                dueDate=datetime(2024, 12, 31)
            )
            db_session.add(task)

        db_session.commit()

        # Query in ascending order
        asc_tasks = db_session.query(model.Task).order_by(model.Task.createdDate.asc()).all()
        assert len(asc_tasks) == 3
        for i in range(1, len(asc_tasks)):
            assert asc_tasks[i].createdDate >= asc_tasks[i-1].createdDate

        # Query in descending order
        desc_tasks = db_session.query(model.Task).order_by(model.Task.createdDate.desc()).all()
        assert len(desc_tasks) == 3
        for i in range(1, len(desc_tasks)):
            assert desc_tasks[i].createdDate <= desc_tasks[i-1].createdDate

    def test_bulk_operations(self, db_session):
        """Test bulk database operations"""
        # Bulk insert
        tasks_data = [
            {
                "title": f"Bulk Task {i}",
                "description": f"Bulk description {i}",
                "status": "pending",
                "createdDate": datetime.now(),
                "dueDate": datetime(2024, 12, 31)
            }
            for i in range(10)
        ]

        db_session.bulk_insert_mappings(model.Task, tasks_data)
        db_session.commit()

        # Verify bulk insert
        all_tasks = db_session.query(model.Task).filter(model.Task.title.like("Bulk Task%")).all()
        assert len(all_tasks) == 10

        # Bulk update
        update_data = [
            {"id": task.id, "status": "completed"}
            for task in all_tasks[:5]
        ]

        db_session.bulk_update_mappings(model.Task, update_data)
        db_session.commit()

        # Verify bulk update
        completed_tasks = db_session.query(model.Task).filter_by(status="completed").all()
        assert len(completed_tasks) == 5

    def test_pagination_query(self, db_session):
        """Test paginated queries"""
        # Create 25 tasks
        for i in range(25):
            task = model.Task(
                title=f"Paginated Task {i}",
                description=f"Task {i} for pagination testing",
                status="pending",
                createdDate=datetime.now(),
                dueDate=datetime(2024, 12, 31)
            )
            db_session.add(task)

        db_session.commit()

        # Test pagination
        page_size = 10
        page = 1
        all_pages_tasks = []

        while True:
            offset = (page - 1) * page_size
            tasks = db_session.query(model.Task)\
                .order_by(model.Task.id)\
                .offset(offset)\
                .limit(page_size)\
                .all()

            if not tasks:
                break

            all_pages_tasks.extend(tasks)
            page += 1

        assert len(all_pages_tasks) == 25

        # Verify we got all tasks in order
        for i, task in enumerate(all_pages_tasks):
            assert f"Paginated Task {i}" in task.title

    def test_count_and_aggregate_queries(self, db_session):
        """Test count and aggregate queries"""
        # Create tasks with different statuses
        statuses = ["pending"] * 5 + ["in-progress"] * 3 + ["completed"] * 2
        for i, status in enumerate(statuses):
            task = model.Task(
                title=f"Aggregate Task {i}",
                description=f"Task {i}",
                status=status,
                createdDate=datetime.now(),
                dueDate=datetime(2024, 12, 31)
            )
            db_session.add(task)

        db_session.commit()

        # Count total tasks
        total_count = db_session.query(model.Task).count()
        assert total_count == 10

        # Count by status
        pending_count = db_session.query(model.Task).filter_by(status="pending").count()
        in_progress_count = db_session.query(model.Task).filter_by(status="in-progress").count()
        completed_count = db_session.query(model.Task).filter_by(status="completed").count()

        assert pending_count == 5
        assert in_progress_count == 3
        assert completed_count == 2

    def test_date_range_queries(self, db_session):
        """Test date range queries"""
        base_date = datetime(2024, 6, 1, 12, 0, 0)

        # Create tasks with different due dates
        for i in range(7):
            task = model.Task(
                title=f"Date Task {i}",
                description=f"Task due on day {i}",
                status="pending",
                createdDate=datetime.now(),
                dueDate=base_date.replace(day=i + 1)
            )
            db_session.add(task)

        db_session.commit()

        # Query tasks due in first week (inclusive range)
        start_date = datetime(2024, 6, 1)
        end_date = datetime(2024, 6, 7, 23, 59, 59)  # End of day 7

        week_tasks = db_session.query(model.Task)\
            .filter(model.Task.dueDate >= start_date)\
            .filter(model.Task.dueDate <= end_date)\
            .order_by(model.Task.dueDate)\
            .all()

        assert len(week_tasks) == 7

        # Query tasks due after mid-week
        mid_week = datetime(2024, 6, 4, 12, 0, 0)
        later_tasks = db_session.query(model.Task)\
            .filter(model.Task.dueDate > mid_week)\
            .all()

        assert len(later_tasks) == 3  # Days 5, 6, 7