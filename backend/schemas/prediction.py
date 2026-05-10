from pydantic import BaseModel, Field
from typing import Optional, List

class PredictionRequest(BaseModel):
    text: str = Field(..., description="The generated text from the LLM to be evaluated.")
    domain: Optional[str] = Field("general", description="The domain of the text, e.g., 'math', 'law', 'ui/ux'.")

class PredictionResponse(BaseModel):
    hallucination_score: float = Field(..., description="Score between 0.0 and 1.0 indicating hallucination likelihood.")
    hallucination_type: str = Field(..., description="Type of hallucination, e.g., 'fabrication', 'inconsistency', 'math_error', 'none'.")
    confidence: float = Field(..., description="Confidence score of the prediction.")
    details: Optional[str] = Field(None, description="Any additional explanation or reasoning provided by the model.")

class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    model_name: Optional[str] = "qwen3.5:4b"

class ChatResponse(BaseModel):
    response: str
