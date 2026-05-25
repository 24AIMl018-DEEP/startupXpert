import re
from ddgs import DDGS

_DOMAIN_RE = re.compile(r"https?://(?:www\.)?([^/]+)")

# community path signals — if URL contains these it's likely a discussion
_COMMUNITY_PATH_SIGNALS = [
    "/r/", "/comments/", "/post/", "/thread/", "/discussion/",
    "/forum/", "/community/", "/question/", "/answers/",
    "/review/", "/reviews/", "/feedback/", "/complaint/",
    "/watch?", "/video/", "/status/", "/tweet/"
]

# domain keyword signals → (label, weight)
_DOMAIN_SIGNALS = [
    (["reddit"],                          ("reddit",    10)),
    (["discord"],                         ("discord",    9)),
    (["steam", "steampowered"],           ("steam",      9)),
    (["trustpilot", "g2", "capterra"],    ("review",     9)),
    (["youtube", "youtu"],                ("youtube",    8)),
    (["twitter", ".x.com", "x.com"],      ("twitter",    7)),
    (["quora"],                           ("quora",      7)),
    (["stackoverflow", "stackexchange"],  ("stackoverflow", 6)),
    (["ycombinator", "indiehackers"],     ("startup_community", 7)),
    (["producthunt"],                     ("producthunt", 7)),
    (["forum", "community", "discuss",
      "board", "talk", "hub", "clan",
      "guild", "group", "chat"],          ("forum",      6)),
    (["review", "rating", "feedback",
      "complaint", "opinion"],            ("review_site", 6)),
    (["news", "techcrunch", "wired",
      "verge", "mashable", "forbes",
      "bloomberg", "cnbc"],              ("news",        2)),
    (["blog", "medium", "substack",
      "wordpress", "ghost", "beehiiv"],  ("blog",        2)),
    (["wiki", "wikipedia", "docs",
      "pdf", "scribd", "slideshare"],    ("reference",   1)),
]


def _score_url(url: str) -> tuple:
    """
    Dynamically score a URL based on:
    1. Domain keyword signals
    2. Community path signals
    Returns (source_label, weight)
    """
    if not url:
        return ("unknown", 3)

    url_lower = url.lower()

    # PDF check
    if re.search(r"\.pdf(\?|$)", url_lower):
        return ("pdf", 1)

    # extract domain
    m = _DOMAIN_RE.match(url)
    domain = m.group(1).lower() if m else url_lower

    # check domain keyword signals
    for keywords, (label, weight) in _DOMAIN_SIGNALS:
        if any(kw in domain for kw in keywords):
            # boost if URL path also has community signals
            path_boost = 1 if any(sig in url_lower for sig in _COMMUNITY_PATH_SIGNALS) else 0
            return (label, min(10, weight + path_boost))

    # unknown domain — check path for community signals
    community_hits = sum(1 for sig in _COMMUNITY_PATH_SIGNALS if sig in url_lower)
    if community_hits >= 2:
        return ("community", 6)
    elif community_hits == 1:
        return ("community", 5)

    # pure unknown — low weight, likely SEO/noise
    return (domain, 3)


class SearchCollector:

    def collect(self, queries: list, limit: int = 100) -> list:
        evidence = []

        with DDGS() as ddgs:
            for query in queries:
                try:
                    results = ddgs.text(query, max_results=limit)

                    for result in results:
                        title = result.get("title", "")
                        body  = result.get("body", "")
                        url   = result.get("href", result.get("url", ""))

                        if not (title or body):
                            continue

                        source_label, weight = _score_url(url)

                        evidence.append({
                            "text":          f"TITLE: {title}\nCONTENT: {body}",
                            "source":        source_label,
                            "url":           url,
                            "source_weight": weight
                        })

                except Exception as e:
                    print(f"    Search Error: {e}")

        return evidence
