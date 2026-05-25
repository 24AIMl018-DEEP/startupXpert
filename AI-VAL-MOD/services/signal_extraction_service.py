"""
Signal Extraction Service
─────────────────────────
Extracts 8 business signals from a single text using ONLY traditional NLP.
NO LLM is used here — this is the "channi" (filter) layer.

Signals extracted:
  1. sentiment        → label (negative/neutral/positive) + score
  2. keywords         → top relevant terms
  3. competitors      → ORG entities via spaCy + custom brand patterns
  4. urgency          → regex pattern match count
  5. workaround       → regex pattern match count
  6. spending         → money/payment pattern count
  7. pain_intensity   → exclamation + sentiment combined score
  8. user_type        → PERSON/GROUP entities
"""

import re
from functools import lru_cache
from collections import Counter
from transformers import pipeline as hf_pipeline
import spacy


# ── Lazy singletons ────────────────────────────────────────────────────────────

_sentiment_pipe = None
_nlp = None


def _get_sentiment():
    global _sentiment_pipe
    if _sentiment_pipe is None:
        print("  [signal] Loading sentiment model...")
        _sentiment_pipe = hf_pipeline(
            "sentiment-analysis",
            model="distilbert-base-uncased-finetuned-sst-2-english",
            truncation=True,
            max_length=512
        )
    return _sentiment_pipe


def _get_nlp():
    global _nlp
    if _nlp is None:
        _nlp = spacy.load("en_core_web_sm")
    return _nlp


# ── Regex patterns (compiled once) ────────────────────────────────────────────

_URGENCY_PATTERNS = re.compile(
    r"\b(urgent|urgently|asap|immediately|right now|can.?t wait|need.{0,10}now|"
    r"need.{0,10}today|need.{0,10}fast|critical|desperate|desperately|"
    r"no time|overdue|deadline|stuck|blocking|emergency|must.have|"
    r"please help|fix this|broken|not working|doesn.?t work|stopped working|"
    r"keeps (crashing|failing|breaking)|won.?t (load|open|work)|help me|"
    r"anyone else|is it just me|why (is|does|won.?t|can.?t))\b",
    re.IGNORECASE
)

_WORKAROUND_PATTERNS = re.compile(
    r"\b(workaround|work.around|hack|makeshift|manual(ly)?|instead|"
    r"using.+as.a|doing.it.myself|alternative|substitute|replacement|"
    r"copy.paste|spreadsheet|excel|google.sheet|notepad|whiteboard|"
    r"band.?aid|duct.tape|patch|bypass|improvise|rigged|temporary.fix|"
    r"cobbled|kludge|just.use|fall.back)\b",
    re.IGNORECASE
)

_SPENDING_PATTERNS = re.compile(
    r"(\$[\d,]+(?:\.\d{2})?|\b\d+\s*(?:dollars?|usd|gbp|eur|inr|rupees?|bucks?)\b|"
    r"\b(paying|paid|pay|spent|spend|spending|cost|costs|priced|price|"
    r"worth|budget|invoice|subscription|fee|charge|purchase|buy|bought|afford)\b)",
    re.IGNORECASE
)

_COMPETITOR_BRANDS = {
    "excel", "google sheets", "airtable", "notion", "slack", "trello", "jira",
    "asana", "monday", "clickup", "linear", "salesforce", "hubspot", "zoho",
    "mailchimp", "stripe", "paypal", "venmo", "whatsapp", "telegram", "discord",
    "linkedin", "twitter", "instagram", "facebook", "reddit", "youtube",
    "shopify", "wix", "wordpress", "squarespace", "figma", "canva", "dropbox",
    "github", "gitlab", "bitbucket", "upwork", "fiverr", "meetup", "eventbrite",
    "zoom", "teams", "meet", "calendly", "typeform", "surveymonkey"
}

_STOPWORDS = {
    "the", "a", "an", "and", "or", "but", "in", "on", "at", "to", "for", "of",
    "with", "is", "was", "are", "be", "been", "have", "has", "had", "do", "does",
    "did", "will", "would", "could", "should", "may", "might", "this", "that",
    "these", "those", "it", "its", "i", "we", "you", "he", "she", "they", "my",
    "our", "your", "his", "her", "their", "can", "not", "no", "so", "as", "if",
    "by", "from", "up", "out", "about", "just", "also", "there", "when", "where",
    "how", "what", "which", "who", "get", "got", "use", "used", "like", "really",
    "very", "much", "more", "most", "some", "all", "any", "even", "still", "want",
    "need", "make", "one", "time", "way", "people", "thing", "things", "good",
    "great", "bad", "hard", "easy", "new", "old", "other", "same", "different"
}


