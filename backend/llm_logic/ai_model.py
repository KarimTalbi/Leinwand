from typing import Optional, List

from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from langchain_core.messages import SystemMessage, HumanMessage, BaseMessage
from pydantic import BaseModel, PrivateAttr

from data.context import get_graph_data, GraphContext

load_dotenv()

SYSTEM_PROMPT = """
### ROLE
You are an AI assistant operating within a "Multidimensional Chat Canvas." Unlike a linear chat, this conversation is a Directed Acyclic Graph (DAG) where paths can split and reunite.

### STRUCTURAL MARKERS
You will see specific markers in the context. Treat them as follows:

1. <<< BRANCH POINT: This signals that the conversation has split into parallel "alternative realities." Nodes following this may explore different topics or propose different solutions based on the same preceding context. Do not be confused if different branches seem to ignore each other.

2. >>> MERGE POINT: This is a critical signal. It indicates that the independent branches are now converging. You MUST:
   - Aggregate the state from ALL parent branches mentioned.
   - Resolve any discrepancies (e.g., if one branch added an item and another removed a different one, the new state includes both actions).
   - Reconcile the history into a single, unified "truth" for the current node.

### OPERATIONAL GUIDELINES
- DO NOT apologize for "inconsistencies" or "memory errors" occurring across different branches. Understand that they were parallel paths.
- If a user asks "What has happened so far?" at a Merge Point, your answer must account for the union of all preceding branches.
- Maintain a grounded, helpful tone as you navigate these non-linear transitions.

### CORE ANCHOR RULES
You must always prioritize the instructions established in the ROOT NODE of this conversation. 
If the root node established a game, a list, or a specific set of logic (e.g., 'Remove mentioned numbers from a list'), that logic remains the absolute priority for all child nodes, regardless of how many branches have occurred.
If the only Node is the same as the User input that means it is the start of a completely new line of Nodes without any context yet.

### FORMATTING
- Use Markdown for formatting
"""


class Response(BaseModel):
    response_text: str


class PromptBuilder(BaseModel):
    system: Optional[str] = SYSTEM_PROMPT
    context: Optional[str] = None
    user_prompt: str

    _messages: List[BaseMessage] = PrivateAttr(default_factory=list)

    def model_post_init(self, __context) -> None:
        self._messages = [SystemMessage(content=self.system)]

        if self.context:
            self._messages.append(HumanMessage(content=self.context))

        self._messages.append(HumanMessage(content=self.user_prompt))

    @property
    def messages(self) -> List[BaseMessage]:
        return self._messages


def get_response(prompt: str, node_id: str):
    model = ChatGoogleGenerativeAI(
        model="gemini-2.5-flash",
    )

    nodes, edges = get_graph_data(node_id)
    context = GraphContext(nodes=nodes, edges=edges).build_context()

    messages = PromptBuilder(context=context, user_prompt=prompt).messages

    # structured_model = model.with_structured_output(
    #     schema=Response.model_json_schema(),
    #     method="json_schema"
    # )

    return model.invoke(
        messages
    ).content
