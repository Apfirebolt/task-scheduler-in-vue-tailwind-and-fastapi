from datetime import date, datetime
from typing import Optional
from pydantic import BaseModel


class TaskBase(BaseModel):
    id: Optional[int]
    title: str
    description: str
    status: str
    createdDate: Optional[datetime]
    dueDate: datetime

    class Config:
        orm_mode = True


class TaskUpdate(BaseModel):
    title: Optional[str]
    description: Optional[str]
    status: Optional[str]
    dueDate: Optional[datetime]

    class Config:
        orm_mode = True


class TaskList(BaseModel):
    id: int
    title: str
    description: str
    status: str
    createdDate: datetime
    dueDate: datetime

    class Config:
        orm_mode = True