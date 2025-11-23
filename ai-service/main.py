from fastapi import FastAPI, HTTPException, UploadFile, File
from pydantic import BaseModel
from typing import List, Dict, Any, Optional
from rag_engine import RAGEngine
from llm_client import LLMClient
import shutil
import os

app = FastAPI()
rag = RAGEngine()
llm = LLMClient()

class RecommendationRequest(BaseModel):
    user_profile: Dict[str, Any]
    query: str # e.g. "I need off-road cover"

@app.get("/")
def read_root():
    return {"message": "CoverBots AI Service (RAG Enabled) is running"}

@app.post("/ingest")
async def ingest_policy(vendor_id: str, file: UploadFile = File(...)):
    try:
        # Save temp file
        temp_path = f"temp_{file.filename}"
        with open(temp_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)
            
        # Read text (Simple text/markdown support for MVP)
        # For PDFs, we would need pypdf or similar
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
        # 1. Retrieve relevant chunks
        search_results = rag.query(request.query)
        
        context_chunks = []
        if search_results and 'documents' in search_results and search_results['documents']:
             # Check if the first list in documents is not empty (Chroma returns list of lists)
             if len(search_results['documents']) > 0 and len(search_results['documents'][0]) > 0:
                context_chunks = search_results['documents'][0]
        
        # 2. Generate answer
        recommendation_str = llm.generate_recommendation(request.user_profile, context_chunks)
        
        # Try to parse JSON
        import json
        try:
            # Clean up potential markdown code blocks
            clean_str = recommendation_str.replace("```json", "").replace("```", "").strip()
            recommendation_data = json.loads(clean_str)
        except json.JSONDecodeError:
            # Fallback if LLM fails to return JSON
            recommendation_data = []
            print(f"Failed to parse JSON: {recommendation_str}")

        return {
            "recommendations": recommendation_data,
            "context_used": context_chunks
        }
    except Exception as e:
        import traceback
        traceback.print_exc()
        print(f"Error generating recommendations: {e}")
        raise HTTPException(status_code=500, detail=str(e))

