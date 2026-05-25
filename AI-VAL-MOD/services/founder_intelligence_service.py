import re
import time
from services.llm_service import ask_llm
from services.embedding_service import clean_text


class FounderIntelligenceService:

    def extract_quotes(self, cluster: dict) -> list:
        quotes = []
        for post in cluster.get("top_posts", [])[:2]:
            t = clean_text(post)
            for s in re.split(r'[.!?]', t):
                s = s.strip()
                if len(s) > 30:
                    quotes.append(s[:120])
                    break
        return quotes

    def build_market_signals(self, compressed: dict) -> list:
        signals = []
        for intent, cluster_key, emotion in [
            ("pain",     "problem_clusters",  "frustration"),
            ("behavior", "behavior_clusters", "adaptation"),
            ("spending", "spending_clusters", "economic_intent")
        ]:
            for cluster in compressed.get(cluster_key, [])[:3]:
                if not cluster.get("summary"):
                    continue
                signals.append({
                    "type":          intent,
                    "summary":       cluster["summary"],
                    "quotes":        self.extract_quotes(cluster),
                    "emotion":       emotion,
                    "sentiment":     cluster.get("sentiment", {}).get("label", "neutral"),
                    "size":          cluster.get("size", 1),
                    "keywords":      cluster.get("top_keywords", []),
                    "competitors":   cluster.get("top_competitors", []),
                    "urgency":       cluster.get("urgency_count", 0),
                    "workarounds":   cluster.get("workaround_count", 0),
                    "spending":      cluster.get("spending_count", 0)
                })
        return sorted(signals, key=lambda x: x["size"], reverse=True)

    def build_prompt(self, problem: str, signals: list) -> str:
        signal_text = ""
        for s in signals[:8]:
            signal_text += f"\n[{s['type'].upper()} — {s['emotion']} — {s['sentiment']}]\n"
            signal_text += f"{s['summary']}\n"
            if s["keywords"]:
                signal_text += f"  Keywords: {', '.join(s['keywords'])}\n"
            if s["competitors"]:
                signal_text += f"  Competitors: {', '.join(s['competitors'])}\n"
            if s["urgency"]:
                signal_text += f"  Urgency signals: {s['urgency']}\n"
            if s["workarounds"]:
                signal_text += f"  Workaround signals: {s['workarounds']}\n"
            if s["spending"]:
                signal_text += f"  Spending signals: {s['spending']}\n"
            for q in s["quotes"]:
                signal_text += f'  > "{q}"\n'

        return f"""You are a startup advisor giving a direct, honest assessment to a founder.

These signals were extracted from real internet discussions — not surveys.

FOUNDER'S PROBLEM:
{problem.strip()}

MARKET SIGNALS FROM THE INTERNET:
{signal_text}

Give a direct, honest startup assessment. Structure your response naturally but make sure you cover:
1. Should they build this? (clear yes/no with one-line reason)
2. What is the strongest signal from the data?
3. What is the biggest risk or weakness?
4. What behavior pattern is most interesting?
5. What should the founder validate or do next?

Rules:
- Reference actual quotes and signals from above
- Challenge weak assumptions directly
- If competitors are mentioned, explain what that means
- If workarounds exist, explain what that reveals about urgency
- Do NOT mention clusters, embeddings, scores, or AI
- Do NOT use filler phrases like "I love diving into" or "fascinating"
- Be direct like a YC partner, not a consultant writing a report
- Max 400 words"""

    def analyze(self, state: dict) -> str:
        problem    = state.get("problem", "")
        compressed = state.get("intelligence", {}).get("compressed", {})
        signals    = self.build_market_signals(compressed)

        if not signals:
            return "Not enough market signals collected to generate analysis."

        prompt = self.build_prompt(problem, signals)

        for attempt in range(3):
            try:
                time.sleep(attempt * 2)
                result = ask_llm(prompt, max_tokens=1024)
                if result and len(result) > 100:
                    return result.strip()
            except Exception as e:
                print(f"    [founder_intelligence] retry {attempt + 1}: {e}")

        return "Analysis could not be generated. Please retry."
