"""
genre_node.py — Node: Genre Detection
Rule: Nodes contain ZERO logic. Only read state → call service → write state.

Note: Genre is run AFTER structure_node so it can use structured_problem
      for richer context. If structured_problem is not yet available,
      falls back to raw problem string only.
"""
from services.genre_service import GenreService

_svc = GenreService()


def genre_node(state: dict) -> dict:
    print("\n[1/8] Genre Detection")
    result = _svc.run(
        state["problem"],
        structured_problem=state.get("structured_problem")   # None on first call
    )
    print(f"  → Genre: {result['genre'][:70]}")
    print(f"  → Confidence: {result['confidence_score']:.4f}")
    return {
        "genre":            result["genre"],
        "top_genres":       result["top_genres"],
        "confidence_score": result["confidence_score"]
    }
