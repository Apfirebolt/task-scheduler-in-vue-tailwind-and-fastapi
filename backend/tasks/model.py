from datetime import datetime
from sqlalchemy import Column, String, Text, DateTime, Integer


from backend.db import Base


class Task(Base):
    __tablename__ = "task"

    id = Column(Integer, primary_key=True, autoincrement=True)
    createdDate = Column(DateTime, default=datetime.now)
    dueDate = Column(DateTime, default=datetime.now)
    title = Column(String(50))
    description = Column(Text)
    status = Column(String(50))

    def __str__(self):
        """String representation of Task"""
        return f"Task(id={self.id}, title='{self.title}', status='{self.status}')"

    def __repr__(self):
        """Representation of Task"""
        return f"<Task(id={self.id}, title='{self.title}', status='{self.status}')>"
