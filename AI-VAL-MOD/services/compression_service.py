"""
Compression Service  (HDBSCAN Clustering)
──────────────────────────────────────────
Groups semantically similar evidence into clusters.

Why HDBSCAN?
  - Best for noisy internet text (handles noise natively)
  - Doesn't require specifying number of clusters
  - Points that don't fit any cluster → labelled as noise (-1)
  - More robust than KMeans for variable-density data

Flow:
  cleaned_evidence (list of {text, relevance_score})
    → embed texts
    → HDBSCAN cluster
    → assign noise points to nearest cluster centroid
    → extract representative text per cluster
    → return: list of cluster dicts
"""

import numpy as np
from collections import defaultdict
from services.embedding_service import encode, cosine_similarity

try:
    import hdbscan as _hdbscan
    _HDBSCAN_AVAILABLE = True
except ImportError:
    _HDBSCAN_AVAILABLE = False


class CompressionService:
    """
    Clusters cleaned evidence using HDBSCAN.
    Falls back to simple centroid grouping if HDBSCAN unavailable.
    """

    def __init__(self, min_cluster_size: int = 3, min_samples: int = 2):
        self.min_cluster_size = min_cluster_size
        self.min_samples      = min_samples

    def run(self, cleaned_evidence: list) -> list:
        """
        Args:
            cleaned_evidence: List of {text, relevance_score} dicts

        Returns:
            List of cluster dicts:
            [{cluster_id, size, representative_text, relevance_score, top_posts}]
        """
        if not cleaned_evidence:
            return []

        texts   = [item["text"] if isinstance(item, dict) else item for item in cleaned_evidence]
        scores  = [item.get("relevance_score", 1.0) if isinstance(item, dict) else 1.0 for item in cleaned_evidence]
        weights = [item.get("source_weight", 3) if isinstance(item, dict) else 3 for item in cleaned_evidence]

        if len(texts) < self.min_cluster_size:
            return [{
                "cluster_id":          0,
                "size":                len(texts),
                "representative_text": texts[0] if texts else "",
                "relevance_score":     round(float(np.mean(scores)), 4),
                "top_posts":           texts[:5]
            }]

        embeddings = encode(texts)
        labels     = self._cluster(embeddings)
        labels     = self._reassign_noise(embeddings, labels)
        clusters   = self._build_clusters(texts, scores, weights, embeddings, labels)

        return clusters

    # ── Clustering ─────────────────────────────────────────────────────────────

    def _cluster(self, embeddings: np.ndarray) -> np.ndarray:
        if _HDBSCAN_AVAILABLE:
            clusterer = _hdbscan.HDBSCAN(
                min_cluster_size=self.min_cluster_size,
                min_samples=self.min_samples,
                metric="euclidean",
                cluster_selection_method="eom"
            )
            return clusterer.fit_predict(embeddings)

        # Fallback: split into fixed groups
        n = len(embeddings)
        size = max(self.min_cluster_size, n // 5)
        return np.array([i // size for i in range(n)])

    # ── Noise reassignment ─────────────────────────────────────────────────────

    def _reassign_noise(self, embeddings: np.ndarray, labels: np.ndarray) -> np.ndarray:
        """Assign noise points (label=-1) to nearest non-noise cluster centroid."""
        labels = labels.copy()
        unique_labels = [l for l in np.unique(labels) if l != -1]

        if not unique_labels:
            # All noise — assign all to cluster 0
            return np.zeros(len(labels), dtype=int)

        # Compute cluster centroids
        centroids = {}
        for cluster_id in unique_labels:
            mask = labels == cluster_id
            centroids[cluster_id] = embeddings[mask].mean(axis=0)

        centroid_matrix = np.array([centroids[l] for l in unique_labels])

        # Reassign noise
        noise_idx = np.where(labels == -1)[0]
        for idx in noise_idx:
            sims = cosine_similarity(
                embeddings[idx].reshape(1, -1),
                centroid_matrix
            )[0]
            best_cluster = unique_labels[int(np.argmax(sims))]
            labels[idx] = best_cluster

        return labels

    # ── Cluster builder ────────────────────────────────────────────────────────

    def _build_clusters(
        self,
        texts: list,
        scores: list,
        weights: list,
        embeddings: np.ndarray,
        labels: np.ndarray
    ) -> list:
        groups: dict = defaultdict(list)

        for i, label in enumerate(labels):
            groups[int(label)].append({
                "text":   texts[i],
                "score":  scores[i],
                "weight": weights[i],
                "emb":    embeddings[i]
            })

        clusters = []
        for cluster_id, members in groups.items():
            emb_matrix = np.array([m["emb"] for m in members])
            centroid   = emb_matrix.mean(axis=0).reshape(1, -1)
            sims       = cosine_similarity(centroid, emb_matrix)[0]
            rep_idx    = int(np.argmax(sims))

            # sort by source_weight first, then relevance score
            # high-trust sources (reddit, steam) rise to top
            sorted_members = sorted(
                members,
                key=lambda m: (m["weight"], m["score"]),
                reverse=True
            )
            top_posts  = [m["text"] for m in sorted_members[:5]]
            avg_score  = round(float(np.mean([m["score"]  for m in members])), 4)
            avg_weight = round(float(np.mean([m["weight"] for m in members])), 1)

            clusters.append({
                "cluster_id":          cluster_id,
                "size":                len(members),
                "representative_text": members[rep_idx]["text"],
                "relevance_score":     avg_score,
                "avg_source_weight":   avg_weight,
                "top_posts":           top_posts
            })

        clusters.sort(key=lambda c: c["size"], reverse=True)
        return clusters
