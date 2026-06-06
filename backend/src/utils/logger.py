"""
This module configures the logging settings for the application.

It provides a setup function to initialize the root logger with stream
and file handlers, set appropriate log levels for various third-party
libraries (like SQLAlchemy and HTTPX), and define custom filters to
suppress unwanted exception tracebacks in specific logs.
"""
import logging
import sys


class SuppressExceptionFilter(logging.Filter):
    """
    A custom logging filter that suppresses log records containing exception information.

    This is useful for muting verbose tracebacks from specific loggers where
    only the log message itself is desired.
    """
    def filter(self, record: logging.LogRecord) -> bool:
        """
        Determines whether a log record should be filtered out.

        Args:
            record: The log record to evaluate.

        Returns:
            True if the record does not contain exception info (i.e., it should be logged),
            False if it does contain exception info (i.e., it should be suppressed).
        """
        return record.exc_info is None


def setup_logging() -> None:
    """
    Configures the application's logging infrastructure.

    This function sets up the root logger to output warnings and above to both
    standard output and a file named 'app.log'. It also configures specific log levels
    for application code and suppresses overly verbose output from libraries like
    SQLAlchemy and HTTPX. Additionally, it applies the SuppressExceptionFilter
    to the 'uvicorn.error' logger.
    """
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
