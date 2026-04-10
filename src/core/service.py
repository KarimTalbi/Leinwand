import json
from collections.abc import Sequence
from typing import Any

from sqlalchemy import select, delete
from sqlalchemy.dialects.sqlite import insert
from sqlalchemy.ext.asyncio import AsyncSession

from data import Node, NodeRead, Edge, EdgeRead, CanvasRead, get_ancestors_recursive


class BaseService[T, R]:
    """
    A generic base service class for handling CRUD operations with a specified database model.

    This class provides utility methods to list, retrieve by IDs, delete, and update
    entities in the database. It is designed to work with asynchronous database
    sessions and supports conflict handling on insert or update operations.

    Attributes:
        model (type[T]): The database model class that this service operates on.
        session (AsyncSession): The asynchronous session for interacting with the database.
        read_model (type[R]): The data transfer object (DTO) model class for read operations.
    """
    def __init__(self, session: AsyncSession, model: type[T], read_model: type[R]):
        self.model = model
        self.session = session
        self.read_model = read_model
        self.conflict_set_ = {}

    async def list(self) -> Sequence[T]:
        """
        Asynchronously retrieves a list of all records from the database corresponding
        to the model associated with this instance. The retrieved data is returned
        as a sequence of objects.

        Returns:
            Sequence[T]: A sequence containing all records of type `T` retrieved
            from the database.
        """
        result = await self.session.execute(select(self.model))
        return result.scalars().all()

    async def get(self, ids: Sequence[str]) -> Sequence[T]:
        """
        Fetches a sequence of records from the database by their IDs.

        This asynchronous method queries the database for records that match
        the given sequence of IDs. It uses the session's execute method to
        perform the query and retrieves matching scalars.

        Args:
            ids (Sequence[str]): A sequence of IDs for which the corresponding
                records need to be fetched.

        Returns:
            Sequence[T]: A sequence of fetched records corresponding to the
                provided IDs.
        """
        result = await self.session.execute(
            select(self.model).where(self.model.id.in_(ids))
        )
        return result.scalars().all()

    async def delete_not_in(self, ids: Sequence[str]) -> None:
        """
        Deletes all records from the database table that do not have their IDs in the provided sequence.

        This method performs an asynchronous delete operation by filtering records where their IDs
        are not included in the specified sequence of IDs.

        Args:
            ids (Sequence[str]): A sequence of string IDs that should remain in the database. All
                other records will be deleted.

        Returns:
            None
        """
        await self.session.execute(delete(self.model).where(self.model.id.notin_(ids)))

    async def update(self, items: Sequence[R]):
        """
        Updates the database with the provided sequence of items. Performs an upsert
        operation, where existing entries with conflicting keys are updated, and new
        entries are inserted.

        Args:
            items (Sequence[R]): A sequence of items to be added or updated in the
                database. Each item must be compatible with the model structure and must
                support the `model_dump` method for extracting model data while
                excluding unset and `None` values.
        """
        if not items:
            return

        await self.session.execute(
            insert(self.model)
            .values(
                [
                    item.model_dump(exclude_unset=True, exclude_none=True)
                    for item in items
                ]
            )
            .on_conflict_do_update(
                index_elements=["id"],
                set_=self.conflict_set_,
            )
        )


class NodeService(BaseService[Node, NodeRead]):
    """Service class for managing nodes and their relationships.

    The NodeService class provides methods for managing nodes and retrieving their
    hierarchical relationships, such as ancestors. This service is tied to a database
    session and operates on the Node and NodeRead models.

    Attributes:
        conflict_set_ (dict): A dictionary defining conflict resolution strategies
            for inserting or updating nodes, specifying how to handle conflicts with
            properties such as `type`, `position`, and `data`.
    """
    def __init__(self, session: AsyncSession):
        """
        Initializes a new instance of the class, setting up the conflict resolution set for database insert operations.

        Args:
            session (AsyncSession): The database session to be used for asynchronous operations.
        """
        super().__init__(session, Node, NodeRead)
        self.conflict_set_ = {
            "type": insert(Node).excluded.type,
            "position": insert(Node).excluded.position,
            "data": insert(Node).excluded.data,
        }

    async def get_ancestors(
        self, node_id: str, target_handle: str | None = None
    ) -> list[dict[str, Any]]:
        """
        Retrieves the ancestors of a specific node in a hierarchical structure.

        This asynchronous method fetches and processes data for all ancestor nodes of the
        specified `node_id` by executing a recursive query. The resulting data is cleaned
        by removing unnecessary keys and merging JSON attributes into the main dictionary.

        Args:
            node_id (str): The unique identifier of the node whose ancestors are being
                retrieved.
            target_handle (str | None): An optional unique identifier used to filter the
                ancestor search.

        Returns:
            list[dict[str, Any]]: A list of dictionaries, where each dictionary represents
                an ancestor node with its attributes, excluding unnecessary keys.
        """
        result = await self.session.execute(
            get_ancestors_recursive(node_id, target_handle)
        )

        rows = [dict(row) for row in result.mappings()]

        for row in rows:
            row.update(json.loads(row["data"]))
            for key in ["data", "id", "position", "closed", "label"]:
                row.pop(key)

        return rows


