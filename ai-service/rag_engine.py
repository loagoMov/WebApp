import chromadb
from chromadb.utils import embedding_functions
import uuid

class RAGEngine:
    def __init__(self, persist_directory="./chroma_db"):
        self.client = chromadb.PersistentClient(path=persist_directory)
        # Use a default lightweight embedding model
        self.embedding_function = embedding_functions.SentenceTransformerEmbeddingFunction(model_name="all-MiniLM-L6-v2")
        self.collection = self.client.get_or_create_collection(
            name="insurance_policies",
            embedding_function=self.embedding_function
        )

    def ingest_document(self, text: str, metadata: dict):
        """
        Splits text into chunks and stores them in ChromaDB.
        """
        # Simple chunking by paragraphs for MVP
        chunks = [c.strip() for c in text.split('\n\n') if c.strip()]
        
        ids = [str(uuid.uuid4()) for _ in chunks]
        metadatas = [metadata for _ in chunks]
        
        self.collection.add(
            documents=chunks,
            metadatas=metadatas,
            ids=ids
        )
        return len(chunks)

    def query(self, query_text: str, n_results: int = 3):
        """
        Retrieves the most relevant document chunks.
        """
        results = self.collection.query(
            query_texts=[query_text],
            n_results=n_results
        )
        return results
