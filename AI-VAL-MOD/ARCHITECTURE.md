# AI-VAL-MOD — Architecture Documentation

---

## Technology Legend

| Symbol | Meaning                          |
|--------|----------------------------------|
| 🤖 LLM  | Uses LLM (NVIDIA / Llama 3.1)   |
| 🧠 EMB  | Uses Sentence Embeddings (MiniLM)|
| 🎭 HF   | Uses HuggingFace free model      |
| 🔍 WEB  | Makes internet search requests   |
| 📈 TRD  | Uses Google Trends API           |
| ⚙️ ENG  | Pure Python / engineering logic  |

---

## Pipeline Flow

```
main.py
  ↓
graph/startup_graph.py  (LangGraph orchestration)
  ↓
[1] genre_node
[2] structure_node
[3] query_node
[4] evidence_node
[5] cleaning_node
[6] clustering_node
[7] compression_intelligence_node
  ↓
state["intelligence"]["compressed"]  ← final output stored here
```

---

## Nodes  (`nodes/`)

| File                            | What it does                                      | Technology |
|---------------------------------|---------------------------------------------------|------------|
| `genre_node.py`                 | Calls GenreService, writes genre to state         | ⚙️ ENG     |
| `structure_node.py`             | Calls ProblemStructuringService, writes structured_problem | ⚙️ ENG |
| `query_node.py`                 | Calls QueryGenerationService, writes search_queries | ⚙️ ENG  |
| `evidence_node.py`              | Calls EvidenceService, writes evidence per intent | ⚙️ ENG     |
| `cleaning_node.py`              | Calls CleaningService for each intent, writes cleaned evidence | ⚙️ ENG |
| `clustering_node.py`            | Calls CompressionService for each intent, writes clustered evidence | ⚙️ ENG |
| `compression_intelligence_node.py` | Calls CompressionIntelligenceService, writes compressed intelligence | ⚙️ ENG |

> **Rule:** Nodes NEVER contain logic. They only read from state, call a service, write result back to state.

---

## Services  (`services/`)

| File                               | What it does                                                    | Technology       |
|------------------------------------|-----------------------------------------------------------------|------------------|
| `llm_service.py`                   | Single LLM client (NVIDIA API, Llama 3.1-8b)                   | 🤖 LLM           |
| `embedding_service.py`             | Single SentenceTransformer instance (`all-MiniLM-L6-v2`)       | 🧠 EMB           |
| `genre_service.py`                 | Encodes problem + genres, cosine similarity → top 3 genres     | 🧠 EMB           |
| `problem_structuring_service.py`   | Sends raw problem to LLM → structured JSON (core_problem, main_pain, environment, target_users) | 🤖 LLM |
| `query_generation_service.py`      | Sends structured problem to LLM → 3 intent query sets (problem / behavior / spending) | 🤖 LLM |
| `evidence_service.py`              | Searches internet per query per intent, fetches trend score    | 🔍 WEB 📈 TRD    |
| `cleaning_service.py`              | Semantic similarity filter — keeps evidence relevant to problem | 🧠 EMB          |
| `compression_service.py`           | KMeans clustering of cleaned evidence → representative clusters | 🧠 EMB          |
| `compression_intelligence_service.py` | Per cluster: LLM summary (1 sentence) + HuggingFace sentiment | 🤖 LLM 🎭 HF  |
| `query_service.py`                 | Old utility — not used in current pipeline                     | ⚙️ ENG           |
| `base_service.py`                  | Base class for all services                                    | ⚙️ ENG           |

---

## Collectors  (`collectors/`)

| File                    | What it does                              | Technology |
|-------------------------|-------------------------------------------|------------|
| `search_collector.py`   | DuckDuckGo search via `ddgs` library      | 🔍 WEB     |
| `trends_collector.py`   | Google Trends score via `pytrends`        | 📈 TRD     |

---

## State  (`states/startup_state.py`)

All data flows through one shared state dict. Sub-states define what each phase stores:

```
StartupState
├── problem                    str         raw input problem
│
├── understanding              (flat keys on state)
│   ├── genre                  str
│   ├── top_genres             List[Dict]
│   ├── confidence_score       float
│   ├── structured_problem     Dict        {core_problem, main_pain, environment, target_users}
│   ├── search_queries         Dict        {problem_queries, behavior_queries, spending_queries}
│   ├── trend_keyword          str
│   └── trend_score            float
│
├── evidence                   Dict
│   ├── raw                    List[str]   all combined
│   ├── problem                List[str]   raw problem intent
│   ├── behavior               List[str]   raw behavior intent
│   ├── spending               List[str]   raw spending intent
│   ├── problem_cleaned        List[Dict]  {text, relevance_score}
│   ├── behavior_cleaned       List[Dict]
│   ├── spending_cleaned       List[Dict]
│   ├── problem_clustered      List[Dict]  {cluster_id, cluster_size, representative_text, relevance_score}
│   ├── behavior_clustered     List[Dict]
│   └── spending_clustered     List[Dict]
│
└── intelligence               Dict
    └── compressed             Dict
        ├── top_pains          List[str]   LLM 1-sentence summaries of problem clusters
        ├── behavior_patterns  List[str]   LLM 1-sentence summaries of behavior clusters
        ├── spending_patterns  List[str]   LLM 1-sentence summaries of spending clusters
        ├── problem_sentiment  List[Dict]  {label: negative/neutral/positive, score: float}
        ├── behavior_sentiment List[Dict]
        ├── spending_sentiment List[Dict]
        ├── problem_clusters   List[Dict]  {summary, sentiment, size}
        ├── behavior_clusters  List[Dict]
        └── spending_clusters  List[Dict]
```

---

## LLM Usage Summary

| Where                              | Input to LLM                          | Output from LLM                    |
|------------------------------------|---------------------------------------|------------------------------------|
| `problem_structuring_service.py`   | Raw problem text                      | Structured JSON (4 fields)         |
| `query_generation_service.py`      | Structured problem                    | 18 search queries (3 × 6)          |
| `compression_intelligence_service.py` | Top 3 cleaned texts per cluster    | 1 sentence summary per cluster     |

> LLM is NEVER given raw evidence directly. Only structured or compressed inputs.

---

## HuggingFace Model Usage

| Where                              | Model                                              | Purpose                  |
|------------------------------------|----------------------------------------------------|--------------------------|
| `compression_intelligence_service.py` | `cardiffnlp/twitter-roberta-base-sentiment-latest` | Sentiment per cluster    |
| `embedding_service.py`             | `sentence-transformers/all-MiniLM-L6-v2`           | All semantic operations  |

---

## Graph  (`graph/`)

| File               | What it does                                      |
|--------------------|---------------------------------------------------|
| `startup_graph.py` | LangGraph StateGraph — wires all nodes in order   |
| `visualize.py`     | Generates `pipeline_graph.png` (run separately)   |
