"""
Provides classes and methods for managing entities and their persistence, such as nodes, edges,
and canvases, in an asynchronous context using SQLAlchemy. This module includes generic services
for creating, listing, updating, and deleting entities, as well as services specific to nodes and
edges. It also defines a service for managing a canvas, which is a combination of nodes and edges.
"""
import asyncio
from uuid import UUID
from typing import Generic, List, Optional, Type, Tuple, Set

from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import select, delete

from utils import is_valid_uuid, log_performance
from data import (
    Node, NodeRead, NodeCreate, NodeUpdate,
    Edge, EdgeRead, EdgeCreate, EdgeUpdate,
    CanvasRead,
    SyncTask, T, C, R, U
)


class BaseService(Generic[T, C, U]):
    """
    Provides a generic base service class for performing common database operations.

    This class encapsulates general operations such as listing, creating, reading, updating,
    and deleting entities in a database. Designed to be extended for specific model implementations,
    it employs asynchronous methods and is compatible with SQLAlchemy's AsyncSession. It reduces
    boilerplate code in database-driven services by providing generic methods for common tasks.

    Attributes:
        model (Type[T]): The SQLAlchemy model class associated with the service.
        session (AsyncSession): The asynchronous database session used for executing operations.
    """

    def __init__(self, model: Type[T], session: AsyncSession):
        self.model = model
        self.session = session

    @log_performance
    async def list(self, offset: int = 0, limit: int = 100) -> List[T]:
        """
        Asynchronously retrieves a list of records from the database with pagination support.
        The method executes a database query to fetch records starting from the specified
        `offset` and up to the number of records specified by `limit`.

        Args:
            offset (int): The starting position of the records to retrieve. Defaults to 0.
            limit (int): The maximum number of records to retrieve. Defaults to 100.

        Returns:
            List[T]: A list of records of type `T`, as retrieved from the database.
        """

        result = await self.session.execute(
            select(self.model).offset(offset).limit(limit)
        )
        return list(result.scalars().all())

    @log_performance
    async def list_ids(self, offset: int = 0, limit: int = 100) -> List[UUID]:
        """
        Fetches a paginated list of all IDs from the specified model in the database.

        The method retrieves IDs using the SQLAlchemy `select` query with `offset` and
        `limit` parameters for pagination, ensuring efficient data access in large
        datasets.

        Args:
            offset (int): The starting point from which records are fetched. Defaults to 0.
            limit (int): The maximum number of IDs to fetch. Defaults to 100.

        Returns:
            List[UUID]: A list of IDs retrieved from the database.
        """

        result = await self.session.execute(
            select(self.model.id).offset(offset).limit(limit)
        )
        return list(result.scalars().all())

    @log_performance
    async def create(self, create_schema: C) -> T:
        """
        Asynchronously creates and persists a new instance of the given model based on the provided schema.

        This method takes in a schema containing the data for a new instance, creates the model object,
        persists it to the database through the current session, and refreshes the instance to ensure it
        contains the latest changes. The newly created instance is then returned.

        Args:
            create_schema (C): A schema object containing the data for the new model instance.

        Returns:
            T: The newly created and persisted instance of the model.
        """

        instance = self.model(**create_schema.model_dump())

        self.session.add(instance)
        await self.session.flush()
        await self.session.refresh(instance)

        return instance

    @log_performance
    async def create_many(self, create_schemas: List[C]):
        """
        Creates multiple instances in the database from the provided schemas.

        This asynchronous method takes a list of schemas, converts them into model
        instances, and adds them to the database session in bulk. The provided schemas
        must be compatible with the underlying model structure to ensure successful
        database operations.

        Args:
            create_schemas (List[C]): A list of schema objects to be converted into
                model instances and added to the database.
        """

        if create_schemas:
            instances = [
                self.model(**create_schema.model_dump()) for create_schema in create_schemas
            ]
            self.session.add_all(instances)

    @log_performance
    async def read(self, instance_id: UUID) -> Optional[T]:
        """
        Reads an instance of the specified model using the provided instance ID.

        This method fetches a record from the specified database model using its
        unique identifier. It leverages an asynchronous session to perform the query
        operation in an efficient manner. If no matching record is found, the method
        returns None.

        Args:
            instance_id (UUID): The unique identifier of the instance to read from
                the database.

        Returns:
            Optional[T]: The instance of the model if found, or None if no matching
            instance exists.
        """
        return await self.session.get(
            self.model, instance_id
        )

    @log_performance
    async def update(self, instance_id: UUID, update_instance: U) -> Optional[T]:
        """
        Updates an existing instance in the database.

        Given an instance identifier and an update payload, this method retrieves the
        corresponding instance, applies the updates, and saves the changes to the
        database. If the instance does not exist, the method returns None.

        Args:
            instance_id (UUID): The unique identifier for the instance to be updated.
            update_instance (U): The update payload containing fields and values to
                modify within the instance.

        Returns:
            Optional[T]: The updated instance if it exists, otherwise None.
        """
        instance = await self.read(instance_id)

        if instance:
            instance_data = update_instance.model_dump(exclude_unset=True)

            for key, value in instance_data.items():
                setattr(instance, key, value)

            self.session.add(instance)
            await self.session.flush()
            await self.session.refresh(instance)

        return instance

    @log_performance
    async def delete(self, instance_id: UUID) -> bool:
        """
        Deletes an instance with the specified ID asynchronously.

        This method retrieves an instance by its ID and deletes it from the session if
        it exists. It returns a boolean indicating whether the deletion was successful.

        Args:
            instance_id (UUID): The unique identifier of the instance to delete.

        Returns:
            bool: True if the instance was found and deleted, otherwise False.
        """
        instance = await self.read(instance_id)

        if instance:
            await self.session.delete(instance)
            return True

        return False

    @log_performance
    async def delete_many(self, instance_ids: List[UUID]):
        """
        Deletes multiple instances from the database using their unique identifiers.

        This method takes a list of UUIDs representing instance IDs and deletes
        the corresponding records asynchronously from the database. It ensures
        efficient bulk deletion if valid instance IDs are provided.

        Args:
            instance_ids (List[UUID]): A list of UUIDs identifying the instances to
                be deleted. If an empty list is provided, no operation is performed.
        """
        if instance_ids:
            await self.session.execute(
                delete(self.model).where(self.model.id.in_(instance_ids))
            )


