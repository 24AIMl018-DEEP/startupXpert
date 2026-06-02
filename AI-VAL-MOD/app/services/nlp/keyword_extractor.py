import spacy

class KeywordExtractor:
    def __init__(self):
        # Load the free, lightweight English NLP model
        try:
            self.nlp = spacy.load("en_core_web_sm")
        except OSError:
            raise RuntimeError("Spacy model not found. Run: python -m spacy download en_core_web_sm")

    def extract_keywords(self, text: str) -> list[str]:
        """
        Uses standard NLP to extract important nouns and entities from text.
        Removes stop words and punctuation.
        """
        if not text:
            return []
            
        doc = self.nlp(text)
        keywords = set()
        
        # Extract meaningful noun chunks (e.g., "telemedicine platform", "specialist doctors")
        for chunk in doc.noun_chunks:
            # Filter out basic pronouns and highly generic words
            if chunk.root.pos_ in ['NOUN', 'PROPN'] and not chunk.root.is_stop:
                clean_text = chunk.text.lower().strip()
                if len(clean_text) > 2:
                    keywords.add(clean_text)
                    
        return list(keywords)

# Instantiate as a singleton service
nlp_extractor = KeywordExtractor()