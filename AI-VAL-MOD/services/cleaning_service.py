from services.embedding_service import encode, cosine_similarity


class CleaningService:

    def run(self, problem: str, genre: str, raw_evidence: list) -> list:

        if not raw_evidence:
            return []

        # pure semantic similarity — no keyword filter
        # keyword filter was rejecting valid cross-domain evidence
        problem_embedding   = encode([problem])
        evidence_embeddings = encode(raw_evidence)

        similarities = cosine_similarity(problem_embedding, evidence_embeddings)[0]

        cleaned = [
            {"text": evidence, "relevance_score": round(float(score), 3)}
            for evidence, score in zip(raw_evidence, similarities)
            if score >= 0.30
        ]

        return sorted(cleaned, key=lambda x: x["relevance_score"], reverse=True)
