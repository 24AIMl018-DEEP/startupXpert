from typing import Dict
from agents.query_agents.base_agent import BaseQueryAgent
from schema.prompts.query_prompts import CustomerQueryPrompt


class CustomerAgent(BaseQueryAgent):
    name = "customer"
    platforms = ["ddg", "quora", "hackernews"]
    query_count = 4

    def _build_prompt(self, pitch: str, startup_data: Dict) -> str:
        return CustomerQueryPrompt.TEMPLATE.format(
            count=self.query_count,
            problem_statement=startup_data.get("problem_statement", ""),
            target_audience=startup_data.get("target_audience", ""),
            geographic_market=startup_data.get("geographic_market", ""),
            existing_competitors=startup_data.get("existing_competitors", ""),
            customer_acquisition_strategy=startup_data.get("customer_acquisition_strategy", ""),
        )

customer_agent = CustomerAgent()
