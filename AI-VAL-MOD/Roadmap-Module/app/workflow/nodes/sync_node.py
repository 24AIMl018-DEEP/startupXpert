from agents.sync_agent import sync_agent


def sync_node(state: dict) -> dict:
    print("[Node:sync] START")
    if not state.get("enriched_tasks"):
        print("[Node:sync] No tasks — skipping")
        return {"synced_tasks": []}

    synced = sync_agent.run(
        tasks=state["enriched_tasks"],
        business_type=state["profiler_output"].get("business_type", ""),
    )
    print(f"[Node:sync] DONE — {len(synced)} tasks synced")
    return {"synced_tasks": synced}
