from locust import HttpUser, task, between
import json
import random


class TaskSchedulerUser(HttpUser):
    wait_time = between(1, 3)

    def on_start(self):
        """Called when a simulated user starts"""
        # Test health endpoint
        self.client.get("/health")

    @task(3)
    def get_tasks(self):
        """Get all tasks - most common operation"""
        self.client.get("/tasks/")

    @task(2)
    def create_task(self):
        """Create a new task"""
        task_data = {
            "title": f"Performance Test Task {random.randint(1000, 9999)}",
            "description": "This is a performance test task",
            "status": "pending",
            "dueDate": "2024-12-31T00:00:00"
        }
        response = self.client.post("/tasks/", json=task_data)

        # Store task ID for potential update/delete operations
        if response.status_code == 201:
            self.task_id = response.json().get("id")

    @task(1)
    def get_task_by_id(self):
        """Get a specific task"""
        # Try to get a task, might be from created task or random ID
        task_id = getattr(self, 'task_id', random.randint(1, 100))
        self.client.get(f"/tasks/{task_id}")

    @task(1)
    def update_task(self):
        """Update an existing task"""
        if hasattr(self, 'task_id'):
            update_data = {
                "title": "Updated Performance Task",
                "status": "completed"
            }
            self.client.patch(f"/tasks/{self.task_id}", json=update_data)

    @task(1)
    def delete_task(self):
        """Delete a task"""
        if hasattr(self, 'task_id'):
            self.client.delete(f"/tasks/{self.task_id}")
            delattr(self, 'task_id')

    @task(1)
    def get_api_docs(self):
        """Access API documentation"""
        self.client.get("/docs")


class AdminUser(HttpUser):
    wait_time = between(2, 5)
    weight = 1  # Less frequent than regular users

    @task
    def get_system_health(self):
        """Check system health"""
        self.client.get("/health")

    @task
    def get_cookie_endpoint(self):
        """Test cookie endpoint"""
        self.client.get("/tasks/cookie")