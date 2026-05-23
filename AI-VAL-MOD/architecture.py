AGENTS = [
    {
        "name": "GenreAgent",
        "file": "agents/genre_agent.py",
        "input": "problem",
        "output": "genre, top_genres, confidence_score",
        "method": "Sentence Embedding + Cosine Similarity",
        "status": "DONE"
    },
    {
        "name": "EvidenceAgent",
        "file": "agents/evidence_agent.py",
        "input": "problem",
        "output": "raw_evidence, trend_keyword, trend_score",
        "method": "DuckDuckGo Search + Google Trends",
        "status": "DONE"
    },
    {
        "name": "CleaningAgent",
        "file": "agents/cleaning_agent.py",
        "input": "genre, raw_evidence",
        "output": "cleaned_evidence",
        "method": "Genre Keyword Filter + Semantic Similarity",
        "status": "DONE"
    },
    {
        "name": "SentimentAgent",
        "file": "agents/sentiment_agent.py",
        "input": "cleaned_evidence",
        "output": "sentiment, sentiment_score",
        "method": "LLM / VADER",
        "status": "PENDING"
    },
    {
        "name": "ScoringAgent",
        "file": "agents/scoring_agent.py",
        "input": "sentiment, trend_score, cleaned_evidence",
        "output": "pain_score",
        "method": "Rule-Based Weighted Scoring",
        "status": "PENDING"
    },
    {
        "name": "FakeDetectorAgent",
        "file": "agents/fake_detector_agent.py",
        "input": "cleaned_evidence, pain_score",
        "output": "is_fake_problem, fake_problem_reason",
        "method": "LLM Reasoning",
        "status": "PENDING"
    },
    {
        "name": "VerdictAgent",
        "file": "agents/verdict_agent.py",
        "input": "full state",
        "output": "final_verdict, final_reasoning",
        "method": "LLM Summary",
        "status": "PENDING"
    }
]

W = 60

def print_architecture():

    print("\n" + "=" * W)
    print("  STARTUPXPERT — PIPELINE ARCHITECTURE")
    print("=" * W)

    for i, agent in enumerate(AGENTS, 1):

        status_tag = "✅" if agent["status"] == "DONE" else "⏳"

        print(f"\n  {status_tag} [{i}] {agent['name']}")
        print(f"       File   : {agent['file']}")
        print(f"       Input  : {agent['input']}")
        print(f"       Output : {agent['output']}")
        print(f"       Method : {agent['method']}")

        if i < len(AGENTS):
            print("         |")
            print("         ▼")

    print("\n" + "=" * W)

    done    = sum(1 for a in AGENTS if a["status"] == "DONE")
    pending = len(AGENTS) - done

    print(f"  Progress : {done}/{len(AGENTS)} agents complete  |  {pending} pending")
    print("=" * W + "\n")


if __name__ == "__main__":
    print_architecture()
