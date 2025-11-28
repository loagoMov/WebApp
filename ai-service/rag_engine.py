import json
import os
import numpy as np
from sentence_transformers import SentenceTransformer
from typing import List, Dict, Any

class LightweightRAG:
    def __init__(self, persistence_file: str = "knowledge_base.json"):
        self.persistence_file = persistence_file
        # Load a small, fast model
        print("Loading embedding model...")
        self.model = SentenceTransformer('all-MiniLM-L6-v2')
        self.chunks = []
        self.embeddings = None
        self.load_data()

    def load_data(self):
        if os.path.exists(self.persistence_file):
            try:
                with open(self.persistence_file, 'r') as f:
                    data = json.load(f)
                    self.chunks = data.get('chunks', [])
                    # Re-compute embeddings on load if not stored (to save space/complexity in JSON)
                    # Or better: just re-embed on startup. For MVP with small data, this is fast.
                    if self.chunks:
                        print(f"Restoring {len(self.chunks)} chunks...")
                        texts = [chunk['text'] for chunk in self.chunks]
                        self.embeddings = self.model.encode(texts)
            except Exception as e:
                print(f"Error loading knowledge base: {e}")
                self.chunks = []
                self.embeddings = None

    def save_data(self):
        try:
            with open(self.persistence_file, 'w') as f:
                json.dump({'chunks': self.chunks}, f)
        except Exception as e:
            print(f"Error saving knowledge base: {e}")

    def ingest_document(self, text: str, metadata: Dict[str, Any]) -> int:
        # Simple chunking by paragraphs or fixed size
        # For insurance policies, paragraphs are usually good
        raw_chunks = [c.strip() for c in text.split('\n\n') if c.strip()]
        
        new_chunks = []
        for content in raw_chunks:
            # Further split if too long (rough heuristic)
            if len(content) > 1000:
                # Very naive split
                parts = [content[i:i+1000] for i in range(0, len(content), 1000)]
                for part in parts:
                    new_chunks.append({
                        'text': part,
                        'metadata': metadata
                    })
            else:
                new_chunks.append({
                    'text': content,
                    'metadata': metadata
                })

        if not new_chunks:
            return 0

        # Embed new chunks
        new_texts = [c['text'] for c in new_chunks]
        new_embeddings = self.model.encode(new_texts)

        # Update state
        self.chunks.extend(new_chunks)
        if self.embeddings is None:
            self.embeddings = new_embeddings
        else:
            self.embeddings = np.vstack([self.embeddings, new_embeddings])

        self.save_data()
        return len(new_chunks)

    def search(self, query: str, k: int = 3) -> List[str]:
        if not self.chunks or self.embeddings is None:
            return []

        query_embedding = self.model.encode([query])
        
        # Cosine similarity
        # (1, D) @ (N, D).T -> (1, N)
        scores = (query_embedding @ self.embeddings.T)[0]
        
        # Get top k indices
        # If we have fewer than k chunks, take all
        k = min(k, len(self.chunks))
        top_indices = np.argsort(scores)[-k:][::-1]
        
        results = []
        for idx in top_indices:
            results.append(self.chunks[idx]['text'])
            
        return results
