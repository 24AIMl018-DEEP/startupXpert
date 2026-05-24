import re
from transformers import pipeline
from services.llm_service import ask_llm

_sentiment_model = None


def get_sentiment_model():
    global _sentiment_model
    if _sentiment_model is None:
        _sentiment_model = pipeline(
            "sentiment-analysis",
            model="cardiffnlp/twitter-roberta-base-sentiment-latest",
            truncation=True,
            max_length=512
        )
    return _sentiment_model


class CompressionIntelligenceService:

    def clean_text(self, text: str) -> str:
        text = re.sub(r'TITLE:\s*', '', text)
        text = re.sub(r'CONTENT:\s*', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    # ── SENTIMENT PER CLUSTER ─────────────────────────────────
    # runs free model on representative text of each cluster

    def analyze_sentiment(self, text: str) -> dict:
        try:
            result = get_sentiment_model()(self.clean_text(text)[:512])[0]
            label  = result["label"].lower()   # positive / neutral / negative
            score  = round(result["score"], 3)
            return {"label": label, "score": score}
        except Exception:
            return {"label": "neutral", "score": 0.0}

    # ── LLM CLUSTER SUMMARIZER ────────────────────────────────

    def summarize_cluster(self, cluster_texts: list, intent: str) -> str:
        samples = [self.clean_text(t)[:200] for t in cluster_texts[:3]]
        joined  = "\n".join(f"- {s}" for s in samples)

        prompt = f"""You are summarizing market research evidence.
Below are {len(samples)} real user discussion snippets ({intent} signal).

{joined}

Write ONE short sentence (max 15 words) capturing the core human pattern.
No explanation. No bullet. Just the sentence."""

        for attempt in range(3):
            try:
                result = ask_llm(prompt).strip().strip('"').strip("'")
                if result:
                    return result
            except Exception:
                continue
        return samples[0][:80] if samples else ""

    # ── SUMMARIZE ONE INTENT ──────────────────────────────────

    def summarize_intent(self, clustered_evidence: list, intent: str) -> list:
        results = []
        for cluster in clustered_evidence:
            # use top_posts if available, fallback to representative_text
            top_posts = cluster.get("top_posts", [])
            if not top_posts:
                top_posts = [cluster.get("representative_text", "")]

            summary   = self.summarize_cluster(top_posts, intent)
            sentiment = self.analyze_sentiment(top_posts[0])  # sentiment on best post
            results.append({
                "summary":   summary,
                "sentiment": sentiment,
                "size":      cluster.get("cluster_size", 1)
            })
        return results[:5]

    # ── MAIN ──────────────────────────────────────────────────

    def compress(self, evidence: dict) -> dict:

        problem_clusters  = self.summarize_intent(
            evidence.get("problem_clustered",  []), "problem"
        )
        behavior_clusters = self.summarize_intent(
            evidence.get("behavior_clustered", []), "behavior"
        )
        spending_clusters = self.summarize_intent(
            evidence.get("spending_clustered", []), "spending"
        )

        return {
            "top_pains":         [c["summary"]   for c in problem_clusters],
            "behavior_patterns": [c["summary"]   for c in behavior_clusters],
            "spending_patterns": [c["summary"]   for c in spending_clusters],
            "problem_sentiment":  [c["sentiment"] for c in problem_clusters],
            "behavior_sentiment": [c["sentiment"] for c in behavior_clusters],
            "spending_sentiment": [c["sentiment"] for c in spending_clusters],
            "problem_clusters":  problem_clusters,
            "behavior_clusters": behavior_clusters,
            "spending_clusters": spending_clusters
        }
