import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ReactFlow,
  MiniMap,
  Controls,
  Background,
  BackgroundVariant,
  useNodesState,
  useEdgesState,
  type Node,
  type Edge,
  type OnNodesChange,
  type OnEdgesChange,
  type OnConnect,
  type NodeMouseHandler,
  type EdgeMouseHandler,
  Panel,
} from '@xyflow/react';
import '@xyflow/react/dist/style.css';

import { nodeTypes } from './nodes';
import { edgeTypes } from './edges';
import { getElkLayout, type LayoutOptions } from './layout/elkLayout';
import type { GraphResponse, GraphNode, GraphEdge } from '../../types/graph';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RefreshCw,
  Search,
  ArrowDownCircle,
  ArrowRightCircle,
  Eye,
  SlidersHorizontal,
  Download,
  Share2,
} from 'lucide-react';

interface ReactFlowGraphCanvasProps {
  data: GraphResponse;
  selectedNodeId?: string | null;
  selectedEdgeId?: string | null;
  onSelectNode: (nodeId: string | null) => void;
  onSelectEdge: (edgeId: string | null) => void;
  searchQuery?: string;
  onSearchChange?: (query: string) => void;
  onToggleCytoscape?: () => void;
  isCytoscapeAvailable?: boolean;
}

// Convert backend/mock GraphNodeType to React Flow node type
function mapNodeType(type: string): string {
  switch (type) {
    case 'PAPER':
    case 'UNRESOLVED_PAPER':
      return 'paper';
    case 'CLAIM':
      return 'claim';
    case 'CHUNK':
      return 'evidence';
    case 'DATASET':
      return 'dataset';
    case 'CONCEPT':
    case 'METHOD':
    default:
      return 'concept';
  }
}

