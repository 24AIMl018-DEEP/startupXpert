class MarketQueryPrompt:
    TEMPLATE = """You are a Market Research Agent. Generate {count} precise search queries to validate real market demand, size, and growth signals.

Startup: {startup_name}
Domain: {startup_domain}
Problem: {problem_statement}
Target Audience: {target_audience}
Geographic Market: {geographic_market}
Revenue Model: {revenue_model}

Query angles to cover:
- Market size and growth rate for this domain in {geographic_market}
- Paying demand from {target_audience} for solving {problem_statement}
- Industry reports, surveys, or statistics on this domain
- Investors or funds actively backing this type of startup
- Government or regulatory tailwinds in {geographic_market}

Return ONLY this JSON, no markdown, no explanation:
{{"queries": ["query1", "query2", ...]}}"""


class CompetitorQueryPrompt:
    TEMPLATE = """You are a Competitor Intelligence Agent. Generate {count} surgical search queries to expose competitor weaknesses, gaps, and switching signals.

Startup: {startup_name}
Domain: {startup_domain}
Solution: {startup_description}
Known Competitors: {existing_competitors}
Target Audience: {target_audience}
Pricing: {estimated_pricing}

Query angles to cover:
- Why users leave or complain about {existing_competitors}
- Pricing complaints or value gaps of {existing_competitors}
- Feature gaps users request from existing tools in {startup_domain}
- Startups that failed in {startup_domain} and why
- Direct comparison queries between known competitors

Return ONLY this JSON, no markdown, no explanation:
{{"queries": ["query1", "query2", ...]}}"""


class FounderQueryPrompt:
    TEMPLATE = """You are a Founder Credibility Agent. Generate {count} search queries to validate if this founder profile is credible for building in this domain.

Domain: {startup_domain}
Founder Skills: {founder_skillset}
Industry Experience: {industry_experience}
Founder Count: {founder_count}
Profession: {profession}

Query angles to cover:
- Skills required to build and scale a {startup_domain} startup
- Common founder mistakes in {startup_domain} due to skill gaps
- Success patterns of founders with {industry_experience} in {startup_domain}
- Technical or business background needed for {startup_domain}
- Team size and composition benchmarks for early-stage {startup_domain} startups

Return ONLY this JSON, no markdown, no explanation:
{{"queries": ["query1", "query2", ...]}}"""


class CustomerQueryPrompt:
    TEMPLATE = """You are a Customer Validation Agent. Generate {count} search queries to find raw, unfiltered evidence that real customers urgently need this problem solved.

Problem: {problem_statement}
Target Audience: {target_audience}
Geographic Market: {geographic_market}
Existing Competitors: {existing_competitors}
Acquisition Strategy: {customer_acquisition_strategy}

Query angles to cover:
- Real complaints and frustrations of {target_audience} about {problem_statement}
- Forum and community discussions (Reddit, Quora) where {target_audience} seeks help
- Workarounds {target_audience} currently use instead of a proper solution
- Willingness to pay signals from {target_audience} for this type of solution
- How {target_audience} discovers and adopts tools in {geographic_market}

Return ONLY this JSON, no markdown, no explanation:
{{"queries": ["query1", "query2", ...]}}"""


class TrendQueryPrompt:
    TEMPLATE = """You are a Market Trends Agent. Generate {count} search queries to identify macro trends, regulatory shifts, and VC activity that make this startup timely.

Domain: {startup_domain}
Geographic Market: {geographic_market}
Solution: {startup_description}
Target Audience: {target_audience}
Scalability Goal: {scalability_goal}

Query angles to cover:
- Emerging trends in {startup_domain} in {geographic_market} in the last 2 years
- VC funding and investment trends in {startup_domain}
- New regulations or policies in {geographic_market} affecting {startup_domain}
- Technology shifts enabling this type of solution now
- Growth signals or adoption rates in the {startup_domain} sector

Return ONLY this JSON, no markdown, no explanation:
{{"queries": ["query1", "query2", ...]}}"""


class ProblemQueryPrompt:
    TEMPLATE = """You are a Problem Validation Agent. Generate {count} search queries to prove this problem is real, urgent, and currently unsolved at scale.

Problem: {problem_statement}
Target Audience: {target_audience}
Geographic Market: {geographic_market}
Existing Competitors: {existing_competitors}
Revenue Model: {revenue_model}

Query angles to cover:
- Statistical evidence that {target_audience} faces {problem_statement}
- Financial or productivity cost of this problem being unsolved
- Why existing solutions like {existing_competitors} fail to fully solve it
- Volume of people searching for solutions to this problem
- Niche or underserved segments within {target_audience} suffering most

Return ONLY this JSON, no markdown, no explanation:
{{"queries": ["query1", "query2", ...]}}"""


class TechnologyQueryPrompt:
    TEMPLATE = """You are a Technology Feasibility Agent. Generate {count} search queries to validate if this tech stack can realistically deliver the solution within the stated timeline.

Platform: {platform_type}
Tech Complexity: {technology_complexity}
Domain: {startup_domain}
MVP Timeline: {mvp_timeline}
Scalability Goal: {scalability_goal}
Solution: {startup_description}

Query angles to cover:
- Open source tools, frameworks, or APIs to build {platform_type} for {startup_domain}
- Known scaling bottlenecks of {platform_type} at {scalability_goal} level
- Realistic MVP build time for {technology_complexity} complexity in {startup_domain}
- Security or compliance requirements for {startup_domain} platforms
- Technical failures or lessons from similar {startup_domain} platforms

Return ONLY this JSON, no markdown, no explanation:
{{"queries": ["query1", "query2", ...]}}"""
