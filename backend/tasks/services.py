from fastapi import HTTPException, status
from typing import List
from . import model
from datetime import datetime


async def create_new_task(request, database) -> model.Task:
    new_task = model.Task(title=request.title, description=request.description, status=request.status,
                            createdDate=datetime.now(), dueDate=request.dueDate)
    database.add(new_task)
    database.commit()
    database.refresh(new_task)
    return new_task


async def get_task_listing(database) -> List[model.Task]:
    tasks = database.query(model.Task).all()
    return tasks


async def get_task_by_id(task_id, database):
    task = database.query(model.Task).filter_by(id=task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="task Not Found !"
        )
    return task


async def delete_task_by_id(task_id, database):
    database.query(model.Task).filter(
        model.Task.id == task_id).delete()
    database.commit()


async def update_task_by_id(request, task_id, database):
    task = database.query(model.Task).filter_by(id=task_id).first()
    if not task:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND,
            detail="task Not Found !"
        )
    task.title = request.title if request.title else task.title
    task.description = request.description if request.description else task.description
    task.status = request.status if request.status else task.status
    task.dueDate = request.dueDate if request.dueDate else task.dueDate
    database.commit()
    database.refresh(task)
    return task