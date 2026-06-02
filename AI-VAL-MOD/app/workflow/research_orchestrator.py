import asyncio
from schema.extracted_schema import NormalizedStartupData
from agent.query.query_orchestrator import query_orchestrator
from services.search.search_router import search_router
from services.nlp.unified_vector_store import vector_store

class ResearchOrchestrator:
    async def run_full_research_cycle(self, startup_data: NormalizedStartupData) -> dict:
        """
        Executes the entire research phase: Query Generation -> Web Scraping -> Vector Storage.
        """
        print("[Workflow] Starting Research Phase...")

        # Step 1: Generate all targeted queries using LLMs
        print("[Workflow] Generating queries for all 7 agents...")
        generated_queries = await query_orchestrator.generate_all_queries(startup_data)

        # Step 2: Map the generated queries to their respective agents
        agent_query_map = {
            "Market": generated_queries.market_research,
            "Competitor": generated_queries.competitor_research,
            "Customer": generated_queries.customer_validation,
            "Business": generated_queries.business_model,
            "Regulatory": generated_queries.regulatory_risk,
            "Founder": generated_queries.founder_feasibility,
            "Technology": generated_queries.technology_research
        }

        # Step 3: Dispatch all searches concurrently through the Multi-Platform Router
        print("[Workflow] Dispatching concurrent searches across GitHub, HN, and DDG...")
        search_tasks = []
        for agent_name, queries in agent_query_map.items():
            if queries: # Only search if queries were successfully generated
                search_tasks.append(search_router.execute_smart_search(agent_name, queries))
        
        # Execute all network calls at exactly the same time (Massive speed boost)
        all_search_results = await asyncio.gather(*search_tasks, return_exceptions=True)

        # Step 4: Flatten the results and filter out errors
        final_documents = []
        for batch in all_search_results:
            if isinstance(batch, Exception):
                print(f"[Workflow] Search batch failed: {batch}")
                continue
            final_documents.extend(batch)

        # Step 5: Store everything into the Unified Vector Locker
        if final_documents:
            print(f"[Workflow] Storing {len(final_documents)} documents into Vector Store...")
            vector_store.add_documents(final_documents)
        else:
            print("[Workflow] WARNING: No documents were retrieved during the search phase.")

        return {
            "status": "completed",
            "total_documents_indexed": len(final_documents),
            "agents_executed": len(agent_query_map)
        }

# Instantiate the singleton workflow controller
research_orchestrator = ResearchOrchestrator()