import networkx as nx
from typing import List, Dict, Any, Tuple, Optional
from app.models.models import EntityModel, RelationshipModel, TransactionModel

class GraphAnalyticsEngine:
    def __init__(self, entities: List[EntityModel], relationships: List[RelationshipModel]):
        self.entities = entities
        self.relationships = relationships
        self.entity_map = {e.id: e for e in entities}
        
        # Build NetworkX DiGraph (for directed flow analysis) and Graph (for undirected mediation)
        self.G_dir = nx.DiGraph()
        self.G_undir = nx.Graph()
        
        for e in entities:
            self.G_dir.add_node(e.id, name=e.name, type=e.type, risk=e.risk_score)
            self.G_undir.add_node(e.id, name=e.name, type=e.type, risk=e.risk_score)
            
        for r in relationships:
            weight = r.amount_usd if r.amount_usd else 1000.0
            self.G_dir.add_edge(r.source_id, r.target_id, id=r.id, type=r.type, weight=weight, label=r.label)
            self.G_undir.add_edge(r.source_id, r.target_id, id=r.id, type=r.type, weight=weight, label=r.label)

    def calculate_centralities(self) -> Dict[str, Dict[str, float]]:
        """
        Computes Degree, Betweenness, Closeness, and PageRank centralities.
        """
        deg_centrality = nx.degree_centrality(self.G_undir)
        betweenness = nx.betweenness_centrality(self.G_undir)
        closeness = nx.closeness_centrality(self.G_undir)
        
        try:
            pagerank = nx.pagerank(self.G_dir, weight='weight')
        except Exception:
            pagerank = {n: 0.0 for n in self.G_dir.nodes()}

        results = {}
        for node_id in self.G_undir.nodes():
            results[node_id] = {
                "degree": round(deg_centrality.get(node_id, 0.0), 3),
                "betweenness": round(betweenness.get(node_id, 0.0), 3),
                "closeness": round(closeness.get(node_id, 0.0), 3),
                "pagerank": round(pagerank.get(node_id, 0.0), 4),
            }
        return results

    def detect_communities(self) -> List[Dict[str, Any]]:
        """
        Groups connected entities into functional criminal network communities.
        """
        try:
            communities_gen = nx.community.greedy_modularity_communities(self.G_undir)
            clusters = []
            for idx, comm in enumerate(communities_gen):
                member_ids = list(comm)
                clusters.append({
                    "cluster_id": idx + 1,
                    "label": f"Cell Cluster #{idx + 1}",
                    "size": len(member_ids),
                    "members": member_ids,
                })
            return clusters
        except Exception:
            return []

    def trace_shortest_path(self, source_id: str, target_id: str) -> Optional[Dict[str, Any]]:
        """
        Finds the shortest path between two entities and calculates tracked volume.
        """
        if not self.G_undir.has_node(source_id) or not self.G_undir.has_node(target_id):
            return None
            
        try:
            path = nx.shortest_path(self.G_undir, source=source_id, target=target_id)
            edges_along_path = []
            total_flow = 0.0
            
            for i in range(len(path) - 1):
                u, v = path[i], path[i+1]
                edge_data = self.G_undir.get_edge_data(u, v) or {}
                edges_along_path.append({
                    "source": u,
                    "target": v,
                    "type": edge_data.get("type", "association"),
                    "amount_usd": edge_data.get("weight", 0.0)
                })
                total_flow += edge_data.get("weight", 0.0)
                
            return {
                "source_id": source_id,
                "target_id": target_id,
                "path": path,
                "hops": len(path) - 1,
                "edges": edges_along_path,
                "total_flow_usd": total_flow,
            }
        except (nx.NetworkXNoPath, nx.NodeNotFound):
            return None

    def compute_network_metrics(self) -> Dict[str, Any]:
        """
        Calculates overarching graph topology metrics.
        """
        num_nodes = self.G_undir.number_of_nodes()
        num_edges = self.G_undir.number_of_edges()
        density = round(nx.density(self.G_undir), 3) if num_nodes > 1 else 0.0
        connected_components = nx.number_connected_components(self.G_undir)
        avg_degree = round(sum(dict(self.G_undir.degree()).values()) / max(num_nodes, 1), 2)
        
        centralities = self.calculate_centralities()
        top_betweenness = sorted(
            [{"id": n, "name": self.entity_map.get(n).name if self.entity_map.get(n) else n, "score": d["betweenness"]} for n, d in centralities.items()],
            key=lambda x: x["score"],
            reverse=True
        )[:5]

        top_degree = sorted(
            [{"id": n, "name": self.entity_map.get(n).name if self.entity_map.get(n) else n, "score": d["degree"]} for n, d in centralities.items()],
            key=lambda x: x["score"],
            reverse=True
        )[:5]

        communities = self.detect_communities()

        return {
            "node_count": num_nodes,
            "edge_count": num_edges,
            "density": density,
            "average_degree": avg_degree,
            "connected_components": connected_components,
            "top_betweenness_nodes": top_betweenness,
            "top_degree_nodes": top_degree,
            "communities": communities,
        }

    def predict_candidate_links(self) -> List[Dict[str, Any]]:
        """
        Uses Adamic-Adar link prediction algorithm to suggest hidden candidate connections.
        """
        try:
            preds = nx.adamic_adar_index(self.G_undir)
            sorted_preds = sorted(preds, key=lambda x: x[2], reverse=True)[:5]
            
            candidates = []
            for u, v, p in sorted_preds:
                u_ent = self.entity_map.get(u)
                v_ent = self.entity_map.get(v)
                candidates.append({
                    "source_id": u,
                    "source_name": u_ent.name if u_ent else u,
                    "target_id": v,
                    "target_name": v_ent.name if v_ent else v,
                    "prediction_score": round(p, 3),
                    "algorithm": "Adamic-Adar Common Neighborhood Topology",
                    "reason": "High density of shared commercial proxies and intermediaries"
                })
            return candidates
        except Exception:
            return []
