from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity as _cosine
import numpy as np

_model = None


def get_model():
    global _model
    if _model is None:
        _model = SentenceTransformer("sentence-transformers/all-MiniLM-L6-v2")
    return _model


def embed_text(text: str):
    return get_model().encode(text)


def embed_batch(texts: list):
    return get_model().encode(texts)


# aliases used by cleaning_service
def encode(texts):
    return get_model().encode(texts)


def cosine_similarity(a, b):
    return _cosine(a, b)


def similarity(emb_a, emb_b) -> float:
    return float(_cosine([emb_a], [emb_b])[0][0])


def average_embedding(embeddings):
    return np.mean(embeddings, axis=0)
