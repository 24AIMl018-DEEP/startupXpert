from typing import List
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
from schema.document_schema import SearchDocument

class UnifiedVectorStore:
    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.documents: List[SearchDocument] = []
        self.embeddings = []

    def add_documents(self, docs: List[SearchDocument]):
        texts = [d.content for d in docs]
        new_embeddings = self.model.encode(texts)
        self.documents.extend(docs)
        self.embeddings.extend(new_embeddings)

    def retrieve(self, query: str, agent_filter: str = None, top_k: int = 5) -> List[dict]:
        if not self.documents:
            return []

        query_embedding = self.model.encode([query])
        scores = cosine_similarity(query_embedding, self.embeddings)[0]

        ranked = sorted(zip(scores, self.documents), key=lambda x: x[0], reverse=True)

        results = []
        for score, doc in ranked:
            if agent_filter and doc.metadata.get("agent_owner") != agent_filter:
                continue
            results.append({"score": float(score), "content": doc.content, "source": doc.source_url})
            if len(results) >= top_k:
                break
        return results

vector_store = UnifiedVectorStore()
