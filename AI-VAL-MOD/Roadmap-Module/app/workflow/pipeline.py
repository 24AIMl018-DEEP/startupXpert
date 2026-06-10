from typing import List, Dict, Optional

from schema.startup_input import StartupInput
from schema.states.roadmap_state import RoadmapGraphState
from schema.states.pipeline_state import (
    ProfilerOutput, BranchRoadmap, SyncedTask, RoadmapPipelineState,
)
from workflow.graph import build_graph
from workflow.nodes.profiler_node import profiler_node
from services.validation_fetcher import fetch_validation_context
from services.db.reader import get_startup_input
from services.db.writer import write_profiler, write_branch, write_tasks, delete_roadmap_for_session


async def run_roadmap_pipeline(
    session_id: str,
    team_members: List[Dict],
) -> RoadmapPipelineState:

    # ── Phase 0: fetch startup_input + validation context from DB ─
    raw = get_startup_input(session_id)
    if not raw:
        raise ValueError(
            f"startup_input row not found for session_id={session_id}. "
            "Verify the session was created by the Validation module and that both modules "
            "share the same Supabase project (check SUPABASE_URL in AI-VAL-MOD/.env)."
        )

    startup_data = StartupInput(**{
        k: raw[k] for k in StartupInput.model_fields if k in raw
    })

    print(f"\n{'='*60}\n[Roadmap] START — {startup_data.startup_name} | session={session_id}\n{'='*60}")

    delete_roadmap_for_session(session_id)

    validation_ctx = fetch_validation_context(session_id)

    startup_dict = startup_data.model_dump()
    startup_dict["platform_type"]    = ", ".join(startup_data.platform_type or [])
    startup_dict["founder_skillset"] = ", ".join(startup_data.founder_skillset or [])

    base_state: RoadmapGraphState = {
        "session_id":         session_id,
        "startup_data":       startup_dict,
        "team_members":       team_members,
        "validation_context": validation_ctx,
        "profiler_output":    {},
        "branch_results":     [],
        "enriched_tasks":     [],
        "synced_tasks":       [],
    }

    # ── Phase 1: profiler → dynamic branches ──────────────────────
    profiler_result  = profiler_node(base_state)
    profiler_output  = profiler_result["profiler_output"]
    approved_branches: List[str] = profiler_output.get("prioritized_branches", [])

    print(f"[Roadmap] Profiler — {len(approved_branches)} branches: {approved_branches}")

    profiler_db_id = write_profiler(session_id, startup_data.startup_name, profiler_output)

    # ── Phase 2: build graph dynamically + run ─────────────────────
    graph = build_graph(approved_branches)

    final_state: RoadmapGraphState = await graph.ainvoke({
        **base_state,
        "profiler_output": profiler_output,
    })

    # Map team member name (case-insensitive) to their org_members UUID
    member_id_map = {}
    for m in team_members:
        if m.get("name") and m.get("id"):
            member_id_map[m["name"].lower().strip()] = m["id"]

    # Map task assignments to member database IDs
    for r in final_state.get("branch_results", []):
        for t in r.get("tasks", []):
            assigned_name = t.get("assigned_to")
            if assigned_name:
                t["assigned_member_id"] = member_id_map.get(assigned_name.lower().strip())

    for t in final_state.get("synced_tasks", []):
        assigned_name = t.get("assigned_to")
        if assigned_name:
            t["assigned_member_id"] = member_id_map.get(assigned_name.lower().strip())

    # ── Assemble output + write to DB ──────────────────────────────
    approved_set     = set(approved_branches)
    branch_roadmaps: List[BranchRoadmap] = []
    # Map branch name → DB id for task-level db_id lookup
    branch_db_id_map: Dict[str, Optional[str]] = {}

    for r in final_state["branch_results"]:
        if r["branch"] not in approved_set:
            continue

        branch_db_id: Optional[str] = None

        if profiler_db_id:
            branch_db_id = write_branch(
                profiler_id= profiler_db_id,
                session_id=  session_id,
                branch=      r["branch"],
                status=      r["status"],
                summary=     r.get("summary"),
            )
            if branch_db_id and r.get("tasks"):
                task_list = [
                    {**t, "task_id": f"{r['branch']}_task_{i:02d}"}
                    for i, t in enumerate(r["tasks"])
                ]
                db_id_map = {
                    item["task_id"]: item["db_id"]
                    for item in write_tasks(branch_db_id, task_list)
                }
                # Store task_id → db_id map so synced_tasks can reference it
                r["_task_db_ids"] = db_id_map

        branch_db_id_map[r["branch"]] = branch_db_id

        branch_roadmaps.append(BranchRoadmap(
            branch=  r["branch"],
            status=  r["status"],
            tasks=   r.get("tasks"),
            summary= r.get("summary"),
            db_id=   branch_db_id,   # DB uuid so frontend can sync branch edits
        ))

    # Build a flat task_id → db_id map across all branches
    all_task_db_ids: Dict[str, Optional[str]] = {}
    for r in final_state["branch_results"]:
        all_task_db_ids.update(r.get("_task_db_ids", {}))

    synced_tasks = [
        SyncedTask(
            task_id=         t["task_id"],
            branch=          t["branch"],
            title=           t["title"],
            description=     t.get("description"),
            timeline=        t.get("timeline"),
            priority=        t.get("priority"),
            assigned_to=     t.get("assigned_to"),
            assignee_role=   t.get("assignee_role"),
            assigned_member_id= t.get("assigned_member_id"),
            estimated_hours= t.get("estimated_hours"),
            complexity=      t.get("complexity"),
            cost_impact=     t.get("cost_impact"),
            db_id=           all_task_db_ids.get(t["task_id"]),  # real DB uuid
            status=          t.get("status", "Ready"),
            blocked_by=      t.get("blocked_by", []),
            unblocks=        t.get("unblocks", []),
        )
        for t in final_state["synced_tasks"]
    ]

    # ── Safe coercions ── LLM can return tech_required as "true"/"false" string
    def _bool(val) -> bool:
        if isinstance(val, bool): return val
        if isinstance(val, int):  return bool(val)
        if isinstance(val, str):  return val.strip().lower() in ("true", "1", "yes")
        return False

    def _strlist(val) -> list:
        if isinstance(val, list): return [str(v) for v in val if v is not None]
        return []

    pipeline_state = RoadmapPipelineState(
        session_id=      session_id,
        status=          "success",
        startup_name=    startup_data.startup_name,
        profiler_output= ProfilerOutput(
            business_type=        str(profiler_output.get("business_type") or "Unknown"),
            tech_required=        _bool(profiler_output.get("tech_required")),
            prioritized_branches= _strlist(approved_branches),
            banned_branches=      _strlist(profiler_output.get("banned_branches")),
            reasoning=            str(profiler_output.get("reasoning") or ""),
        ),
        branch_roadmaps= branch_roadmaps,
        synced_tasks=    synced_tasks,
    )

    print(f"\n{'='*60}\n[Roadmap] COMPLETE — {len(branch_roadmaps)} branches | {len(synced_tasks)} tasks\n{'='*60}\n")
    return pipeline_state
