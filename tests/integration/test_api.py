import pytest
from datetime import date


@pytest.mark.integration
class TestTaskAPI:
    """Integration tests for task API endpoints"""

    def test_create_task_endpoint(self, client, sample_task_data):
        """Test POST /tasks endpoint"""
        response = client.post("/tasks/", json=sample_task_data)

        assert response.status_code == 201
        data = response.json()
        assert data["title"] == sample_task_data["title"]
        assert data["description"] == sample_task_data["description"]
        assert data["status"] == sample_task_data["status"]
        assert data["dueDate"].startswith("2024-12-31")
        assert "id" in data
        assert "createdDate" in data

    def test_create_task_endpoint_invalid_data(self, client):
        """Test POST /tasks endpoint with invalid data"""
        invalid_data = {
            "title": "Test Task"
            # Missing required fields
        }

        response = client.post("/tasks/", json=invalid_data)

        assert response.status_code == 422  # Validation error

    def test_get_tasks_endpoint_empty(self, client):
        """Test GET /tasks endpoint when no tasks exist"""
        response = client.get("/tasks/")

        assert response.status_code == 200
        data = response.json()
        assert data == []

    def test_get_tasks_endpoint_with_data(self, client, sample_task):
        """Test GET /tasks endpoint with existing tasks"""
        response = client.get("/tasks/")

        assert response.status_code == 200
        data = response.json()
        assert len(data) == 1
        assert data[0]["id"] == sample_task.id
        assert data[0]["title"] == "Sample Task"

    def test_get_task_by_id_endpoint_success(self, client, sample_task):
        """Test GET /tasks/{task_id} endpoint success"""
        response = client.get(f"/tasks/{sample_task.id}")

        assert response.status_code == 200
        data = response.json()
        assert data["id"] == sample_task.id
        assert data["title"] == "Sample Task"

    def test_get_task_by_id_endpoint_not_found(self, client):
        """Test GET /tasks/{task_id} endpoint with non-existent ID"""
        response = client.get("/tasks/999")

        assert response.status_code == 404
        assert "task Not Found" in response.json()["detail"]

    def test_delete_task_endpoint_success(self, client, sample_task):
        """Test DELETE /tasks/{task_id} endpoint success"""
        response = client.delete(f"/tasks/{sample_task.id}")

        assert response.status_code == 204

        # Verify task is deleted
        get_response = client.get(f"/tasks/{sample_task.id}")
        assert get_response.status_code == 404

    def test_delete_task_endpoint_not_found(self, client):
        """Test DELETE /tasks/{task_id} endpoint with non-existent ID"""
        response = client.delete("/tasks/999")

        assert response.status_code == 204  # Current implementation returns 204 even if not found

    def test_update_task_endpoint_success(self, client, sample_task):
        """Test PATCH /tasks/{task_id} endpoint success"""
        update_data = {
            "title": "Updated Task Title",
            "status": "completed"
        }

        response = client.patch(f"/tasks/{sample_task.id}", json=update_data)

        assert response.status_code == 200
        data = response.json()
        assert data["title"] == "Updated Task Title"
        assert data["status"] == "completed"
        assert data["description"] == sample_task.description  # Unchanged

    def test_update_task_endpoint_partial_update(self, client, sample_task):
        """Test PATCH /tasks/{task_id} endpoint with partial data"""
        update_data = {
            "description": "Updated description only"
        }

        response = client.patch(f"/tasks/{sample_task.id}", json=update_data)

        assert response.status_code == 200
        data = response.json()
        assert data["description"] == "Updated description only"
        assert data["title"] == sample_task.title  # Unchanged
        assert data["status"] == sample_task.status  # Unchanged

    def test_update_task_endpoint_not_found(self, client):
        """Test PATCH /tasks/{task_id} endpoint with non-existent ID"""
        update_data = {
            "title": "Updated Title"
        }

        response = client.patch("/tasks/999", json=update_data)

        assert response.status_code == 404
        assert "task Not Found" in response.json()["detail"]

    def test_cookie_endpoint(self, client):
        """Test GET /tasks/cookie endpoint"""
        response = client.get("/tasks/cookie")

        assert response.status_code == 200
        data = response.json()
        assert "message" in data
        assert "Come to the dark side" in data["message"]
        assert "fakesession" in response.cookies

    def test_full_task_lifecycle(self, client, sample_task_data):
        """Test complete task lifecycle: create -> read -> update -> delete"""
        # Create task
        create_response = client.post("/tasks/", json=sample_task_data)
        assert create_response.status_code == 201
        task_id = create_response.json()["id"]

        # Read task
        get_response = client.get(f"/tasks/{task_id}")
        assert get_response.status_code == 200
        assert get_response.json()["title"] == sample_task_data["title"]

        # Update task
        update_data = {"status": "completed"}
        update_response = client.patch(f"/tasks/{task_id}", json=update_data)
        assert update_response.status_code == 200
        assert update_response.json()["status"] == "completed"

        # Delete task
        delete_response = client.delete(f"/tasks/{task_id}")
        assert delete_response.status_code == 204

        # Verify deletion
        verify_response = client.get(f"/tasks/{task_id}")
        assert verify_response.status_code == 404

    def test_get_multiple_tasks(self, client, db_session):
        """Test getting multiple tasks"""
        from datetime import datetime
        from backend.tasks import model

        # Create multiple tasks
        tasks = []
        for i in range(3):
            task = model.Task(
                title=f"Task {i+1}",
                description=f"Description {i+1}",
                status="pending",
                createdDate=datetime.now(),
                dueDate=date(2024, 12, 31)
            )
            db_session.add(task)
            db_session.commit()
            db_session.refresh(task)
            tasks.append(task)

        # Get all tasks
        response = client.get("/tasks/")
        assert response.status_code == 200
        data = response.json()
        assert len(data) == 3

        # Verify tasks are returned
        titles = [task["title"] for task in data]
        assert "Task 1" in titles
        assert "Task 2" in titles
        assert "Task 3" in titles