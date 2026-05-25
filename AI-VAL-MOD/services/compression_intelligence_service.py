"""
Compression Intelligence Service
──────────────────────────────────
Aggregates multi-signal data per cluster → sends ONLY structured signals to LLM.

The key insight:
  BAD:  Give LLM 500 raw posts → "Summarize these"
  GOOD: Give LLM structured signals → "Generate startup validation report"

Per-cluster pipeline:
  1. Extract all 8 signals from each post in the cluster
  2. Aggregate signals (avg sentiment, total counts, top keywords, top competitors)
  3. Build structured signal JSON
  4. LLM generates 1-sentence insight from structured JSON only

Final output per cluster:
  {cluster_id, size, representative_text, summary, avg_sentiment,
   sentiment_label, urgency_count, workaround_count, spending_count,
   top_keywords, top_competitors, top_posts}
"""

import json
import time
from collections import Counter

from services.signal_extraction_service import SignalExtractionService
from services.llm_service import ask_llm


_signal_svc = SignalExtractionService()


class CompressionIntelligenceService:
    """
    Takes clustered evidence and produces structured intelligence per cluster.
    Traditional NLP handles aggregation. LLM only handles final 1-sentence insight.
    """

    def run(self, clustered_evidence: list, intent: str) -> list:
        """
        Args:
            clustered_evidence: List of cluster dicts from CompressionService
            intent: "problem" | "behavior" | "spending"

        Returns:
            List of enriched cluster intelligence dicts
        """
        enriched = []

        for cluster in clustered_evidence:
            cluster_intel = self._process_cluster(cluster, intent)
            enriched.append(cluster_intel)

        return enriched

    def _process_cluster(self, cluster: dict, intent: str) -> dict:
        posts = cluster.get("top_posts", [cluster.get("representative_text", "")])

        # ── Step 1: Extract signals from ALL posts in cluster ─────────────────
        signals_list = _signal_svc.extract_batch(posts)

        # ── Step 2: Extract repeated patterns BEFORE LLM ──────────────────────
        # This prevents LLM hallucination from noisy clusters
        patterns = self._extract_patterns(posts, signals_list)

        # ── Step 3: Aggregate signals ─────────────────────────────────────────
        agg = self._aggregate_signals(signals_list)

        # ── Step 4: Build structured signal dict for LLM ──────────────────────
        # LLM receives extracted patterns, NOT raw posts
        structured = {
            "intent":              intent,
            "cluster_size":        cluster["size"],
            "avg_sentiment":       agg["avg_sentiment"],
            "sentiment_label":     agg["sentiment_label"],
            "urgency_count":       agg["urgency_count"],
            "workaround_count":    agg["workaround_count"],
            "spending_count":      agg["spending_count"],
            "top_keywords":        agg["top_keywords"],
            "top_competitors":     agg["top_competitors"],
            # Pre-extracted patterns — grounded in actual text, not noise
            "repeated_complaints": patterns["repeated_complaints"],
            "emotional_patterns":  patterns["emotional_patterns"],
            "high_pain_sample":    patterns["high_pain_sample"]
        }

        # ── Step 5: LLM insight (structured patterns only, not raw posts) ─────
        summary = self._llm_insight(structured)

        return {
            "cluster_id":          cluster["cluster_id"],
            "size":                cluster["size"],
            "representative_text": cluster["representative_text"],
            "top_posts":           cluster.get("top_posts", []),
            "summary":             summary,
            "avg_sentiment":       agg["avg_sentiment"],
            "sentiment_label":     agg["sentiment_label"],
            "sentiment":           {"label": agg["sentiment_label"], "score": agg["avg_sentiment"]},
            "urgency_count":       agg["urgency_count"],
            "workaround_count":    agg["workaround_count"],
            "spending_count":      agg["spending_count"],
            "top_keywords":        agg["top_keywords"],
            "top_competitors":     agg["top_competitors"],
            "repeated_complaints": patterns["repeated_complaints"],
            "emotional_patterns":  patterns["emotional_patterns"]
        }

    # ── Signal aggregation ─────────────────────────────────────────────────────

    def _aggregate_signals(self, signals_list: list) -> dict:
        """Aggregate all signals from multiple posts into cluster-level stats."""
        sentiment_scores = []
        all_keywords     = []
        all_competitors  = []
        urgency_total    = 0
        workaround_total = 0
        spending_total   = 0

        for sig in signals_list:
            # Sentiment
            sentiment_scores.append(sig["sentiment"]["score"])

            # Counts
            urgency_total    += sig["urgency_count"]
            workaround_total += sig["workaround_count"]
            spending_total   += sig["spending_count"]

            # Keywords (deduplicated per post to avoid single-post domination)
            all_keywords.extend(sig["keywords"][:5])
            all_competitors.extend(sig["competitors"])

        # Average sentiment
        avg_sentiment  = round(sum(sentiment_scores) / max(len(sentiment_scores), 1), 4)
        sentiment_label = (
            "negative" if avg_sentiment < -0.1
            else "positive" if avg_sentiment > 0.1
            else "neutral"
        )

        # Top keywords by frequency
        keyword_freq   = Counter(all_keywords)
        top_keywords   = [kw for kw, _ in keyword_freq.most_common(8)]

        # Top competitors by frequency
        competitor_freq = Counter(all_competitors)
        top_competitors = [c for c, _ in competitor_freq.most_common(5)]

        return {
            "avg_sentiment":    avg_sentiment,
            "sentiment_label":  sentiment_label,
            "urgency_count":    urgency_total,
            "workaround_count": workaround_total,
            "spending_count":   spending_total,
            "top_keywords":     top_keywords,
            "top_competitors":  top_competitors
        }

    # ── Pattern extraction (runs BEFORE LLM — grounds the summary in real text) ─

    def _extract_patterns(self, posts: list, signals_list: list) -> dict:
        """
        Extract repeated complaints, emotional patterns, and high-pain samples
        from the cluster BEFORE sending anything to LLM.

        Why: LLM hallucination happens when clusters are noisy (unrelated docs mixed in).
        Grounding in extracted patterns forces LLM to summarize REAL patterns.
        """
        import re
        from collections import Counter

        # ── Repeated complaint nouns/verbs ─────────────────────────────────────
        # Extract short phrases (2-3 word n-grams) that appear in multiple posts
        all_ngrams = []
        for post in posts:
            words = re.findall(r'\b[a-zA-Z]{3,}\b', post.lower())
            bigrams  = [f"{words[i]} {words[i+1]}" for i in range(len(words)-1)]
            trigrams = [f"{words[i]} {words[i+1]} {words[i+2]}" for i in range(len(words)-2)]
            all_ngrams.extend(bigrams + trigrams)

        ngram_freq = Counter(all_ngrams)
        # Keep only phrases that appear in multiple posts and aren't stopword-only
        _STOPWORDS = {"the", "and", "for", "that", "this", "with", "are", "was",
                      "have", "from", "they", "been", "will", "would", "could"}
        repeated = [
            phrase for phrase, count in ngram_freq.most_common(20)
            if count >= 2 and not all(w in _STOPWORDS for w in phrase.split())
        ][:5]

        # ── Emotional intensity patterns ───────────────────────────────────────
        _EMOTION_WORDS = re.compile(
            r'\b(hate|love|awful|terrible|broken|garbage|trash|worst|amazing|'  
            r'useless|waste|scam|fraud|disgusting|pathetic|frustrated|annoyed|'  
            r'angry|rage|furious|disappointed|helpless|desperate|stuck|ruined)\b',
            re.IGNORECASE
        )
        emotion_counts = Counter()
        for post in posts:
            for m in _EMOTION_WORDS.finditer(post):
                emotion_counts[m.group(0).lower()] += 1
        emotional_patterns = [w for w, _ in emotion_counts.most_common(5)]

        # ── High-pain sample (post with highest pain_intensity signal) ─────────
        high_pain_sample = ""
        if signals_list:
            max_pain_idx = max(
                range(len(signals_list)),
                key=lambda i: signals_list[i].get("pain_intensity", 0)
            )
            if max_pain_idx < len(posts):
                high_pain_sample = posts[max_pain_idx][:200].strip()

        return {
            "repeated_complaints": repeated,
            "emotional_patterns":  emotional_patterns,
            "high_pain_sample":    high_pain_sample
        }

    # ── LLM insight ────────────────────────────────────────────────────────────

    def _llm_insight(self, structured: dict) -> str:
        """
        Send structured signals + pre-extracted patterns to LLM.
        NOT raw internet posts — prevents hallucination from noisy clusters.
        """
        # Build a compact signal summary for the LLM
        kws       = ", ".join(structured.get("top_keywords", [])[:5])
        comps     = ", ".join(structured.get("top_competitors", [])[:3])
        repeated  = " | ".join(structured.get("repeated_complaints", [])[:3])
        emotions  = ", ".join(structured.get("emotional_patterns", [])[:4])
        sample    = structured.get("high_pain_sample", "")[:150]
        sentiment = structured.get("sentiment_label", "neutral")
        urgency   = structured.get("urgency_count", 0)
        workaround= structured.get("workaround_count", 0)
        spending  = structured.get("spending_count", 0)
        size      = structured.get("cluster_size", 0)
        intent    = structured.get("intent", "problem")

        prompt = f"""Startup signal analyst. Write ONE sentence (max 28 words) summarizing the business insight.

Cluster ({intent} intent, {size} discussions, sentiment={sentiment}):
- Repeated phrases: {repeated or 'none detected'}
- Emotional words: {emotions or 'none detected'}
- Top keywords: {kws}
- Competitors mentioned: {comps or 'none'}
- Urgency signals: {urgency} | Workarounds: {workaround} | Spending signals: {spending}
- Sample: "{sample}"

Rules:
- ONE sentence. Max 28 words.
- Ground it in the repeated phrases and emotional words above — do NOT invent.
- State the business implication directly.
- No "users say", no "research shows". Just the insight."""

        for attempt in range(3):
            try:
                time.sleep(attempt * 1.5)
                result = ask_llm(prompt, max_tokens=80)
                if result and len(result.strip()) > 10:
                    # Trim to first sentence
                    first_sent = result.strip().split(".")[0].strip()
                    return first_sent + "." if first_sent else result.strip()[:120]
            except Exception as e:
                print(f"    [compression_intel] retry {attempt+1}: {e}")

        # Fallback: build summary from signals directly
        return self._fallback_summary(structured)

    def _fallback_summary(self, s: dict) -> str:
        label   = s.get("sentiment_label", "neutral")
        kws     = ", ".join(s.get("top_keywords", [])[:3]) or "unknown patterns"
        size    = s.get("cluster_size", 0)
        comps   = ", ".join(s.get("top_competitors", [])[:2])
        urgency = s.get("urgency_count", 0)

        parts = [f"{size} discussions show {label} sentiment around {kws}"]
        if urgency > 0:
            parts.append(f"with {urgency} urgency signals")
        if comps:
            parts.append(f"and mentions of {comps}")
        return ". ".join(parts) + "."
