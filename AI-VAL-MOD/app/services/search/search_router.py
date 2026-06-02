import asyncio
from typing import List
from schema.document_schema import SearchDocument
from services.search.hn_service import hn_service
from services.search.github_service import github_service
from services.search.ddg_service import ddg_service

class SearchRouter:
    async def execute_smart_search(self, agent_name: str, queries: List[str]) -> List[SearchDocument]:
        """
        Routes queries to the most relevant platforms based on the Agent Type.
        Executes all network calls concurrently for maximum speed.
        """
        all_tasks = []

        for query in queries:
            if agent_name == "Technology":
                # Tech goes to GitHub + HackerNews
                all_tasks.append(github_service.search(query, agent_name))
                all_tasks.append(hn_service.search(query, agent_name))
                
            elif agent_name == "Customer":
                # Customer goes to HN + Reddit (via DDG)
                all_tasks.append(hn_service.search(query, agent_name))
                all_tasks.append(ddg_service.search(f"{query} site:reddit.com", agent_name))
                
            else:
                # Market, Business, Regulatory, Founder default to General Web (DDG)
                # But we can also ping HN just in case there's startup news
                all_tasks.append(ddg_service.search(query, agent_name))
                if agent_name in ["Business", "Market"]:
                    all_tasks.append(hn_service.search(query, agent_name))

        # Execute everything at exactly the same time
        nested_results = await asyncio.gather(*all_tasks)
        
        # Flatten the list of lists
        final_documents = []
        for batch in nested_results:
            final_documents.extend(batch)
            
        return final_documents

search_router = SearchRouter()