import numpy as np
from services.embedding_service import embed_batch, similarity


class PainExtractionService:

    # ── FIND CENTROID SENTENCE ────────────────────────────────
    # most central sentence = highest avg similarity to all others
    # = most recurring pain signal in the cluster

    def find_centroid(self, texts: list, embeddings) -> str:
        if len(texts) == 1:
            return texts[0]

        scores = []
        for i, emb in enumerate(embeddings):
            avg_sim = np.mean([
                similarity(emb, embeddings[j])
                for j in range(len(embeddings)) if j != i
            ])
            scores.append(avg_sim)

        centroid_idx = int(np.argmax(scores))
        return texts[centroid_idx]

    # ── EXTRACT FROM CLUSTERS ─────────────────────────────────

    def extract(self, pain_patterns: list) -> list:
        extracted = []

        for cluster in pain_patterns:
            texts = cluster.get("examples", [cluster.get("representative", "")])
            texts = [t["text"] if isinstance(t, dict) else t for t in texts]

            if not texts:
                continue

            embeddings  = embed_batch(texts)
            centroid    = self.find_centroid(texts, embeddings)

            extracted.append({
                "cluster_id":   cluster.get("cluster_id"),
                "size":         cluster.get("size", len(texts)),
                "pain_signal":  centroid,
            })

        return sorted(extracted, key=lambda x: x["size"], reverse=True)
