# StartupXpert — Streamlit UI

## Run

From the project root (`AI-VAL-MOD/`):

```bash
streamlit run ui/app.py
```

## Notes
- Must be run from project root so imports resolve correctly
- Requires `streamlit` installed: `pip install streamlit`
- All pipeline logic stays in `services/`, `nodes/`, `graph/`
- UI only calls `build_graph()` and renders results
