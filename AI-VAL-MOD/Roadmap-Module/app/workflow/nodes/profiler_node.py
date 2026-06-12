from agents.profiler_agent import profiler_agent


def profiler_node(state: dict) -> dict:
    # If profiler already ran (pipeline pre-computed it), skip re-run
    if state.get("profiler_output") and state["profiler_output"].get("business_type"):
        print("[Node:profiler] Already computed — skipping re-run")
        return {"profiler_output": state["profiler_output"]}

    team_members = state.get("team_members", [])
    
    # Filter for top-level members to assign branch nodes
    top_level_keywords = {"founder", "ceo", "cto", "cmo", "coo", "lead", "head", "director", "manager", "chief", "president", "vp", "executive"}
    top_level_members = []
    
    for m in team_members:
        role_lower = str(m.get("role", "")).lower()
        if any(kw in role_lower for kw in top_level_keywords):
            top_level_members.append(m)
            
    # Fallback: if no leaders found, just use up to 5 members
    if not top_level_members:
        top_level_members = team_members[:5]

    print("[Node:profiler] START")
    result = profiler_agent.run(
        startup_data=state["startup_data"],
        validation_context=state.get("validation_context", {}),
        team_members=top_level_members,
    )
    print(f"[Node:profiler] DONE — branches={result.get('prioritized_branches', [])}")
    return {"profiler_output": result}

