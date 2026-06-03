import asyncio
from schema.extracted_schema import NormalizedStartupData
from agent.analysis.signal_gatekeeper import signal_gatekeeper

from agent.analysis.market_agent import market_agent
from agent.analysis.competition_agent import competition_agent
from agent.analysis.risk_agent import risk_agent
from agent.analysis.feasibility_agent import feasibility_agent
from agent.analysis.innovation_agent import innovation_agent

# NAYA IMPORT YAHAN
from agent.analysis.recommendation_agent import recommendation_agent

class AnalysisOrchestrator:
    async def run_full_analysis(self, startup_data: NormalizedStartupData) -> dict:
        print("[Workflow] Starting Deep Analysis Phase...")
        
        domains_to_analyze = {
            "Market": market_agent,
            "Competitor": competition_agent,
            "Regulatory": risk_agent,
            "Technology": feasibility_agent,
            "Customer": innovation_agent 
        }

        final_reports = {}

        async def process_domain(vector_domain: str, agent_instance):
            clean_signals = await signal_gatekeeper.extract_valid_signals(
                agent_domain=vector_domain,
                startup=startup_data
            )
            report = await agent_instance.analyze(startup_data, clean_signals)
            return vector_domain, report.dict()

        # Run the 5 specialized agents concurrently
        tasks = [process_domain(dom, agt) for dom, agt in domains_to_analyze.items()]
        results = await asyncio.gather(*tasks)
        
        for dom, report in results:
            final_reports[dom] = report

        print("[Workflow] 5 Domains Analyzed. Generating Final Recommendation...")
        
        # FINAL STEP: Saari 5 reports Recommendation Agent ko do
        final_verdict = await recommendation_agent.generate_final_verdict(
            startup_name=startup_data.startup_name,
            all_domain_reports=final_reports
        )

        print("[Workflow] Entire Analysis Pipeline Complete!")
        
        return {
            "domain_reports": final_reports,
            "final_verdict": final_verdict.dict()
        }

analysis_orchestrator = AnalysisOrchestrator()
