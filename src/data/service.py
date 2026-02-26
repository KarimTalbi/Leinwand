from typing import (
    TYPE_CHECKING,
    Any,
    Literal,
    TypeVar,
    overload,
)
from uuid import UUID

from sqlalchemy import delete as delete_
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from . import ResourceNotFoundError
from .db_models import Base
from .schemas import CreateBase, ReadBase, UpdateBase

if TYPE_CHECKING:
    from sqlalchemy.engine import Result

_T = TypeVar("_T", bound=Base)
_R = TypeVar("_R", bound=ReadBase)
_C = TypeVar("_C", bound=CreateBase)
_U = TypeVar("_U", bound=UpdateBase)


async def add(session: AsyncSession, model: type[_T], payload: _C) -> _T:

    entity = model(**payload.model_dump(exclude_unset=True))

    session.add(entity)
    await session.flush()
    await session.refresh(entity)

    return entity


@overload
async def get(session: AsyncSession, model: type[_T], id_: Literal["*"] = ...) -> list[_T]: ...


@overload
async def get(session: AsyncSession, model: type[_T], id_: UUID = ...) -> _T: ...


async def get(
    session: AsyncSession, model: type[_T], id_: UUID | Literal["*"] = "*"
) -> _T | list[_T]:

    if id_ == "*":
        result: Result[tuple[_T]] = await session.execute(select(model))
        return list(result.scalars().all())

    result = await session.get(model, id_)
    if not result:
        raise ResourceNotFoundError(model, id_)

    return result


async def update(session: AsyncSession, model: type[_T], payload: _U) -> _T:

    entity: _T = await get(session, model, payload.id)
    data: dict[str, Any] = payload.model_dump(exclude_unset=True)

    for key, value in data.items():
        setattr(entity, key, value)

    await session.flush()
    await session.refresh(entity)

    return entity


@overload
async def delete(session: AsyncSession, model: type[_T], id_: Literal["*"]) -> list[_T]: ...


@overload
async def delete(session: AsyncSession, model: type[_T], id_: UUID) -> _T: ...


async def delete(session: AsyncSession, model: type[_T], id_: UUID | Literal["*"]) -> _T | list[_T]:
    if id_ == "*":
        result = await session.execute(delete_(model).returning(model))
        return list(result.scalars().all())

    entity: _T = await get(session, model, id_)
    await session.delete(entity)
    await session.flush()
    return entity
