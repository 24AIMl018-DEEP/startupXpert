from services.llm.router import get_llm_response
from schema.analysis_schema import ValidatedSignal
from schema.extracted_schema import NormalizedStartupData
from services.nlp.unified_vector_store import vector_store


def _to_str(val) -> str:
    if isinstance(val, str):
        return val
    if isinstance(val, dict):
        for key in ("signal", "fact", "finding", "text", "content", "description", "source"):
            if key in val:
                return str(val[key])
        return " | ".join(f"{k}: {v}" for k, v in val.items())
    return str(val)


def build_domain_queries(startup: NormalizedStartupData) -> dict:
    """
    Builds cosine retrieval queries dynamically from actual startup data.
    Fixed bug: static hardcoded queries never matched docs for different startups.
    """
    domain      = startup.domain
    market      = startup.target_market
    location    = startup.location
    problem     = startup.core_problem[:120]
    competitors = ", ".join(startup.competitors_list[:3])
    revenue     = ", ".join(startup.revenue_streams[:2])
    tech        = startup.tech_stack_summary[:120]
    skills      = ", ".join(startup.founder_profile.get("skills", [])[:3])

    return {
        "Market":     f"{domain} market size demand growth {market}",
        "Competitor": f"{competitors} competitor review pricing complaints {domain}",
        "Customer":   f"{problem} user complaints access {market}",
        "Business":   f"{revenue} pricing revenue model {domain} {location}",
        "Regulatory": f"{domain} regulations compliance {location} data protection",
        "Founder":    f"{skills} founder experience {domain} startup {location}",
        "Technology": f"{tech} scalability feasibility {domain}",
    }


class SignalGatekeeperAgent:
    async def extract_valid_signals(self, agent_domain: str, startup: NormalizedStartupData) -> ValidatedSignal:
        domain_queries = build_domain_queries(startup)
        focused_query  = domain_queries.get(
            agent_domain,
            f"{startup.startup_name} {agent_domain} {startup.core_problem}"
        )
        raw_docs = vector_store.retrieve(query=focused_query, agent_filter=agent_domain, top_k=5)

        if not raw_docs:
            print(f"[Gatekeeper] No raw data found for {agent_domain}.")
            return ValidatedSignal(domain=agent_domain, verified_facts=[], red_flags=[], data_quality_score=1)

        combined_noise = "\n\n".join([
            f"Source ({doc.get('source', '')}): {doc['content'][:400]}"
            for doc in raw_docs
        ])

        prompt = f"""You are a Data Gatekeeper for a VC firm.
Extract ONLY hard validated signals for '{agent_domain}' domain for startup '{startup.startup_name}'.
RAW DATA:
{combined_noise}
Return ONLY JSON: {{"domain": "{agent_domain}", "verified_facts": [], "red_flags": [], "data_quality_score": 5}}"""

        try:
            data = await get_llm_response(prompt, tier="low", temperature=0.1)
            data["verified_facts"] = [_to_str(x) for x in data.get("verified_facts", [])]
            data["red_flags"]      = [_to_str(x) for x in data.get("red_flags", [])]
            return ValidatedSignal(**data)
        except Exception as e:
            print(f"[Gatekeeper] Failed for {agent_domain}: {e}")
            return ValidatedSignal(domain=agent_domain, verified_facts=[], red_flags=[str(e)], data_quality_score=1)


signal_gatekeeper = SignalGatekeeperAgent()
