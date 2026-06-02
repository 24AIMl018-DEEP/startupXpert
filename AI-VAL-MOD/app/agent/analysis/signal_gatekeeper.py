import json
from groq import AsyncGroq
from core.config import settings
from schema.analysis_schema import ValidatedSignal
from services.nlp.unified_vector_store import vector_store

class SignalGatekeeperAgent:
    def __init__(self):
        self.client = AsyncGroq(api_key=settings.GROQ_API_KEY)
        self.model = "llama-3.1-8b-instant"

    async def extract_valid_signals(self, agent_domain: str, startup_name: str, core_problem: str) -> ValidatedSignal:
        """
        Retrieves raw documents from the Vector Store for a specific domain, 
        and filters out the noise to extract only hard, validated signals.
        """
        # 1. Retrieve the top 5 most relevant scraped documents from our locker
        # We construct a generic query based on the domain to pull the best data
        retrieval_query = f"{startup_name} {agent_domain} {core_problem}"
        raw_docs = vector_store.retrieve(query=retrieval_query, agent_filter=agent_domain, top_k=5)
        
        if not raw_docs:
            print(f"[Gatekeeper] No raw data found in locker for {agent_domain}.")
            return ValidatedSignal(domain=agent_domain, verified_facts=[], red_flags=[], data_quality_score=1)

        # 2. Combine the raw text for the LLM
        combined_noise = "\n\n".join([f"Source ({doc.get('source', '')}): {doc['content']}" for doc in raw_docs])

        # 3. Prompt the LLM to act as a ruthless filter
        prompt = f"""
        You are an elite Data Gatekeeper for a Venture Capital firm.
        Your job is to read raw, noisy web scraping data and extract ONLY the hard, validated signals 
        relevant to the '{agent_domain}' domain for a startup named '{startup_name}'.

        RAW NOISY DATA:
        {combined_noise}

        RULES:
        1. Ignore marketing fluff, opinions, and generic statements.
        2. Extract concrete facts (numbers, named competitors, specific tech stacks, actual user complaints).
        3. Identify any obvious red flags (legal issues, market saturation, extreme negative reviews).
        4. Score the quality/usefulness of this raw data from 1 to 10.

        Output strictly as JSON matching this format:
        {{
            "domain": "{agent_domain}",
            "verified_facts": ["fact 1", "fact 2"],
            "red_flags": ["flag 1"],
            "data_quality_score": 8
        }}
        """

        try:
            response = await self.client.chat.completions.create(
                messages=[{"role": "user", "content": prompt}],
                model=self.model,
                response_format={"type": "json_object"},
                temperature=0.1 # Very low temperature for maximum factual extraction
            )
            
            raw_json = json.loads(response.choices[0].message.content)
            return ValidatedSignal(**raw_json)
            
        except Exception as e:
            print(f"[Gatekeeper] Failed to filter signals for {agent_domain}: {e}")
            return ValidatedSignal(domain=agent_domain, verified_facts=[], red_flags=[f"Extraction Error: {e}"], data_quality_score=1)

signal_gatekeeper = SignalGatekeeperAgent()