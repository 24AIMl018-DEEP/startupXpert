from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
from states.startup_state import StartupState
from agents.base_agent import BaseAgent


class GenreAgent(BaseAgent):

    def __init__(self):

        self.model = SentenceTransformer("all-MiniLM-L6-v2")

        self.genres = [

            "serious medical, disease, infection, or healthcare related problems affecting human health",

            "payment fraud, financial loss, or money management problems",

            "workflow inefficiency, time waste, or productivity problems",

            "human relationship, social connection, or communication problems",

            "public hygiene and cleanliness discomfort problems",

            "daily convenience, small lifestyle friction, or comfort improvement problems",

            "transportation, commuting, or logistics problems",

            "mental stress, emotional wellbeing, or psychological problems",

            "privacy, data security, or digital safety problems",

            "education, skill learning, or knowledge access problems"

        ]

        self.genre_embeddings = self.model.encode(self.genres)

    def run(self, state: StartupState) -> StartupState:

        problem = state["problem"]

        # Enriched semantic context for stronger embedding signal
        problem_context = f"""
Startup Problem:
{problem}

This startup problem describes a real-world human pain point,
friction,
discomfort,
or operational issue.
"""

        problem_embedding = self.model.encode([problem_context])

        # Cosine similarity between problem and all genres
        similarities = cosine_similarity(problem_embedding, self.genre_embeddings)[0]

        # Top-3 genres
        top_indices = similarities.argsort()[-3:][::-1]

        top_genres = []

        for idx in top_indices:
            top_genres.append({
                "genre": self.genres[idx],
                "score": round(float(similarities[idx]), 3)
            })

        state["top_genres"] = top_genres
        state["genre"] = top_genres[0]["genre"]
        state["confidence_score"] = top_genres[0]["score"]

        return state
