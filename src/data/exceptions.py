from uuid import UUID


class DomainError(Exception): ...


class ResourceNotFoundError(DomainError):
    def __init__(self, service: object, ids: list[UUID]) -> None:
        service_name: str = service.__class__.__name__.replace("Service", "")
        self.message: str = f"{service_name} not found: {ids}"
        super().__init__(self.message)


class InvalidUUIDError(DomainError):
    def __init__(self, service: object, id_: UUID | None) -> None:
        service_name: str = service.__class__.__name__.replace("Service", "")
        self.message: str = (
            f"id: {id_} is not a valid UUID for {service_name}"
            if id_
            else "No id provided"
        )
        super().__init__(self.message)


class SyncError(DomainError):
    def __init__(self) -> None:
        super().__init__("Sync Error")