export const ReactFlowGraphCanvas: React.FC<ReactFlowGraphCanvasProps> = ({
  data,
  selectedNodeId,
  selectedEdgeId,
  onSelectNode,
  onSelectEdge,
  searchQuery = '',
  onSearchChange,
  onToggleCytoscape,
  isCytoscapeAvailable = true,
}) => {
  const [nodes, setNodes, onNodesChange] = useNodesState<Node>([]);
  const [edges, setEdges, onEdgesChange] = useEdgesState<Edge>([]);
  const [layoutDirection, setLayoutDirection] = useState<'DOWN' | 'RIGHT'>('DOWN');
  const [isLayouting, setIsLayouting] = useState<boolean>(false);
  const [collapsedNodes, setCollapsedNodes] = useState<Set<string>>(new Set());

  // 1. Transform raw graph data into React Flow nodes and edges
  const initialElements = useMemo(() => {
    const rawNodes = data.nodes || [];
    const rawEdges = data.edges || [];

    const rfNodes: Node[] = rawNodes.map((n) => ({
      id: n.id,
      type: mapNodeType(n.type),
      position: { x: 0, y: 0 },
      data: {
        ...n.data,
        label: n.label,
        type: n.type,
      },
      selected: n.id === selectedNodeId,
    }));

    const rfEdges: Edge[] = rawEdges.map((e) => ({
      id: e.id,
      source: e.source,
      target: e.target,
      type: 'flowEdge',
      data: {
        ...e.data,
        label: e.data?.label || e.type,
        type: e.type,
        provenance: e.data?.provenance,
      },
      selected: e.id === selectedEdgeId,
    }));

    return { rfNodes, rfEdges };
  }, [data, selectedNodeId, selectedEdgeId]);

  // 2. Run ELK layout whenever raw graph data or direction changes
  const applyLayout = useCallback(
    async (dir: 'DOWN' | 'RIGHT') => {
      setIsLayouting(true);
      try {
        const { nodes: layoutedNodes, edges: layoutedEdges } = await getElkLayout(
          initialElements.rfNodes,
          initialElements.rfEdges,
          { direction: dir, nodeSpacing: 60, layerSpacing: 90 }
        );

        setNodes(layoutedNodes);
        setEdges(layoutedEdges);
      } catch (err) {
        console.error('Error computing ELK layout:', err);
      } finally {
        setIsLayouting(false);
      }
    },
    [initialElements, setNodes, setEdges]
  );

  useEffect(() => {
    applyLayout(layoutDirection);
  }, [applyLayout, layoutDirection]);

  // 3. Selection Handlers
  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      onSelectEdge(null);
      onSelectNode(node.id === selectedNodeId ? null : node.id);
    },
    [onSelectNode, onSelectEdge, selectedNodeId]
  );

  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (_, edge) => {
      onSelectNode(null);
      onSelectEdge(edge.id === selectedEdgeId ? null : edge.id);
    },
    [onSelectNode, onSelectEdge, selectedEdgeId]
  );

  const handlePaneClick = useCallback(() => {
    onSelectNode(null);
    onSelectEdge(null);
  }, [onSelectNode, onSelectEdge]);

  // 4. Highlight nodes matching the search query
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodes;
    const q = searchQuery.toLowerCase();

    return nodes.map((node) => {
      const title = (node.data?.title as string || '').toLowerCase();
      const label = (node.data?.label as string || '').toLowerCase();
      const authors = (Array.isArray(node.data?.authors)
        ? node.data.authors.join(' ')
        : (node.data?.authors as string) || ''
      ).toLowerCase();

      const matches = title.includes(q) || label.includes(q) || authors.includes(q);

      return {
        ...node,
        style: {
          ...node.style,
          opacity: matches ? 1 : 0.25,
          filter: matches ? 'drop-shadow(0 0 12px rgba(255,255,255,0.4))' : 'none',
        },
      };
    });
  }, [nodes, searchQuery]);

  return (
    <div className="relative w-full h-full bg-[#131417] overflow-hidden select-none">
      {/* Top Floating Glass Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Search input */}
        <div className="pointer-events-auto flex items-center gap-2 bg-zinc-900/85 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-zinc-700/80 shadow-xl max-w-sm w-full">
          <Search className="w-4 h-4 text-zinc-400 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search papers, claims, concepts..."
            className="w-full bg-transparent text-xs text-zinc-100 placeholder-zinc-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange?.('')}
              className="text-[10px] text-zinc-400 hover:text-white px-1.5 py-0.5 rounded bg-zinc-800"
            >
              Clear
            </button>
          )}
        </div>

        {/* Right: Layout & View Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Direction toggle */}
          <div className="flex items-center bg-zinc-900/85 backdrop-blur-md p-1 rounded-2xl border border-zinc-700/80 shadow-xl">
            <button
              onClick={() => setLayoutDirection('DOWN')}
              title="Top to Bottom Flow"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                layoutDirection === 'DOWN'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Hierarchical</span>
            </button>
            <button
              onClick={() => setLayoutDirection('RIGHT')}
              title="Left to Right Flow"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                layoutDirection === 'RIGHT'
                  ? 'bg-zinc-800 text-white shadow-sm'
                  : 'text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <ArrowRightCircle className="w-3.5 h-3.5 text-sky-400" />
              <span>Horizontal</span>
            </button>
          </div>

          {/* Engine switcher: Card Flow (ELK) vs Dense Cytoscape */}
          {isCytoscapeAvailable && onToggleCytoscape && (
            <button
              onClick={onToggleCytoscape}
              className="flex items-center gap-1.5 bg-zinc-900/85 hover:bg-zinc-800 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-zinc-700/80 text-xs font-medium text-zinc-200 shadow-xl transition-all"
              title="Switch to Cytoscape.js for dense network analysis"
            >
              <Share2 className="w-3.5 h-3.5 text-indigo-400" />
              <span>Dense Network</span>
            </button>
          )}

          {/* Re-layout button */}
          <button
            onClick={() => applyLayout(layoutDirection)}
            disabled={isLayouting}
            className="flex items-center gap-1 bg-zinc-900/85 hover:bg-zinc-800 backdrop-blur-md p-2 rounded-2xl border border-zinc-700/80 text-zinc-300 shadow-xl transition-all"
            title="Re-run ELK Layout"
          >
            <RefreshCw className={`w-4 h-4 ${isLayouting ? 'animate-spin text-emerald-400' : ''}`} />
          </button>
        </div>
      </div>

      {/* Main React Flow Canvas */}
      <ReactFlow
        nodes={filteredNodes}
        edges={edges}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onNodeClick={handleNodeClick}
        onEdgeClick={handleEdgeClick}
        onPaneClick={handlePaneClick}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        fitView
        minZoom={0.15}
        maxZoom={2.0}
        attributionPosition="bottom-left"
        className="touch-none"
      >
        {/* Subtle Dark Grid Background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color="#27272E"
          className="bg-[#131417]"
        />

        {/* Floating Zoom / Pan Controls */}
        <Controls
          showInteractive={false}
          className="!bg-zinc-900/90 !border !border-zinc-700/80 !rounded-2xl !p-1 !shadow-2xl [&>button]:!bg-zinc-800/80 [&>button]:!border-zinc-700 [&>button]:!text-zinc-200 [&>button:hover]:!bg-zinc-700"
        />

        {/* Dark Themed MiniMap */}
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(n) => {
            switch (n.type) {
              case 'paper':
                return '#FDE68A';
              case 'claim':
                return '#D8B4FE';
              case 'concept':
                return '#86EFAC';
              case 'dataset':
                return '#7DD3FC';
              case 'evidence':
                return '#FDE047';
              default:
                return '#A1A1AA';
            }
          }}
          maskColor="rgba(19, 20, 23, 0.85)"
          className="!bg-zinc-950/90 !border !border-zinc-800 !rounded-2xl !shadow-2xl overflow-hidden"
          zoomable
          pannable
        />

        {/* Bottom Status Panel */}
        <Panel position="bottom-center" className="mb-3">
          <div className="flex items-center gap-3 bg-zinc-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-zinc-800 text-[11px] text-zinc-400 shadow-xl">
            <span>
              <strong className="text-zinc-200">{filteredNodes.length}</strong> cards
            </span>
            <span className="text-zinc-600">•</span>
            <span>
              <strong className="text-zinc-200">{edges.length}</strong> relations
            </span>
            <span className="text-zinc-600">•</span>
            <span className="flex items-center gap-1.5 text-emerald-400">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ELK Hierarchical Flow
            </span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};

