from typing import List
import chromadb
from chromadb.config import Settings as ChromaSettings
from sentence_transformers import SentenceTransformer
from schema.document_schema import SearchDocument


class UnifiedVectorStore:
    COLLECTION_NAME = "startup_research"
    PERSIST_DIR     = "./chroma_store"

    def __init__(self):
        self.model = SentenceTransformer("all-MiniLM-L6-v2")
        self.client = chromadb.PersistentClient(
            path=self.PERSIST_DIR,
            settings=ChromaSettings(anonymized_telemetry=False)
        )
        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}  # cosine similarity — same as before
        )

    # Junk patterns — content matching any of these is dropped before storage
    _JUNK_PATTERNS = (
        "site owner hides",
        "we would like to show you a description",
        "be the first to comment",
        "nobody's responded to this post",
        "bing.com/aclick",          # Bing ad redirect URLs leaked as content
        "quora digest",
        "download the quora app",
        "rankings and reviews for best seo",
        "view more in blogging",
        "if you wish to do an ama",
        "weekly dose of optimism",  # off-topic Substack newsletter recurring filler
        "america spins on westmag",
        "thank god for data centers",
    )
    _MIN_CONTENT_LEN = 80  # anything shorter than this is useless

    def _is_junk(self, content: str) -> bool:
        lowered = content.lower()
        if len(content) < self._MIN_CONTENT_LEN:
            return True
        return any(p in lowered for p in self._JUNK_PATTERNS)

    def add_documents(self, docs: List[SearchDocument]):
        if not docs:
            return

        # Filter junk before embedding — saves compute + keeps vector store clean
        clean_docs = [d for d in docs if not self._is_junk(d.content)]
        dropped = len(docs) - len(clean_docs)
        if dropped:
            print(f"[VectorStore] Dropped {dropped} junk documents before storage.")
        if not clean_docs:
            return

        texts      = [d.content for d in clean_docs]
        ids        = [d.id for d in clean_docs]
        embeddings = self.model.encode(texts).tolist()
        metadatas  = [
            {
                **{k: str(v) for k, v in d.metadata.items()},
                "source_url": d.source_url,
                "platform":   d.platform,
            }
            for d in clean_docs
        ]

        # Upsert — safe to call multiple times, no duplicates on re-runs
        self.collection.upsert(
            ids=ids,
            embeddings=embeddings,
            documents=texts,
            metadatas=metadatas
        )
        print(f"[VectorStore] Upserted {len(clean_docs)} documents. Total: {self.collection.count()}")

    def retrieve(self, query: str, agent_filter: str = None, top_k: int = 5) -> List[dict]:
        if self.collection.count() == 0:
            return []

        query_embedding = self.model.encode([query]).tolist()

        where = {"agent_owner": agent_filter} if agent_filter else None

        results = self.collection.query(
            query_embeddings=query_embedding,
            n_results=min(top_k, self.collection.count()),
            where=where,
            include=["documents", "metadatas", "distances"]
        )

        docs      = results["documents"][0]
        metadatas = results["metadatas"][0]
        distances = results["distances"][0]   # cosine distance (0=identical, 2=opposite)

        return [
            {
                "score":      round(1 - dist, 4),   # convert distance → similarity score
                "content":    doc,
                "source":     meta.get("source_url", ""),
                "platform":   meta.get("platform", ""),
                "agent_owner": meta.get("agent_owner", ""),
            }
            for doc, meta, dist in zip(docs, metadatas, distances)
        ]

    def retrieve_top_by_domain(self, startup, top_k: int = 5, min_score: float = 0.45) -> dict:
        """Returns only relevant docs per domain using dynamic startup-specific queries."""
        from agent.analysis.signal_gatekeeper import build_domain_queries
        if self.collection.count() == 0:
            return {}

        domain_queries = build_domain_queries(startup)
        grouped: dict = {}
        for domain, query in domain_queries.items():
            hits = self.retrieve(query=query, agent_filter=domain, top_k=top_k)
            relevant = [
                {
                    "relevance_score": h["score"],
                    "content":         h["content"][:400],
                    "source":          h["source"],
                    "platform":        h["platform"],
                }
                for h in hits if h["score"] >= min_score
            ]
            if relevant:
                grouped[domain] = relevant
        return grouped

    def get_all_by_domain(self) -> dict:
        """Returns all stored documents grouped by agent domain — for final JSON response."""
        if self.collection.count() == 0:
            return {}

        results = self.collection.get(include=["documents", "metadatas"])
        grouped: dict = {}

        for doc, meta in zip(results["documents"], results["metadatas"]):
            domain = meta.get("agent_owner", "Unknown")
            grouped.setdefault(domain, [])
            grouped[domain].append({
                "content":  doc[:500],          # trimmed for readability
                "source":   meta.get("source_url", ""),
                "platform": meta.get("platform", ""),
                "query":    meta.get("search_query", ""),
            })

        return grouped

    def reset(self):
        """Wipe collection — useful between validation runs."""
        self.client.delete_collection(self.COLLECTION_NAME)
        self.collection = self.client.get_or_create_collection(
            name=self.COLLECTION_NAME,
            metadata={"hnsw:space": "cosine"}
        )
        print("[VectorStore] Collection reset.")


vector_store = UnifiedVectorStore()
