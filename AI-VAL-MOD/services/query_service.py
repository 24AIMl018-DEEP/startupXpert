def generate_queries(problem: str):

    return [

        problem,

        f"{problem} complaints",

        f"{problem} frustration",

        f"{problem} inconvenience",

        f"people discussing {problem}",

        f"problems caused by {problem}",

        f"user pain points about {problem}"
    ]


def extract_trend_keyword(problem: str):

    # Take first 3 meaningful words from problem as keyword
    words = problem.lower().split()

    stop_words = {"a", "an", "the", "is", "are", "was", "were", "in", "on",
                  "at", "to", "for", "of", "and", "or", "but", "from", "with",
                  "that", "this", "it", "they", "people", "feel", "feels",
                  "uncomfortable", "very", "too", "so", "do", "does", "not"}

    keywords = [w for w in words if w not in stop_words]

    return " ".join(keywords[:3])
