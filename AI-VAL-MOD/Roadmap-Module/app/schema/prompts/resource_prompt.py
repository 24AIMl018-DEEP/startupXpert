RESOURCE_PROMPT = """\
You are a startup team & resource planning expert. Assign each task to the most suitable team member based on their skills.

TEAM MEMBERS:
{team_json}

BUSINESS TYPE: {business_type}

TASKS TO ASSIGN:
{tasks_json}

ASSIGNMENT RULES:
1. Match task requirements to team member skills — assign to the person whose skills best fit the task.
2. If NO team member has the required skill (e.g. legal, accounting, tax) → assigned_to = "External / Outsource", assignee_role = "Professional".
3. Distribute tasks fairly — do NOT overload one person with everything.
4. estimated_hours: realistic integer hours to complete this task.
5. complexity: "Low", "Medium", or "High".
6. cost_impact: "None", "Low", "Medium", "High" — does this task require spending money?

OUTPUT FORMAT (strict JSON array only, no explanation):
[
  {{
    "task_id": "<same task_id from input>",
    "assigned_to": "<team member name OR 'External / Outsource'>",
    "assignee_role": "<their role>",
    "estimated_hours": <integer>,
    "complexity": "<Low|Medium|High>",
    "cost_impact": "<None|Low|Medium|High>"
  }}
]
"""
