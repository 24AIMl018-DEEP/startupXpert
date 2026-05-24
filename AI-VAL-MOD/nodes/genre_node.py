from services.genre_service import GenreService

service = GenreService()


def genre_node(state: dict) -> dict:
    result = service.run(state["problem"])
    state["genre"]            = result["genre"]
    state["top_genres"]       = result["top_genres"]
    state["confidence_score"] = result["confidence_score"]
    return state
