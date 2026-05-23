from ddgs import DDGS


class SearchCollector:

    def collect(self, queries, limit=100):

        evidence = []

        with DDGS() as ddgs:

            for query in queries:

                try:

                    results = ddgs.text(
                        query,
                        max_results=limit
                    )

                    for result in results:

                        title = result.get("title", "")

                        body = result.get("body", "")

                        combined = f"""
TITLE:
{title}

CONTENT:
{body}
"""

                        evidence.append(combined)

                except Exception as e:

                    print(f"Search Error: {e}")

        return evidence
