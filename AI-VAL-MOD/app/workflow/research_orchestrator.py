import asyncio
from schema.extracted_schema import NormalizedStartupData
from agent.query.query_orchestrator import query_orchestrator
from agent.research.domains.market_agent import market_research_agent
from agent.research.domains.competitor_agent import competitor_research_agent
from agent.research.domains.customer_agent import customer_research_agent
from agent.research.domains.business_agent import business_research_agent
from agent.research.domains.regulatory_agent import regulatory_research_agent
from agent.research.domains.founder_agent import founder_research_agent
from agent.research.domains.tech_agent import technology_research_agent
from services.nlp.unified_vector_store import vector_store


class ResearchOrchestrator:
    async def run_full_research_cycle(self, startup_data: NormalizedStartupData) -> dict:
        print("[Workflow] Starting Research Phase...")
        vector_store.reset()  # fresh collection per validation run

        # Step 1: Orchestrator generates all 7 query sets
        print("[Workflow] Generating queries for all 7 agents...")
        generated_queries = await query_orchestrator.generate_all_queries(startup_data)

        # Step 2: Map each domain agent to its query set
        agent_query_map = [
            (market_research_agent,       generated_queries.market_research),
            (competitor_research_agent,   generated_queries.competitor_research),
            (customer_research_agent,     generated_queries.customer_validation),
            (business_research_agent,     generated_queries.business_model),
            (regulatory_research_agent,   generated_queries.regulatory_risk),
            (founder_research_agent,      generated_queries.founder_feasibility),
            (technology_research_agent,   generated_queries.technology_research),
        ]

        # Step 3: Fire all 7 agents concurrently — each autonomously picks platforms & depth
        print("[Workflow] Dispatching 7 autonomous research agents...")
        results = await asyncio.gather(
            *[agent.research(queries) for agent, queries in agent_query_map],
            return_exceptions=True
        )

        # Step 4: Flatten + error filter
        final_documents = []
        for batch in results:
            if isinstance(batch, Exception):
                print(f"[Workflow] Agent batch failed: {batch}")
                continue
            final_documents.extend(batch)

        # Step 5: Store all collected documents into vector space
        if final_documents:
            print(f"[Workflow] Storing {len(final_documents)} documents into Vector Store...")
            vector_store.add_documents(final_documents)
        else:
            print("[Workflow] WARNING: No documents retrieved during research phase.")

        return {
            "status": "completed",
            "total_documents_indexed": len(final_documents),
            "agents_executed": len(agent_query_map),
        }


research_orchestrator = ResearchOrchestrator()
