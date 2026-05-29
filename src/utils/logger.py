import logging
import sys

class SuppressExceptionFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        return record.exc_info is None


def setup_logging() -> None:

    logging.basicConfig(
        level=logging.WARNING,
        format="%(asctime)s [%(levelname)s] %(name)s: %(message)s",
        handlers=[
            logging.StreamHandler(sys.stdout),
            logging.FileHandler("../app.log"),
        ],
    )

    logging.getLogger("app").setLevel(logging.DEBUG)
    logging.getLogger("sqlalchemy.engine").setLevel(logging.WARNING)
    logging.getLogger("httpx").setLevel(logging.WARNING)
    logging.getLogger("uvicorn.error").addFilter(SuppressExceptionFilter())
