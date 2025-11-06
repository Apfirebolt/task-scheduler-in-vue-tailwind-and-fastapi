from fastapi import HTTPException, status
from typing import List, Optional

from . import schema
from . import models


async def new_user_register(request: schema.BaseModel, database) -> models.User:
    try:
        new_user = models.User(username=request.username, email=request.email,
                               password=request.password,
                               role='user')                     
        database.add(new_user)
        database.commit()
        database.refresh(new_user)
        return new_user
    except Exception as e:
        database.rollback()
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while registering the user: {str(e)}"
        )


async def all_users(database) -> List[models.User]:
    try:
        users = database.query(models.User).all()
        return users
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching all users: {str(e)}"
        )


async def get_user_by_id(user_id, database) -> Optional[models.User]:
    try:
        user_info = database.query(models.User).get(user_id)

        if not user_info:
            raise HTTPException(
                status_code=status.HTTP_404_NOT_FOUND,
                detail="Data not found!"
            )

        return user_info
    except HTTPException:
        raise
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching the user by ID: {str(e)}"
        )


async def get_profile(database, current_user) -> models.User:
    try:
        user = database.query(models.User).filter(models.User.email == current_user.email).first()
        return user
    except Exception as e:
        raise HTTPException(
            status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
            detail=f"An error occurred while fetching the user profile: {str(e)}"
        )
