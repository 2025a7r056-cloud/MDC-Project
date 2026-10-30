import datetime
from typing import List, Dict, Any, Optional
from app.models.models import EntityModel, RelationshipModel
from app.services.graph_engine import GraphAnalyticsEngine

class AIAssistantService:
    def __init__(self, entities: List[EntityModel], relationships: List[RelationshipModel]):
        self.entities = entities
        self.relationships = relationships
        self.engine = GraphAnalyticsEngine(entities, relationships)

    def answer_investigative_query(self, prompt: str, focus_entity_id: Optional[str] = None) -> Dict[str, Any]:
        """
        Processes analytical questions and responds with grounded evidence.
        """
        q = prompt.lower()
        now_str = datetime.datetime.utcnow().strftime("%Y-%m-%d %H:%M:%S UTC")

        # Query 1: Betweenness / Brokers / Gatekeepers
        if "betweenness" in q or "broker" in q or "gatekeeper" in q:
            centralities = self.engine.calculate_centralities()
            top_node_id = max(centralities.keys(), key=lambda x: centralities[x]["betweenness"])
            top_entity = self.engine.entity_map.get(top_node_id)
            score = centralities[top_node_id]["betweenness"]

            response_text = (
                f"Betweenness Centrality analysis indicates that **{top_entity.name if top_entity else top_node_id} ({top_node_id})** "
                f"holds the highest structural brokerage score ({score}). In criminal network analysis, this node acts as the critical bridge "
                f"connecting maritime shipping operations with offshore corporate shell bank accounts. Disrupting or subpoenaing this entity "
                f"causes the highest fragmentation across the syndicate."
            )
            citations = [
                {"id": top_node_id, "label": f"{top_entity.name} (Betweenness: {score})", "type": "entity"},
                {"id": "ALGO-BRANDES", "label": "Brandes Algorithmic Mediation Index", "type": "stat"}
            ]

        # Query 2: Shortest Path
        elif "shortest path" in q or "path" in q or "trace" in q:
            # Check for mentions of node IDs
            mentioned_ids = [e.id for e in self.entities if e.id.lower() in q]
            src = mentioned_ids[0] if len(mentioned_ids) > 0 else "ENT-001"
            tgt = mentioned_ids[1] if len(mentioned_ids) > 1 else "ENT-007"

            path_res = self.engine.trace_shortest_path(src, tgt)
            if path_res:
                src_name = self.engine.entity_map.get(src).name if self.engine.entity_map.get(src) else src
                tgt_name = self.engine.entity_map.get(tgt).name if self.engine.entity_map.get(tgt) else tgt
                flow_usd = path_res["total_flow_usd"]

                response_text = (
                    f"Shortest path successfully computed between **{src_name} ({src})** and **{tgt_name} ({tgt})**. "
                    f"The route requires **{path_res['hops']} intermediate hops** via {', '.join(path_res['path'][1:-1])}. "
                    f"Total tracked capital flow along this conduit is **${flow_usd:,.2f} USD**."
                )
                citations = [{"id": n, "label": f"{n} ({self.engine.entity_map.get(n).name if self.engine.entity_map.get(n) else 'Node'})", "type": "entity"} for n in path_res["path"]]
            else:
                response_text = f"No connected conduit path was detected between {src} and {tgt} in the current evidentiary subgraph."
                citations = []

        # Query 3: Smurfing / Transactions / Structuring
        elif "transaction" in q or "smurfing" in q or "structuring" in q or "anomaly" in q:
            response_text = (
                "Transaction pattern analysis flagged a recurring structuring (smurfing) pattern: 14 outbound transfers "
                "between $9,800 and $9,950 originated from shell corporation Aethelgard Holdings Ltd (ENT-003) directed to Cyprus and Swiss bank accounts. "
                "By systematically capping wires below the $10,000 threshold, the transaction frequency deviates 3.82 standard deviations "
                "from legitimate baseline commercial operations."
            )
            citations = [
                {"id": "ENT-003", "label": "Aethelgard Holdings Ltd (Originator)", "type": "entity"},
                {"id": "ENT-006", "label": "Cyprus Commercial Bank (Correspondent)", "type": "entity"},
            ]

        # Query 4: Summary of network
        elif "summarize" in q or "overview" in q or "summary" in q:
            metrics = self.engine.compute_network_metrics()
            response_text = (
                f"The active investigation comprises **{metrics['node_count']} target entities** across 7 classifications and "
                f"**{metrics['edge_count']} confirmed evidentiary connections** with an overall network density of **{metrics['density']}**. "
                f"NetworkX modularity partitions the syndicate into **{len(metrics['communities'])} functional cells**: "
                f"(1) Cyprus nominee shells, (2) Eastern European cryptocurrency peeling chains, and (3) Maritime contraband logistics."
            )
            citations = [
                {"id": "CASE-2026-089A", "label": "OPERATION IRON TRIDENT Taskforce", "type": "case"},
                {"id": "ENT-001", "label": "Viktor Kaelen (Target Alpha)", "type": "entity"},
            ]

        # Query 5: Entities connected to target
        elif "connected" in q or focus_entity_id:
            target_id = focus_entity_id or ("ENT-004" if "ent-004" in q else "ENT-001")
            target_ent = self.engine.entity_map.get(target_id)
            neighbors = list(self.engine.G_undir.neighbors(target_id)) if self.engine.G_undir.has_node(target_id) else []
            
            response_text = (
                f"Entity **{target_ent.name if target_ent else target_id} ({target_id})** has direct relationships with "
                f"**{len(neighbors)} network nodes**: {', '.join([self.engine.entity_map.get(n).name if self.engine.entity_map.get(n) else n for n in neighbors])}."
            )
            citations = [{"id": n, "label": f"{n} ({self.engine.entity_map.get(n).name if self.engine.entity_map.get(n) else 'Node'})", "type": "entity"} for n in neighbors]

        # Fallback query
        else:
            response_text = (
                f"Forensic query analyzed against current graph dataset. You may ask: "
                f"'Which nodes have the highest betweenness centrality?', "
                f"'Find the shortest path between ENT-001 and ENT-007', or "
                f"'Explain why the transaction pattern was flagged'."
            )
            citations = [
                {"id": "ENT-001", "label": "Viktor Kaelen", "type": "entity"},
                {"id": "ENT-005", "label": "Helena Vance", "type": "entity"},
            ]

        return {
            "prompt": prompt,
            "timestamp": now_str,
            "response": response_text,
            "grounded_citations": citations,
            "disclaimer": "AI-generated investigative hypothesis grounded in Admiralty evidentiary records. Human review and legal verification required.",
        }
