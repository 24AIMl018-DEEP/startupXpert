from schema.startup_schema import StartupInputSchema
from schema.extracted_schema import NormalizedStartupData, NLPKeywords
from services.nlp.keyword_extractor import nlp_extractor

class ExtractionAgent:
    def __init__(self):
        """
        Extraction Agent doing deep data mining on the JSON payload.
        Strictly NO LLM. Pure Python logic & local NLP.
        """
        pass

    def _infer_business_type(self, audience: str) -> str:
        """Rule-based inference for B2B vs B2C."""
        audience_lower = audience.lower()
        has_b2b = any(word in audience_lower for word in ["clinics", "hospitals", "businesses", "enterprises", "companies"])
        has_b2c = any(word in audience_lower for word in ["patients", "users", "consumers", "individuals", "people"])
        
        if has_b2b and has_b2c:
            return "B2B2C / Marketplace"
        elif has_b2b:
            return "B2B"
        elif has_b2c:
            return "B2C"
        return "Unknown"

    def _extract_revenue_streams(self, revenue_text: str) -> list:
        """Splits revenue model string into distinct streams."""
        # Split by common conjunctions and commas
        import re
        streams = re.split(r',\s*|\s+and\s+', revenue_text.lower())
        return [stream.strip().title() for stream in streams if stream.strip()]

    def extract_and_normalize(self, raw_data: StartupInputSchema) -> NormalizedStartupData:
        # 1. Location & Competitors
        normalized_location = f"{raw_data.city}, {raw_data.country}"
        competitors = [comp.strip() for comp in raw_data.existingCompetitors.split(",") if comp.strip()]

        # 2. Deep Founder Insights
        founder_profile = {
            "name": raw_data.fullName,
            "profession": raw_data.profession,
            "experience_details": raw_data.industryExperience,
            "skills": raw_data.founderSkillset,
            "team_size": raw_data.founderCount,
            # Flag if experience mentions the domain (e.g. "Healthcare")
            "has_domain_experience": raw_data.startupDomain.lower() in raw_data.industryExperience.lower()
        }

        # 3. Deep Financial Insights
        financials = {
            "funding_inr": raw_data.availableFunding,
            "monthly_burn_inr": raw_data.monthlyBurnCapacity,
            "runway_months": round(raw_data.availableFunding / raw_data.monthlyBurnCapacity, 1) if raw_data.monthlyBurnCapacity > 0 else 0,
            "pricing": raw_data.estimatedPricing
        }

        tech_summary = f"Platforms: {', '.join(raw_data.platformType)} | Complexity: {raw_data.technologyComplexity} | MVP Timeline: {raw_data.mVPTimeline}"

        # 4. Deep Business & Market Insights
        business_type = self._infer_business_type(raw_data.targetAudience)
        revenue_streams = self._extract_revenue_streams(raw_data.revenueModel)

        # 5. NLP Extraction (Separated properly)
        problem_keys = nlp_extractor.extract_keywords(raw_data.problemStatement)
        strategy_keys = nlp_extractor.extract_keywords(raw_data.customerAcquisitionStrategy)
        
        # Extract solution entities, but also specifically try to isolate "features"
        solution_keys = nlp_extractor.extract_keywords(raw_data.startupDescription)
        # Using a subset of solution keys that might represent features based on length/composition
        core_features = [k for k in solution_keys if len(k.split()) >= 2] 

        nlp_keywords = NLPKeywords(
            problem_entities=problem_keys,
            solution_entities=solution_keys,
            strategy_entities=strategy_keys,
            extracted_core_features=core_features
        )

        # 6. Map to the Deep Normalized Schema
        return NormalizedStartupData(
            startup_name=raw_data.startupName,
            domain=raw_data.startupDomain,
            target_market=f"{raw_data.targetAudience} in {raw_data.geographicMarket}",
            location=normalized_location,
            founder_profile=founder_profile,
            competitors_list=competitors,
            inferred_business_type=business_type,
            financials=financials,
            revenue_streams=revenue_streams,
            tech_stack_summary=tech_summary,
            core_problem=raw_data.problemStatement,
            core_solution=raw_data.startupDescription,
            stage=raw_data.currentStartupStage,
            nlp_extracted_keywords=nlp_keywords
        )

extraction_agent = ExtractionAgent()