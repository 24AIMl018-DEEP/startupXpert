import json
from typing import Dict, List

from shared.core.base_agent import BaseAgent
from schema.prompts.sync_prompt import SYNC_PROMPT


class SyncAgent(BaseAgent):
    name        = "dependency_sync"
    temperature = 0.1

    def run(self, tasks: List[Dict], business_type: str) -> List[Dict]:
        print(f"[{self.name}] START — {len(tasks)} tasks")

        prompt = SYNC_PROMPT.format(
            business_type=business_type,
            tasks_json=json.dumps(
                [{"task_id": t["task_id"], "branch": t["branch"], "title": t["title"]} for t in tasks],
                indent=2,
            ),
        )
        raw = self._call_llm(prompt)

        try:
            sync_results = self._parse_json(raw, array=True)
        except ValueError:
            print(f"[{self.name}] JSON parse failed — defaulting all tasks to Ready")
            for task in tasks:
                task.setdefault("status",     "Ready")
                task.setdefault("blocked_by", [])
                task.setdefault("unblocks",   [])
            return tasks

        # Guard: _parse_json may return a dict if model wrapped the array
        if isinstance(sync_results, dict):
            sync_results = next((v for v in sync_results.values() if isinstance(v, list)), [])
        if not sync_results or not isinstance(sync_results[0], dict):
            print(f"[{self.name}] Unexpected sync_results format — defaulting all tasks to Ready")
            for task in tasks:
                task.setdefault("status",     "Ready")
                task.setdefault("blocked_by", [])
                task.setdefault("unblocks",   [])
            return tasks

        sync_map = {s["task_id"]: s for s in sync_results}
        for task in tasks:
            s = sync_map.get(task["task_id"], {})
            task["status"]     = s.get("status",     "Ready")
            task["blocked_by"] = s.get("blocked_by", [])
            task["unblocks"]   = s.get("unblocks",   [])

        blocked = sum(1 for t in tasks if t.get("status") == "Blocked")
        print(f"[{self.name}] DONE — {blocked}/{len(tasks)} blocked")
        return tasks


sync_agent = SyncAgent()
