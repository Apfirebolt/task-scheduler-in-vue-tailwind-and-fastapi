from datetime import date
from typing import Optional
from pydantic import BaseModel


class TaskBase(BaseModel):
    id: Optional[int]
    title: str
    description: str
    status: str
    dueDate: date

    class Config:
        orm_mode = True


class TaskUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    status: Optional[str]
    dueDate: Optional[date]

    class Config:
        orm_mode = True


class TaskList(BaseModel):
    id: int
    title: str
    description: str
    status: str
    createdDate: date
    dueDate: date

    class Config:
        orm_mode = True