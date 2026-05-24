import numpy as np
from sklearn.cluster import DBSCAN
from services.embedding_service import embed_batch, similarity


class PainReasoningService:

    # ── FIND CENTROID ─────────────────────────────────────────

    def find_centroid(self, texts, embeddings):
        if len(texts) == 1:
            return texts[0]
        scores = [
            np.mean([similarity(embeddings[i], embeddings[j])
                     for j in range(len(embeddings)) if j != i])
            for i in range(len(embeddings))
        ]
        return texts[int(np.argmax(scores))]

    # ── ROOT FRUSTRATIONS ─────────────────────────────────────
    # cluster pain signals → centroid of each cluster = root cause

    def extract_root_frustrations(self, texts, embeddings):
        if len(texts) < 2:
            return texts

        labels = DBSCAN(
            eps=0.4, min_samples=2, metric="cosine"
        ).fit_predict(embeddings)

        clusters = {}
        for idx, label in enumerate(labels):
            if label == -1:
                continue
            clusters.setdefault(label, []).append(idx)

        # centroid of each cluster = most representative root frustration
        roots = []
        for label, indices in clusters.items():
            cluster_texts = [texts[i] for i in indices]
            cluster_embs  = [embeddings[i] for i in indices]
            roots.append(self.find_centroid(cluster_texts, cluster_embs))

        # if nothing clustered, return top 3 by self-similarity density
        if not roots:
            scores = [
                np.mean([similarity(embeddings[i], embeddings[j])
                         for j in range(len(embeddings)) if j != i])
                for i in range(len(embeddings))
            ]
            top = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:3]
            roots = [texts[i] for i in top]

        return roots[:4]

    # ── BEHAVIOR PATTERNS ─────────────────────────────────────
    # texts with highest avg similarity to ALL others
    # = most universally recurring behavior

    def extract_behavior_patterns(self, texts, embeddings):
        if len(texts) < 2:
            return texts[:2]

        scores = [
            np.mean([similarity(embeddings[i], embeddings[j])
                     for j in range(len(embeddings)) if j != i])
            for i in range(len(embeddings))
        ]
        top = sorted(range(len(scores)), key=lambda i: scores[i], reverse=True)[:2]
        return [texts[i] for i in top]

    # ── HIDDEN PAINS ──────────────────────────────────────────
    # texts with LOWEST avg similarity = outliers = non-obvious pains

    def extract_hidden_pains(self, texts, embeddings):
        if len(texts) < 3:
            return []

        scores = [
            np.mean([similarity(embeddings[i], embeddings[j])
                     for j in range(len(embeddings)) if j != i])
            for i in range(len(embeddings))
        ]
        # lowest similarity = semantically distant = hidden/unique pain
        bottom = sorted(range(len(scores)), key=lambda i: scores[i])[:2]
        return [texts[i] for i in bottom]

    # ── OPPORTUNITY GAPS ──────────────────────────────────────
    # cross-cluster centroids — where two different pain clusters
    # share semantic overlap = unaddressed intersection = gap

    def extract_opportunity_gaps(self, texts, embeddings, roots):
        if not roots or len(texts) < 2:
            return roots[:2]

        root_embs = embed_batch(roots)
        gaps = []

        for i, (root, remb) in enumerate(zip(roots, root_embs)):
            # find evidence most similar to this root
            sims = [similarity(remb, embeddings[j]) for j in range(len(embeddings))]
            best_idx = int(np.argmax(sims))
            if texts[best_idx] != root:
                gaps.append(texts[best_idx])

        # deduplicate
        seen = set()
        unique_gaps = []
        for g in gaps:
            if g not in seen:
                seen.add(g)
                unique_gaps.append(g)

        return unique_gaps[:3]

    # ── MAIN ──────────────────────────────────────────────────

    def run(self, extracted_pains: list, pain_patterns: list, cluster_strength: float) -> dict:

        if not extracted_pains and not pain_patterns:
            return {}

        # collect all signal texts
        texts = []
        for p in extracted_pains:
            texts.append(p.get("pain_signal", ""))
        for p in pain_patterns:
            rep = p.get("representative", "")
            if rep and rep not in texts:
                texts.append(rep)

        texts = [t for t in texts if t.strip()]

        if not texts:
            return {}

        embeddings = embed_batch(texts)

        roots    = self.extract_root_frustrations(texts, embeddings)
        behavior = self.extract_behavior_patterns(texts, embeddings)
        hidden   = self.extract_hidden_pains(texts, embeddings)
        gaps     = self.extract_opportunity_gaps(texts, embeddings, roots)

        return {
            "root_frustrations": roots,
            "behavior_patterns": behavior,
            "hidden_pains":      hidden,
            "opportunity_gaps":  gaps,
            "signal_count":      len(texts),
            "cluster_strength":  cluster_strength
        }
