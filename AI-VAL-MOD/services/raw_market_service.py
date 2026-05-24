from sklearn.cluster import DBSCAN
import numpy as np
from services.embedding_service import embed_batch, similarity


class RawMarketService:

    # ── SEMANTIC CLUSTERING ───────────────────────────────────

    def cluster_evidence(self, embeddings):
        labels = DBSCAN(
            eps=0.35,
            min_samples=2,
            metric="cosine"
        ).fit_predict(embeddings)
        return labels

    # ── EXTRACT CLUSTER PATTERNS ─────────────────────────────

    def extract_cluster_patterns(self, evidence, labels):
        clusters = {}
        for idx, label in enumerate(labels):
            if label == -1:
                continue
            if label not in clusters:
                clusters[label] = []
            clusters[label].append(evidence[idx])

        patterns = []
        for label, texts in clusters.items():
            patterns.append({
                "cluster_id":    label,
                "size":          len(texts),
                "representative": texts[0],
                "examples":      texts[:3]
            })

        return patterns

    # ── MARKET DEMAND ─────────────────────────────────────────

    def calculate_demand(self, labels):
        unique_clusters = len(set(labels) - {-1})
        recurring       = len([x for x in labels if x != -1])

        if unique_clusters == 0:
            return 0

        return round(recurring / unique_clusters, 2)

    # ── TREND EXTRACTION ──────────────────────────────────────

    def extract_trends(self, patterns):
        trends = sorted(
            [{"pattern": c["representative"], "strength": c["size"]} for c in patterns],
            key=lambda x: x["strength"],
            reverse=True
        )
        return trends[:10]

    # ── MAIN ──────────────────────────────────────────────────

    def analyze(self, raw_evidence: list) -> dict:
        if not raw_evidence:
            return {}

        embeddings = embed_batch(raw_evidence)
        labels     = self.cluster_evidence(embeddings)
        patterns   = self.extract_cluster_patterns(raw_evidence, labels)
        demand     = self.calculate_demand(labels)
        trends     = self.extract_trends(patterns)

        return {
            "discussion_volume": len(raw_evidence),
            "market_demand":     demand,
            "semantic_patterns": patterns,
            "market_trends":     trends
        }
