from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from rag_engine import LightweightRAG
from llm_client import LLMClient
import shutil
import os
import json
from dotenv import load_dotenv

load_dotenv()

app = FastAPI()
rag = LightweightRAG()
llm = LLMClient()

class RecommendationRequest(BaseModel):
    user_profile: Dict[str, Any]
    query: str
    active_vendor_ids: Optional[List[str]] = None
    products: Optional[List[Dict]] = None

@app.get("/")
def read_root():
    return {"message": "CoverBots AI Service (Lightweight RAG) is running"}

@app.post("/ingest")
async def ingest_policy(vendor_id: str, file: UploadFile = File(...)):
    try:
        # Save temp file
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Read text (Simple text/markdown support for MVP)
        with open(temp_path, "r", encoding="utf-8", errors="ignore") as f:
            text = f.read()
            
        # Ingest
        chunks_count = rag.ingest_document(text, {"vendor_id": vendor_id, "filename": file.filename})
        
        os.remove(temp_path)
        return {"message": f"Ingested {chunks_count} chunks from {file.filename}"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/recommend")
def get_recommendations(request: RecommendationRequest):
    try:
        # 1. Retrieve relevant policy chunks
        # We search using the user's query + category to find relevant policy info
        search_query = f"{request.query} {request.user_profile.get('category', '')}"
        context_chunks = rag.search(search_query, k=3)
        
        # 2. Generate recommendations with context
        recommendation_str = llm.generate_recommendation(
            request.user_profile, 
            context_chunks,
            request.products or []
        )
        
        try:
            # Try to parse as JSON
            recommendations = json.loads(recommendation_str)
            
            # Ensure it's a list
            if not isinstance(recommendations, list):
                recommendations = [recommendations]
                
            return {
                "recommendations": recommendations,
                "context_used": context_chunks
            }
        except json.JSONDecodeError:
            # Try to clean markdown formatting
            print(f"Failed to decode JSON, attempting cleanup: {recommendation_str}")
            clean_str = recommendation_str.replace("```json", "").replace("```", "").strip()
            try:
                recommendation_data = json.loads(clean_str)
                return {
                    "recommendations": recommendation_data if isinstance(recommendation_data, list) else [recommendation_data],
                    "context_used": context_chunks
                }
            except json.JSONDecodeError:
                # Fallback
                print(f"Failed to parse JSON after cleanup: {clean_str}")
                return {
                    "recommendations": [],
                    "context_used": context_chunks,
                    "error": "Failed to generate valid recommendations",
                    "raw_response": recommendation_str[:500]
                }
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/compatibility")
def calculate_compatibility(request: dict):
    """
    Calculate compatibility scores for products based on user profile.
    Returns a score (0-100) and reasoning for each product.
    """
    try:
        user_profile = request.get("user_profile", {})
        products = request.get("products", [])
        
        if not user_profile or not products:
            return {"scored_products": []}
        
        # Use LLM to score each product
        scored_products = []
        for product in products:
            try:
                score_result = llm.score_compatibility(user_profile, product)
                scored_products.append({
                    "product_id": product.get("id"),
                    "score": score_result.get("score", 0),
                    "reasoning": score_result.get("reasoning", "")
                })
            except Exception as e:
                print(f"Error scoring product {product.get('id')}: {e}")
                scored_products.append({
                    "product_id": product.get("id"),
                    "score": 0,
                    "reasoning": "Unable to calculate compatibility"
                })
        
        return {"scored_products": scored_products}
    except Exception as e:
        import traceback
        traceback.print_exc()
        raise HTTPException(status_code=500, detail=str(e))
