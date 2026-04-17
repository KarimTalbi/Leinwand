from fastapi import HTTPException, status


class InvalidUserOrPassword(HTTPException):
    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Invalid username or password"
    headers = {"WWW-Authenticate": "Bearer"}


class CredentialsException(HTTPException):
    status_code = status.HTTP_401_UNAUTHORIZED
    detail = "Could not validate credentials"
    headers = {"WWW-Authenticate": "Bearer"}


class UserAlreadyExists(HTTPException):
    status_code = status.HTTP_409_CONFLICT
    detail = "User already exists"


class InactiveUserException(HTTPException):
    status_code = status.HTTP_400_BAD_REQUEST
    detail = "Inactive user"


class NodeNotFoundException(HTTPException):
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Node not found"

class EdgeNotFoundException(HTTPException):
    status_code = status.HTTP_404_NOT_FOUND
    detail = "Edge not found"
