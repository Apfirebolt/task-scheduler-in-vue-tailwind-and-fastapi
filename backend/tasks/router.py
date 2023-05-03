from typing import List
from fastapi import APIRouter, Depends, status, Response, Request
from sqlalchemy.orm import Session

from backend import db

from .import schema
from .import services


router = APIRouter(
    tags=["Task"],
    prefix='/task'
)


@router.post('/', status_code=status.HTTP_201_CREATED,
             response_model=schema.TaskBase)
async def create_new_task(request: schema.TaskBase, database: Session = Depends(db.get_db)):
    result = await services.create_new_task(request, database)
    return result


@router.get('/', status_code=status.HTTP_200_OK,
            response_model=List[schema.TaskList])
async def task_list(database: Session = Depends(db.get_db)):
    result = await services.get_task_listing(database)
    return result


@router.get('/{task_id}', status_code=status.HTTP_200_OK, response_model=schema.TaskBase)
async def get_task_by_id(task_id: int, database: Session = Depends(db.get_db)):                            
    return await services.get_task_by_id(task_id, database)


@router.delete('/{task_id}', status_code=status.HTTP_204_NO_CONTENT, response_class=Response)
async def delete_task_by_id(task_id: int,
                                database: Session = Depends(db.get_db)):
    return await services.delete_task_by_id(task_id, database)


@router.patch('/{task_id}', status_code=status.HTTP_200_OK, response_model=schema.TaskBase)
async def update_task_by_id(request: schema.TaskUpdate, task_id: int, database: Session = Depends(db.get_db)):                            
    return await services.update_task_by_id(request, task_id, database)