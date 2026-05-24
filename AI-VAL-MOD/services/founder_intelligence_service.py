import re
import time
from services.llm_service import ask_llm


class FounderIntelligenceService:

    def clean_text(self, text: str) -> str:
        text = re.sub(r'TITLE:\s*', '', text)
        text = re.sub(r'CONTENT:\s*', '', text)
        text = re.sub(r'\s+', ' ', text).strip()
        return text

    # ── EXTRACT RELEVANT QUOTES FROM CLUSTER ─────────────────
    # picks 2 short human-sounding snippets from cluster evidence

    def extract_quotes(self, clustered_item: dict, all_cleaned: list) -> list:
        rep   = self.clean_text(clustered_item.get("representative_text", ""))
        score = clustered_item.get("relevance_score", 0)

        # find top 2 relevant cleaned items near this cluster's score
        nearby = sorted(
            [e for e in all_cleaned if isinstance(e, dict)],
            key=lambda x: abs(x.get("relevance_score", 0) - score)
        )[:2]

        quotes = []
        for item in nearby:
            t = self.clean_text(item.get("text", ""))
            # take first meaningful sentence only
            sentences = re.split(r'[.!?]', t)
            for s in sentences:
                s = s.strip()
                if len(s) > 30:
                    quotes.append(s[:120])
                    break

        return quotes[:2]

    # ── BUILD MARKET SIGNALS ──────────────────────────────────
    # converts compressed clusters into narrative signal objects

    def build_market_signals(self, compressed: dict, evidence: dict) -> list:
        signals = []

        intent_map = [
            ("pain",     "problem_clusters",  "problem_cleaned",  "frustration"),
            ("behavior", "behavior_clusters", "behavior_cleaned", "adaptation"),
            ("spending", "spending_clusters", "spending_cleaned", "economic_intent"),
        ]

        for signal_type, cluster_key, cleaned_key, emotion in intent_map:
            clusters = compressed.get(cluster_key, [])
            cleaned  = evidence.get(cleaned_key, [])

            for cluster in clusters[:3]:  # top 3 per intent
                summary = cluster.get("summary", "")
                if not summary:
                    continue

                quotes    = self.extract_quotes(cluster, cleaned)
                sentiment = cluster.get("sentiment", {})

                signals.append({
                    "type":      signal_type,
                    "summary":   summary,
                    "quotes":    quotes,
                    "emotion":   emotion,
                    "sentiment": sentiment.get("label", "neutral"),
                    "size":      cluster.get("size", 1)
                })

        # sort by size — strongest signals first
        return sorted(signals, key=lambda x: x["size"], reverse=True)

    # ── BUILD PROMPT ──────────────────────────────────────────

    def build_prompt(self, problem: str, structured: dict, signals: list) -> str:

        # format signals as readable context — not JSON dump
        signal_text = ""
        for s in signals[:8]:  # max 8 signals to stay within token limit
            signal_text += f"\n[{s['type'].upper()} — {s['emotion']} — sentiment: {s['sentiment']}]\n"
            signal_text += f"{s['summary']}\n"
            for q in s["quotes"]:
                signal_text += f'  > "{q}"\n'

        prompt = f"""You are an experienced startup advisor analyzing real internet behavior around a founder's idea.

The following signals were extracted from actual online discussions, complaints, workarounds, and user conversations — not surveys or assumptions.

FOUNDER'S PROBLEM:
{problem.strip()}

WHAT THE INTERNET IS SAYING:
{signal_text}

Your task is to deeply understand what is really happening in this market.

Think like a YC partner having a candid conversation with a founder.
You may reference the quotes naturally.
You may challenge weak assumptions.
You may identify unexpected patterns.
Connect the emotional signals with the behavioral ones.
If spending signals exist, explain what they reveal about willingness to pay.

Do NOT follow a rigid format.
Do NOT mention clusters, embeddings, scores, or AI analysis.
Do NOT be robotic or use bullet points unless it feels natural.

Respond conversationally and insightfully — like ChatGPT giving real startup advice."""

        return prompt

    # ── MAIN ──────────────────────────────────────────────────

    def analyze(self, state: dict) -> str:

        problem    = state.get("problem", "")
        structured = state.get("structured_problem", {})
        compressed = state.get("intelligence", {}).get("compressed", {})
        evidence   = state.get("evidence", {})

        signals = self.build_market_signals(compressed, evidence)

        if not signals:
            return "Not enough market signals collected to generate analysis."

        prompt = self.build_prompt(problem, structured, signals)

        # rate limit safe — single call with retry
        for attempt in range(3):
            try:
                time.sleep(attempt * 2)  # backoff on retry
                result = ask_llm(prompt, max_tokens=1024)
                if result and len(result) > 100:
                    return result.strip()
            except Exception as e:
                print(f"    [founder_intelligence] retry {attempt + 1}: {e}")
                continue

        return "Analysis could not be generated. Please retry."
