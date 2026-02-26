from uuid import UUID

from fastapi import Depends

from llm_logic import AiConfig, AiModel, Context


def get_ai_model(config: AiConfig = AiConfig(), echo: bool = True) -> AiModel:
    return AiModel(config=config, echo=echo)


async def get_context(
    _target: UUID, service: CanvasService = Depends(get_canvas_service)
) -> str:
    db_data = await service.get()

    return Context(
        canvas=db_data,
        target_id=_target,
    ).build_prompt()
