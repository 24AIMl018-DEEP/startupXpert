BRANCH_PROMPT = """\
You are a startup execution specialist for the "{branch}" area.

STARTUP DATA:
{startup_json}

BUSINESS PROFILE: {business_type} | Tech: {tech_required}

OUTLINE (expand this):
{branch_outline}

VALIDATION SIGNALS:
{validation_summary}

GENERATE a structured execution plan for "{branch}" with 2-3 phases.
Each phase is a milestone grouping. Each phase has 2-4 specific tasks.

RULES:
- summary: 1 sentence, specific to this startup.
- phase name: short label e.g. "Foundation", "Build", "Launch", "Scale"
- phase goal: 1 sentence — what does completing this phase achieve?
- task title: specific + actionable, no generic words
- NO SPOONFEEDING for the title: Output only high-level, critical tasks (e.g. 3-5 main objectives per phase). Do NOT output 1000 micro-tasks.
- task description (Problem Statement): Provide a HIGHLY DETAILED execution guide. Use the validation data to define the problem statement, strict rules, necessary systems, and exact expectations for the team member. Write at least 4-5 sentences formatting this as a deep context brief for the assignee.
- assigned_to: Look at the provided TEAM context. Assign this task to the best matching team member based on their role and skills. If no current team member fits the task, output "Need to Hire: [Role]".
- timeline: realistic e.g. "Week 1-2", "Month 1", "Month 2-3"
- priority: High / Medium / Low
- milestone: true only for the LAST task of each phase (phase completion checkpoint)

TEAM CONTEXT:
{team_members}

OUTPUT (strict JSON only, no text outside):
{{
  "branch": "{branch}",
  "summary": "<1 sentence>",
  "phases": [
    {{
      "phase": "<phase name>",
      "goal": "<1 sentence>",
      "tasks": [
        {{
          "title": "<actionable title>",
          "description": "<Detailed problem statement & execution rules (4-5 sentences)>",
          "assigned_to": "<Name of Team Member or 'Need to Hire: Role'>",
          "timeline": "<Week X or Month X>",
          "priority": "<High|Medium|Low>",
          "milestone": <true|false>
        }}
      ]
    }}
  ]
}}
"""