# ── Core extractor ─────────────────────────────────────────────────────────────

class SignalExtractionService:
    """
    Extracts all 8 business signals from raw text.
    Used per-text BEFORE clustering, so signals can be aggregated at cluster level.
    """

    def extract(self, text: str) -> dict:
        """
        Returns a signal dict for a single piece of text.
        """
        text_lower = text.lower()
        clean = re.sub(r'\s+', ' ', text).strip()

        return {
            "sentiment":      self._sentiment(clean),
            "keywords":       self._keywords(clean),
            "competitors":    self._competitors(clean),
            "urgency_count":  self._count(_URGENCY_PATTERNS, text_lower),
            "workaround_count": self._count(_WORKAROUND_PATTERNS, text_lower),
            "spending_count": self._count(_SPENDING_PATTERNS, text_lower),
            "pain_intensity": self._pain_intensity(clean),
            "user_type":      self._user_type(clean)
        }

    # ── Sentiment ──────────────────────────────────────────────────────────────

    def _sentiment(self, text: str) -> dict:
        try:
            result = _get_sentiment()(text[:512])[0]
            raw_label = result["label"].lower()
            # distilbert returns POSITIVE/NEGATIVE
            label = "positive" if "positive" in raw_label else "negative" if "negative" in raw_label else "neutral"
            score = result["score"]
            if label == "negative":
                score = -score
            elif label == "neutral":
                score = 0.0
            return {"label": label, "score": round(score, 4)}
        except Exception:
            return {"label": "neutral", "score": 0.0}

    # ── Keywords ───────────────────────────────────────────────────────────────

    def _keywords(self, text: str) -> list:
        words = re.findall(r'\b[a-zA-Z]{4,}\b', text.lower())
        filtered = [w for w in words if w not in _STOPWORDS]
        counts = Counter(filtered)
        return [w for w, _ in counts.most_common(8)]

    # ── Competitors / NER ──────────────────────────────────────────────────────

    def _competitors(self, text: str) -> list:
        found = set()
        text_lower = text.lower()

        # Match known brand names first — most reliable
        for brand in _COMPETITOR_BRANDS:
            if brand in text_lower:
                found.add(brand.title())

        # spaCy ORG/PRODUCT entities — but filter noise
        try:
            doc = _get_nlp()(text[:512])
            for ent in doc.ents:
                if ent.label_ not in ("ORG", "PRODUCT"):
                    continue
                name = ent.text.strip()
                # skip short, generic, or location-like entities
                if len(name) < 3:
                    continue
                if name.lower() in _STOPWORDS:
                    continue
                # skip if it looks like a place (contains common geo words)
                if any(w in name.lower() for w in ("world", "park", "city", "land", "center", "centre", "street", "avenue")):
                    continue
                found.add(name)
        except Exception:
            pass

        return list(found)[:5]

    # ── Pattern counting ───────────────────────────────────────────────────────

    def _count(self, pattern: re.Pattern, text: str) -> int:
        return len(pattern.findall(text))

    # ── Pain intensity ─────────────────────────────────────────────────────────

    def _pain_intensity(self, text: str) -> float:
        exclamations = text.count("!")
        caps_words = len(re.findall(r'\b[A-Z]{3,}\b', text))
        ellipsis = text.count("...")
        # Normalized 0–1 score based on signal density
        raw = (exclamations * 0.4) + (caps_words * 0.3) + (ellipsis * 0.1)
        return round(min(raw / 5.0, 1.0), 3)

    # ── User type ──────────────────────────────────────────────────────────────

    def _user_type(self, text: str) -> list:
        types = set()
        try:
            doc = _get_nlp()(text[:512])
            for ent in doc.ents:
                if ent.label_ in ("PERSON", "NORP", "GPE"):
                    types.add(ent.text.strip())
        except Exception:
            pass
        return list(types)[:4]


    def extract_batch(self, texts: list) -> list:
        """Extract signals from a list of texts. Returns list of signal dicts."""
        return [self.extract(t) for t in texts]
