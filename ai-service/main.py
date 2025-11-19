from fastapi import FastAPI, HTTPException
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from engine import RecommendationEngine

app = FastAPI()
engine = RecommendationEngine()

class RecommendationRequest(BaseModel):
    user_profile: Dict[str, Any]
    products: List[Dict[str, Any]]

@app.get("/")
def read_root():
    return {"message": "CoverBots AI Service is running"}

@app.post("/recommend")
def get_recommendations(request: RecommendationRequest):
    try:
        ranked = engine.rank_products(request.user_profile, request.products)
        return {"recommendations": ranked[:3]} # Return top 3
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

