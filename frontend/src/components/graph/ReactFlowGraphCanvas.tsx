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
import { useTheme } from '../../context/ThemeContext';
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
  const { theme } = useTheme();
  const isDark = theme === 'dark';

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
          filter: matches ? (isDark ? 'drop-shadow(0 0 12px rgba(255,255,255,0.4))' : 'drop-shadow(0 0 12px rgba(37,99,235,0.3))') : 'none',
        },
      };
    });
  }, [nodes, searchQuery, isDark]);

  return (
    <div className="relative w-full h-full bg-slate-50 dark:bg-[#030712] overflow-hidden select-none transition-colors duration-200">
      {/* Top Floating Glass Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Search input */}
        <div className="pointer-events-auto flex items-center gap-2 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm max-w-sm w-full transition-colors">
          <Search className="w-4 h-4 text-slate-400 dark:text-slate-500 shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search papers, claims, concepts..."
            className="w-full bg-transparent text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange?.('')}
              className="text-[10px] text-slate-500 hover:text-slate-800 dark:text-slate-400 dark:hover:text-white px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-800 transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Right: Layout & View Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Direction toggle */}
          <div className="flex items-center bg-white/95 dark:bg-slate-900/90 backdrop-blur-md p-1 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-sm transition-colors">
            <button
              onClick={() => setLayoutDirection('DOWN')}
              title="Top to Bottom Flow"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                layoutDirection === 'DOWN'
                  ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
              }`}
            >
              <ArrowDownCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>Hierarchical</span>
            </button>
            <button
              onClick={() => setLayoutDirection('RIGHT')}
              title="Left to Right Flow"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium transition-all ${
                layoutDirection === 'RIGHT'
                  ? 'bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 shadow-2xs font-semibold'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 border border-transparent'
              }`}
            >
              <ArrowRightCircle className="w-3.5 h-3.5 text-sky-600 dark:text-sky-400" />
              <span>Horizontal</span>
            </button>
          </div>

          {/* Engine switcher: Card Flow (ELK) vs Dense Cytoscape */}
          {isCytoscapeAvailable && onToggleCytoscape && (
            <button
              onClick={onToggleCytoscape}
              className="flex items-center gap-1.5 bg-white/95 hover:bg-slate-50 dark:bg-slate-900/90 dark:hover:bg-slate-800 backdrop-blur-md px-3.5 py-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-xs font-semibold text-slate-700 dark:text-slate-200 shadow-sm transition-all"
              title="Switch to Cytoscape.js for dense network analysis"
            >
              <Share2 className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Dense Network</span>
            </button>
          )}

          {/* Re-layout button */}
          <button
            onClick={() => applyLayout(layoutDirection)}
            disabled={isLayouting}
            className="flex items-center gap-1 bg-white/95 hover:bg-slate-50 dark:bg-slate-900/90 dark:hover:bg-slate-800 backdrop-blur-md p-2 rounded-2xl border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-200 shadow-sm transition-all"
            title="Re-run ELK Layout"
          >
            <RefreshCw className={`w-4 h-4 ${isLayouting ? 'animate-spin text-emerald-500' : ''}`} />
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
        {/* Responsive Grid Background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color={isDark ? '#334155' : '#CBD5E1'}
          className="bg-slate-50 dark:bg-[#030712]"
        />

        {/* Floating Zoom / Pan Controls */}
        <Controls
          showInteractive={false}
          className="!bg-white/95 dark:!bg-slate-900/90 !border !border-slate-200 dark:!border-slate-800 !rounded-2xl !p-1 !shadow-lg [&>button]:!bg-slate-50 dark:[&>button]:!bg-slate-800 [&>button]:!border-slate-200 dark:[&>button]:!border-slate-700 [&>button]:!text-slate-700 dark:[&>button]:!text-slate-200 [&>button:hover]:!bg-slate-100 dark:[&>button:hover]:!bg-slate-700"
        />

        {/* Themed MiniMap */}
        <MiniMap
          nodeStrokeWidth={3}
          nodeColor={(n) => {
            switch (n.type) {
              case 'paper':
                return isDark ? '#FBBF24' : '#3B82F6';
              case 'claim':
                return '#8B5CF6';
              case 'concept':
                return '#10B981';
              case 'dataset':
                return '#0EA5E9';
              case 'evidence':
                return '#F59E0B';
              default:
                return isDark ? '#64748B' : '#94A3B8';
            }
          }}
          maskColor={isDark ? 'rgba(3, 7, 18, 0.75)' : 'rgba(248, 250, 252, 0.75)'}
          className="!bg-white/95 dark:!bg-slate-900/90 !border !border-slate-200 dark:!border-slate-800 !rounded-2xl !shadow-lg overflow-hidden"
          zoomable
          pannable
        />

        {/* Bottom Status Panel */}
        <Panel position="bottom-center" className="mb-3">
          <div className="flex items-center gap-3 bg-white/95 dark:bg-slate-900/90 backdrop-blur-md px-4 py-1.5 rounded-full border border-slate-200 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-400 shadow-md">
            <span>
              <strong className="text-slate-900 dark:text-slate-100 font-semibold">{filteredNodes.length}</strong> cards
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span>
              <strong className="text-slate-900 dark:text-slate-100 font-semibold">{edges.length}</strong> relations
            </span>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="flex items-center gap-1.5 text-emerald-600 dark:text-emerald-400 font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              ELK Hierarchical Flow
            </span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};
