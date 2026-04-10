import logging
import time
from functools import wraps

logger = logging.getLogger("app.services")


def service_monitor(func):
    """
    Decorator for monitoring the execution of asynchronous methods in a class.

    This decorator logs the start and completion of the decorated method, along with the
    execution time. If the decorated method raises an exception, it logs the error type,
    message, and traceback, as well as the time elapsed before the exception occurred.

    Args:
        func (Callable): The asynchronous method to be wrapped and monitored.

    Returns:
        Callable: The wrapped asynchronous method with added monitoring functionality.
    """

    @wraps(func)
    async def wrapper(self, *args, **kwargs):
        class_name = self.__class__.__name__
        func_name = func.__name__

        logger.debug(f"[{class_name}] Starting {func_name}")

        start_time = time.perf_counter()
        try:
            result = await func(self, *args, **kwargs)
            duration = time.perf_counter() - start_time

            logger.info(f"[{class_name}] {func_name} completed in {duration:.4f}s")
            return result

        except Exception as e:
            duration = time.perf_counter() - start_time

            logger.error(
                f"[{class_name}] {func_name} failed after {duration:.4f}s. Error: {type(e).__name__}: {e}",
                exc_info=True,
            )
            raise

    return wrapper
