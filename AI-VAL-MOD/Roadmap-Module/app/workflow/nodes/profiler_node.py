from agents.profiler_agent import profiler_agent


def profiler_node(state: dict) -> dict:
    # If profiler already ran (pipeline pre-computed it), skip re-run
    if state.get("profiler_output") and state["profiler_output"].get("business_type"):
        print("[Node:profiler] Already computed — skipping re-run")
        return {"profiler_output": state["profiler_output"]}

    print("[Node:profiler] START")
    result = profiler_agent.run(
        startup_data=state["startup_data"],
        validation_context=state.get("validation_context", {}),
    )
    print(f"[Node:profiler] DONE — branches={result['prioritized_branches']}")
    return {"profiler_output": result}
