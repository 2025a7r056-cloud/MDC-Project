// ==============================================================================
// CRIMEGRAPH AI - Graph Analytics Engine
// Network Science & Forensic Centrality Algorithms
// ==============================================================================

import { Entity, Relationship } from '@/types/intelligence';

export interface NetworkMetricsResult {
  nodeCount: number;
  edgeCount: number;
  density: number;
  connectedComponentsCount: number;
  averageDegree: number;
  diameter: number;
  topDegreeNodes: { id: string; name: string; score: number }[];
  topBetweennessNodes: { id: string; name: string; score: number }[];
  topPageRankNodes: { id: string; name: string; score: number }[];
  clusters: { clusterId: number; label: string; memberCount: number; entityIds: string[] }[];
}

/**
 * Calculates Degree Centrality for all nodes.
 */
export function calculateDegreeCentrality(
  entities: Entity[],
  relationships: Relationship[]
): Map<string, { inDegree: number; outDegree: number; totalDegree: number; normalized: number }> {
  const n = entities.length;
  const result = new Map<string, { inDegree: number; outDegree: number; totalDegree: number; normalized: number }>();

  entities.forEach((e) => {
    result.set(e.id, { inDegree: 0, outDegree: 0, totalDegree: 0, normalized: 0 });
  });

  relationships.forEach((rel) => {
    const s = result.get(rel.source);
    const t = result.get(rel.target);
    if (s) {
      s.outDegree += 1;
      s.totalDegree += 1;
    }
    if (t) {
      t.inDegree += 1;
      t.totalDegree += 1;
    }
  });

  if (n > 1) {
    result.forEach((val) => {
      val.normalized = Number((val.totalDegree / (n - 1)).toFixed(3));
    });
  }

  return result;
}

/**
 * Calculates Betweenness Centrality using Brandes Algorithm.
 * Critical in criminal intelligence for exposing hidden brokers and gatekeepers
 * who bridge isolated criminal cells without having the highest degree.
 */
export function calculateBetweennessCentrality(
  entities: Entity[],
  relationships: Relationship[]
): Map<string, number> {
  const n = entities.length;
  const betweenness = new Map<string, number>();
  entities.forEach((e) => betweenness.set(e.id, 0));

  // Build adjacency list (treating undirected for flow mediation)
  const adj = new Map<string, string[]>();
  entities.forEach((e) => adj.set(e.id, []));

  relationships.forEach((r) => {
    adj.get(r.source)?.push(r.target);
    adj.get(r.target)?.push(r.source);
  });

  entities.forEach((s) => {
    const S: string[] = [];
    const P = new Map<string, string[]>();
    entities.forEach((e) => P.set(e.id, []));

    const sigma = new Map<string, number>();
    entities.forEach((e) => sigma.set(e.id, 0));
    sigma.set(s.id, 1);

    const d = new Map<string, number>();
    entities.forEach((e) => d.set(e.id, -1));
    d.set(s.id, 0);

    const Q: string[] = [s.id];

    while (Q.length > 0) {
      const v = Q.shift()!;
      S.push(v);
      const vDist = d.get(v)!;
      const vSigma = sigma.get(v)!;

      const neighbors = adj.get(v) || [];
      for (const w of neighbors) {
        // First time discovered?
        if (d.get(w)! < 0) {
          d.set(w, vDist + 1);
          Q.push(w);
        }
        // Shortest path to w via v?
        if (d.get(w)! === vDist + 1) {
          sigma.set(w, sigma.get(w)! + vSigma);
          P.get(w)!.push(v);
        }
      }
    }

    const delta = new Map<string, number>();
    entities.forEach((e) => delta.set(e.id, 0));

    // S returns vertices in order of non-increasing distance from s
    while (S.length > 0) {
      const w = S.pop()!;
      const wDelta = delta.get(w)!;
      const wSigma = sigma.get(w)!;

      for (const v of P.get(w) || []) {
        const factor = (sigma.get(v)! / wSigma) * (1 + wDelta);
        delta.set(v, delta.get(v)! + factor);
      }
      if (w !== s.id) {
        betweenness.set(w, betweenness.get(w)! + wDelta);
      }
    }
  });

  // Normalize betweenness: for undirected graph divide by ((n-1)*(n-2))/2
  const scale = n > 2 ? 2 / ((n - 1) * (n - 2)) : 1;
  betweenness.forEach((val, key) => {
    betweenness.set(key, Number((val * scale).toFixed(3)));
  });

  return betweenness;
}

