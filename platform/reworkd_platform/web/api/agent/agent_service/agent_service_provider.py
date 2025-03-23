from typing import Any, Callable, Coroutine, Optional

from fastapi import Depends

from aiflow_platform.db.crud.oauth import OAuthCrud
from aiflow_platform.schemas.agent import AgentRun, LLM_Model
from aiflow_platform.schemas.user import UserBase
from aiflow_platform.services.tokenizer.dependencies import get_token_service
from aiflow_platform.services.tokenizer.token_service import TokenService
from aiflow_platform.settings import settings
from aiflow_platform.web.api.agent.agent_service.agent_service import AgentService
from aiflow_platform.web.api.agent.agent_service.mock_agent_service import (
    MockAgentService,
)
from aiflow_platform.web.api.agent.agent_service.open_ai_agent_service import (
    OpenAIAgentService,
)
from aiflow_platform.web.api.agent.model_factory import create_model
from aiflow_platform.web.api.dependencies import get_current_user


def get_agent_service(
    validator: Callable[..., Coroutine[Any, Any, AgentRun]],
    streaming: bool = False,
    llm_model: Optional[LLM_Model] = None,
) -> Callable[..., AgentService]:
    def func(
        run: AgentRun = Depends(validator),
        user: UserBase = Depends(get_current_user),
        token_service: TokenService = Depends(get_token_service),
        oauth_crud: OAuthCrud = Depends(OAuthCrud.inject),
    ) -> AgentService:
        if settings.ff_mock_mode_enabled:
            return MockAgentService()

        model = create_model(
            settings,
            run.model_settings,
            user,
            streaming=streaming,
            force_model=llm_model,
        )

        return OpenAIAgentService(
            model,
            run.model_settings,
            token_service,
            callbacks=None,
            user=user,
            oauth_crud=oauth_crud,
        )

    return func
