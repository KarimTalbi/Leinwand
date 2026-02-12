import logging
import sys
import time
import functools


def setup_logging():
    logging.basicConfig(
        level=logging.INFO,
        format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
        handlers=[
            logging.FileHandler("app.log"),
            logging.StreamHandler(sys.stdout)
        ]
    )

logger = logging.getLogger("CanvasApp")

def log_performance(func):
    @functools.wraps(func)
    async def wrapper(*args, **kwargs):
        class_name = args[0].__class__.__name__ if args else "Global"
        action_name = f"{class_name}.{func.__name__}"

        # --- METRIC LOGIC ---
        # Look for 'canvas' in positional args or keyword args
        canvas = next((arg for arg in args if hasattr(arg, 'nodes')), kwargs.get('canvas'))

        count_info = ""
        if canvas:
            n_count = len(getattr(canvas, 'nodes', []))
            e_count = len(getattr(canvas, 'edges', []))
            count_info = f"[Nodes: {n_count}, Edges: {e_count}]"
        # ---------------------

        logger.info(f"🚀 Started {action_name}{count_info}")
        start_time = time.perf_counter()

        try:
            result = await func(*args, **kwargs)
            duration = time.perf_counter() - start_time
            logger.info(f"✅ Finished {action_name} | Took {duration:.4f}s")
            return result
        except Exception as e:
            duration = time.perf_counter() - start_time
            logger.error(f"❌ Failed {action_name} | Took {duration:.4f}s | Type: {type(e).__name__} | Message: {e}", exc_info=True)
            raise e

    return wrapper