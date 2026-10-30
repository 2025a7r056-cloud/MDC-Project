'use client';

import React, { useEffect, useRef, useState, useMemo } from 'react';
import cytoscape, { Core, NodeSingular, EdgeSingular } from 'cytoscape';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Search,
  Filter,
  Download,
  Eye,
  EyeOff,
  Route,
  Sparkles,
  Layers,
  X,
  SlidersHorizontal,
  Info,
  CheckCircle,
  ExternalLink,
  ChevronRight,
  ArrowRight,
  DollarSign,
  Calendar,
  ShieldAlert,
  FileText,
  HelpCircle,
} from 'lucide-react';
import { Entity, Relationship, EntityType, RelationshipType, VerificationStatus } from '@/types/intelligence';
import { traceShortestPath, explainConnection } from '@/lib/graphAnalytics';
import { useTheme } from '@/lib/themeContext';

interface NetworkGraphProps {
  entities: Entity[];
  relationships: Relationship[];
  onSelectEntity: (entityId: string) => void;
  selectedEntityId?: string | null;
  onSelectRelationship?: (rel: Relationship) => void;
}

export const NetworkGraph: React.FC<NetworkGraphProps> = ({
  entities,
  relationships,
  onSelectEntity,
  selectedEntityId,
  onSelectRelationship,
}) => {
  const { resolvedTheme } = useTheme();
  const isDark = resolvedTheme === 'dark';

  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<Core | null>(null);

  // UI state
  const [searchQuery, setSearchQuery] = useState('');
  const [showLabels, setShowLabels] = useState(true);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [selectedLayout, setSelectedLayout] = useState<'cose' | 'concentric' | 'circle' | 'breadthfirst'>('cose');
  const [activeCommunityCluster, setActiveCommunityCluster] = useState<number | 'all'>('all');

  // Shortest Path state
  const [pathSource, setPathSource] = useState<string>('');
  const [pathTarget, setPathTarget] = useState<string>('');
  const [shortestPathResult, setShortestPathResult] = useState<{ path: string[]; totalAmountUSD: number } | null>(null);
  const [isPathTracingMode, setIsPathTracingMode] = useState(false);

  // Connection Explainer Modal state
  const [explainingWithEntity, setExplainingWithEntity] = useState<Entity | null>(null);

  // Filter state
  const [typeFilters, setTypeFilters] = useState<Record<EntityType, boolean>>({
    person: true,
    corporation: true,
    crypto_wallet: true,
    burner_phone: true,
    bank_account: true,
    location: true,
    vessel: true,
  });

  const [relFilters, setRelFilters] = useState<Record<RelationshipType, boolean>>({
    financial_flow: true,
    ownership: true,
    communication: true,
    association: true,
    kinship: true,
    logistics: true,
  });

  const [minRiskScore, setMinRiskScore] = useState<number>(0);
  const [onlyVerified, setOnlyVerified] = useState<boolean>(false);

  // Highlight degree of separation (k-hops)
  const [highlightHops, setHighlightHops] = useState<number>(1);

  // Edge Inspector & Legend state
  const [inspectedRelationship, setInspectedRelationship] = useState<Relationship | null>(null);
  const [showLegendModal, setShowLegendModal] = useState<boolean>(false);

  // Inspector state
  const [inspectedNode, setInspectedNode] = useState<Entity | null>(null);

  // Distinct Node Shapes per entity taxonomy
  const NODE_SHAPES: Record<EntityType, string> = {
    person: 'ellipse',
    corporation: 'round-rectangle',
    crypto_wallet: 'hexagon',
    burner_phone: 'barrel',
    bank_account: 'diamond',
    location: 'triangle',
    vessel: 'pentagon',
  };

  // Color mapping based on black and beige luxury intelligence scheme
  const NODE_COLORS: Record<EntityType, { bg: string; border: string }> = {
    person: { bg: isDark ? '#c5b497' : '#0369a1', border: isDark ? '#f5eee2' : '#7dd3fc' }, // Warm champagne beige
    corporation: { bg: isDark ? '#8f8270' : '#4338ca', border: isDark ? '#ded0bc' : '#a5b4fc' }, // Warm taupe beige
    crypto_wallet: { bg: isDark ? '#c79d5e' : '#b45309', border: isDark ? '#f5d9aa' : '#fde68a' }, // Antique gold
    burner_phone: { bg: isDark ? '#b86b65' : '#be123c', border: isDark ? '#e8a5a0' : '#fda4af' }, // Terracotta rose
    bank_account: { bg: isDark ? '#6b8a75' : '#047857', border: isDark ? '#a8c7b1' : '#86efac' }, // Sage green
    location: { bg: isDark ? '#937896' : '#6d28d9', border: isDark ? '#cfbad1' : '#d8b4fe' }, // Muted lavender taupe
    vessel: { bg: isDark ? '#6d8a94' : '#0f766e', border: isDark ? '#aec7d0' : '#99f6e4' }, // Slate beige
  };

  const REL_COLORS: Record<RelationshipType, string> = {
    financial_flow: isDark ? '#e0be82' : '#f59e0b', // Champagne gold
    ownership: isDark ? '#cfc1ab' : '#818cf8', // Warm sand beige
    communication: isDark ? '#d4948f' : '#f43f5e', // Muted blush rose
    association: isDark ? '#8c8273' : '#94a3b8', // Muted taupe
    kinship: isDark ? '#bfaea1' : '#a78bfa', // Warm parchment
    logistics: isDark ? '#9dbab0' : '#06b6d4', // Soft sage
  };

  // Filtered dataset
  const filteredEntities = useMemo(() => {
    return entities.filter((e) => {
      if (!typeFilters[e.type]) return false;
      if (e.metrics.riskScore < minRiskScore) return false;
      if (onlyVerified && e.verificationStatus !== 'verified') return false;
      if (activeCommunityCluster !== 'all' && e.metrics.clusterId !== activeCommunityCluster) return false;
      return true;
    });
  }, [entities, typeFilters, minRiskScore, onlyVerified, activeCommunityCluster]);

  const filteredNodeIds = useMemo(() => new Set(filteredEntities.map((e) => e.id)), [filteredEntities]);

  const filteredRelationships = useMemo(() => {
    return relationships.filter((r) => {
      if (!relFilters[r.type]) return false;
      if (onlyVerified && r.verificationStatus !== 'verified') return false;
      // Both source and target must exist in filtered nodes
      return filteredNodeIds.has(r.source) && filteredNodeIds.has(r.target);
    });
  }, [relationships, relFilters, onlyVerified, filteredNodeIds]);

  // Connected fictional entities for inspected node
  const connectedItems = useMemo(() => {
    if (!inspectedNode) return [];
    const direct = relationships.filter(
      (r) => r.source === inspectedNode.id || r.target === inspectedNode.id
    );
    return direct.map((rel) => {
      const otherId = rel.source === inspectedNode.id ? rel.target : rel.source;
      const otherEntity = entities.find((e) => e.id === otherId);
      return {
        rel,
        otherId,
        otherName: otherEntity?.name || otherId,
        otherType: otherEntity?.type || 'unknown',
        otherEntity,
        isOutbound: rel.source === inspectedNode.id,
      };
    });
  }, [inspectedNode, relationships, entities]);

  // Initialize and update Cytoscape graph
  useEffect(() => {
    if (!containerRef.current) return;

    // Build elements
    const elements: cytoscape.ElementDefinition[] = [];

    // Add nodes
    filteredEntities.forEach((entity) => {
      const colors = NODE_COLORS[entity.type] || { bg: '#475569', border: '#94a3b8' };
      // Scale node size by degree centrality / betweenness
      const baseSize = 36 + Math.min(entity.metrics.degreeCentrality * 2.5, 30);

      elements.push({
        group: 'nodes',
        data: {
          id: entity.id,
          label: entity.name,
          subLabel: entity.id,
          type: entity.type,
          shape: NODE_SHAPES[entity.type] || 'ellipse',
          risk: entity.metrics.riskScore,
          bgColor: colors.bg,
          borderColor: colors.border,
          size: baseSize,
          cluster: entity.metrics.clusterId,
        },
      });
    });

    // Add edges
    filteredRelationships.forEach((rel) => {
      const edgeColor = REL_COLORS[rel.type] || '#475569';
      const edgeWidth = rel.amountUSD ? Math.max(2, Math.min(rel.amountUSD / 1500000, 7)) : 2;
      const lineStyle =
        rel.verificationStatus === 'hypothesis'
          ? 'dashed'
          : rel.verificationStatus === 'allegation'
          ? 'dotted'
          : 'solid';

      elements.push({
        group: 'edges',
        data: {
          id: rel.id,
          source: rel.source,
          target: rel.target,
          label: rel.amountUSD ? `$${(rel.amountUSD / 1000).toFixed(0)}k` : rel.label,
          type: rel.type,
          color: edgeColor,
          width: edgeWidth,
          lineStyle,
          verification: rel.verificationStatus,
        },
      });
    });

    // Initialize cytoscape instance
    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'shape': 'data(shape)' as any,
            'background-color': 'data(bgColor)',
            'border-color': 'data(borderColor)',
            'border-width': 2,
            'label': showLabels ? 'data(label)' : '',
            'color': isDark ? '#f5eedc' : '#0f172a',
            'font-family': 'monospace',
            'font-size': '10px',
            'font-weight': 600,
            'text-valign': 'bottom',
            'text-margin-y': 6,
            'text-background-color': isDark ? '#14120f' : '#ffffff',
            'text-background-opacity': 0.92,
            'text-background-padding': '3px',
            'text-background-shape': 'roundrectangle',
            'width': 'data(size)',
            'height': 'data(size)',
            'transition-property': 'background-color, border-color, width, height, border-width, opacity',
            'transition-duration': 0.2,
          },
        },
        {
          selector: 'node:selected',
          style: {
            'border-color': isDark ? '#f4ede1' : '#0284c7',
            'border-width': 4,
            'underlay-color': isDark ? '#dfd5bf' : '#38bdf8',
            'underlay-padding': 5,
            'underlay-opacity': 0.3,
          },
        },
        {
          selector: 'node.highlighted',
          style: {
            'border-color': isDark ? '#f4ede1' : '#0284c7',
            'border-width': 3,
            'underlay-color': isDark ? '#dfd5bf' : '#38bdf8',
            'underlay-padding': 4,
            'underlay-opacity': 0.28,
            'opacity': 1,
          },
        },
        {
          selector: 'node.dimmed',
          style: {
            'opacity': 0.15,
          },
        },
        {
          selector: 'edge',
          style: {
            'width': 'data(width)',
            'line-color': 'data(color)',
            'line-style': 'data(lineStyle)' as any,
            'target-arrow-color': 'data(color)',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            'opacity': isDark ? 0.75 : 0.8,
            'label': showLabels ? 'data(label)' : '',
            'font-family': 'monospace',
            'font-size': '9px',
            'color': isDark ? '#dfd5bf' : '#334155',
            'text-background-color': isDark ? '#14120f' : '#ffffff',
            'text-background-opacity': 0.88,
            'text-background-padding': '2px',
            'text-rotation': 'autorotate',
            'arrow-scale': 1.05,
          },
        },
        {
          selector: 'edge.highlighted',
          style: {
            'width': 4,
            'line-color': isDark ? '#f4ede1' : '#0284c7',
            'target-arrow-color': isDark ? '#f4ede1' : '#0284c7',
            'opacity': 1,
            'z-index': 999,
          },
        },
        {
          selector: 'edge.dimmed',
          style: {
            'opacity': 0.08,
          },
        },
      ] as any,
      layout: {
        name: selectedLayout,
        animate: true,
        animationDuration: 600,
        nodeRepulsion: 8000,
        idealEdgeLength: 120,
        padding: 50,
      },
      minZoom: 0.2,
      maxZoom: 3,
    });

    cyRef.current = cy;

    // Helper: Traverse k-hops and highlight
    const highlightHopsFromNode = (centerNode: NodeSingular, hops: number) => {
      cy.batch(() => {
        cy.elements().removeClass('highlighted direct-hop indirect-hop').addClass('dimmed');
        centerNode.removeClass('dimmed').addClass('highlighted');

        let currentLevel = centerNode;
        let visited = centerNode;
        let accumulatedEdges = cy.collection();

        for (let h = 1; h <= hops; h++) {
          const incidentEdges = currentLevel.connectedEdges();
          accumulatedEdges = accumulatedEdges.union(incidentEdges);
          const neighbors = incidentEdges.connectedNodes();
          const unvisited = neighbors.difference(visited);

          visited = visited.union(unvisited);
          currentLevel = unvisited;
        }

        visited.removeClass('dimmed').addClass('highlighted');
        accumulatedEdges.removeClass('dimmed').addClass('highlighted');
      });
    };

    // Event: Node Tap
    cy.on('tap', 'node', (evt) => {
      const node = evt.target as NodeSingular;
      const entityId = node.id();
      const entity = entities.find((e) => e.id === entityId) || null;
      setInspectedNode(entity);
      setInspectedRelationship(null);
      onSelectEntity(entityId);

      highlightHopsFromNode(node, highlightHops);
    });

    // Event: Edge Tap (Show Relationship Inspector)
    cy.on('tap', 'edge', (evt) => {
      const edge = evt.target as EdgeSingular;
      const relId = edge.id();
      const rel = relationships.find((r) => r.id === relId);
      if (rel) {
        setInspectedRelationship(rel);
        setInspectedNode(null);
        if (onSelectRelationship) {
          onSelectRelationship(rel);
        }

        cy.batch(() => {
          cy.elements().removeClass('highlighted').addClass('dimmed');
          edge.removeClass('dimmed').addClass('highlighted');
          edge.connectedNodes().removeClass('dimmed').addClass('highlighted');
        });
      }
    });

    // Event: Canvas Tap (clear highlights)
    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        cy.elements().removeClass('highlighted dimmed');
        setInspectedNode(null);
        setInspectedRelationship(null);
      }
    });

    return () => {
      cy.destroy();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [filteredEntities, filteredRelationships, selectedLayout, showLabels, resolvedTheme]);

  // When selectedEntityId changes externally, focus on it
  useEffect(() => {
    if (!cyRef.current || !selectedEntityId) return;
    const cy = cyRef.current;
    const targetNode = cy.$(`node#${selectedEntityId}`);
    if (targetNode.length > 0) {
      cy.animate({
        center: { eles: targetNode },
        zoom: 1.4,
        duration: 500,
      });
      const entity = entities.find((e) => e.id === selectedEntityId) || null;
      setInspectedNode(entity);

      cy.batch(() => {
        cy.elements().removeClass('highlighted').addClass('dimmed');
        targetNode.removeClass('dimmed').addClass('highlighted');
        targetNode.connectedEdges().removeClass('dimmed').addClass('highlighted');
        targetNode.neighborhood().nodes().removeClass('dimmed').addClass('highlighted');
      });
    }
  }, [selectedEntityId, entities]);

  // Dynamically update neighborhood highlighting when highlightHops changes
  useEffect(() => {
    if (!cyRef.current || !inspectedNode) return;
    const cy = cyRef.current;
    const centerNode = cy.$(`node#${inspectedNode.id}`);
    if (centerNode.length === 0) return;

    cy.batch(() => {
      cy.elements().removeClass('highlighted direct-hop indirect-hop').addClass('dimmed');
      centerNode.removeClass('dimmed').addClass('highlighted');

      let currentLevel = centerNode;
      let visited = centerNode;
      let accumulatedEdges = cy.collection();

      for (let h = 1; h <= highlightHops; h++) {
        const incidentEdges = currentLevel.connectedEdges();
        accumulatedEdges = accumulatedEdges.union(incidentEdges);
        const neighbors = incidentEdges.connectedNodes();
        const unvisited = neighbors.difference(visited);

        visited = visited.union(unvisited);
        currentLevel = unvisited;
      }

      visited.removeClass('dimmed').addClass('highlighted');
      accumulatedEdges.removeClass('dimmed').addClass('highlighted');
    });
  }, [highlightHops, inspectedNode]);

  // Zoom and View Controls
  const handleZoomIn = () => cyRef.current?.zoom(cyRef.current.zoom() * 1.3);
  const handleZoomOut = () => cyRef.current?.zoom(cyRef.current.zoom() * 0.7);
  const handleFit = () => cyRef.current?.fit(undefined, 40);
  const handleReset = () => {
    if (!cyRef.current) return;
    cyRef.current.elements().removeClass('highlighted dimmed');
    cyRef.current.fit(undefined, 40);
    setInspectedNode(null);
    setShortestPathResult(null);
  };

  // Shortest Path Finder
  const handleRunShortestPath = () => {
    if (!pathSource || !pathTarget || !cyRef.current) return;
    const result = traceShortestPath(pathSource, pathTarget, entities, relationships);

    if (result && result.path.length > 0) {
      setShortestPathResult(result);
      const cy = cyRef.current;
      cy.batch(() => {
        cy.elements().removeClass('highlighted').addClass('dimmed');
        result.path.forEach((id) => {
          cy.$(`node#${id}`).removeClass('dimmed').addClass('highlighted');
        });
        result.edges.forEach((edge) => {
          cy.$(`edge#${edge.id}`).removeClass('dimmed').addClass('highlighted');
        });
      });
    } else {
      alert(`No connected path exists between ${pathSource} and ${pathTarget} in current graph.`);
      setShortestPathResult(null);
    }
  };

  // Export Graph Data
  const handleExportJSON = () => {
    const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(
      JSON.stringify({ entities: filteredEntities, relationships: filteredRelationships }, null, 2)
    );
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute('href', dataStr);
    downloadAnchor.setAttribute('download', 'crimegraph_investigation_export.json');
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const handleExportCSV = () => {
    const headers = 'ID,Name,Type,Role,Jurisdiction,RiskScore,DegreeCentrality\n';
    const rows = filteredEntities.map(
      (e) => `"${e.id}","${e.name}","${e.type}","${e.role}","${e.jurisdiction}",${e.metrics.riskScore},${e.metrics.degreeCentrality}`
    ).join('\n');
    const blob = new Blob([headers + rows], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('href', url);
    a.setAttribute('download', 'crimegraph_entities.csv');
    a.click();
  };

  return (
    <div className="relative w-full h-[calc(100vh-4rem)] bg-slate-100 dark:bg-navy-950 overflow-hidden flex transition-colors">
      {/* Cytoscape Canvas Area */}
      <div className="relative flex-1 h-full">
        <div ref={containerRef} className="w-full h-full cytoscape-container" />

        {/* Floating Top Control HUD */}
        <div className="absolute top-4 left-4 flex flex-wrap items-center gap-2 z-20">
          {/* Quick Node Search */}
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Find entity by ID/name..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                if (cyRef.current && e.target.value.trim().length > 1) {
                  const q = e.target.value.toLowerCase();
                  const match = entities.find(
                    (item) => item.name.toLowerCase().includes(q) || item.id.toLowerCase().includes(q)
                  );
                  if (match) {
                    onSelectEntity(match.id);
                  }
                }
              }}
              className="bg-white/95 dark:bg-navy-900/90 border border-slate-300 dark:border-slate-700/80 rounded-lg pl-8 pr-3 py-1.5 text-xs text-slate-900 dark:text-slate-200 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none focus:border-cyan w-52 font-mono shadow-sm dark:shadow-hud backdrop-blur-md"
            />
          </div>

          {/* Layout Selector */}
          <select
            value={selectedLayout}
            onChange={(e) => setSelectedLayout(e.target.value as any)}
            className="bg-white/95 dark:bg-navy-900/90 border border-slate-300 dark:border-slate-700/80 rounded-lg px-2.5 py-1.5 text-xs text-slate-800 dark:text-slate-300 font-mono focus:outline-none focus:border-cyan backdrop-blur-md cursor-pointer shadow-sm"
          >
            <option value="cose">Organic Layout</option>
            <option value="concentric">Concentric Rings</option>
            <option value="circle">Circle View</option>
            <option value="breadthfirst">Hierarchy Tree</option>
          </select>

          {/* Toggle Labels */}
          <button
            onClick={() => setShowLabels(!showLabels)}
            className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 backdrop-blur-md transition shadow-sm ${
              showLabels
                ? 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-500/50 text-cyan-600 dark:text-cyan-bright'
                : 'bg-white/95 dark:bg-navy-900/90 border-slate-300 dark:border-slate-700/80 text-slate-600 dark:text-slate-400'
            }`}
            title="Toggle Relationship & Node Labels"
          >
            {showLabels ? <Eye className="w-3.5 h-3.5" /> : <EyeOff className="w-3.5 h-3.5" />}
            <span className="text-[11px] hidden sm:inline">Labels</span>
          </button>

          {/* Shortest Path Finder Toggle */}
          <button
            onClick={() => setIsPathTracingMode(!isPathTracingMode)}
            className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 backdrop-blur-md transition shadow-sm ${
              isPathTracingMode
                ? 'bg-amber-50 dark:bg-amber-950/70 border-amber-500/50 text-amber-600 dark:text-amber-300'
                : 'bg-white/95 dark:bg-navy-900/90 border-slate-300 dark:border-slate-700/80 text-slate-600 dark:text-slate-400'
            }`}
            title="Trace Shortest Money Flow / Connection Path"
          >
            <Route className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">Path Finder</span>
          </button>

          {/* Filters Button */}
          <button
            onClick={() => setShowFilterDrawer(!showFilterDrawer)}
            className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 backdrop-blur-md transition shadow-sm ${
              showFilterDrawer
                ? 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-500/50 text-cyan-600 dark:text-cyan-bright'
                : 'bg-white/95 dark:bg-navy-900/90 border-slate-300 dark:border-slate-700/80 text-slate-600 dark:text-slate-400'
            }`}
          >
            <SlidersHorizontal className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">Filters</span>
          </button>

          {/* Degrees of Separation (k-Hops) Selector */}
          <div className="flex items-center gap-1 bg-white/95 dark:bg-navy-900/90 border border-slate-300 dark:border-slate-700/80 rounded-lg p-1 backdrop-blur-md shadow-sm">
            <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 px-1 hidden sm:inline">Hops:</span>
            {[1, 2, 3].map((hop) => (
              <button
                key={hop}
                onClick={() => setHighlightHops(hop)}
                className={`px-2 py-0.5 rounded text-[11px] font-mono font-bold transition ${
                  highlightHops === hop
                    ? 'bg-amber-500/20 text-amber-600 dark:text-amber-300 border border-amber-500/50'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white'
                }`}
                title={`Highlight ${hop} degree(s) of separation`}
              >
                {hop}
              </button>
            ))}
          </div>

          {/* Visual Legend Button */}
          <button
            onClick={() => setShowLegendModal(!showLegendModal)}
            className={`p-1.5 rounded-lg border text-xs font-mono flex items-center gap-1.5 backdrop-blur-md transition shadow-sm ${
              showLegendModal
                ? 'bg-cyan-50 dark:bg-cyan-950/70 border-cyan-500/50 text-cyan-600 dark:text-cyan-bright'
                : 'bg-white/95 dark:bg-navy-900/90 border-slate-300 dark:border-slate-700/80 text-slate-600 dark:text-slate-400'
            }`}
            title="Visual Legend & Symbology Guide"
          >
            <Layers className="w-3.5 h-3.5" />
            <span className="text-[11px] hidden sm:inline">Legend</span>
          </button>
        </div>

        {/* Shortest Path Finder Bar (when active) */}
        {isPathTracingMode && (
          <div className="absolute top-16 left-4 z-20 bg-white/95 dark:bg-navy-900/95 border border-amber-500/40 rounded-xl p-3 shadow-xl backdrop-blur-md max-w-lg space-y-2">
            <div className="flex items-center justify-between text-xs font-mono text-amber-600 dark:text-amber-300">
              <span className="flex items-center gap-1.5 font-bold">
                <Route className="w-4 h-4 text-amber-500 dark:text-amber-400" /> Find Connection Path
              </span>
              <button
                onClick={() => setIsPathTracingMode(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="flex items-center gap-2 text-xs">
              <select
                value={pathSource}
                onChange={(e) => setPathSource(e.target.value)}
                className="bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-slate-200 text-xs font-mono flex-1"
              >
                <option value="">Select Origin Entity...</option>
                {entities.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.id} - {e.name}
                  </option>
                ))}
              </select>

              <span className="text-slate-500 font-mono">→</span>

              <select
                value={pathTarget}
                onChange={(e) => setPathTarget(e.target.value)}
                className="bg-slate-50 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 rounded px-2 py-1 text-slate-900 dark:text-slate-200 text-xs font-mono flex-1"
              >
                <option value="">Select Target Entity...</option>
                {entities.map((e) => (
                  <option key={e.id} value={e.id}>
                    {e.id} - {e.name}
                  </option>
                ))}
              </select>

              <button
                onClick={handleRunShortestPath}
                disabled={!pathSource || !pathTarget}
                className="px-3 py-1 bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold rounded text-xs transition disabled:opacity-50"
              >
                Trace
              </button>
            </div>

            {shortestPathResult && (
              <div className="pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] font-mono text-slate-700 dark:text-slate-300 flex items-center justify-between">
                <span>
                  Hops: <strong className="text-cyan-600 dark:text-cyan-bright">{shortestPathResult.path.length - 1}</strong>
                </span>
                <span>
                  Tracked Flow: <strong className="text-amber-600 dark:text-amber-400">${(shortestPathResult.totalAmountUSD / 1000).toLocaleString()}k USD</strong>
                </span>
              </div>
            )}
          </div>
        )}

        {/* Floating Zoom & Canvas Controls on Right */}
        <div className="absolute right-4 top-4 flex flex-col gap-1.5 z-20">
          <button
            onClick={handleZoomIn}
            className="p-2 rounded-lg bg-white/95 dark:bg-navy-900/90 border border-slate-300 dark:border-slate-700 hover:border-cyan text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white backdrop-blur-md shadow-sm dark:shadow-hud transition"
            title="Zoom In"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <button
            onClick={handleZoomOut}
            className="p-2 rounded-lg bg-white/95 dark:bg-navy-900/90 border border-slate-300 dark:border-slate-700 hover:border-cyan text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white backdrop-blur-md shadow-sm dark:shadow-hud transition"
            title="Zoom Out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <button
            onClick={handleFit}
            className="p-2 rounded-lg bg-white/95 dark:bg-navy-900/90 border border-slate-300 dark:border-slate-700 hover:border-cyan text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white backdrop-blur-md shadow-sm dark:shadow-hud transition"
            title="Fit to Screen"
          >
            <Maximize2 className="w-4 h-4" />
          </button>
          <button
            onClick={handleReset}
            className="p-2 rounded-lg bg-white/95 dark:bg-navy-900/90 border border-slate-300 dark:border-slate-700 hover:border-cyan text-slate-700 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white backdrop-blur-md shadow-sm dark:shadow-hud transition"
            title="Reset Graph Selection"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          {/* Export Dropdown / Buttons */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800/80 flex flex-col gap-1">
            <button
              onClick={handleExportJSON}
              className="p-2 rounded-lg bg-white/95 dark:bg-navy-900/90 border border-slate-300 dark:border-slate-700 hover:border-purple-500 text-purple-600 dark:text-purple-300 backdrop-blur-md shadow-sm dark:shadow-hud transition text-[10px] font-mono font-semibold"
              title="Export Graph to JSON"
            >
              JSON
            </button>
            <button
              onClick={handleExportCSV}
              className="p-2 rounded-lg bg-white/95 dark:bg-navy-900/90 border border-slate-300 dark:border-slate-700 hover:border-cyan-500 text-cyan-600 dark:text-cyan-bright backdrop-blur-md shadow-sm dark:shadow-hud transition text-[10px] font-mono font-semibold"
              title="Export Entities to CSV"
            >
              CSV
            </button>
          </div>
        </div>

        {/* Tactical Legend at Bottom Left */}
        <div className="absolute bottom-4 left-4 z-20 bg-white/95 dark:bg-navy-900/90 border border-slate-200 dark:border-slate-800 rounded-lg p-2.5 backdrop-blur-md text-[10px] font-mono hidden md:block shadow-md">
          <div className="text-slate-500 dark:text-slate-400 font-semibold mb-1 uppercase tracking-wider">Node Legend</div>
          <div className="grid grid-cols-2 gap-x-3 gap-y-1">
            {Object.entries(NODE_COLORS).map(([type, colors]) => (
              <div key={type} className="flex items-center gap-1.5">
                <span
                  className="w-2.5 h-2.5 rounded-full border"
                  style={{ backgroundColor: colors.bg, borderColor: colors.border }}
                ></span>
                <span className="text-slate-700 dark:text-slate-300 capitalize">{type.replace('_', ' ')}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Filter Drawer (Slides from Left or Top) */}
        {showFilterDrawer && (
          <div className="absolute top-16 left-4 bottom-4 w-72 bg-white/95 dark:bg-navy-900/95 border border-slate-200 dark:border-slate-700 rounded-xl p-4 z-30 shadow-2xl backdrop-blur-md overflow-y-auto space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-200 dark:border-slate-800">
              <span className="text-xs font-mono font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider flex items-center gap-1.5">
                <SlidersHorizontal className="w-3.5 h-3.5 text-cyan" /> Graph Filters
              </span>
              <button
                onClick={() => setShowFilterDrawer(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Entity Type Toggles */}
            <div className="space-y-1.5">
              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 font-mono">Entity Types</div>
              {Object.keys(typeFilters).map((typeKey) => {
                const key = typeKey as EntityType;
                return (
                  <label
                    key={key}
                    className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <span className="capitalize">{key.replace('_', ' ')}</span>
                    <input
                      type="checkbox"
                      checked={typeFilters[key]}
                      onChange={(e) => setTypeFilters({ ...typeFilters, [key]: e.target.checked })}
                      className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-cyan focus:ring-0"
                    />
                  </label>
                );
              })}
            </div>

            {/* Relationship Types */}
            <div className="space-y-1.5 pt-2 border-t border-slate-200 dark:border-slate-800">
              <div className="text-[11px] font-semibold text-slate-700 dark:text-slate-300 font-mono">Relationship Types</div>
              {Object.keys(relFilters).map((relKey) => {
                const key = relKey as RelationshipType;
                return (
                  <label
                    key={key}
                    className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-200 cursor-pointer"
                  >
                    <span className="capitalize">{key.replace('_', ' ')}</span>
                    <input
                      type="checkbox"
                      checked={relFilters[key]}
                      onChange={(e) => setRelFilters({ ...relFilters, [key]: e.target.checked })}
                      className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-cyan focus:ring-0"
                    />
                  </label>
                );
              })}
            </div>

            {/* Minimum Risk Slider */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800 space-y-1">
              <div className="flex justify-between text-[11px] font-mono">
                <span className="text-slate-700 dark:text-slate-300">Min Risk Score:</span>
                <span className="text-cyan-600 dark:text-cyan-bright font-bold">{minRiskScore}</span>
              </div>
              <input
                type="range"
                min="0"
                max="95"
                step="5"
                value={minRiskScore}
                onChange={(e) => setMinRiskScore(Number(e.target.value))}
                className="w-full accent-cyan"
              />
            </div>

            {/* Verification Status */}
            <div className="pt-2 border-t border-slate-200 dark:border-slate-800">
              <label className="flex items-center justify-between text-xs text-slate-700 dark:text-slate-300 cursor-pointer">
                <span>Verified Facts Only (Admiralty A1)</span>
                <input
                  type="checkbox"
                  checked={onlyVerified}
                  onChange={(e) => setOnlyVerified(e.target.checked)}
                  className="rounded border-slate-300 dark:border-slate-700 bg-white dark:bg-navy-950 text-cyan focus:ring-0"
                />
              </label>
            </div>

            {/* Reset Filters */}
            <button
              onClick={() => {
                setTypeFilters({
                  person: true,
                  corporation: true,
                  crypto_wallet: true,
                  burner_phone: true,
                  bank_account: true,
                  location: true,
                  vessel: true,
                });
                setRelFilters({
                  financial_flow: true,
                  ownership: true,
                  communication: true,
                  association: true,
                  kinship: true,
                  logistics: true,
                });
                setMinRiskScore(0);
                setOnlyVerified(false);
              }}
              className="w-full py-1.5 rounded bg-slate-200 dark:bg-slate-800 hover:bg-slate-300 dark:hover:bg-slate-700 text-xs font-mono text-slate-700 dark:text-slate-300 transition"
            >
              Reset All Filters
            </button>
          </div>
        )}
      </div>

      {/* Node Detail Inspector Drawer on Right */}
      {inspectedNode && (
        <div className="w-80 md:w-96 h-full bg-white dark:bg-navy-900 border-l border-slate-200 dark:border-slate-800 p-5 overflow-y-auto space-y-4 z-30 shadow-2xl animate-in slide-in-from-right duration-200">
          <div className="flex items-start justify-between">
            <div>
              <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-100 dark:bg-cyan-950 border border-cyan-500/40 text-cyan-700 dark:text-cyan-bright">
                {inspectedNode.id}
              </span>
              <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1">{inspectedNode.name}</h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 capitalize">{inspectedNode.role}</p>
            </div>
            <button
              onClick={() => setInspectedNode(null)}
              className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Risk & Verification Indicators */}
          <div className="grid grid-cols-2 gap-2">
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Risk Level</span>
              <div className="text-sm font-bold font-mono text-red-500 dark:text-red-400 mt-0.5 capitalize flex items-center justify-between">
                <span>{inspectedNode.riskLevel}</span>
                <span className="text-xs px-1.5 py-0.2 rounded bg-red-100 dark:bg-red-950 border border-red-500/30">
                  {inspectedNode.metrics.riskScore}/100
                </span>
              </div>
            </div>

            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
              <span className="text-[10px] font-mono text-slate-500 dark:text-slate-400 uppercase">Verification</span>
              <div className="text-sm font-bold font-mono text-cyan-600 dark:text-cyan-bright mt-0.5 capitalize">
                {inspectedNode.verificationStatus}
              </div>
            </div>
          </div>

          {/* Centrality & Graph Metrics */}
          <div className="p-3 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
            <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan uppercase font-semibold">
              Forensic Graph Metrics
            </span>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div>
                <span className="text-slate-500 text-[10px] block">Degree Centrality:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">{inspectedNode.metrics.degreeCentrality}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Betweenness:</span>
                <span className="text-purple-600 dark:text-purple-400 font-bold">{inspectedNode.metrics.betweennessCentrality}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Cluster Group:</span>
                <span className="text-slate-800 dark:text-slate-200 font-bold">Cell #{inspectedNode.metrics.clusterId}</span>
              </div>
              <div>
                <span className="text-slate-500 text-[10px] block">Tracked Volume:</span>
                <span className="text-amber-600 dark:text-amber-400 font-bold">
                  ${(inspectedNode.metrics.totalFlowVolumeUSD / 1000000).toFixed(2)}M
                </span>
              </div>
            </div>
          </div>

          {/* Executive Summary */}
          <div>
            <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono uppercase mb-1">
              Investigative Brief
            </h4>
            <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-navy-950/60 p-2.5 rounded border border-slate-200 dark:border-slate-800/80">
              {inspectedNode.summary}
            </p>
          </div>

          {/* First Seen & Last Seen Timestamps */}
          <div className="grid grid-cols-2 gap-2 text-[11px] font-mono p-2.5 rounded bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
            <div>
              <span className="text-slate-500 text-[10px] block">First Seen:</span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">{inspectedNode.firstSeen || '2023-01-15'}</span>
            </div>
            <div>
              <span className="text-slate-500 text-[10px] block">Last Seen:</span>
              <span className="text-slate-700 dark:text-slate-300 font-semibold">{inspectedNode.lastSeen || '2026-10-18'}</span>
            </div>
          </div>

          {/* Admiralty Provenance Source */}
          <div className="p-2.5 rounded bg-slate-100 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono space-y-1">
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Provenance Code:</span>
              <span className="text-cyan-600 dark:text-cyan-bright font-bold">{inspectedNode.provenance.admiraltyCode}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Source Type:</span>
              <span className="capitalize text-slate-800 dark:text-slate-300">{inspectedNode.provenance.sourceType.replace('_', ' ')}</span>
            </div>
            <div className="flex justify-between text-slate-600 dark:text-slate-400">
              <span>Collecting Agency:</span>
              <span className="text-slate-800 dark:text-slate-300">{inspectedNode.provenance.collectorAgency}</span>
            </div>
          </div>

          {/* Recorded Relationships & Connection Explainer */}
          <div className="space-y-2 pt-1 border-t border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between">
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono uppercase">
                Recorded Relationships ({connectedItems.length})
              </h4>
              {connectedItems.length > 0 && (
                <button
                  onClick={() => {
                    if (connectedItems[0].otherEntity) {
                      setExplainingWithEntity(connectedItems[0].otherEntity);
                    }
                  }}
                  className="text-[10px] font-mono text-cyan-600 dark:text-cyan-bright hover:underline flex items-center gap-1 font-semibold"
                >
                  <Sparkles className="w-3 h-3" /> Explain First Link
                </button>
              )}
            </div>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {connectedItems.map((item, idx) => (
                <div
                  key={idx}
                  className="p-2 rounded bg-slate-50 dark:bg-navy-950/80 border border-slate-200 dark:border-slate-800/80 text-[11px] space-y-1"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-semibold text-slate-900 dark:text-slate-100 truncate max-w-[170px]">
                      {item.otherName}
                    </span>
                    <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-200 dark:bg-slate-800 text-slate-700 dark:text-slate-300 uppercase">
                      {item.rel.type.replace('_', ' ')}
                    </span>
                  </div>
                  <p className="text-[10px] text-slate-500 dark:text-slate-400 line-clamp-2">
                    {item.rel.description}
                  </p>
                  <div className="flex items-center justify-between pt-1">
                    <span className="text-[9px] font-mono text-slate-400">
                      {item.rel.amountUSD ? `$${item.rel.amountUSD.toLocaleString()} USD` : 'Non-monetary conduit'}
                    </span>
                    <button
                      onClick={() => {
                        if (item.otherEntity) {
                          setExplainingWithEntity(item.otherEntity);
                        }
                      }}
                      className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-50 dark:bg-navy-800 text-cyan-700 dark:text-cyan-bright hover:bg-cyan-100 dark:hover:bg-navy-700 border border-cyan-300 dark:border-cyan-700/50 transition font-bold"
                    >
                      Explain This Connection
                    </button>
                  </div>
                </div>
              ))}
              {connectedItems.length === 0 && (
                <p className="text-[11px] font-mono text-slate-400 italic">No direct relationships recorded in current filter view.</p>
              )}
            </div>
          </div>

          {/* Risk Factors Breakdown */}
          {inspectedNode.metrics.explainableRiskFactors && (
            <div className="space-y-1.5">
              <span className="text-[10px] font-mono uppercase text-red-500 dark:text-red-400 font-semibold">
                Risk Contributing Factors
              </span>
              <div className="space-y-1">
                {inspectedNode.metrics.explainableRiskFactors.map((factor, i) => (
                  <div key={i} className="text-[11px] p-2 rounded bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-500/20">
                    <div className="font-semibold text-red-600 dark:text-red-300 flex justify-between">
                      <span>{factor.factor}</span>
                      <span className="font-mono">+{factor.weight}%</span>
                    </div>
                    <p className="text-[10px] text-slate-600 dark:text-slate-400 mt-0.5">{factor.description}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Quick Action: Set as Source/Target for Shortest Path */}
          <div className="pt-2 border-t border-slate-200 dark:border-slate-800 flex gap-2">
            <button
              onClick={() => {
                setPathSource(inspectedNode.id);
                setIsPathTracingMode(true);
              }}
              className="flex-1 py-1.5 rounded bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 hover:border-amber-500 text-[11px] font-mono text-amber-600 dark:text-amber-300 transition font-semibold"
            >
              Set as Path Start
            </button>
            <button
              onClick={() => {
                setPathTarget(inspectedNode.id);
                setIsPathTracingMode(true);
              }}
              className="flex-1 py-1.5 rounded bg-slate-100 dark:bg-navy-950 border border-slate-300 dark:border-slate-700 hover:border-cyan-500 text-[11px] font-mono text-cyan-600 dark:text-cyan-bright transition font-semibold"
            >
              Set as Path End
            </button>
          </div>
        </div>
      )}

      {/* Edge Detail Inspector Drawer on Right */}
      {inspectedRelationship && (() => {
        const sourceEntity = entities.find((e) => e.id === inspectedRelationship.source);
        const targetEntity = entities.find((e) => e.id === inspectedRelationship.target);
        return (
          <div className="w-80 md:w-96 h-full bg-white dark:bg-navy-900 border-l border-slate-200 dark:border-slate-800 p-5 overflow-y-auto space-y-4 z-30 shadow-2xl animate-in slide-in-from-right duration-200">
            <div className="flex items-start justify-between">
              <div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-100 dark:bg-amber-950/80 border border-amber-500/40 text-amber-700 dark:text-amber-300">
                  {inspectedRelationship.id}
                </span>
                <h3 className="text-base font-bold text-slate-900 dark:text-slate-100 mt-1 capitalize">
                  {inspectedRelationship.type.replace('_', ' ')}
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 font-mono">
                  {inspectedRelationship.label}
                </p>
              </div>
              <button
                onClick={() => setInspectedRelationship(null)}
                className="p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Relationship Directional Flow */}
            <div className="p-3 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 space-y-2">
              <span className="text-[10px] font-mono uppercase text-slate-500 dark:text-slate-400 font-semibold">
                Connection Direction &amp; Endpoints
              </span>
              <div className="space-y-2">
                <div 
                  onClick={() => sourceEntity && onSelectEntity(sourceEntity.id)}
                  className="p-2 rounded bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800/80 hover:border-cyan-500 cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">Origin Node</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {sourceEntity?.name || inspectedRelationship.source}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-bright capitalize">
                    {sourceEntity?.type.replace('_', ' ') || 'Entity'}
                  </span>
                </div>

                <div className="flex justify-center text-slate-400">
                  <ArrowRight className="w-4 h-4 text-cyan-500 rotate-90 sm:rotate-0" />
                </div>

                <div 
                  onClick={() => targetEntity && onSelectEntity(targetEntity.id)}
                  className="p-2 rounded bg-white dark:bg-navy-900 border border-slate-200 dark:border-slate-800/80 hover:border-cyan-500 cursor-pointer transition flex items-center justify-between"
                >
                  <div>
                    <span className="text-[9px] font-mono text-slate-400 block uppercase">Target Node</span>
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 font-mono">
                      {targetEntity?.name || inspectedRelationship.target}
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-cyan-600 dark:text-cyan-bright capitalize">
                    {targetEntity?.type.replace('_', ' ') || 'Entity'}
                  </span>
                </div>
              </div>
            </div>

            {/* Financial / Quantitative Details */}
            {inspectedRelationship.amountUSD !== undefined && (
              <div className="p-3 rounded-lg bg-emerald-50/70 dark:bg-emerald-950/20 border border-emerald-300 dark:border-emerald-600/30 space-y-1">
                <span className="text-[10px] font-mono text-emerald-700 dark:text-emerald-400 uppercase font-semibold flex items-center gap-1">
                  <DollarSign className="w-3 h-3" /> Transferred Amount
                </span>
                <div className="text-lg font-bold font-mono text-emerald-600 dark:text-emerald-300">
                  ${inspectedRelationship.amountUSD.toLocaleString()} USD
                </div>
                {inspectedRelationship.transactionCount && (
                  <p className="text-[11px] font-mono text-slate-500 dark:text-slate-400">
                    Aggregation of {inspectedRelationship.transactionCount} linked transaction records
                  </p>
                )}
              </div>
            )}

            {/* Verification Status & Provenance */}
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">Verification</span>
                <div className="text-xs font-bold text-cyan-600 dark:text-cyan-bright mt-0.5 capitalize flex items-center gap-1">
                  <span className={`w-2 h-2 rounded-full ${
                    inspectedRelationship.verificationStatus === 'verified_fact' ? 'bg-emerald-500' :
                    inspectedRelationship.verificationStatus === 'hypothesis' ? 'bg-amber-500' : 'bg-cyan-500'
                  }`} />
                  {inspectedRelationship.verificationStatus.replace('_', ' ')}
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800">
                <span className="text-[10px] text-slate-500 dark:text-slate-400 uppercase block">Admiralty Code</span>
                <div className="text-xs font-bold text-slate-800 dark:text-slate-200 mt-0.5">
                  {inspectedRelationship.admiraltyCode || 'B2 (Reliable)'}
                </div>
              </div>
            </div>

            {/* Timeline */}
            <div className="p-2.5 rounded-lg bg-slate-50 dark:bg-navy-950 border border-slate-200 dark:border-slate-800 text-[11px] font-mono space-y-1">
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>First Observed:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{inspectedRelationship.firstSeen || inspectedRelationship.firstObserved || '2023-04-12'}</span>
              </div>
              <div className="flex justify-between text-slate-600 dark:text-slate-400">
                <span>Last Observed:</span>
                <span className="font-semibold text-slate-800 dark:text-slate-200">{inspectedRelationship.lastSeen || inspectedRelationship.lastObserved || '2026-08-30'}</span>
              </div>
              {(inspectedRelationship.collectorAgency || inspectedRelationship.provenance?.collectorAgency) && (
                <div className="flex justify-between text-slate-600 dark:text-slate-400 pt-1 border-t border-slate-200 dark:border-slate-800">
                  <span>Reporting Agency:</span>
                  <span className="font-semibold text-slate-800 dark:text-slate-200">{inspectedRelationship.collectorAgency || inspectedRelationship.provenance?.collectorAgency}</span>
                </div>
              )}
            </div>

            {/* Relationship Narrative */}
            <div>
              <h4 className="text-xs font-semibold text-slate-700 dark:text-slate-300 font-mono uppercase mb-1">
                Evidence Dossier
              </h4>
              <p className="text-xs text-slate-600 dark:text-slate-400 leading-relaxed bg-slate-50 dark:bg-navy-950/60 p-2.5 rounded border border-slate-200 dark:border-slate-800/80">
                {inspectedRelationship.description}
              </p>
            </div>
          </div>
        );
      })()}

      {/* Visual Symbology Legend Modal */}
      {showLegendModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-[#14120f] border border-slate-200 dark:border-[#2f2a23] rounded-xl p-6 max-w-xl w-full shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-150 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-amber-500 dark:text-[#dfd5bf]" />
                <h3 className="text-base font-bold text-slate-900 dark:text-[#f4ede1] font-mono">
                  Visual Symbology &amp; Taxonomy Guide
                </h3>
              </div>
              <button
                onClick={() => setShowLegendModal(false)}
                className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Node Shapes & Taxonomy */}
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-bold mb-2">
                Entity Taxonomy (Node Shapes)
              </h4>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] flex items-center gap-3">
                  <div className="w-6 h-6 rounded-full border-2 border-cyan-500 bg-cyan-500/20 flex items-center justify-center text-[10px] font-bold">O</div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-[#dfd5bf]">Person</span>
                    <span className="text-[10px] text-slate-500 block">Circle / Ellipse</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] flex items-center gap-3">
                  <div className="w-6 h-6 rounded-md border-2 border-indigo-500 bg-indigo-500/20 flex items-center justify-center text-[10px] font-bold">□</div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-[#dfd5bf]">Corporation / Shell</span>
                    <span className="text-[10px] text-slate-500 block">Round Rectangle</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] flex items-center gap-3">
                  <div className="w-6 h-6 rotate-45 border-2 border-emerald-500 bg-emerald-500/20 flex items-center justify-center text-[10px] font-bold">◇</div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-[#dfd5bf]">Bank Account</span>
                    <span className="text-[10px] text-slate-500 block">Diamond</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-amber-500 bg-amber-500/20 flex items-center justify-center text-[10px] font-bold">⬡</div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-[#dfd5bf]">Crypto Wallet</span>
                    <span className="text-[10px] text-slate-500 block">Hexagon</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] flex items-center gap-3">
                  <div className="w-6 h-6 rounded-lg border-2 border-orange-500 bg-orange-500/20 flex items-center justify-center text-[10px] font-bold">[]</div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-[#dfd5bf]">Burner Phone / SIM</span>
                    <span className="text-[10px] text-slate-500 block">Barrel</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-red-500 bg-red-500/20 flex items-center justify-center text-[10px] font-bold">△</div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-[#dfd5bf]">Physical Location</span>
                    <span className="text-[10px] text-slate-500 block">Triangle</span>
                  </div>
                </div>

                <div className="p-2.5 rounded bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] flex items-center gap-3">
                  <div className="w-6 h-6 border-2 border-teal-500 bg-teal-500/20 flex items-center justify-center text-[10px] font-bold">⬠</div>
                  <div>
                    <span className="font-bold text-slate-800 dark:text-[#dfd5bf]">Vessel / Aircraft</span>
                    <span className="text-[10px] text-slate-500 block">Pentagon</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Edge Verification Styles */}
            <div>
              <h4 className="text-xs font-mono uppercase text-slate-500 dark:text-slate-400 font-bold mb-2">
                Edge Verification Line Styles
              </h4>
              <div className="space-y-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-0.5 bg-emerald-500"></div>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-[#dfd5bf]">Solid Line</span>
                      <span className="text-[10px] text-slate-500 block">Verified Fact</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-emerald-600 dark:text-emerald-400">Substantiated (Bank records/intercepts)</span>
                </div>

                <div className="p-2.5 rounded bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 border-b-2 border-dashed border-amber-500"></div>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-[#dfd5bf]">Dashed Line</span>
                      <span className="text-[10px] text-slate-500 block">Hypothesis</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-amber-600 dark:text-amber-400">Analytical Inference / Corroborating</span>
                </div>

                <div className="p-2.5 rounded bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-12 border-b-2 border-dotted border-cyan-500"></div>
                    <div>
                      <span className="font-bold text-slate-800 dark:text-[#dfd5bf]">Dotted Line</span>
                      <span className="text-[10px] text-slate-500 block">Allegation</span>
                    </div>
                  </div>
                  <span className="text-[10px] text-cyan-600 dark:text-cyan-bright">Informant Tip / Pending Corroboration</span>
                </div>
              </div>
            </div>

            <div className="pt-2 flex justify-end">
              <button
                onClick={() => setShowLegendModal(false)}
                className="px-4 py-1.5 rounded-lg bg-slate-900 dark:bg-[#dfd5bf] text-white dark:text-[#080706] font-bold text-xs font-mono"
              >
                Close Legend
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Connection Explainer Modal */}
      {explainingWithEntity && inspectedNode && (() => {
        const expl = explainConnection(inspectedNode.id, explainingWithEntity.id, entities, relationships);
        return (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <div className="bg-white dark:bg-[#14120f] border border-slate-200 dark:border-[#2f2a23] rounded-xl p-6 max-w-lg w-full shadow-2xl space-y-4 animate-in fade-in zoom-in-95 duration-150">
              <div className="flex items-center justify-between pb-3 border-b border-slate-200 dark:border-slate-800">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-cyan-600 dark:text-cyan-bright" />
                  <h3 className="text-base font-bold text-slate-900 dark:text-[#f4ede1] font-mono">
                    Explain This Connection
                  </h3>
                </div>
                <button
                  onClick={() => setExplainingWithEntity(null)}
                  className="text-slate-400 hover:text-slate-700 dark:hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Entity Connection Header Pills */}
              <div className="flex items-center justify-between gap-2 p-3 rounded-lg bg-slate-50 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a] text-xs font-mono">
                <div className="text-center flex-1 truncate">
                  <span className="text-[10px] text-slate-500 block">Source</span>
                  <span className="font-bold text-slate-800 dark:text-[#dfd5bf] truncate">{inspectedNode.name}</span>
                </div>
                <div className="text-cyan-600 dark:text-cyan-bright font-bold px-2">⟷</div>
                <div className="text-center flex-1 truncate">
                  <span className="text-[10px] text-slate-500 block">Target</span>
                  <span className="font-bold text-slate-800 dark:text-[#dfd5bf] truncate">{explainingWithEntity.name}</span>
                </div>
              </div>

              {/* Plain-language explanation strictly derived from dataset */}
              <div className="p-3.5 rounded-lg bg-slate-50 dark:bg-[#1a1714] border border-slate-200 dark:border-[#383127] space-y-1.5">
                <span className="text-[10px] font-mono uppercase text-cyan-600 dark:text-cyan-bright font-bold block">
                  Summary:
                </span>
                <p className="text-xs text-slate-700 dark:text-[#f4ede1] leading-relaxed">
                  {expl.explanation}
                </p>
              </div>

              {/* Metrics & Evidence References */}
              <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                <div className="p-2.5 rounded bg-slate-100 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a]">
                  <span className="text-[10px] text-slate-500 block">Connection Types:</span>
                  <span className="font-bold text-slate-800 dark:text-[#dfd5bf]">
                    {expl.relationshipTypes.length > 0 ? expl.relationshipTypes.join(', ') : 'Direct Record'}
                  </span>
                </div>
                <div className="p-2.5 rounded bg-slate-100 dark:bg-[#100f0d] border border-slate-200 dark:border-[#25201a]">
                  <span className="text-[10px] text-slate-500 block">Tracked Volume:</span>
                  <span className="font-bold text-amber-600 dark:text-[#d4af37]">
                    ${expl.totalVolumeUSD.toLocaleString()} USD
                  </span>
                </div>
              </div>

              <div className="text-[11px] text-slate-500 dark:text-[#a89f8d]">
                Derived from verified interactions and intelligence records in the active dataset.
              </div>

              <div className="pt-2 flex justify-end">
                <button
                  onClick={() => setExplainingWithEntity(null)}
                  className="px-4 py-1.5 rounded-lg bg-cyan-600 hover:bg-cyan-500 dark:bg-[#dfd5bf] text-white dark:text-[#080706] hover:dark:bg-[#e8dec8] font-bold text-xs font-mono shadow-sm"
                >
                  Dismiss Explanation
                </button>
              </div>
            </div>
          </div>
        );
      })()}
    </div>
  );
};
