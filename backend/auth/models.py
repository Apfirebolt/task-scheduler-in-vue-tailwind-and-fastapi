from sqlalchemy import Column, Integer, String
from sqlalchemy.orm import relationship
from backend.db import Base

from .import hashing


class User(Base):
    __tablename__ = "user"

    id = Column(Integer, primary_key=True, autoincrement=True)
    username = Column(String(50))
    email = Column(String(255), unique=True)
    role = Column(String(50), nullable=True, default='user')
    password = Column(String(255))

    movies = relationship("Movie", back_populates="owner")

    def __init__(self, username, email, role, password, *args, **kwargs):
        self.username = username
        self.email = email
        self.role = role
        self.password = hashing.get_password_hash(password)

    def check_password(self, password):
        return hashing.verify_password(self.password, password)
    
    def to_dict(self):
        return {
            "id": self.id,
            "username": self.username,
            "email": self.email,
            "role": self.role,
            "movies": [movie.to_dict() for movie in self.movies],
        }
