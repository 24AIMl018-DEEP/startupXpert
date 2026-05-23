from agents.genre_agent import GenreAgent
from agents.problem_structuring_agent import ProblemStructuringAgent
from agents.query_generation_agent import QueryGenerationAgent
from agents.evidence_agent import EvidenceAgent
from agents.cleaning_agent import CleaningAgent
from agents.compression_agent import CompressionAgent

W = 60

state = {
    "problem": """Pet owners want to share cute photos of their pets, but they lack a dedicated space without cluttering their personal main social media feeds.
    """
}

print("=" * W)
print("  RUNNING PIPELINE")
print("=" * W)

print("\n  [1/6] Genre Agent...")
state = GenreAgent().run(state)

print("  [2/6] Problem Structuring Agent...")
state = ProblemStructuringAgent().run(state)

print("  [3/6] Query Generation Agent...")
state = QueryGenerationAgent().run(state)

print("  [4/6] Evidence Agent...")
state = EvidenceAgent().run(state)

print("  [5/6] Cleaning Agent...")
state = CleaningAgent().run(state)

print("  [6/6] Compression Agent...")
state = CompressionAgent().run(state)

print("\n" + "=" * W)
print("  GENRE ANALYSIS")
print("=" * W)
print(f"\n  Genre      : {state['genre']}")
print(f"  Confidence : {state['confidence_score']}")
print("\n  Top 3:")
for i, g in enumerate(state["top_genres"], 1):
    print(f"    {i}. [{g['score']}]  {g['genre']}")

print("\n" + "=" * W)
print("  STRUCTURED PROBLEM")
print("=" * W)
sp = state["structured_problem"]
print(f"\n  Core Problem  : {sp['core_problem']}")
print(f"  Main Pain     : {sp['main_pain']}")
print(f"  Environment   : {sp['environment']}")
print(f"  Target Users  : {sp['target_users']}")

print("\n" + "=" * W)
print("  SEARCH QUERIES")
print("=" * W)
for i, q in enumerate(state["search_queries"], 1):
    print(f"  {i}. {q}")

print("\n" + "=" * W)
print("  EVIDENCE")
print("=" * W)
print(f"\n  Trend Keyword : {state['trend_keyword']}")
print(f"  Trend Score   : {state['trend_score']}")
print(f"  Raw Evidence  : {len(state['raw_evidence'])} collected")
print(f"  Cleaned       : {len(state['cleaned_evidence'])} passed filter")

print("\n" + "=" * W)
print("  CLEANED EVIDENCE — TOP 5")
print("=" * W)

if not state["cleaned_evidence"]:
    print("\n  No relevant evidence found.")
else:
    for i, item in enumerate(state["cleaned_evidence"][:5], 1):
        print(f"\n  [{i}] Score: {item['relevance_score']}")
        print("  " + "-" * 50)
        print("  " + item["text"][:400].strip().replace("\n", "\n  "))

print("\n" + "=" * W)
print("  COMPRESSED EVIDENCE")
print("=" * W)

if not state["compressed_evidence"]:
    print("\n  No compressed evidence.")
else:
    for item in state["compressed_evidence"]:
        print(f"\n  Cluster {item['cluster_id']} ({item['cluster_size']} items) | Score: {item['relevance_score']}")
        print("  " + "-" * 50)
        print("  " + item["representative_text"][:400].strip().replace("\n", "\n  "))

print("\n" + "=" * W)
print("  DONE")
print("=" * W + "\n")
