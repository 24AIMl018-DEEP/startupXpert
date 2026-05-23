from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from agents.base_agent import BaseAgent
from states.startup_state import StartupState


class CleaningAgent(BaseAgent):

    # ==============================
    # GENRE → KEYWORD MAP
    # ==============================

    GENRE_KEYWORDS = {

        "serious medical, disease, infection, or healthcare related problems affecting human health": {
            "positive": ["disease", "infection", "health", "medical", "hospital", "symptom", "patient", "treatment"],
            "negative": ["insurance", "billing", "finance", "stock", "investment"]
        },

        "payment fraud, financial loss, or money management problems": {
            "positive": ["fraud", "payment", "money", "financial", "scam", "loss", "transaction", "bank"],
            "negative": ["health", "medical", "hospital", "education", "traffic"]
        },

        "workflow inefficiency, time waste, or productivity problems": {
            "positive": ["workflow", "productivity", "inefficient", "time", "process", "task", "delay", "manual"],
            "negative": ["health", "fraud", "hygiene", "transport"]
        },

        "human relationship, social connection, or communication problems": {
            "positive": ["relationship", "communication", "social", "connect", "lonely", "friend", "community", "interact"],
            "negative": ["fraud", "medical", "hygiene", "transport"]
        },

        "public hygiene and cleanliness discomfort problems": {
            "positive": ["hygiene", "shared", "glass", "cup", "drink", "public", "clean", "utensil", "water", "sanitation"],
            "negative": ["alcohol", "beer", "wine", "drunk", "spectacles", "eyeglasses", "vision", "meta glasses"]
        },

        "daily convenience, small lifestyle friction, or comfort improvement problems": {
            "positive": ["convenience", "lifestyle", "comfort", "daily", "friction", "habit", "routine", "ease"],
            "negative": ["fraud", "medical", "infection", "transport"]
        },

        "transportation, commuting, or logistics problems": {
            "positive": ["transport", "commute", "traffic", "logistics", "delivery", "route", "vehicle", "travel"],
            "negative": ["health", "fraud", "hygiene", "education"]
        },

        "mental stress, emotional wellbeing, or psychological problems": {
            "positive": ["stress", "anxiety", "mental", "emotional", "wellbeing", "burnout", "depression", "psychological"],
            "negative": ["fraud", "transport", "hygiene", "logistics"]
        },

        "privacy, data security, or digital safety problems": {
            "positive": ["privacy", "security", "data", "hack", "breach", "digital", "password", "surveillance"],
            "negative": ["health", "hygiene", "transport", "education"]
        },

        "education, skill learning, or knowledge access problems": {
            "positive": ["education", "learning", "skill", "knowledge", "student", "course", "training", "access"],
            "negative": ["fraud", "hygiene", "transport", "medical"]
        }
    }

    def __init__(self):

        self.model = SentenceTransformer("all-MiniLM-L6-v2")

    # ==============================
    # GENRE-AWARE KEYWORD FILTER
    # ==============================

    def keyword_filter(self, text, positive_keywords, negative_keywords):

        text = text.lower()

        # Reject if any negative keyword found
        for word in negative_keywords:
            if word in text:
                return False

        # Accept only if 2+ positive keywords match
        score = sum(1 for word in positive_keywords if word in text)

        return score >= 1

    # ==============================
    # MAIN RUN
    # ==============================

    def run(self, state: StartupState):

        problem    = state["problem"]
        genre      = state["genre"]
        raw_evidence = state["raw_evidence"]

        if not raw_evidence:
            state["cleaned_evidence"] = []
            return state

        # Get keywords for detected genre
        genre_map = self.GENRE_KEYWORDS.get(genre, {})
        positive_keywords = genre_map.get("positive", [])
        negative_keywords = genre_map.get("negative", [])

        # Step 1 — Genre-aware keyword filter
        keyword_filtered = [
            e for e in raw_evidence
            if self.keyword_filter(e, positive_keywords, negative_keywords)
        ]

        if not keyword_filtered:
            state["cleaned_evidence"] = []
            return state

        # Step 2 — Semantic similarity against problem
        problem_embedding   = self.model.encode([problem])
        evidence_embeddings = self.model.encode(keyword_filtered)

        similarities = cosine_similarity(
            problem_embedding,
            evidence_embeddings
        )[0]

        # Step 3 — Threshold + collect
        cleaned = []

        for evidence, score in zip(keyword_filtered, similarities):

            if score >= 0.35:

                cleaned.append({
                    "text": evidence,
                    "relevance_score": round(float(score), 3)
                })

        # Step 4 — Sort best first
        cleaned = sorted(
            cleaned,
            key=lambda x: x["relevance_score"],
            reverse=True
        )

        state["cleaned_evidence"] = cleaned

        return state
