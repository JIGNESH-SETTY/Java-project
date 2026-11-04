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
  RefreshCw,
  Search,
  ArrowDownCircle,
  ArrowRightCircle,
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
  const [layoutDirection, setLayoutDirection] = useState<'DOWN' | 'RIGHT'>('DOWN');
  const [isLayouting, setIsLayouting] = useState(false);

  // Transform GraphResponse to React Flow format
  const initialNodes: Node[] = useMemo(() => {
    return (data.nodes || []).map((node: GraphNode) => ({
      id: node.id,
      type: mapNodeType(node.type),
      position: { x: 0, y: 0 },
      data: {
        ...node,
        isSelected: selectedNodeId === node.id,
      },
    }));
  }, [data.nodes, selectedNodeId]);

  const initialEdges: Edge[] = useMemo(() => {
    return (data.edges || []).map((edge: GraphEdge) => ({
      id: edge.id,
      source: edge.source,
      target: edge.target,
      type: 'scholarly',
      data: {
        ...edge,
        isSelected: selectedEdgeId === edge.id,
      },
    }));
  }, [data.edges, selectedEdgeId]);

  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes);
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges);

  // Apply ELK hierarchical layout
  const applyLayout = useCallback(
    async (direction: 'DOWN' | 'RIGHT') => {
      if (initialNodes.length === 0) return;
      setIsLayouting(true);
      try {
        const layoutOptions: LayoutOptions = {
          direction,
          nodeSpacing: 50,
          layerSpacing: 80,
        };
        const layouted = await getElkLayout(initialNodes, initialEdges, layoutOptions);
        setNodes(layouted.nodes);
        setEdges(layouted.edges);
      } catch (err) {
        console.error('ELK layout computation failed:', err);
        setNodes(initialNodes);
        setEdges(initialEdges);
      } finally {
        setIsLayouting(false);
      }
    },
    [initialNodes, initialEdges, setNodes, setEdges]
  );

  // Recalculate layout whenever incoming nodes/edges or direction change
  useEffect(() => {
    applyLayout(layoutDirection);
  }, [applyLayout, layoutDirection]);

  // Synchronize selection state in node data
  useEffect(() => {
    setNodes((nds) =>
      nds.map((node) => ({
        ...node,
        data: {
          ...node.data,
          isSelected: node.id === selectedNodeId,
        },
      }))
    );
  }, [selectedNodeId, setNodes]);

  // Synchronize selection state in edge data
  useEffect(() => {
    setEdges((eds) =>
      eds.map((edge) => ({
        ...edge,
        data: {
          ...(edge.data || {}),
          isSelected: edge.id === selectedEdgeId,
        },
      }))
    );
  }, [selectedEdgeId, setEdges]);

  // Search filtering highlight
  const filteredNodes = useMemo(() => {
    if (!searchQuery.trim()) return nodes;
    const query = searchQuery.toLowerCase();
    return nodes.map((node) => {
      const label = (node.data?.label as string) || '';
      const subtitle = (node.data?.subtitle as string) || '';
      const matches = label.toLowerCase().includes(query) || subtitle.toLowerCase().includes(query);
      return {
        ...node,
        style: {
          ...node.style,
          opacity: matches ? 1 : 0.25,
          filter: matches ? 'none' : 'grayscale(80%)',
        },
      };
    });
  }, [nodes, searchQuery]);

  // Click handlers
  const handleNodeClick: NodeMouseHandler = useCallback(
    (_, node) => {
      onSelectNode(node.id);
    },
    [onSelectNode]
  );

  const handleEdgeClick: EdgeMouseHandler = useCallback(
    (_, edge) => {
      onSelectEdge(edge.id);
    },
    [onSelectEdge]
  );

  const handlePaneClick = useCallback(() => {
    onSelectNode(null);
    onSelectEdge(null);
  }, [onSelectNode, onSelectEdge]);

  return (
    <div className="relative w-full h-full bg-[#F3F6F9] dark:bg-[#091920] overflow-hidden select-none transition-colors duration-200">
      {/* Top Floating Control Bar */}
      <div className="absolute top-4 left-4 right-4 z-20 flex items-center justify-between pointer-events-none">
        {/* Left: Search input */}
        <div className="pointer-events-auto flex items-center gap-2 bg-white/95 dark:bg-[#0D222B]/95 backdrop-blur-md px-3 py-2 rounded-[10px] border border-[#D9E1E9] dark:border-[#1E4656] shadow-sm max-w-sm w-full transition-colors">
          <Search className="w-4 h-4 text-[#5B6B7D] dark:text-[#6B8F9E] shrink-0" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => onSearchChange?.(e.target.value)}
            placeholder="Search papers, claims, concepts..."
            className="w-full bg-transparent text-xs text-[#0B2A33] dark:text-[#E0F2F6] placeholder-[#6B7785] dark:placeholder-[#527584] focus:outline-none"
          />
          {searchQuery && (
            <button
              onClick={() => onSearchChange?.('')}
              className="text-[10px] text-[#5B6B7D] hover:text-[#0B2A33] dark:text-[#6B8F9E] dark:hover:text-[#E0F2F6] px-1.5 py-0.5 rounded-[6px] bg-[#EEF2F6] dark:bg-[#122B36] transition"
            >
              Clear
            </button>
          )}
        </div>

        {/* Right: Layout & View Controls */}
        <div className="pointer-events-auto flex items-center gap-2">
          {/* Direction toggle */}
          <div className="flex items-center bg-white/95 dark:bg-[#0D222B]/95 backdrop-blur-md p-1 rounded-[10px] border border-[#D9E1E9] dark:border-[#1E4656] shadow-sm transition-colors">
            <button
              onClick={() => setLayoutDirection('DOWN')}
              title="Top to Bottom Flow"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
                layoutDirection === 'DOWN'
                  ? 'bg-[#0F4C5C] text-white shadow-xs'
                  : 'text-[#475569] dark:text-[#8EB3C2] hover:text-[#0B2A33] dark:hover:text-[#E0F2F6]'
              }`}
            >
              <ArrowDownCircle className="w-3.5 h-3.5" />
              <span>Hierarchical</span>
            </button>
            <button
              onClick={() => setLayoutDirection('RIGHT')}
              title="Left to Right Flow"
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-[8px] text-xs font-semibold transition-all ${
                layoutDirection === 'RIGHT'
                  ? 'bg-[#0F4C5C] text-white shadow-xs'
                  : 'text-[#475569] dark:text-[#8EB3C2] hover:text-[#0B2A33] dark:hover:text-[#E0F2F6]'
              }`}
            >
              <ArrowRightCircle className="w-3.5 h-3.5" />
              <span>Horizontal</span>
            </button>
          </div>

          {/* Engine switcher: Card Flow (ELK) vs Dense Cytoscape */}
          {isCytoscapeAvailable && onToggleCytoscape && (
            <button
              onClick={onToggleCytoscape}
              className="flex items-center gap-1.5 bg-white/95 hover:bg-[#FAFBFD] dark:bg-[#0D222B]/95 dark:hover:bg-[#122B36] backdrop-blur-md px-3 py-2 rounded-[10px] border border-[#D9E1E9] dark:border-[#1E4656] text-xs font-semibold text-[#0B2A33] dark:text-[#E0F2F6] shadow-sm transition-all"
              title="Switch to Cytoscape.js for dense network analysis"
            >
              <Share2 className="w-3.5 h-3.5 text-[#0A6A80] dark:text-[#38BDF8]" />
              <span>Dense Network</span>
            </button>
          )}

          {/* Re-layout button */}
          <button
            onClick={() => applyLayout(layoutDirection)}
            disabled={isLayouting}
            className="flex items-center gap-1 bg-white/95 hover:bg-[#FAFBFD] dark:bg-[#0D222B]/95 dark:hover:bg-[#122B36] backdrop-blur-md p-2 rounded-[10px] border border-[#D9E1E9] dark:border-[#1E4656] text-[#0B2A33] dark:text-[#E0F2F6] shadow-sm transition-all"
            title="Re-run ELK Layout"
          >
            <RefreshCw className={`w-4 h-4 ${isLayouting ? 'animate-spin text-[#0F4C5C]' : ''}`} />
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
        {/* Responsive Dot Grid Background */}
        <Background
          variant={BackgroundVariant.Dots}
          gap={24}
          size={1.5}
          color={isDark ? '#1E4656' : '#D3DCE5'}
          className="bg-[#F3F6F9] dark:bg-[#091920]"
        />

        {/* Floating Zoom / Pan Controls */}
        <Controls
          showInteractive={false}
          className="!bg-white/95 dark:!bg-[#0D222B]/90 !border !border-[#D9E1E9] dark:!border-[#1E4656] !rounded-[10px] !p-1 !shadow-sm [&>button]:!bg-[#FAFBFD] dark:[&>button]:!bg-[#122B36] [&>button]:!border-[#D9E1E9] dark:[&>button]:!border-[#1E4656] [&>button]:!text-[#0B2A33] dark:[&>button]:!text-[#E0F2F6] [&>button:hover]:!bg-[#EEF2F6] dark:[&>button:hover]:!bg-[#1A3E4E]"
        />

        {/* Themed MiniMap */}
        <MiniMap
          nodeStrokeWidth={2}
          nodeColor={(n) => {
            switch (n.type) {
              case 'paper':
                return '#0F4C5C';
              case 'claim':
                return '#475569';
              case 'concept':
                return '#3E6FA3';
              case 'dataset':
                return '#B7791F';
              case 'evidence':
                return '#1B6B43';
              default:
                return isDark ? '#6B8F9E' : '#94A3B8';
            }
          }}
          maskColor={isDark ? 'rgba(9, 25, 32, 0.75)' : 'rgba(247, 249, 251, 0.75)'}
          className="!bg-white/95 dark:!bg-[#0D222B]/90 !border !border-[#D9E1E9] dark:!border-[#1E4656] !rounded-[10px] !shadow-sm overflow-hidden"
          zoomable
          pannable
        />

        {/* Bottom Status Panel */}
        <Panel position="bottom-center" className="mb-3">
          <div className="flex items-center gap-3 bg-white/95 dark:bg-[#0D222B]/95 backdrop-blur-md px-4 py-1.5 rounded-full border border-[#D9E1E9] dark:border-[#1E4656] text-[11px] text-[#475569] dark:text-[#8EB3C2] shadow-sm">
            <span>
              <strong className="text-[#0B2A33] dark:text-[#E0F2F6] font-semibold">{filteredNodes.length}</strong> cards
            </span>
            <span className="text-[#D9E1E9] dark:text-[#1E4656]">•</span>
            <span>
              <strong className="text-[#0B2A33] dark:text-[#E0F2F6] font-semibold">{edges.length}</strong> relations
            </span>
            <span className="text-[#D9E1E9] dark:text-[#1E4656]">•</span>
            <span className="flex items-center gap-1.5 text-[#1B6B43] dark:text-[#34D399] font-medium">
              <span className="w-1.5 h-1.5 rounded-full bg-[#1B6B43] animate-pulse" />
              ELK Hierarchical Flow
            </span>
          </div>
        </Panel>
      </ReactFlow>
    </div>
  );
};
