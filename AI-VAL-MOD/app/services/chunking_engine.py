from langchain_text_splitters import RecursiveCharacterTextSplitter
from sentence_transformers import SentenceTransformer
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np

# Load a fast, local embedding model (runs easily on CPU)
model = SentenceTransformer('all-MiniLM-L6-v2')

# Configure the sliding window chunker
text_splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=200,
    length_function=len
)

def filter_relevant_chunks(raw_text: str, pitch: str, top_k: int = 5) -> list[str]:
    """
    Splits massive scraped text into chunks, compares them to the startup pitch 
    using vector similarity, and returns only the top most relevant paragraphs.
    """
    if not raw_text.strip():
        return []
        
    # 1. Split the massive text
    chunks = text_splitter.split_text(raw_text)
    if not chunks:
        return []

    # 2. Convert text to mathematical vectors
    chunk_embeddings = model.encode(chunks)
    pitch_embedding = model.encode([pitch])
    
    # 3. Calculate Cosine Similarity
    similarities = cosine_similarity(pitch_embedding, chunk_embeddings)[0]
    
    # 4. Get the indices of the highest scoring chunks
    top_indices = np.argsort(similarities)[-top_k:][::-1]
    
    # 5. Return the actual text of those top chunks
    return [chunks[i] for i in top_indices]