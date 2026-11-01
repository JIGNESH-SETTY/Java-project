import React, { useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphApi, getUseMockGraphData, setUseMockGraphData } from '../api/graphApi';
import {
  ConceptGraphFilters,
  GraphEdge,
  GraphNode,
  GraphResponse,
} from '../types/graph';
import { ReactFlowGraphCanvas } from '../components/graph/ReactFlowGraphCanvas';
import { GraphCanvas, GraphCanvasHandle } from '../components/graph/GraphCanvas';
import { GraphControls } from '../components/graph/GraphControls';
import { GraphLegend } from '../components/graph/GraphLegend';
import { GraphFilters } from '../components/graph/GraphFilters';
import { GraphDetailsPanel } from '../components/graph/GraphDetailsPanel';
import { GraphEmptyState } from '../components/graph/GraphEmptyState';
import { GraphLoadingState } from '../components/graph/GraphLoadingState';
import { GraphListView } from '../components/graph/GraphListView';
import { Network, Filter, LayoutGrid } from 'lucide-react';

export const ConceptGraphPage: React.FC = () => {
  const canvasRef = useRef<GraphCanvasHandle>(null);

  // Engine: 'flow' (React Flow + ELK.js) or 'cytoscape' (dense network)
  const [engine, setEngine] = useState<'flow' | 'cytoscape'>('flow');

  // Layout & View states
  const [layoutName, setLayoutName] = useState<'cose' | 'concentric' | 'circle' | 'breadthfirst'>('cose');
  const [viewMode, setViewMode] = useState<'graph' | 'list'>('graph');
  const [showLabels, setShowLabels] = useState(true);
  const [showArrows, setShowArrows] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');

  // Selection states
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null);
  const [selectedEdge, setSelectedEdge] = useState<GraphEdge | null>(null);

  // Mobile drawer states
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [isMobileDetailsOpen, setIsMobileDetailsOpen] = useState(false);

  // Filters state
  const [filters, setFilters] = useState<ConceptGraphFilters>({
    nodeTypes: ['PAPER', 'CONCEPT', 'CLAIM', 'METHOD', 'DATASET', 'AI_INTERPRETATION'],
    showEvidenceChunks: true,
  });

  // Mock vs live data toggle
  const [isMock, setIsMock] = useState(getUseMockGraphData());

  const handleToggleMock = () => {
    const nextVal = !isMock;
    setIsMock(nextVal);
    setUseMockGraphData(nextVal);
    refetch();
  };

  const { data: graphData, isLoading, refetch } = useQuery<GraphResponse>({
    queryKey: ['conceptGraph', filters, isMock],
    queryFn: () => graphApi.getConceptGraph(filters),
  });

  const nodes = graphData?.nodes || [];
  const edges = graphData?.edges || [];

  const handleSelectNode = (node: GraphNode) => {
    setSelectedNode(node);
    setSelectedEdge(null);
    setIsMobileDetailsOpen(true);
  };

  const handleSelectNodeById = (nodeId: string | null) => {
    if (!nodeId) {
      setSelectedNode(null);
      return;
    }
    const found = nodes.find((n) => n.id === nodeId);
    if (found) {
      setSelectedNode(found);
      setSelectedEdge(null);
      setIsMobileDetailsOpen(true);
    }
  };

  const handleSelectEdge = (edge: GraphEdge) => {
    setSelectedEdge(edge);
    setSelectedNode(null);
    setIsMobileDetailsOpen(true);
  };

  const handleSelectEdgeById = (edgeId: string | null) => {
    if (!edgeId) {
      setSelectedEdge(null);
      return;
    }
    const found = edges.find((e) => e.id === edgeId);
    if (found) {
      setSelectedEdge(found);
      setSelectedNode(null);
      setIsMobileDetailsOpen(true);
    }
  };

  const handleDeselect = () => {
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  const handleCenterGraph = (id: string) => {
    if (canvasRef.current) {
      canvasRef.current.centerOnNode(id);
    }
  };

  const handleResetFilters = () => {
    setFilters({
      nodeTypes: ['PAPER', 'CONCEPT', 'CLAIM', 'METHOD', 'DATASET', 'AI_INTERPRETATION'],
      showEvidenceChunks: true,
    });
    setSelectedNode(null);
    setSelectedEdge(null);
  };

  return (
    <div className="p-4 sm:p-6 lg:p-8 max-w-[1720px] mx-auto space-y-6 select-none font-sans">
      {/* Top Page Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-2 border-b border-slate-200/60">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-full bg-white shadow-xs border border-white flex items-center justify-center text-teal-600">
              <Network className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold text-[#29282B] tracking-tight">
                  Concept & Claim Evidence Graph
                </h1>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-teal-50 text-teal-700 border border-teal-200">
                  {engine === 'flow' ? 'XYFlow + ELK' : 'Cytoscape Dense'}
                </span>
              </div>
              <p className="text-xs text-[#77747A] mt-0.5 font-medium">
                Visualizes research claims, concepts, models, datasets, and verified relationships (supports, contradicts, qualifies, extends).
              </p>
            </div>
          </div>
        </div>

        {/* Top Controls & Mobile Toggles */}
        <div className="flex items-center gap-2 self-start md:self-auto flex-wrap">
          {/* Engine Selector */}
          <div className="flex items-center bg-white/80 backdrop-blur-md p-1 rounded-full border border-slate-200 shadow-xs">
            <button
              onClick={() => setEngine('flow')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                engine === 'flow'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <LayoutGrid className="w-3.5 h-3.5 text-emerald-400" />
              <span>Card Map</span>
            </button>
            <button
              onClick={() => setEngine('cytoscape')}
              className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold transition-all ${
                engine === 'cytoscape'
                  ? 'bg-zinc-900 text-white shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Network className="w-3.5 h-3.5 text-teal-400" />
              <span>Dense Graph</span>
            </button>
          </div>

          <button
            type="button"
            onClick={() => setIsMobileFiltersOpen(true)}
            className="md:hidden flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white border border-slate-200 text-xs font-semibold text-[#29282B]"
          >
            <Filter className="w-3.5 h-3.5 text-teal-600" />
            <span>Filters</span>
          </button>

          {engine === 'cytoscape' && (
            <GraphControls
              onZoomIn={() => canvasRef.current?.zoomIn()}
              onZoomOut={() => canvasRef.current?.zoomOut()}
              onFit={() => canvasRef.current?.fit()}
              onReset={() => canvasRef.current?.reset()}
              onExportPng={() => canvasRef.current?.exportPng()}
              layoutName={layoutName}
              onChangeLayout={setLayoutName}
              showLabels={showLabels}
              onToggleLabels={() => setShowLabels(!showLabels)}
              showArrows={showArrows}
              onToggleArrows={() => setShowArrows(!showArrows)}
              viewMode={viewMode}
              onToggleViewMode={() => setViewMode(viewMode === 'graph' ? 'list' : 'graph')}
            />
          )}
        </div>
      </div>

      {/* Main 3-Column Desktop Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Column: Filter Panel */}
        <div className="hidden lg:block lg:col-span-3">
          <GraphFilters
            graphMode="concept"
            conceptFilters={filters}
            onConceptFiltersChange={setFilters}
            isMockData={isMock}
            onToggleMockData={handleToggleMock}
            onReset={handleResetFilters}
          />
        </div>

        {/* Center Column: Graph Canvas */}
        <div className="lg:col-span-6 w-full flex flex-col gap-4">
          <div className="relative rounded-[28px] overflow-hidden min-h-[640px] flex flex-col justify-between shadow-xl border border-zinc-800/80 bg-[#131417]">
            {isLoading ? (
              <GraphLoadingState message="Extracting normalized claims, linking evidence passages, and calculating semantic consensus..." />
            ) : nodes.length === 0 ? (
              <div className="p-8">
                <GraphEmptyState
                  title="No Concept Entities Match Current Filters"
                  description="Try enabling all entity types or toggling 'Fictional Demo Data' to view cross-paper claims and contradictions."
                  onResetFilters={handleResetFilters}
                />
              </div>
            ) : viewMode === 'list' ? (
              <div className="p-4 bg-white min-h-[640px]">
                <GraphListView
                  nodes={nodes}
                  edges={edges}
                  onSelectNode={handleSelectNode}
                  onSelectEdge={handleSelectEdge}
                />
              </div>
            ) : engine === 'flow' ? (
              /* React Flow with ELK.js Hierarchical Card Map */
              <div className="w-full h-[640px]">
                <ReactFlowGraphCanvas
                  data={graphData || { nodes: [], edges: [], metadata: { totalNodes: 0, totalEdges: 0, isTruncated: false, appliedFilters: {} } }}
                  selectedNodeId={selectedNode?.id}
                  selectedEdgeId={selectedEdge?.id}
                  onSelectNode={handleSelectNodeById}
                  onSelectEdge={handleSelectEdgeById}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                  onToggleCytoscape={() => setEngine('cytoscape')}
                  isCytoscapeAvailable={true}
                />
              </div>
            ) : (
              /* Cytoscape.js Dense Graph Mode */
              <div className="relative w-full h-[640px] bg-slate-50/50">
                <GraphCanvas
                  ref={canvasRef}
                  nodes={nodes}
                  edges={edges}
                  selectedNodeId={selectedNode?.id}
                  selectedEdgeId={selectedEdge?.id}
                  onSelectNode={handleSelectNode}
                  onSelectEdge={handleSelectEdge}
                  onDeselect={handleDeselect}
                  layoutName={layoutName}
                  showLabels={showLabels}
                  showArrows={showArrows}
                />

                {/* Floating Bottom Left Legend */}
                <div className="absolute bottom-3 left-3 z-20 max-w-xs">
                  <GraphLegend graphMode="concept" />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Details Panel */}
        <div className="hidden lg:block lg:col-span-3">
          <GraphDetailsPanel
            selectedNode={selectedNode}
            selectedEdge={selectedEdge}
            onClose={handleDeselect}
            onCenterGraph={handleCenterGraph}
          />
        </div>
      </div>

      {/* Mobile Filters Drawer */}
      {isMobileFiltersOpen && (
        <div className="fixed inset-0 z-50 flex lg:hidden">
          <div
            className="fixed inset-0 bg-[#29282B]/20 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileFiltersOpen(false)}
          />
          <div className="relative w-80 max-w-[85%] bg-white h-full shadow-2xl p-4 overflow-y-auto z-10">
            <GraphFilters
              graphMode="concept"
              conceptFilters={filters}
              onConceptFiltersChange={setFilters}
              isMockData={isMock}
              onToggleMockData={handleToggleMock}
              onReset={handleResetFilters}
            />
          </div>
        </div>
      )}

      {/* Mobile Details Drawer */}
      {isMobileDetailsOpen && (selectedNode || selectedEdge) && (
        <div className="fixed inset-0 z-50 flex justify-end lg:hidden">
          <div
            className="fixed inset-0 bg-[#29282B]/20 backdrop-blur-xs transition-opacity"
            onClick={() => setIsMobileDetailsOpen(false)}
          />
          <div className="relative w-80 max-w-[85%] bg-white h-full shadow-2xl p-4 overflow-y-auto z-10">
            <GraphDetailsPanel
              selectedNode={selectedNode}
              selectedEdge={selectedEdge}
              onClose={() => {
                setIsMobileDetailsOpen(false);
                handleDeselect();
              }}
              onCenterGraph={handleCenterGraph}
            />
          </div>
        </div>
      )}
    </div>
  );
};