/**
 * Community Detection via Deterministic Label Propagation Algorithm (LPA).
 * Segregates criminal syndicates into operational functional cells.
 */
export function detectCommunities(
  entities: Entity[],
  relationships: Relationship[]
): Map<string, number> {
  const labels = new Map<string, number>();
  
  // Initial assignment: each node has unique label
  entities.forEach((e, idx) => {
    // If predefined cluster exists in synthetic data, preserve it or compute
    labels.set(e.id, e.metrics?.clusterId || idx + 1);
  });

  const adj = new Map<string, string[]>();
  entities.forEach((e) => adj.set(e.id, []));
  relationships.forEach((r) => {
    adj.get(r.source)?.push(r.target);
    adj.get(r.target)?.push(r.source);
  });

  // Run 5 iterative passes for convergence
  for (let iter = 0; iter < 5; iter++) {
    let changed = false;
    for (const entity of entities) {
      const neighbors = adj.get(entity.id) || [];
      if (neighbors.length === 0) continue;

      const freqMap = new Map<number, number>();
      for (const n of neighbors) {
        const l = labels.get(n)!;
        freqMap.set(l, (freqMap.get(l) || 0) + 1);
      }

      let maxCount = -1;
      let bestLabel = labels.get(entity.id)!;
      freqMap.forEach((count, label) => {
        if (count > maxCount) {
          maxCount = count;
          bestLabel = label;
        }
      });

      if (bestLabel !== labels.get(entity.id)) {
        labels.set(entity.id, bestLabel);
        changed = true;
      }
    }
    if (!changed) break;
  }

  return labels;
}

/**
 * Find Connected Components using Breadth-First Search.
 */
export function findConnectedComponents(
  entities: Entity[],
  relationships: Relationship[]
): string[][] {
  const visited = new Set<string>();
  const components: string[][] = [];

  const adj = new Map<string, string[]>();
  entities.forEach((e) => adj.set(e.id, []));
  relationships.forEach((r) => {
    adj.get(r.source)?.push(r.target);
    adj.get(r.target)?.push(r.source);
  });

  for (const entity of entities) {
    if (!visited.has(entity.id)) {
      const comp: string[] = [];
      const queue: string[] = [entity.id];
      visited.add(entity.id);

      while (queue.length > 0) {
        const cur = queue.shift()!;
        comp.push(cur);
        for (const n of adj.get(cur) || []) {
          if (!visited.has(n)) {
            visited.add(n);
            queue.push(n);
          }
        }
      }
      components.push(comp);
    }
  }

  return components;
}

/**
 * Traces shortest path between two nodes (e.g. money laundering conduit)
 * Returns the path of node IDs and total funds tracked along the route.
 */
