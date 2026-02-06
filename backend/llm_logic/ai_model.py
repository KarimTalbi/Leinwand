import os
from dotenv import load_dotenv
from langchain_google_genai import ChatGoogleGenerativeAI
from pydantic import BaseModel


load_dotenv()

class Message:
    pass

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

### FORMATTING
- Use Markdown for formatting
"""

ALT_PROMPT = """
You are an AI processing a Directed Acyclic Graph (DAG) of conversation nodes. 
The context provided is a "Flattened Graph" where multiple branches may merge into the current node.

GUIDELINES:
1. MERGING PATHS: If you see two nodes that seem to come from different conversation flows (e.g., different numbers removed in different branches), your task is to UNIFY them. 
2. STATE AGGREGATION: Treat all previous nodes as cumulative. If Path A removed '7' and Path B removed '9', the current state is that BOTH '7' and '9' are removed.
3. NON-LINEARITY: Do not apologize for "inconsistencies" in previous nodes. Understand that those nodes existed in parallel branches. Simply provide the new consolidated state.
4. NODE IDS: Use the provided Node IDs to track the hierarchy if necessary, but focus on the cumulative content of the prompts.
"""

class Response(BaseModel):
    context_summary: str
    response_text: str


model = ChatGoogleGenerativeAI(
    model="gemini-3-flash-preview",
    temperature=1.0,
    max_tokens=None,
    timeout=None,
    max_retries=2,
    include_thoughts=True
)

structured_model = model.with_structured_output(
    schema=Response.model_json_schema(),
    method="json_schema"
)
messages=[
        ("system", SYSTEM_PROMPT),
        ("human", "tell me what your role is")
    ]

response = structured_model.invoke(
    messages
)

print(response)