class NodeService(BaseService[Node, NodeCreate, NodeUpdate]):
    """
    Provides management functions for Node entities.

    This class interacts with the database to perform CRUD operations for the
    Node model. It leverages the BaseService customizable for various entity
    types, enabling reuse and consistent implementation of service logic.
    The NodeService is specifically tailored to handle operations on Node
    objects using asynchronous database sessions.

    Attributes:
        model (Type[Node]): The database model associated with the service.
        session (AsyncSession): The asynchronous session used for database
            interactions.
    """

    def __init__(self, session: AsyncSession):
        super().__init__(
            Node, session
        )


class EdgeService(BaseService[Edge, EdgeCreate, EdgeUpdate]):
    """
    Handles business logic for the Edge entity.

    This class provides methods for managing and interacting with Edge entities,
    including creation, update, and retrieval operations. It inherits functionality
    from the BaseService class, which provides common service methods for database
    operations utilizing an asynchronous session.

    Attributes:
        session (AsyncSession): Database session used for executing asynchronous
            operations on Edge entities.
    """

    def __init__(self, session: AsyncSession):
        super().__init__(
            Edge, session
        )


class CanvasService:
    """
    Service for managing and retrieving canvas-related data.

    Provides methods to retrieve, update, and synchronize data related to nodes
    and edges within a canvas structure. This class serves as a central point for
    interacting with canvas entities by leveraging `NodeService` and `EdgeService`.

    Attributes:
        session (AsyncSession): The asynchronous session used for database
            operations.
        node_service (NodeService): Service for interacting with node entities.
        edge_service (EdgeService): Service for interacting with edge entities.
    """

    def __init__(self, session: AsyncSession):
        self.session = session
        self.node_service = NodeService(session)
        self.edge_service = EdgeService(session)

    @log_performance
    async def get(self) -> Tuple[List[Node], List[Edge]]:
        """
        Retrieves and returns a list of nodes and edges asynchronously.

        This method gathers data from the node_service and edge_service concurrently,
        fetching a list of nodes and edges and returning them in a tuple.

        Returns:
            Tuple[List[Node], List[Edge]]: A tuple containing a list of Node objects and a list of Edge objects.
        """
        return await asyncio.gather(
            self.node_service.list(),
            self.edge_service.list()
        )

    @log_performance
    async def get_ids(self) -> Tuple[List[UUID], List[UUID]]:
        """
        Asynchronously fetches IDs from node and edge services and returns a tuple of lists.

        This method gathers the results from `node_service.list_ids()` and
        `edge_service.list_ids()` concurrently, utilizing asyncio. The results are
        returned as a tuple containing two lists of UUIDs.

        Returns:
            Tuple[List[UUID], List[UUID]]: A tuple where the first element is the list of
            UUIDs from the node service and the second element is the list of UUIDs from
            the edge service.
        """
        return await asyncio.gather(
            self.node_service.list_ids(),
            self.edge_service.list_ids()
        )

    @log_performance
    async def read(self) -> CanvasRead:
        """
        Asynchronously reads data and returns a `CanvasRead` object containing
        validated nodes and edges.

        This function retrieves data using the `get` method, validates the nodes and
        edges using `NodeRead` and `EdgeRead` validators, and wraps them in a
        `CanvasRead` object.

        Returns:
            CanvasRead: An object containing the validated nodes and edges.
        """
        nodes, edges = await self.get()

        return CanvasRead(
            nodes=[NodeRead.model_validate(nodes)],
            edges=[EdgeRead.model_validate(edges)]
        )

    @staticmethod
    async def _sync_entities(
            items: List[R],
            db_ids: Set[UUID],
            service: BaseService,
            create_schema: Type[C],
            update_schema: Type[U]
    ):
        """
        Synchronizes a collection of entity objects with their corresponding database entries.
        This involves comparing the provided list of items with the set of database IDs and
        performing necessary create, update, or delete operations.

        Args:
            items (List[R]): A list of entity objects to synchronize. `R` should represent the
                format of items provided, each containing an "id" attribute of UUID type
                along with other attributes to manage.
            db_ids (Set[UUID]): A set of UUIDs representing the IDs of entities currently
                present in the database.
            service (BaseService): An instance of a service class that interfaces with the
                database, providing methods for creating, updating, or deleting entries.
            create_schema (Type[C]): A schema class used for creating new entries in the
                database based on the items lacking a valid or existing ID.
            update_schema (Type[U]): A schema class used for updating existing entries in the
                database with modified attributes of entities.
        """

        await service.delete_many(
            list(db_ids - {i.id for i in items if i.id})
        )

        to_create = []
        for item in items:
            if is_valid_uuid(item.id) and item.id in db_ids:
                await service.update(
                    item.id, update_schema(**item.model_dump(exclude={"id"}))
                )

            else:
                to_create.append(
                    create_schema(**item.model_dump(exclude={"id"}))
                )

        if to_create:
            await service.create_many(to_create)

    @log_performance
    async def save(self, canvas: CanvasRead):
        """
        Saves the current state of the canvas into the database by synchronizing nodes and edges
        against the existing database state. Performs the synchronization in an efficient,
        transactional manner and ensures that any changes in the canvas state are properly
        reflected within the database.

        Args:
            canvas (CanvasRead): The canvas object containing the nodes and edges to be saved.

        Returns:
            Any: The updated canvas after synchronization with the database.
        """
        async with self.session.begin():
            db_nodes_ids, db_edges_ids = [
                set(res) for res in await self.get_ids()
            ]

            sync_plan: List[SyncTask] = [
                SyncTask(
                    items=canvas.nodes,
                    db_ids=db_nodes_ids,
                    service=self.node_service,
                    create_schema=NodeCreate,
                    update_schema=NodeUpdate
                ),
                SyncTask(
                    items=canvas.edges,
                    db_ids=db_edges_ids,
                    service=self.edge_service,
                    create_schema=EdgeCreate,
                    update_schema=EdgeUpdate
                )
            ]

            for task in sync_plan:
                await self._sync_entities(**task)
                await self.session.flush()

            return await self.read()
