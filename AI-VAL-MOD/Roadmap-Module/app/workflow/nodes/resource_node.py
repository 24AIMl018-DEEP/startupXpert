from agents.resource_agent import resource_agent


def resource_node(state: dict) -> dict:
    print("[Node:resource] START")
    approved = set(state["profiler_output"].get("prioritized_branches", []))

    flat_tasks = []
    for br in state["branch_results"]:
        if br["branch"] not in approved or br["status"] != "success":
            continue
        for idx, task in enumerate(br.get("tasks") or []):
            flat_tasks.append({
                "task_id":     f"{br['branch']}_task_{idx:02d}",
                "branch":      br["branch"],
                "title":       task.get("title", ""),
                "description": task.get("description"),
                "timeline":    task.get("timeline"),
                "priority":    task.get("priority"),
            })

    if not flat_tasks:
        print("[Node:resource] No tasks — skipping")
        return {"enriched_tasks": []}

    team_members = state.get("team_members") or []
    if not team_members:
        print("[Node:resource] No team members — returning tasks unassigned")
        return {"enriched_tasks": flat_tasks}

    enriched = resource_agent.run(
        tasks=flat_tasks,
        team_members=team_members,
        business_type=state["profiler_output"].get("business_type", ""),
    )
    print(f"[Node:resource] DONE — {len(enriched)} tasks assigned")
    return {"enriched_tasks": enriched}
