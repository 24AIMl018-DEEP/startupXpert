from sklearn.cluster import DBSCAN
import numpy as np
from services.embedding_service import embed_batch, similarity
from services.pain_extraction_service import PainExtractionService


class RelevantMarketService:

    def __init__(self):
        self.pain_extractor = PainExtractionService()

    # ── PAIN INTENSITY ────────────────────────────────────────
    # avg pairwise similarity — high = recurring focused pain

    def calculate_pain_intensity(self, embeddings) -> float:
        similarities = [
            similarity(embeddings[i], embeddings[j])
            for i in range(len(embeddings))
            for j in range(i + 1, len(embeddings))
        ]
        if not similarities:
            return 0
        return round(float(np.mean(similarities)), 3)

    # ── SEMANTIC CLUSTERING ───────────────────────────────────

    def cluster_evidence(self, embeddings):
        labels = DBSCAN(
            eps=0.35,
            min_samples=2,
            metric="cosine"
        ).fit_predict(embeddings)
        return labels

    # ── EXTRACT PAIN PATTERNS ─────────────────────────────────

    def extract_pain_patterns(self, evidence, labels):
        clusters = {}
        for idx, label in enumerate(labels):
            if label == -1:
                continue
            if label not in clusters:
                clusters[label] = []
            clusters[label].append(evidence[idx])

        patterns = []
        for label, items in clusters.items():
            texts = [e["text"] if isinstance(e, dict) else e for e in items]
            patterns.append({
                "cluster_id":    label,
                "size":          len(texts),
                "representative": texts[0],
                "examples":      texts[:3]
            })

        return sorted(patterns, key=lambda x: x["size"], reverse=True)

    # ── MAIN ──────────────────────────────────────────────────

    def analyze(self, relevant_evidence: list) -> dict:
        if not relevant_evidence:
            return {}

        texts      = [e["text"] if isinstance(e, dict) else e for e in relevant_evidence]
        embeddings = embed_batch(texts)
        labels     = self.cluster_evidence(embeddings)
        patterns   = self.extract_pain_patterns(relevant_evidence, labels)
        intensity  = self.calculate_pain_intensity(embeddings)
        extracted  = self.pain_extractor.extract(patterns)

        return {
            "pain_intensity":   intensity,
            "pain_patterns":    patterns,
            "extracted_pains":  extracted,
            "unique_clusters":  len(set(labels) - {-1}),
            "total_evidence":   len(texts)
        }
