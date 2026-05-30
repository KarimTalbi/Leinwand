"""
This module defines custom exception classes for the application.

These exceptions are used to represent specific error conditions that can occur
during the application's execution, such as when a requested resource is not
found, a user already exists, or an API key is invalid.

Using custom exceptions allows for more specific error handling and clearer
error messages in the application's logs and API responses.
"""
from uuid import UUID

from fastapi import HTTPException, status


class NodeNotFoundException(Exception):
    """Exception raised when a specific node is not found in the database."""

    def __init__(self, node_id: UUID | str | None = None) -> None:
        self.node_id = node_id
        super().__init__(f"Node not found: {node_id}" if node_id else "Node not found")


class EdgeNotFoundException(Exception):
    """Exception raised when a specific edge is not found in the database."""

    def __init__(self, edge_id: UUID | str | None = None) -> None:
        self.edge_id = edge_id
        super().__init__(f"Edge not found: {edge_id}" if edge_id else "Edge not found")


class CanvasNotFoundException(Exception):
    """Exception raised when a specific canvas is not found in the database."""

    def __init__(self, canvas_id: UUID | str | None = None) -> None:
        self.canvas_id = canvas_id
        super().__init__(f"Canvas not found: {canvas_id}" if canvas_id else "Canvas not found")


class UserAlreadyExistsException(Exception):
    """Exception raised when attempting to create a user that already exists."""

    def __init__(self, username: str | None = None) -> None:
        self.username = username
        super().__init__(f"User already exists: {username}" if username else "User already exists")


class UserNotFoundException(Exception):
    """Exception raised when a specific user is not found."""

    def __init__(self) -> None:
        super().__init__("User not found")


class InactiveUserException(Exception):
    """Exception raised when an operation is attempted with an inactive user account."""

    def __init__(self, username: str | None = None) -> None:
        self.username = username
        super().__init__(f"Inactive user: {username}" if username else "Inactive user")


class InvalidApiKeyException(Exception):
    """Exception raised when an invalid API key is provided for an external service."""

    def __init__(self, message: str | None = None) -> None:
        self.message = message
        super().__init__(
            message if message else "Invalid API key. Please check your key and try again."
        )


class RateLimitError(Exception):
    """Exception raised when an API rate limit for an external service is exceeded."""

    def __init__(self, message: str | None = None) -> None:
        self.message = message
        super().__init__(message if message else "Rate limit exceeded. Please try again later.")


class ProviderError(Exception):
    """Exception raised for general errors that occur with an external provider."""

    def __init__(self, message: str | None = None) -> None:
        self.message = message
        super().__init__(
            message if message else "An error occurred with the provider. Please try again later."
        )


class InvalidUserOrPasswordException(HTTPException):
    """
    HTTPException for invalid username or password during authentication.
    Returns a 401 Unauthorized status.
    """

    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )


class CredentialsException(HTTPException):
    """
    HTTPException for failure to validate credentials.
    Returns a 401 Unauthorized status.
    """

    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
