import json
from typing import Dict, List

from shared.core.base_agent import BaseAgent
from schema.prompts.resource_prompt import RESOURCE_PROMPT


class ResourceAgent(BaseAgent):
    name        = "resource_allocator"
    temperature = 0.1

    def run(self, tasks: List[Dict], team_members: List[Dict], business_type: str) -> List[Dict]:
        print(f"[{self.name}] START — {len(tasks)} tasks, {len(team_members)} members")

        # Process in batches of 10 to stay within token limits
        BATCH_SIZE = 10
        all_enrichments: List[Dict] = []

        for i in range(0, len(tasks), BATCH_SIZE):
            batch = tasks[i:i + BATCH_SIZE]
            prompt = RESOURCE_PROMPT.format(
                team_json=json.dumps(team_members, indent=2),
                business_type=business_type,
                tasks_json=json.dumps(
                    [{"task_id": t["task_id"], "title": t["title"],
                      "description": (t.get("description") or "")[:200]}  # cap description length
                     for t in batch],
                    indent=2,
                ),
            )
            raw = self._call_llm(prompt)

            try:
                enrichments = self._parse_json(raw, array=True)
            except ValueError:
                print(f"[{self.name}] JSON parse failed on batch {i//BATCH_SIZE + 1} — skipping batch")
                continue

            # Guard: must be a list of dicts with task_id keys
            if isinstance(enrichments, dict):
                enrichments = next((v for v in enrichments.values() if isinstance(v, list)), [])
            if not enrichments or not isinstance(enrichments[0], dict):
                print(f"[{self.name}] Unexpected format on batch {i//BATCH_SIZE + 1} — skipping")
                continue

            all_enrichments.extend(enrichments)

        enrich_map = {}
        for e in all_enrichments:
            if isinstance(e, dict) and "task_id" in e:
                enrich_map[e["task_id"]] = e
        for task in tasks:
            e = enrich_map.get(task["task_id"], {})
            task["assigned_to"]     = e.get("assigned_to")
            task["assignee_role"]   = e.get("assignee_role")
            task["estimated_hours"] = e.get("estimated_hours")
            task["complexity"]      = e.get("complexity")
            task["cost_impact"]     = e.get("cost_impact")

        workload: Dict[str, int] = {}
        for task in tasks:
            p = task.get("assigned_to") or "Unassigned"
            workload[p] = workload.get(p, 0) + 1
        print(f"[{self.name}] DONE — workload: {workload}")
        return tasks


resource_agent = ResourceAgent()
