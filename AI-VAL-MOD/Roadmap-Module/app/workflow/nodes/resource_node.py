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

    # Summarize team_members into unique roles to save tokens
    role_counts = {}
    for m in team_members:
        r = (m.get("role") or m.get("job_title") or "Team Member").strip()
        skills = tuple(m.get("skills") or [])
        key = (r, skills)
        role_counts[key] = role_counts.get(key, 0) + 1

    team_roles = [
        {"role": r, "skills": list(skills), "available_count": count}
        for (r, skills), count in role_counts.items()
    ]

    enriched = resource_agent.run(
        tasks=flat_tasks,
        team_roles=team_roles,
        business_type=state["profiler_output"].get("business_type", ""),
    )

    # Post-processing: Map assigned_role to a specific team member based on workload
    workload = {m.get("name", f"Unknown_{i}"): 0 for i, m in enumerate(team_members)}
    
    for task in enriched:
        assigned_role = task.get("assigned_role")
        if not assigned_role or assigned_role == "External / Outsource":
            task["assigned_to"] = "External / Outsource"
            task["assignee_role"] = "Professional"
            continue

        # Find all members matching this role
        matching_members = [
            m for m in team_members 
            if (m.get("role") or m.get("job_title") or "") == assigned_role
        ]
        
        # Fallback: if no exact role match, find any member
        if not matching_members:
            matching_members = team_members
            
        # Find the one with the lowest workload
        best_member = min(matching_members, key=lambda m: workload.get(m.get("name", ""), 0))
        
        m_name = best_member.get("name", "Unknown")
        task["assigned_to"] = m_name
        task["assigned_member_id"] = best_member.get("id")
        task["assignee_role"] = assigned_role
        workload[m_name] = workload.get(m_name, 0) + 1

    print(f"[Node:resource] DONE — {len(enriched)} tasks assigned. Final workloads: {workload}")
    return {"enriched_tasks": enriched}
