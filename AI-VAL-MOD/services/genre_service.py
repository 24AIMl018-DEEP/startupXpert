"""
Genre Service  (v2 — Domain-aware Startup Taxonomy)
─────────────────────────────────────────────────────
Fix: Old version had 10 generic labels → overfitted on surface keywords.

Example failure:
  "gaming toxicity" → classified as "payment fraud"
  because words like "scams", "spending", "loss" matched fintech label.

Root cause:
  Matching KEYWORDS not PROBLEM INTENT.

Fix:
  1. 30 specific startup problem categories — built from real startup domains
  2. Each category has MULTIPLE phrasings to prevent keyword overfitting
  3. Problem encoded with full context window (problem + pain + users + environment)
  4. Multi-anchor scoring: average similarity across all phrasings per category
  5. Low-confidence fallback returns "general consumer problem"
"""

import numpy as np
from services.embedding_service import encode, cosine_similarity


# ── Startup domain taxonomy ─────────────────────────────────────────────────────
# Each category: (label, [list of phrasings])
# Multiple phrasings prevent single-keyword overfitting.
# Similarity is AVERAGED across all phrasings per category.

STARTUP_TAXONOMY = [
    (
        "gaming toxicity, harassment, or competitive fairness",
        [
            "toxic players ruining online gaming experience",
            "hackers cheaters smurfs ruining ranked matches",
            "multiplayer harassment bullying gaming community",
            "unfair matchmaking skill gap online games",
            "gaming trust safety reporting system broken",
            "player behavior moderation in competitive games"
        ]
    ),
    (
        "creator monetization, burnout, or audience building",
        [
            "content creator struggling to make money online",
            "YouTube Instagram creator burnout and mental health",
            "building audience from zero as a creator",
            "monetization platform unfair treatment of creators",
            "creator economy income instability"
        ]
    ),
    (
        "social connection, loneliness, or community building",
        [
            "difficulty making real friends as an adult",
            "loneliness social isolation finding community",
            "meeting new people in new city",
            "building meaningful relationships online"
        ]
    ),
    (
        "student learning, education access, or skill gap",
        [
            "students struggling to learn new skills effectively",
            "education system failing students real-world skills",
            "online learning engagement dropout problem",
            "hackathon internship networking for students",
            "skill gap between college and job market"
        ]
    ),
    (
        "remote work, collaboration, or team productivity",
        [
            "remote team collaboration inefficiency and burnout",
            "async communication problem in distributed teams",
            "project management chaos in remote companies",
            "zoom fatigue remote work productivity loss"
        ]
    ),
    (
        "healthcare access, patient experience, or medical friction",
        [
            "difficulty getting doctor appointment fast",
            "navigating complex healthcare insurance system",
            "mental health access cost and waiting times",
            "chronic illness daily management pain"
        ]
    ),
    (
        "financial management, debt, or personal money problems",
        [
            "personal debt management budgeting difficulty",
            "understanding investing savings for young adults",
            "living paycheck to paycheck financial stress",
            "credit score loan access problems"
        ]
    ),
    (
        "payment fraud, financial scams, or digital security",
        [
            "online payment fraud scam money lost",
            "identity theft phishing financial crime victim",
            "account hacked money stolen digital fraud",
            "crypto scam investment fraud loss"
        ]
    ),
    (
        "small business operations, invoicing, or admin overhead",
        [
            "small business owner drowning in paperwork admin",
            "freelancer invoice payment delayed cash flow",
            "manual bookkeeping accounting small business",
            "solopreneur time wasted on non-core work"
        ]
    ),
    (
        "hiring, recruitment, or talent finding friction",
        [
            "finding qualified candidates for job opening",
            "recruitment process too slow and expensive",
            "startup hiring first employees difficulty",
            "job seeker frustrated with application process"
        ]
    ),
    (
        "food, restaurant discovery, or delivery experience",
        [
            "food delivery wrong order cold food frustration",
            "finding good restaurants in new city",
            "dietary restriction food option limited",
            "restaurant waitlist reservation problem"
        ]
    ),
    (
        "transportation, commuting, or last-mile logistics",
        [
            "daily commute too long inefficient public transport",
            "last mile delivery package not arriving problem",
            "parking finding city driving frustration",
            "rideshare safety pricing surge problem"
        ]
    ),
    (
        "dating, relationships, or trust in romantic connection",
        [
            "dating app fake profiles ghosting frustration",
            "finding serious relationship online difficulty",
            "online dating trust safety concerns",
            "long distance relationship communication problem"
        ]
    ),
    (
        "mental health, anxiety, stress, or emotional wellbeing",
        [
            "anxiety depression support access difficulty",
            "work stress burnout mental health crisis",
            "therapy cost availability mental health stigma",
            "emotional support community for mental wellness"
        ]
    ),
    (
        "home services, maintenance, or local service booking",
        [
            "finding reliable plumber electrician handyman",
            "home repair service overpriced unreliable",
            "booking local services trust and quality problem",
            "property maintenance management landlord tenant"
        ]
    ),
    (
        "e-commerce, returns, or online shopping friction",
        [
            "online shopping return process complicated",
            "counterfeit product received from online store",
            "sizing fit problem buying clothes online",
            "delivery delay tracking package problem"
        ]
    ),
    (
        "AI workflow, developer tools, or technical productivity",
        [
            "developer workflow inefficient too many tools",
            "AI integration complexity in existing software",
            "software engineering productivity bottleneck",
            "code review deployment process too slow"
        ]
    ),
    (
        "data privacy, surveillance, or digital rights",
        [
            "personal data being sold without consent",
            "app tracking location without permission",
            "digital privacy awareness and control",
            "corporate surveillance data exploitation"
        ]
    ),
    (
        "travel planning, booking, or trip experience",
        [
            "travel planning overwhelming too many options",
            "flight hotel cancellation refund problem",
            "tourist scam safety travel experience",
            "visa immigration process complicated"
        ]
    ),
    (
        "pet care, veterinary access, or animal welfare",
        [
            "vet appointment expensive hard to get",
            "pet care cost insurance problem",
            "finding reliable pet sitter dog walker"
        ]
    ),
    (
        "environmental, sustainability, or climate anxiety",
        [
            "consumer frustrated by greenwashing corporate",
            "sustainable product option too expensive limited",
            "individual carbon footprint reduction difficulty",
            "climate anxiety eco-friendly lifestyle barrier"
        ]
    ),
    (
        "legal access, contracts, or regulatory complexity",
        [
            "small business confused by legal compliance",
            "contract review expensive without lawyer",
            "startup regulatory hurdle legal uncertainty",
            "consumer rights violation no recourse"
        ]
    ),
    (
        "parenting, childcare, or family coordination",
        [
            "finding affordable reliable childcare difficulty",
            "parenting scheduling family activity coordination",
            "child education school homework support problem"
        ]
    ),
    (
        "fitness, wellness habits, or behavior change",
        [
            "gym motivation consistency behavior change hard",
            "fitness tracking not changing actual habits",
            "nutrition diet plan adherence problem",
            "sleep quality improvement difficulty"
        ]
    ),
    (
        "nonprofit, social impact, or community organizing",
        [
            "nonprofit donor management volunteer coordination",
            "community organizing grassroots movement tools",
            "social impact measurement reporting difficulty"
        ]
    ),
    (
        "media consumption, content overload, or attention economy",
        [
            "social media addiction doom scrolling problem",
            "information overload news fatigue",
            "podcast video content discovery difficulty",
            "attention span focus distraction modern media"
        ]
    ),
    (
        "event planning, networking, or professional community",
        [
            "professional networking events feel transactional fake",
            "event planning coordination tools inadequate",
            "finding niche professional community connection"
        ]
    ),
    (
        "supply chain, inventory, or B2B operations",
        [
            "supply chain disruption inventory management",
            "B2B procurement process slow inefficient",
            "vendor management supplier reliability problem"
        ]
    ),
    (
        "real estate, renting, or housing access",
        [
            "renting apartment high cost limited options",
            "landlord tenant dispute maintenance neglect",
            "first home buying process confusing expensive"
        ]
    ),
    (
        "general consumer frustration or everyday friction",
        [
            "everyday task unnecessarily complicated frustrating",
            "consumer product service failing basic expectations",
            "daily friction small annoyances quality of life"
        ]
    )
]


