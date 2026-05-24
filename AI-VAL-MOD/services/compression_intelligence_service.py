import numpy as np
from sklearn.cluster import DBSCAN
from services.embedding_service import embed_batch, similarity


class CompressionIntelligenceService:

    # ── SENTIMENT PROXY ───────────────────────────────────────
    # embedding distance from a "negative frustration" anchor
    # closer to anchor = more negative = stronger pain signal

    NEGATIVE_ANCHOR = (
        "frustrated angry hate terrible awful worst painful "
        "annoying unbearable disgusting struggling suffering"
    )
    POSITIVE_ANCHOR = (
        "happy satisfied easy convenient smooth works great "
        "solved fixed comfortable reliable efficient"
    )

    def __init__(self):
        anchors = embed_batch([self.NEGATIVE_ANCHOR, self.POSITIVE_ANCHOR])
        self._neg_anchor = anchors[0]
        self._pos_anchor = anchors[1]

    def sentiment_score(self, text_embedding) -> float:
        neg = similarity(text_embedding, self._neg_anchor)
        pos = similarity(text_embedding, self._pos_anchor)
        # -1.0 = fully negative, +1.0 = fully positive
        return round(float(neg - pos), 3)

    def clean_text(self, text: str) -> str:
        import re
        text = re.sub(r'TITLE:\s*', '', text)
        text = re.sub(r'CONTENT:\s*', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    def extract_key_phrase(self, texts: list) -> str:
        """Extract most meaningful short phrase from cluster texts."""
        import re
        from collections import Counter

        STOPWORDS = {
            "the", "a", "an", "is", "are", "was", "were", "in", "on", "at",
            "to", "for", "of", "and", "or", "but", "from", "with", "that",
            "this", "it", "they", "i", "we", "you", "he", "she", "be", "been",
            "have", "has", "had", "do", "does", "did", "will", "would", "can",
            "could", "should", "may", "might", "not", "no", "so", "if", "as",
            "by", "about", "than", "then", "when", "where", "how", "what",
            "which", "who", "there", "their", "my", "your", "our", "its",
            "just", "also", "more", "very", "too", "up", "out", "get", "got"
        }

        all_words = []
        for t in texts:
            cleaned = self.clean_text(t).lower()
            words   = re.findall(r'\b[a-z]{4,}\b', cleaned)
            all_words.extend([w for w in words if w not in STOPWORDS])

        if not all_words:
            return self.clean_text(texts[0])[:120]

        # top 6 most frequent meaningful words = cluster theme
        top_words = [w for w, _ in Counter(all_words).most_common(6)]
        return " | ".join(top_words)

    # ── CLUSTER SUMMARY ───────────────────────────────────────

    def summarize_cluster(self, texts: list, embeddings) -> dict:
        if not texts:
            return {}

        scores = [
            np.mean([similarity(embeddings[i], embeddings[j])
                     for j in range(len(embeddings)) if j != i])
            for i in range(len(embeddings))
        ] if len(texts) > 1 else [1.0]

        centroid_idx = int(np.argmax(scores))
        centroid_text = self.clean_text(texts[centroid_idx])[:150]

        # key phrase = top recurring words across all cluster texts
        key_phrase = self.extract_key_phrase(texts)

        sentiments    = [self.sentiment_score(emb) for emb in embeddings]
        avg_sentiment = round(float(np.mean(sentiments)), 3)

        if avg_sentiment > 0.15:
            emotion = "frustration"
        elif avg_sentiment > 0.05:
            emotion = "dissatisfaction"
        elif avg_sentiment < -0.05:
            emotion = "neutral_positive"
        else:
            emotion = "mild_concern"

        return {
            "key_phrase":    key_phrase,       # top recurring theme words
            "centroid":      centroid_text,    # most central evidence text
            "frequency":     len(texts),
            "avg_sentiment": avg_sentiment,
            "core_emotion":  emotion
        }

    # ── INTENT SUMMARY ────────────────────────────────────────

    def summarize_intent(self, cleaned_evidence: list, intent: str) -> dict:
        if not cleaned_evidence:
            return {"intent": intent, "dominant_patterns": [], "market_severity": 0}

        texts = [e["text"] if isinstance(e, dict) else e for e in cleaned_evidence]
        embeddings = embed_batch(texts)

        # cluster
        labels = DBSCAN(
            eps=0.38, min_samples=2, metric="cosine"
        ).fit_predict(embeddings)

        clusters = {}
        for idx, label in enumerate(labels):
            if label == -1:
                continue
            clusters.setdefault(label, []).append(idx)

        # summarize each cluster
        dominant_patterns = []
        for label, indices in clusters.items():
            cluster_texts = [texts[i] for i in indices]
            cluster_embs  = [embeddings[i] for i in indices]
            summary = self.summarize_cluster(cluster_texts, cluster_embs)
            dominant_patterns.append(summary)

        # sort by frequency
        dominant_patterns = sorted(
            dominant_patterns, key=lambda x: x["frequency"], reverse=True
        )

        # market severity = weighted avg sentiment × cluster coverage
        total_clustered = sum(p["frequency"] for p in dominant_patterns)
        coverage_ratio  = round(total_clustered / len(texts), 3) if texts else 0

        if dominant_patterns:
            weighted_sentiment = np.average(
                [abs(p["avg_sentiment"]) for p in dominant_patterns],
                weights=[p["frequency"] for p in dominant_patterns]
            )
            market_severity = round(float(weighted_sentiment) * coverage_ratio * 10, 2)
        else:
            market_severity = 0

        # strongest pain = top cluster key phrase + centroid
        strongest_pain = dominant_patterns[0]["key_phrase"] if dominant_patterns else ""

        return {
            "intent":            intent,
            "total_evidence":    len(texts),
            "clustered_count":   total_clustered,
            "coverage_ratio":    coverage_ratio,
            "dominant_patterns": dominant_patterns[:5],
            "strongest_pain":    strongest_pain,
            "market_severity":   market_severity
        }

    # ── EXECUTIVE CONTEXT ─────────────────────────────────────
    # cross-intent signal — finds semantic overlap between
    # problem pain and spending behavior = opportunity zone

    def build_executive_context(
        self,
        problem_summary:  dict,
        behavior_summary: dict,
        spending_summary: dict
    ) -> dict:

        p_patterns = problem_summary.get("dominant_patterns", [])
        s_patterns = spending_summary.get("dominant_patterns", [])

        if not p_patterns or not s_patterns:
            return {
                "opportunity_zones": [],
                "pain_spending_overlap": 0,
                "strongest_signal": problem_summary.get("strongest_pain", "")
            }

        # embed top representatives from problem and spending
        p_texts = [p["key_phrase"] for p in p_patterns[:3]]
        s_texts = [p["key_phrase"] for p in s_patterns[:3]]

        p_embs = embed_batch(p_texts)
        s_embs = embed_batch(s_texts)

        # find cross-intent overlaps
        overlaps = []
        for i, (pt, pe) in enumerate(zip(p_texts, p_embs)):
            for j, (st, se) in enumerate(zip(s_texts, s_embs)):
                sim = similarity(pe, se)
                if sim > 0.45:
                    overlaps.append({
                        "pain":     pt,
                        "spending": st,
                        "overlap":  round(float(sim), 3)
                    })

        overlaps = sorted(overlaps, key=lambda x: x["overlap"], reverse=True)

        avg_overlap = round(
            float(np.mean([o["overlap"] for o in overlaps])), 3
        ) if overlaps else 0

        return {
            "opportunity_zones":     overlaps[:3],
            "pain_spending_overlap": avg_overlap,
            "strongest_signal":      problem_summary.get("strongest_pain", "")
        }

    # ── MAIN ──────────────────────────────────────────────────

    def compress(self, evidence: dict) -> dict:

        problem_summary  = self.summarize_intent(
            evidence.get("problem_cleaned",  []), "problem"
        )
        behavior_summary = self.summarize_intent(
            evidence.get("behavior_cleaned", []), "behavior"
        )
        spending_summary = self.summarize_intent(
            evidence.get("spending_cleaned", []), "spending"
        )

        executive = self.build_executive_context(
            problem_summary, behavior_summary, spending_summary
        )

        return {
            "problem_summary":  problem_summary,
            "behavior_summary": behavior_summary,
            "spending_summary": spending_summary,
            "executive_context": executive
        }
