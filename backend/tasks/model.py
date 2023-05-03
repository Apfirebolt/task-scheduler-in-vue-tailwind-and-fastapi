from datetime import datetime
from sqlalchemy.orm import relationship
from sqlalchemy import Column, Float, String, Text, DateTime, Integer


from backend.db import Base


class Task(Base):
    __tablename__ = "task"

    id = Column(Integer, primary_key=True, autoincrement=True)
    createdDate = Column(DateTime, default=datetime.now)
    dueDate = Column(DateTime, default=datetime.now)
    title = Column(String(50))
    description = Column(Text)
    status = Column(String(50))