class GenreService:
    """
    Domain-aware startup problem classifier.

    Uses multi-anchor cosine similarity:
    - Each category has multiple phrasings
    - Similarity is AVERAGED across phrasings → prevents keyword overfitting
    - Problem encoded with FULL context (problem + pain + environment + users)
    """

    def __init__(self):
        # Pre-compute embeddings for all phrasings of all categories
        self._labels   = []   # category label strings
        self._anchors  = []   # np.array per category: (num_phrasings, D)

        for label, phrasings in STARTUP_TAXONOMY:
            self._labels.append(label)
            embs = encode(phrasings)   # (num_phrasings, D)
            self._anchors.append(embs)

    def run(self, problem: str, structured_problem: dict = None) -> dict:
        """
        Classify startup problem into domain taxonomy.

        Args:
            problem: raw founder problem string
            structured_problem: optional {core_problem, main_pain, environment, target_users}
                                 if present, used to build a richer encoding anchor

        Returns:
            {genre, top_genres, confidence_score}
        """
        # ── Build rich problem context ─────────────────────────────────────────
        if structured_problem:
            context = (
                f"Startup problem: {problem}\n"
                f"Core issue: {structured_problem.get('core_problem', '')}\n"
                f"User pain: {structured_problem.get('main_pain', '')}\n"
                f"Where it happens: {structured_problem.get('environment', '')}\n"
                f"Who suffers: {structured_problem.get('target_users', '')}"
            )
        else:
            context = f"Startup problem: {problem}"

        problem_emb = encode([context])  # (1, D)

        # ── Score each category (avg similarity across phrasings) ──────────────
        category_scores = []
        for i, (label, anchor_embs) in enumerate(zip(self._labels, self._anchors)):
            # similarity between problem and EACH phrasing of this category
            sims = cosine_similarity(problem_emb, anchor_embs)[0]  # (num_phrasings,)
            # Use max (not avg) — if ANY phrasing matches well, category is relevant
            avg_sim = float(np.max(sims))
            category_scores.append((label, avg_sim))

        # ── Rank ───────────────────────────────────────────────────────────────
        category_scores.sort(key=lambda x: x[1], reverse=True)
        top3 = category_scores[:3]

        top_genres = [
            {"genre": label, "score": round(score, 4)}
            for label, score in top3
        ]

        # Low confidence fallback
        best_label = top3[0][0]
        best_score = top3[0][1]
        if best_score < 0.30:
            best_label = "general consumer frustration or everyday friction"

        return {
            "genre":            best_label,
            "top_genres":       top_genres,
            "confidence_score": round(best_score, 4)
        }
