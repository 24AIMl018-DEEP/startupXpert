import asyncio
from schema.extracted_schema import NormalizedStartupData
from schema.query_schema import MasterQueryOutput
from agent.query.base_query_agent import BaseQueryAgent

class QueryOrchestrator:
    def __init__(self):
        # Initialize independent agents with specific model tiers
        self.market_agent = BaseQueryAgent("Market", priority_tier="mid")
        self.competitor_agent = BaseQueryAgent("Competitor", priority_tier="mid")
        self.customer_agent = BaseQueryAgent("Customer", priority_tier="mid")
        
        # Using High-Tier models for the complex stuff
        self.business_agent = BaseQueryAgent("Business", priority_tier="high")
        self.regulatory_agent = BaseQueryAgent("Regulatory", priority_tier="high")
        self.founder_agent = BaseQueryAgent("Founder", priority_tier="mid")
        self.tech_agent = BaseQueryAgent("Technology", priority_tier="high")

    def _build_context(self, data: NormalizedStartupData) -> str:
        """Helper to inject startup data into prompts."""
        return f"""
        Startup: {data.startup_name} | Domain: {data.domain} | Market: {data.target_market}
        Problem: {data.core_problem}
        Solution Features: {', '.join(data.nlp_extracted_keywords.extracted_core_features)}
        """

    async def generate_all_queries(self, data: NormalizedStartupData) -> MasterQueryOutput:
        context = self._build_context(data)
        
        # Define independent prompts for each agent
        # Define independent prompts for each agent (Added strict string array instructions)
        output_format_instruction = "Output strictly as JSON: {'queries': ['string1', 'string2', 'string3']}. Do NOT put objects or dictionaries inside the array."
        
        prompts = {
            "market": f"You are a Market Researcher. Context: {context}. Generate 3 Google search queries to validate market size and demand. {output_format_instruction}",
            
            "competitor": f"You are a Competitor Analyst. Context: {context}. Competitors: {', '.join(data.competitors_list)}. Generate 3 search queries to find competitor reviews and flaws. {output_format_instruction}",
            
            "customer": f"You are a UX/Customer Validator. Context: {context}. Generate 3 queries to find Reddit/Quora complaints about the problem statement. {output_format_instruction}",
            
            "business": f"You are a Financial Analyst. Context: {context}. Revenue: {', '.join(data.revenue_streams)}. Generate 3 queries to validate pricing models in this sector. {output_format_instruction}",
            
            "regulatory": f"You are a Legal Advisor. Context: {context}. Location: {data.location}. Generate 3 queries to find specific legal compliances and risks for this domain. {output_format_instruction}",
            
            "founder": f"You are a VC. Context: {context}. Founder Skills: {', '.join(data.founder_profile['skills'])}. Generate 2 queries to check required credentials for this domain. {output_format_instruction}",
            
            "tech": f"You are a CTO. Context: {context}. Tech: {data.tech_stack_summary}. Generate 3 queries to check the feasibility and limitations of this tech stack. {output_format_instruction}"
        }
        # FIRE ALL AGENTS CONCURRENTLY (Massive speed boost)
        results = await asyncio.gather(
            self.market_agent.generate(prompts["market"]),
            self.competitor_agent.generate(prompts["competitor"]),
            self.customer_agent.generate(prompts["customer"]),
            self.business_agent.generate(prompts["business"]),
            self.regulatory_agent.generate(prompts["regulatory"]),
            self.founder_agent.generate(prompts["founder"]),
            self.tech_agent.generate(prompts["tech"])
        )

        # Map results back to the master schema
        return MasterQueryOutput(
            market_research=results[0],
            competitor_research=results[1],
            customer_validation=results[2],
            business_model=results[3],
            regulatory_risk=results[4],
            founder_feasibility=results[5],
            technology_research=results[6]
        )

query_orchestrator = QueryOrchestrator()