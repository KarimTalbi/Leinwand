import logging
import sys
import time
from functools import wraps

logger = logging.getLogger("app.services")


def service_monitor(func):

    @wraps(func)
    async def wrapper(*args, **kwargs):
        func_file = func.__code__.co_filename
        func_name = func.__name__

        logger.debug(f"Starting {func_name} {func_file}:{func.__code__.co_firstlineno}")

        start_time = time.perf_counter()
        try:
            result = await func(*args, **kwargs)
            duration = time.perf_counter() - start_time

            logger.info(
                f"{func_name} completed in {duration:.4f}s {func_file}:{func.__code__.co_firstlineno}"
            )
            return result

        except Exception as e:
            duration = time.perf_counter() - start_time

            logger.error(
                f"{func_name} failed after {duration:.4f}s. Error: {type(e).__name__}: {e}",
                exc_info=True,
            )
            raise

    return wrapper


def setup_logging():

    logging.basicConfig(
        level=logging.WARNING,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("../app.log"),
        ],
    )

    logging.getLogger("app").setLevel(logging.DEBUG)
    logging.getLogger("app.services").setLevel(logging.INFO)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("uvicorn").setLevel(logging.INFO)