class EdgeService(BaseService[Edge, EdgeRead]):
    """
    Service class for managing Edge entities.

    This class provides operations for managing and interacting with `Edge` entities
    using an asynchronous database session. It is designed to provide features specific
    to edges in a graph or similar structure. The `EdgeService` inherits from a generic
    base service class, `BaseService`, and utilizes a data transfer object `EdgeRead`
    for read operations. The class integrates conflict resolution mechanisms for handling
    database insertions.

    Attributes:
        session (AsyncSession): The asynchronous database session used for interactions
            with the database.
    """
    def __init__(self, session: AsyncSession):
        super().__init__(session, Edge, EdgeRead)
        self.conflict_set_ = {
            "source": insert(Edge).excluded.source,
            "target": insert(Edge).excluded.target,
            "source_handle": insert(Edge).excluded.source_handle,
            "target_handle": insert(Edge).excluded.target_handle,
        }


class CanvasService:
    """
    Service class for managing canvas data including nodes and edges.

    This class provides methods to list, update, delete, and synchronize
    canvas-related data such as nodes and edges. It acts as a bridge between
    different services handling specific aspects of a canvas, such as nodes and
    edges, ensuring consistency and correctness of the data.

    Attributes:
        nodes (NodeService): Service instance for managing node-related operations.
        edges (EdgeService): Service instance for managing edge-related operations.
    """
    def __init__(self, session: AsyncSession):
        self.nodes = NodeService(session)
        self.edges = EdgeService(session)

    async def list(self) -> CanvasRead:
        """
        Asynchronously retrieves a complete canvas structure.

        This method consolidates the nodes and edges of a canvas into a single
        structured output. It leverages asynchronous operations to fetch
        the list of nodes and edges individually and then combines them
        into a unified object.

        Returns:
            CanvasRead: An object containing the list of nodes and edges.

        Raises:
            Any exceptions raised during the asynchronous retrieval of nodes or
            edges will propagate to the caller.
        """
        return CanvasRead(nodes=await self.nodes.list(), edges=await self.edges.list())

    async def delete_not_in(self, data: CanvasRead) -> None:
        """
        Deletes nodes and edges from the database that are not present in the input data.

        This method ensures that only the nodes and edges specified in the input data remain in the
        database by deleting any entries that are not included in the specified node and edge IDs. It
        is intended to synchronize the state of the database with the given data.

        Args:
            data (CanvasRead): The input data containing the nodes and edges to retain in the database.
        """
        node_ids = [n.id for n in data.nodes]
        edge_ids = [e.id for e in data.edges]

        await self.edges.delete_not_in(edge_ids)
        await self.nodes.delete_not_in(node_ids)

    async def update(self, data: CanvasRead) -> None:
        """
        Updates nodes and edges in the current instance with the provided data.

        Args:
            data (CanvasRead): An object containing the information needed to update
                the nodes and edges. This includes `nodes` to update the current list
                of nodes and `edges` to update the current edges list.

        Returns:
            None
        """
        await self.nodes.update(data.nodes)
        await self.edges.update(data.edges)

    async def sync(self, data: CanvasRead) -> None:
        """
        Synchronizes the current state with the given data by deleting entries
        not present in the data and updating existing entries accordingly.

        Args:
            data (CanvasRead): The data structure containing updated information
                to sync with.
        """
        await self.delete_not_in(data)
        await self.update(data)
