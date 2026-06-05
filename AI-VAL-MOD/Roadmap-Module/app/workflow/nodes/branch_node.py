from agents.branch_agent import branch_agent


def make_branch_node(branch: str):
    def _node(state: dict) -> dict:
        profiler_output = state["profiler_output"]
        approved = set(profiler_output.get("prioritized_branches", []))
        banned   = set(profiler_output.get("banned_branches", []))

        if branch in banned or branch not in approved:
            print(f"[Node:branch_{branch}] SKIPPED — not in approved branches")
            return {"branch_results": [{"branch": branch, "status": "skipped", "tasks": None, "summary": None}]}

        result = branch_agent.run(
            branch=branch,
            startup_data=state["startup_data"],
            profiler_output=profiler_output,
            validation_context=state.get("validation_context", {}),
        )
        return {"branch_results": [result]}

    _node.__name__ = f"branch_{branch}"
    return _node
