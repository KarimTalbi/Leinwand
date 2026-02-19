from data import get_async_session, CanvasService, NodeService, EdgeService
from llm_logic import AiModel, ConfigBuilder


def get_canvas_service():
    return CanvasService(get_async_session())


def get_node_service():
    return NodeService(get_async_session())


def get_edge_service():
    return EdgeService(get_async_session())


def get_ai_model(config: ConfigBuilder = ConfigBuilder(), echo: bool = False):
    return AiModel(config=config, echo=echo)
