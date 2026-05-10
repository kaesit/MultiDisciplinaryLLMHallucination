from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from contextlib import asynccontextmanager
from api.routes import router as prediction_router
from ml.model import predictor

@asynccontextmanager
async def lifespan(app: FastAPI):
    # Load the ML model on startup
    predictor.load_model()
    yield
    # Clean up resources on shutdown if necessary
    
app = FastAPI(
    title="LLM Hallucination Prediction API",
    description="Backend for testing and detecting hallucinations in LLMs",
    version="1.0.0",
    lifespan=lifespan
)

app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

app.include_router(prediction_router)

@app.get("/")
def health_check():
    return {"status": "ok", "message": "LLM Hallucination Backend is running."}
