import numpy as np
from services.embedding_service import embed_batch, similarity


class ClusterIntelligenceService:

    # ── CLUSTER STRENGTH ──────────────────────────────────────
    # avg pairwise similarity within cluster texts

    def calculate_cluster_strength(self, embeddings) -> float:
        similarities = [
            similarity(embeddings[i], embeddings[j])
            for i in range(len(embeddings))
            for j in range(i + 1, len(embeddings))
        ]
        if not similarities:
            return 0
        return round(float(np.mean(similarities)), 3)

    # ── SEMANTIC RECURRENCE ───────────────────────────────────
    # how many clusters have high internal similarity

    def detect_recurring_patterns(self, clustered_evidence: list) -> list:
        results = []

        for cluster in clustered_evidence:
            text = cluster.get("representative_text", "")
            size = cluster.get("cluster_size", 1)

            results.append({
                "representative": text,
                "recurrence":     size
            })

        return sorted(results, key=lambda x: x["recurrence"], reverse=True)

    # ── MAIN ──────────────────────────────────────────────────

    def analyze(self, clustered_evidence: list) -> dict:
        if not clustered_evidence:
            return {}

        texts = [
            c.get("representative_text", "")
            for c in clustered_evidence
        ]

        embeddings = embed_batch(texts)
        strength   = self.calculate_cluster_strength(embeddings)
        patterns   = self.detect_recurring_patterns(clustered_evidence)

        return {
            "cluster_strength":   strength,
            "recurring_patterns": patterns,
            "unique_patterns":    len(clustered_evidence)
        }
