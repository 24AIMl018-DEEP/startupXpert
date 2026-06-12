RESOURCE_PROMPT = """\
Assign each task to the best-fit team member. Be direct, no explanations.

TEAM ROLES AVAILABLE:
{team_json}

BUSINESS TYPE: {business_type}

TASKS:
{tasks_json}

RULES:
- Match required skills to the best-fit role from the available list.
- If no team role fits (legal, accounting, design, etc.) → assigned_role="External / Outsource"
- estimated_hours: realistic integer (e.g. milestone tasks = 2-4h, implementation tasks = 8-20h)
- complexity: Low / Medium / High
- cost_impact: None / Low / Medium / High
- INTERN GUIDANCE: If you assign a task to someone whose role contains the word "Intern", you MUST provide step-by-step instructions in the `intern_guidance` field. Otherwise, leave it null.

OUTPUT: strict JSON array only, no extra text.
[
  {{
    "task_id": "<same id from input>",
    "assigned_role": "<best-fit role from the available list or 'External / Outsource'>",
    "estimated_hours": <int>,
    "complexity": "<Low|Medium|High>",
    "cost_impact": "<None|Low|Medium|High>",
    "intern_guidance": "<step-by-step guidance paragraph or null>"
  }}
]
"""