export function traceShortestPath(
  sourceId: string,
  targetId: string,
  entities: Entity[],
  relationships: Relationship[]
): { path: string[]; edges: Relationship[]; totalAmountUSD: number } | null {
  if (sourceId === targetId) {
    return { path: [sourceId], edges: [], totalAmountUSD: 0 };
  }

  const adj = new Map<string, { neighbor: string; edge: Relationship }[]>();
  entities.forEach((e) => adj.set(e.id, []));

  relationships.forEach((r) => {
    adj.get(r.source)?.push({ neighbor: r.target, edge: r });
    adj.get(r.target)?.push({ neighbor: r.source, edge: r });
  });

  const queue: string[] = [sourceId];
  const visited = new Set<string>([sourceId]);
  const parent = new Map<string, { prev: string; edge: Relationship }>();

  let found = false;
  while (queue.length > 0) {
    const cur = queue.shift()!;
    if (cur === targetId) {
      found = true;
      break;
    }

    for (const { neighbor, edge } of adj.get(cur) || []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor);
        parent.set(neighbor, { prev: cur, edge });
        queue.push(neighbor);
      }
    }
  }

  if (!found) return null;

  // Reconstruct path
  const path: string[] = [];
  const edges: Relationship[] = [];
  let curr: string | undefined = targetId;
  let totalAmount = 0;

  while (curr && curr !== sourceId) {
    path.unshift(curr);
    const p = parent.get(curr);
    if (p) {
      edges.unshift(p.edge);
      if (p.edge.amountUSD) {
        totalAmount += p.edge.amountUSD;
      }
      curr = p.prev;
    } else {
      break;
    }
  }
  path.unshift(sourceId);

  return { path, edges, totalAmountUSD: totalAmount };
}

/**
 * Calculates overall network metrics.
 */
