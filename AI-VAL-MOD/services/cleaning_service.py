"""
Cleaning Service  (v2 — Source-weight boosted relevance scoring)
─────────────────────────────────────────────────────────────────
Fix: Old version scored all sources equally.
     A Reddit rant and a PDF were treated the same.

New scoring formula:
  final_score = semantic_similarity × source_weight_multiplier

Source weight multiplier:
  weight 10 (Reddit) → ×1.40
  weight 8-9         → ×1.25
  weight 6-7         → ×1.10
  weight 4-5         → ×1.00  (no boost)
  weight 1-3         → ×0.75  (penalized)

This means a Reddit post with sim=0.25 beats a blog with sim=0.30.

Handles BOTH old format (raw strings) and new format (dicts with source_weight).
"""

import re
import numpy as np
from services.embedding_service import encode, cosine_similarity, clean_text


_SPAM_PATTERNS = re.compile(
    r"(subscribe now|click here|buy now|limited offer|click below|"
    r"privacy policy|terms of service|cookie policy|advertisement|"
    r"sponsored content|promoted post|sign up free|log in to continue|"
    r"follow us|share this post|like and subscribe|SEO|search engine optimization)",
    re.IGNORECASE
)

# ── Source weight → score multiplier ───────────────────────────────────────────
def _weight_to_multiplier(weight: int) -> float:
    if weight >= 10:   return 1.40   # Reddit — raw user voice
    if weight >= 8:    return 1.25   # YouTube, Discord, Steam, App Stores
    if weight >= 6:    return 1.10   # Twitter, Quora, HN
    if weight >= 4:    return 1.00   # Neutral
    if weight >= 2:    return 0.80   # Blogs, Medium — opinions not pain
    return 0.60                      # PDFs, Wikipedia — not startup signal


class CleaningService:
    """
    Semantic relevance filter with source-weight boosted scoring.

    Accepts evidence as:
      - List[str]   (old format — backward compat)
      - List[dict]  {text, source, url, source_weight}  (new format)
    """

    def __init__(self, relevance_threshold: float = 0.20, dedup_threshold: float = 0.92):
        self.relevance_threshold = relevance_threshold
        self.dedup_threshold     = dedup_threshold

    def run(self, raw_evidence: list, structured_problem: dict) -> list:
        """
        Args:
            raw_evidence: List[str] or List[dict{text,source,url,source_weight}]
            structured_problem: {core_problem, main_pain, environment, target_users}

        Returns:
            List[dict]: [{text, relevance_score, source, url, source_weight}]
            Sorted by relevance_score descending.
        """
        if not raw_evidence:
            return []

        # ── Normalize to {text, source_weight} dicts ───────────────────────────
        normalized = self._normalize(raw_evidence)
        if not normalized:
            return []

        # ── Step 1: Basic quality filter ───────────────────────────────────────
        candidates = []
        for item in normalized:
            cleaned = clean_text(item["text"])
            if self._is_low_quality(cleaned):
                continue
            item["text"] = cleaned
            candidates.append(item)

        if not candidates:
            return []

        # ── Step 2: Build rich problem anchor ──────────────────────────────────
        problem_anchor = (
            f"startup problem: {structured_problem.get('core_problem', '')} "
            f"user pain: {structured_problem.get('main_pain', '')} "
            f"users: {structured_problem.get('target_users', '')} "
            f"context: {structured_problem.get('environment', '')}"
        ).strip()

        anchor_emb = encode([problem_anchor])                  # (1, D)
        texts      = [c["text"] for c in candidates]
        text_embs  = encode(texts)                             # (N, D)

        # ── Step 3: Semantic similarity ────────────────────────────────────────
        sims = cosine_similarity(anchor_emb, text_embs)[0]    # (N,)

        # ── Step 4: Apply source-weight boost ─────────────────────────────────
        scored = []
        for i, item in enumerate(candidates):
            sim        = float(sims[i])
            multiplier = _weight_to_multiplier(item.get("source_weight", 3))
            boosted    = round(sim * multiplier, 4)

            if boosted >= self.relevance_threshold:
                scored.append({
                    "text":          item["text"],
                    "relevance_score": boosted,
                    "raw_sim":       round(sim, 4),
                    "source":        item.get("source", "unknown"),
                    "url":           item.get("url", ""),
                    "source_weight": item.get("source_weight", 3)
                })

        # Sort by boosted relevance score
        scored.sort(key=lambda x: x["relevance_score"], reverse=True)

        # ── Step 5: Deduplicate ────────────────────────────────────────────────
        scored = self._deduplicate(scored)

        return scored

    # ── Helpers ────────────────────────────────────────────────────────────────

    def _normalize(self, raw_evidence: list) -> list:
        """Convert str or dict evidence to uniform {text, source, url, source_weight}."""
        normalized = []
        for item in raw_evidence:
            if isinstance(item, str):
                normalized.append({
                    "text":          item,
                    "source":        "unknown",
                    "url":           "",
                    "source_weight": 3
                })
            elif isinstance(item, dict):
                normalized.append({
                    "text":          item.get("text", ""),
                    "source":        item.get("source", "unknown"),
                    "url":           item.get("url", ""),
                    "source_weight": item.get("source_weight", 3)
                })
        return [n for n in normalized if n["text"].strip()]

    def _is_low_quality(self, text: str) -> bool:
        if len(text) < 25:
            return True
        if _SPAM_PATTERNS.search(text):
            return True
        alpha_ratio = sum(c.isalpha() for c in text) / max(len(text), 1)
        if alpha_ratio < 0.35:
            return True
        return False

    def _deduplicate(self, scored: list) -> list:
        """Remove near-identical texts (cosine sim > dedup_threshold)."""
        if len(scored) < 2:
            return scored

        texts     = [item["text"] for item in scored]
        embs      = encode(texts)
        keep      = []
        kept_embs = []

        for i, item in enumerate(scored):
            if not kept_embs:
                keep.append(item)
                kept_embs.append(embs[i])
                continue

            kept_matrix = np.array(kept_embs)
            cur_emb     = embs[i].reshape(1, -1)
            sims        = cosine_similarity(cur_emb, kept_matrix)[0]

            if max(sims) < self.dedup_threshold:
                keep.append(item)
                kept_embs.append(embs[i])

        return keep
