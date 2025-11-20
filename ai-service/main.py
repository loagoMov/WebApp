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
        context_chunks = search_results['documents'][0]
        
        # 2. Generate answer
        recommendation = llm.generate_recommendation(request.user_profile, context_chunks)
        
        return {
            "recommendation": recommendation,
            "context_used": context_chunks
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