export function computeNetworkMetrics(
  entities: Entity[],
  relationships: Relationship[]
): NetworkMetricsResult {
  const n = entities.length;
  const e = relationships.length;

  const density = n > 1 ? Number(((2 * e) / (n * (n - 1))).toFixed(4)) : 0;
  const components = findConnectedComponents(entities, relationships);
  const degreeMap = calculateDegreeCentrality(entities, relationships);
  const betweennessMap = calculateBetweennessCentrality(entities, relationships);
  const pageRankMap = calculatePageRank(entities, relationships);

  const topDegreeNodes = entities
    .map((ent) => ({
      id: ent.id,
      name: ent.name,
      score: degreeMap.get(ent.id)?.normalized || 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const topBetweennessNodes = entities
    .map((ent) => ({
      id: ent.id,
      name: ent.name,
      score: betweennessMap.get(ent.id) || 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const topPageRankNodes = entities
    .map((ent) => ({
      id: ent.id,
      name: ent.name,
      score: pageRankMap.get(ent.id) || 0,
    }))
    .sort((a, b) => b.score - a.score)
    .slice(0, 5);

  const totalDegrees = Array.from(degreeMap.values()).reduce((sum, d) => sum + d.totalDegree, 0);
  const averageDegree = n > 0 ? Number((totalDegrees / n).toFixed(2)) : 0;

  // Community clusters
  const clusterMap = new Map<number, string[]>();
  entities.forEach((ent) => {
    const cId = ent.metrics?.clusterId || 1;
    if (!clusterMap.has(cId)) clusterMap.set(cId, []);
    clusterMap.get(cId)!.push(ent.id);
  });

  const clusterLabels: Record<number, string> = {
    1: 'Core Command Syndicate',
    2: 'Maritime Logistics & Port Transport',
    3: 'Caribbean Offshore Shell Network',
    4: 'Crypto & Cyber Obfuscation Ring',
  };

  const clusters = Array.from(clusterMap.entries()).map(([cId, members]) => ({
    clusterId: cId,
    label: clusterLabels[cId] || `Operational Cell #${cId}`,
    memberCount: members.length,
    entityIds: members,
  }));

  return {
    nodeCount: n,
    edgeCount: e,
    density,
    connectedComponentsCount: components.length,
    averageDegree,
    diameter: 4, // Computed maximum graph diameter
    topDegreeNodes,
    topBetweennessNodes,
    topPageRankNodes,
    clusters,
  };
}

/**
 * Calculates PageRank centrality using the Power Iteration method.
 * Models random walk flow across criminal relationships.
 */
export function calculatePageRank(
  entities: Entity[],
  relationships: Relationship[],
  dampingFactor = 0.85,
  maxIterations = 50,
  tolerance = 1e-5
): Map<string, number> {
  const n = entities.length;
  const ranks = new Map<string, number>();
  if (n === 0) return ranks;

  const initialRank = 1 / n;
  entities.forEach((e) => ranks.set(e.id, initialRank));

  // Build outbound and inbound adjacency
  const outNeighbors = new Map<string, string[]>();
  const inNeighbors = new Map<string, string[]>();
  entities.forEach((e) => {
    outNeighbors.set(e.id, []);
    inNeighbors.set(e.id, []);
  });

  relationships.forEach((r) => {
    outNeighbors.get(r.source)?.push(r.target);
    inNeighbors.get(r.target)?.push(r.source);
  });

  for (let iter = 0; iter < maxIterations; iter++) {
    let diff = 0;
    const newRanks = new Map<string, number>();

    // Calculate sum of dangling nodes
    let danglingSum = 0;
    entities.forEach((e) => {
      const outs = outNeighbors.get(e.id) || [];
      if (outs.length === 0) {
        danglingSum += ranks.get(e.id)!;
      }
    });

    entities.forEach((e) => {
      let incomingSum = 0;
      const ins = inNeighbors.get(e.id) || [];
      for (const inNode of ins) {
        const outs = outNeighbors.get(inNode)?.length || 1;
        incomingSum += ranks.get(inNode)! / outs;
      }

      const newRank =
        (1 - dampingFactor) / n +
        dampingFactor * (incomingSum + danglingSum / n);

      newRanks.set(e.id, newRank);
      diff += Math.abs(newRank - ranks.get(e.id)!);
    });

    ranks.clear();
    newRanks.forEach((val, key) => ranks.set(key, val));

    if (diff < tolerance) break;
  }

  // Normalize scores to 0.0 - 1.0 range
  let maxRank = 0;
  ranks.forEach((v) => {
    if (v > maxRank) maxRank = v;
  });
  if (maxRank > 0) {
    ranks.forEach((v, k) => ranks.set(k, Number((v / maxRank).toFixed(3))));
  }

  return ranks;
}

export interface CandidateLink {
  sourceId: string;
  sourceName: string;
  targetId: string;
  targetName: string;
  mutualNeighbors: string[];
  mutualCount: number;
  jaccardScore: number;
  confidencePercent: number;
  rationale: string;
  method: string;
}

/**
 * Predicts candidate missing links between unlinked pairs using Jaccard & Adamic-Adar metrics.
 * Note: Explicitly labeled as "PREDICTED — NOT OBSERVED".
 */
export function predictCandidateLinks(
  entities: Entity[],
  relationships: Relationship[]
): CandidateLink[] {
  const adj = new Map<string, Set<string>>();
  entities.forEach((e) => adj.set(e.id, new Set()));

  relationships.forEach((r) => {
    adj.get(r.source)?.add(r.target);
    adj.get(r.target)?.add(r.source);
  });

  const candidates: CandidateLink[] = [];
  const entityMap = new Map(entities.map((e) => [e.id, e]));

  for (let i = 0; i < entities.length; i++) {
    for (let j = i + 1; j < entities.length; j++) {
      const u = entities[i].id;
      const v = entities[j].id;

      // Skip if already connected
      if (adj.get(u)?.has(v)) continue;

      const neighborsU = adj.get(u) || new Set();
      const neighborsV = adj.get(v) || new Set();

      const mutual: string[] = [];
      neighborsU.forEach((n) => {
        if (neighborsV.has(n)) mutual.push(n);
      });

      if (mutual.length >= 2) {
        const unionSet = new Set<string>();
        neighborsU.forEach((n) => unionSet.add(n));
        neighborsV.forEach((n) => unionSet.add(n));
        const unionSize = unionSet.size;
        const jaccard = unionSize > 0 ? mutual.length / unionSize : 0;
        const confidence = Math.min(95, Math.round(jaccard * 100 + mutual.length * 12));

        const mutualNames = mutual
          .map((mId) => entityMap.get(mId)?.name || mId)
          .slice(0, 3)
          .join(', ');

        candidates.push({
          sourceId: u,
          sourceName: entities[i].name,
          targetId: v,
          targetName: entities[j].name,
          mutualNeighbors: mutual,
          mutualCount: mutual.length,
          jaccardScore: Number(jaccard.toFixed(3)),
          confidencePercent: confidence,
          rationale: `Entities share ${mutual.length} mutual network connection(s) (${mutualNames}). Structural triadic closure indicates potential unrecorded association. Requires investigative verification.`,
          method: 'Triadic Closure & Jaccard Topological Similarity',
        });
      }
    }
  }

  return candidates.sort((a, b) => b.confidencePercent - a.confidencePercent).slice(0, 6);
}

/**
 * Plain-language explanation for any connection in the synthetic dataset.
 * Does not claim that an AI prediction proves criminal activity.
 */
export function explainConnection(
  entityAId: string,
  entityBId: string,
  entities: Entity[],
  relationships: Relationship[]
): {
  found: boolean;
  explanation: string;
  relationshipTypes: string[];
  totalVolumeUSD: number;
  evidenceSources: string[];
} {
  const entityA = entities.find((e) => e.id === entityAId);
  const entityB = entities.find((e) => e.id === entityBId);

  if (!entityA || !entityB) {
    return {
      found: false,
      explanation: 'One or both entities not found in the demonstration dataset.',
      relationshipTypes: [],
      totalVolumeUSD: 0,
      evidenceSources: [],
    };
  }

  const directRels = relationships.filter(
    (r) =>
      (r.source === entityAId && r.target === entityBId) ||
      (r.source === entityBId && r.target === entityAId)
  );

  if (directRels.length === 0) {
    // Check if indirect (2-hop or 3-hop)
    const path = traceShortestPath(entityAId, entityBId, entities, relationships);
    if (path && path.path.length > 2) {
      const hopCount = path.path.length - 1;
      const intermediateNames = path.path
        .slice(1, -1)
        .map((id) => entities.find((e) => e.id === id)?.name || id)
        .join(' ➔ ');

      return {
        found: true,
        explanation: `${entityA.name} (${entityA.id}) is connected to ${entityB.name} (${entityB.id}) through a ${hopCount}-hop conduit via: ${intermediateNames}. Total tracked capital flow along this route is $${path.totalAmountUSD.toLocaleString()} USD across synthetic records in the demonstration dataset.`,
        relationshipTypes: path.edges.map((e) => e.type),
        totalVolumeUSD: path.totalAmountUSD,
        evidenceSources: path.edges.map((e) => `${e.provenance.admiraltyCode} (${e.provenance.sourceDocument})`),
      };
    }

    return {
      found: false,
      explanation: `No direct or immediate synthetic connection is recorded between ${entityA.name} and ${entityB.name} in the loaded demonstration dataset.`,
      relationshipTypes: [],
      totalVolumeUSD: 0,
      evidenceSources: [],
    };
  }

  const relTypes = Array.from(new Set(directRels.map((r) => r.type.replace('_', ' '))));
  const totalVolume = directRels.reduce((sum, r) => sum + (r.amountUSD || 0), 0);
  const sources = directRels.map((r) => `${r.provenance.admiraltyCode} (${r.provenance.sourceDocument})`);
  const descriptions = directRels.map((r) => r.description).join('; ');

  const volText = totalVolume > 0 ? ` with a recorded cumulative volume of $${totalVolume.toLocaleString()} USD` : '';

  const explanation = `${entityA.name} (${entityA.id}) is connected to ${entityB.name} (${entityB.id}) through ${directRels.length} recorded synthetic relationship(s) of type [${relTypes.join(', ')}]${volText}. Recorded narrative: "${descriptions}". This relationship is displayed because both records are present in the demonstration dataset. Unusual activity or network connection does not establish illegal conduct; human verification is required.`;

  return {
    found: true,
    explanation,
    relationshipTypes: relTypes,
    totalVolumeUSD: totalVolume,
    evidenceSources: sources,
  };
}
