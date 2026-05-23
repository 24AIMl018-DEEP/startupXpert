from sentence_transformers import SentenceTransformer
from sklearn.cluster import MiniBatchKMeans

from agents.base_agent import BaseAgent
from states.startup_state import StartupState

class CompressionAgent(BaseAgent):
    
    def __init__(self):
        
        self.model = SentenceTransformer(
            "all-MiniLM-L6-v2"
        )
        
    # main run
    def run(self, states: StartupState):
        
        cleaned_evidence = states[
            'cleaned_evidence'
        ]
        
        # empty safty
        if not cleaned_evidence:
        
            states['compressed_evidence'] = []
        
            return states
    
        # Extract text 
        evidence_texts = [
            evidence['text']
            for evidence in cleaned_evidence
        ]
        
        # create embadings
        embeddings = self.model.encode(
            evidence_texts
        )
        
        # dynamic cluster count 
        cluster_count = min(
            5,
            len(evidence_texts)
        )
        
        # clustering 
        clustering_model = MiniBatchKMeans(
            n_clusters=cluster_count,
            random_state=42
        )
        
        labels = clustering_model.fit_predict(
            embeddings
        )
        
        # Group Evidence 
        clusters={}
        for label,item in zip(
            labels,cleaned_evidence
        ):
            if label not in clusters:
                clusters[label] = []
            clusters[label].append(item)
        
        # Create compressed output 
        compressed = []
        
        for label, items in clusters.items():
            
            # best evidence in cluster 
            best_item = max(
                items,
                key=lambda x: x['relevance_score']
            )
            
            compressed.append({
                "cluster_id": int(label),
                "cluster_size": len(items),
                "representative_text": best_item['text'],
                "relevance_score": best_item['relevance_score']
            })
        
        # Sorting 
        compressed = sorted(
            compressed,
            key = lambda x:
            x['cluster_size'],
            reverse = True
        )
        
        states['compressed_evidence'] = compressed
        return states