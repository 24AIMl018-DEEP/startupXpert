"""
Query Generation Service  (v2 — Internet-native language)
──────────────────────────────────────────────────────────
Fix: Old prompt generated corporate/SEO language.
     "terrible matchmaking experiences for young gamers" ← sounds like SEO spam.

Real users write:
  "free fire random teammates are trash"
  "why ff matchmaking so bad"
  "hackers ruined ranked again"
  "toxic squad keep reporting me"

The key: generate queries the WAY REAL USERS ACTUALLY TYPE.
  - Short, casual, frustrated
  - Use slang, abbreviations, platform-native language
  - Mix Reddit-style, Twitter-style, app review-style
  - No tutorials, no "how to", no corporate language
"""

import json
from services.llm_service import ask_llm


class QueryGenerationService:

    def run(self, structured_problem: dict, user_input: dict = None, genre: str = "") -> dict:
        sp    = structured_problem
        ui    = user_input or {}
        genre = genre or "general"

        problem_desc = ui.get("problem", sp.get("core_problem", ""))
        target_users = ui.get("target_users", sp.get("target_users", "users"))
        current_sol  = ui.get("current_solutions", "unknown")
        why_bad      = ui.get("why_bad", "unknown")
        main_pain    = sp.get("main_pain", "")
        environment  = sp.get("environment", "")

        prompt = f"""You are simulating how real frustrated users ACTUALLY type on the internet.

Startup Context:
- Problem domain: {genre}
- Core problem: {sp.get('core_problem', problem_desc)}
- Main pain: {main_pain}
- Target users: {target_users}
- Environment: {environment}
- Current solutions people use: {current_sol}
- Why those solutions fail: {why_bad}

Generate 3 types of search queries — written EXACTLY how real users type when venting online.

STYLE RULES (CRITICAL):
- Write like Reddit posts, app store reviews, Twitter rants, Discord messages
- Use casual speech: contractions, slang, abbreviations users actually use
- Short and punchy — real searches are 3-8 words max
- Include domain-specific vocabulary (game names, app names, platform names)
- NO corporate language, NO "experiencing difficulties", NO tutorial language
- Mix in: platform names (reddit, steam, discord), emotion words (trash, broken, garbage, hate)
- Think: what would a frustrated user type at 2am

EXAMPLE (for gaming toxicity — use this as style reference only):
{{
  "problem_queries": [
    "ff random teammates garbage again",
    "why is valorant matchmaking so broken",
    "hackers in ranked csgo ruined my game",
    "toxic squad reporting system useless",
    "smurfs destroying bronze lobbies reddit"
  ],
  "behavior_queries": [
    "playing with friends only avoid randoms",
    "always muting teammates now",
    "leaving ranked games because of toxics",
    "creating new account to avoid bad players",
    "only solo queue late night less toxicity"
  ],
  "spending_queries": [
    "bought premium rank protection still got bad teammates",
    "wasted money on game ruined by hackers",
    "paid for matchmaking boost not worth it",
    "subscription to avoid toxic lobbies worth it"
  ]
}}

Now generate for the ACTUAL problem above. Only output JSON. No explanation.

{{
  "problem_queries": [<6 short real-user complaint/rant style queries>],
  "behavior_queries": [<6 short real-user workaround/habit style queries>],
  "spending_queries": [<6 short real-user spending/value style queries>]
}}"""

        for attempt in range(3):
            try:
                raw   = ask_llm(prompt, max_tokens=600)
                start = raw.find("{")
                end   = raw.rfind("}") + 1
                if start != -1 and end > 0:
                    result = json.loads(raw[start:end])
                    pq = result.get("problem_queries",  [])[:6]
                    bq = result.get("behavior_queries", [])[:6]
                    sq = result.get("spending_queries", [])[:6]
                    # Validate: reject if queries are too long (corporate style)
                    pq = [q for q in pq if isinstance(q, str) and 3 <= len(q.split()) <= 12]
                    bq = [q for q in bq if isinstance(q, str) and 3 <= len(q.split()) <= 12]
                    sq = [q for q in sq if isinstance(q, str) and 3 <= len(q.split()) <= 12]
                    if pq and bq and sq:
                        return {
                            "problem_queries":  pq,
                            "behavior_queries": bq,
                            "spending_queries": sq
                        }
            except Exception:
                continue

        # Fallback: domain-aware short queries from structured problem
        core  = sp.get("core_problem", "")[:30]
        users = sp.get("target_users", "users")[:20]
        pain  = sp.get("main_pain", "")[:25]
        return {
            "problem_queries": [
                f"{core} so frustrating",
                f"hate dealing with {core}",
                f"{core} broken reddit",
                f"why is {core} so bad",
                f"{users} complaining {core}",
                f"{pain} reddit"
            ],
            "behavior_queries": [
                f"workaround for {core}",
                f"alternative to {core}",
                f"how to avoid {core}",
                f"{users} dealing with {core}",
                f"switching from {core}",
                f"stopped using {core} reddit"
            ],
            "spending_queries": [
                f"paid to fix {core}",
                f"worth buying solution for {core}",
                f"{core} subscription cost",
                f"spent money on {core} not worth",
                f"budget for {core} alternatives",
                f"free vs paid {core}"
            ]
        }
