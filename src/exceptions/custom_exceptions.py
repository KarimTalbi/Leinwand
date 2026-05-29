from uuid import UUID

from fastapi import HTTPException, status


class NodeNotFoundException(Exception):
    def __init__(self, node_id: UUID | str | None = None) -> None:
        self.node_id = node_id
        super().__init__(f"Node not found: {node_id}" if node_id else "Node not found")


class EdgeNotFoundException(Exception):
    def __init__(self, edge_id: UUID | str | None = None) -> None:
        self.edge_id = edge_id
        super().__init__(f"Edge not found: {edge_id}" if edge_id else "Edge not found")


class CanvasNotFoundException(Exception):
    def __init__(self, canvas_id: UUID | str | None = None) -> None:
        self.canvas_id = canvas_id
        super().__init__(f"Canvas not found: {canvas_id}" if canvas_id else "Canvas not found")


class UserAlreadyExistsException(Exception):
    def __init__(self, username: str | None = None) -> None:
        self.username = username
        super().__init__(f"User already exists: {username}" if username else "User already exists")


class UserNotFoundException(Exception):
    def __init__(self) -> None:
        super().__init__("User not found")


class InactiveUserException(Exception):
    def __init__(self, username: str | None = None) -> None:
        self.username = username
        super().__init__(f"Inactive user: {username}" if username else "Inactive user")


class InvalidApiKeyException(Exception):
    def __init__(self, message: str | None = None) -> None:
        self.message = message
        super().__init__(
            message if message else "Invalid API key. Please check your key and try again."
        )


class RateLimitError(Exception):
    def __init__(self, message: str | None = None) -> None:
        self.message = message
        super().__init__(message if message else "Rate limit exceeded. Please try again later.")


class ProviderError(Exception):
    def __init__(self, message: str | None = None) -> None:
        self.message = message
        super().__init__(
            message if message else "An error occurred with the provider. Please try again later."
        )


class InvalidUserOrPasswordException(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )


class CredentialsException(HTTPException):
    def __init__(self) -> None:
        super().__init__(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Could not validate credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
