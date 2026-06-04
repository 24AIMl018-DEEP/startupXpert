import hashlib
import numpy as np
from typing import List, Dict, Optional
from sentence_transformers import SentenceTransformer

class VectorStore:
    """
    In-memory vector store.
    - Embeds text using sentence-transformers (free, local)
    - Deduplicates by content hash before inserting
    - Similarity search via cosine similarity
    - Accessible by all agents
    """

    def __init__(self, model_name: str = "all-MiniLM-L6-v2"):
        self.model = SentenceTransformer(model_name)
        self._docs: List[Dict] = []           # raw docs with metadata
        self._embeddings: List[np.ndarray] = []
        self._hashes: set = set()             # for dedup

    def _hash(self, text: str) -> str:
        return hashlib.md5(text.strip().lower().encode()).hexdigest()

    def _cosine(self, a: np.ndarray, b: np.ndarray) -> float:
        denom = np.linalg.norm(a) * np.linalg.norm(b)
        return float(np.dot(a, b) / denom) if denom > 0 else 0.0

    def add(self, text: str, metadata: Optional[Dict] = None) -> bool:
        """Add a document. Returns False if duplicate, True if added."""
        h = self._hash(text)
        if h in self._hashes:
            return False
        self._hashes.add(h)
        embedding = self.model.encode(text, convert_to_numpy=True)
        self._docs.append({"text": text, "metadata": metadata or {}})
        self._embeddings.append(embedding)
        return True

    def add_batch(self, items: List[Dict]) -> Dict:
        """Add a list of {text, metadata} dicts. Returns stats."""
        added, skipped = 0, 0
        for item in items:
            ok = self.add(item.get("text", ""), item.get("metadata", {}))
            added += int(ok)
            skipped += int(not ok)
        return {"added": added, "skipped_duplicates": skipped}

    def search(self, query: str, top_k: int = 5, agent_filter: Optional[str] = None) -> List[Dict]:
        """Return top_k most similar docs to query."""
        if not self._docs:
            return []
        q_emb = self.model.encode(query, convert_to_numpy=True)
        scored = [
            (self._cosine(q_emb, emb), doc)
            for emb, doc in zip(self._embeddings, self._docs)
            if not agent_filter or doc["metadata"].get("agent") == agent_filter
        ]
        scored.sort(key=lambda x: x[0], reverse=True)
        return [{"score": round(s, 4), "text": d["text"], "metadata": d["metadata"]} for s, d in scored[:top_k]]

    def stats(self) -> Dict:
        agents = {}
        for doc in self._docs:
            a = doc["metadata"].get("agent", "unknown")
            agents[a] = agents.get(a, 0) + 1
        return {"total_docs": len(self._docs), "by_agent": agents}

    def clear(self):
        self._docs.clear()
        self._embeddings.clear()
        self._hashes.clear()


# Global singleton — all agents share this
vector_store = VectorStore()
