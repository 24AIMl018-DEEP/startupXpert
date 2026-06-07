from schema.states.graph_state import GraphState
from services.pitch_generation.pitch_service import create_pitch
from services.vector.indexer import index_pitch, index_startup_json


def pitch_node(state: GraphState) -> GraphState:
    """
    Generates the pitch sentence only and return and stores to the vector and and updates states
    """
    
    print(f"[Node:pitch] Generating pitch for {state['startup_data'].startup_name}...")

    startup_data = state["startup_data"]
    
    pitch = create_pitch(startup_data)
    
    index_pitch(pitch, startup_data.startup_name)
    
    chunks = index_startup_json(startup_data.model_dump())
    
    print(f"[Node:pitch] Done — chars={len(pitch)} json_chunks={chunks}")
    
    return {**state, "pitch": pitch, "indexed_chunks": chunks}
