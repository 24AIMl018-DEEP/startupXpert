RESOURCE_PROMPT = """\
Assign each task to the best-fit team member. Be direct, no explanations.

TEAM:
{team_json}

BUSINESS TYPE: {business_type}

TASKS:
{tasks_json}

RULES:
- Match skills to task requirements.
- If no team member fits (legal, accounting, design, etc.) → assigned_to="External / Outsource", assignee_role="Professional"
- Distribute workload fairly — do not assign everything to one person.
- estimated_hours: realistic integer (e.g. milestone tasks = 2-4h, implementation tasks = 8-20h)
- complexity: Low / Medium / High
- cost_impact: None / Low / Medium / High

OUTPUT: strict JSON array only, no extra text.
[
  {{
    "task_id": "<same id from input>",
    "assigned_to": "<team member name or 'External / Outsource'>",
    "assignee_role": "<their role>",
    "estimated_hours": <int>,
    "complexity": "<Low|Medium|High>",
    "cost_impact": "<None|Low|Medium|High>"
  }}
]
"""
