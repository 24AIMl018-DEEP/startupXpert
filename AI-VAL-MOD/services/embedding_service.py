import re
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity as _cosine

_model = None


def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return _model


def encode(texts):
    return get_model().encode(texts)


def cosine_similarity(a, b):
    return _cosine(a, b)


def clean_text(text: str) -> str:
    text = re.sub(r'TITLE:\s*', '', text)
    text = re.sub(r'CONTENT:\s*', '', text)
    text = re.sub(r'\s+', ' ', text).strip()
    return text
