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
- task description: exactly 2 sentences — what to do + measurable outcome
- timeline: realistic e.g. "Week 1-2", "Month 1", "Month 2-3"
- priority: High / Medium / Low
- milestone: true only for the LAST task of each phase (phase completion checkpoint)

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
          "description": "<2 sentences: action + outcome>",
          "timeline": "<Week X or Month X>",
          "priority": "<High|Medium|Low>",
          "milestone": <true|false>
        }}
      ]
    }}
  ]
}}
"""
