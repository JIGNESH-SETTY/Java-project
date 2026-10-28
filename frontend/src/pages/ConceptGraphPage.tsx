import React, { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { graphApi } from '../api/graphApi';
import cytoscape from 'cytoscape';
import { Network, Table, ZoomIn, ZoomOut, RefreshCw, X, Sparkles, Filter } from 'lucide-react';
import { ProvenanceBadge } from '../components/ProvenanceBadge';

export const ConceptGraphPage: React.FC = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const cyRef = useRef<cytoscape.Core | null>(null);
  const [layoutName, setLayoutName] = useState<'cose' | 'concentric' | 'circle' | 'breadthfirst'>('cose');
  const [selectedNode, setSelectedNode] = useState<any | null>(null);
  const [viewMode, setViewMode] = useState<'graph' | 'table'>('graph');

  const { data: graphData, isLoading } = useQuery({
    queryKey: ['conceptGraph'],
    queryFn: () => graphApi.getConceptGraph(),
  });

  useEffect(() => {
    if (!containerRef.current || !graphData || viewMode !== 'graph') return;

    const elements = [
      ...graphData.nodes.map((n) => ({
        data: {
          id: n.id,
          label: n.label.length > 25 ? n.label.substring(0, 25) + '...' : n.label,
          fullLabel: n.label,
          type: n.type,
          ...n.data,
        },
      })),
      ...graphData.edges.map((e) => ({
        data: {
          id: e.id,
          source: e.source,
          target: e.target,
          label: e.label,
          relationType: e.relationType,
          isAiProposed: e.isAiProposed,
          rationale: e.rationale,
        },
      })),
    ];

    const cy = cytoscape({
      container: containerRef.current,
      elements,
      style: [
        {
          selector: 'node',
          style: {
            'background-color': '#4f46e5',
            label: 'data(label)',
            color: '#f8fafc',
            'font-size': '10px',
            'text-valign': 'bottom',
            'text-margin-y': 5,
            width: 28,
            height: 28,
          },
        },
        {
          selector: 'node[type = "PAPER"]',
          style: {
            'background-color': '#4f46e5',
            shape: 'round-rectangle',
            width: 36,
            height: 36,
            'border-width': 2,
            'border-color': '#818cf8',
          },
        },
        {
          selector: 'node[type = "METHOD"]',
          style: {
            'background-color': '#2563eb',
            shape: 'diamond',
            width: 30,
            height: 30,
          },
        },
        {
          selector: 'node[type = "DATASET"]',
          style: {
            'background-color': '#d97706',
            shape: 'hexagon',
            width: 30,
            height: 30,
          },
        },
        {
          selector: 'node[type = "CLAIM"]',
          style: {
            'background-color': '#059669',
            shape: 'ellipse',
            width: 26,
            height: 26,
          },
        },
        {
          selector: 'node[type = "PROBLEM"]',
          style: {
            'background-color': '#e11d48',
            shape: 'triangle',
            width: 28,
            height: 28,
          },
        },
        {
          selector: 'edge',
          style: {
            width: 1.5,
            'line-color': '#64748b',
            'target-arrow-color': '#64748b',
            'target-arrow-shape': 'triangle',
            'curve-style': 'bezier',
            opacity: 0.8,
            'font-size': '9px',
            color: '#94a3b8',
          },
        },
        {
          selector: 'edge[?isAiProposed]',
          style: {
            'line-color': '#a855f7',
            'target-arrow-color': '#a855f7',
            'line-style': 'dashed',
            width: 2,
            opacity: 0.9,
          },
        },
        {
          selector: ':selected',
          style: {
            'background-color': '#10b981',
            'border-color': '#34d399',
            'border-width': 4,
          },
        },
      ],
      layout: {
        name: layoutName,
        padding: 40,
      },
    });

    cy.on('tap', 'node', (evt) => {
      setSelectedNode(evt.target.data());
    });

    cy.on('tap', (evt) => {
      if (evt.target === cy) {
        setSelectedNode(null);
      }
    });

    cyRef.current = cy;

    return () => {
      cy.destroy();
    };
  }, [graphData, layoutName, viewMode]);

  const handleZoom = (type: 'in' | 'out' | 'fit') => {
    if (!cyRef.current) return;
    if (type === 'in') cyRef.current.zoom(cyRef.current.zoom() * 1.25);
    if (type === 'out') cyRef.current.zoom(cyRef.current.zoom() * 0.8);
    if (type === 'fit') cyRef.current.fit();
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Concept & Entity Graph</h1>
          <p className="text-xs text-slate-400">
            Heterogeneous knowledge graph connecting papers, methods, datasets, problems, and claims
          </p>
        </div>

        {/* View mode toggle */}
        <div className="flex items-center gap-3">
          <div className="flex rounded-xl bg-slate-900 p-0.5 border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('graph')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
                viewMode === 'graph'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Network className="w-3.5 h-3.5" />
              <span>Interactive Graph</span>
            </button>
            <button
              onClick={() => setViewMode('table')}
              className={`px-3 py-1.5 rounded-lg flex items-center gap-1.5 font-medium transition ${
                viewMode === 'table'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Table className="w-3.5 h-3.5" />
              <span>Accessible Table</span>
            </button>
          </div>
        </div>
      </div>

      {isLoading ? (
        <div className="text-center py-20 text-slate-500 text-xs">
          Computing concept knowledge graph layout...
        </div>
      ) : viewMode === 'graph' ? (
        <div className="relative glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-2xl h-[650px] flex">
          {/* Canvas */}
          <div ref={containerRef} className="w-full h-full bg-[#080d1a]" />

          {/* Floating Controls */}
          <div className="absolute top-4 left-4 z-10 flex flex-wrap items-center gap-2 bg-slate-900/90 backdrop-blur-md p-1.5 rounded-xl border border-slate-800 text-xs shadow-lg">
            <span className="text-slate-400 text-[11px] px-2">Layout:</span>
            {(['cose', 'concentric', 'circle', 'breadthfirst'] as const).map((l) => (
              <button
                key={l}
                onClick={() => setLayoutName(l)}
                className={`px-2.5 py-1 rounded-lg capitalize text-[11px] font-semibold transition ${
                  layoutName === l ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {l}
              </button>
            ))}

            <div className="h-4 w-px bg-slate-800 mx-1" />

            <button
              onClick={() => handleZoom('in')}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition"
              title="Zoom In"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom('out')}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleZoom('fit')}
              className="p-1.5 rounded-lg text-slate-300 hover:bg-slate-800 transition"
              title="Fit View"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          </div>

          {/* Node Legend Widget */}
          <div className="absolute bottom-4 left-4 z-10 p-3 rounded-xl bg-slate-900/90 backdrop-blur-md border border-slate-800 text-[10px] space-y-1.5 shadow-lg">
            <div className="font-semibold text-slate-300">Entity & Provenance Legend</div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1">
              <div className="flex items-center gap-1.5 text-indigo-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-indigo-500" />
                <span>Paper</span>
              </div>
              <div className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2.5 h-2.5 rotate-45 bg-blue-600" />
                <span>Method</span>
              </div>
              <div className="flex items-center gap-1.5 text-amber-400">
                <span className="w-2.5 h-2.5 rounded-sm bg-amber-600" />
                <span>Dataset</span>
              </div>
              <div className="flex items-center gap-1.5 text-emerald-400">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-600" />
                <span>Reported Claim</span>
              </div>
            </div>
            <div className="pt-1 border-t border-slate-800 space-y-1">
              <div className="flex items-center gap-2 text-slate-300">
                <span className="w-4 h-0.5 bg-slate-500" />
                <span>Reported Evidence Edge</span>
              </div>
              <div className="flex items-center gap-2 text-purple-400">
                <span className="w-4 h-0.5 border-t border-dashed border-purple-400" />
                <span>AI Proposed Relation</span>
              </div>
            </div>
          </div>

          {/* Node Inspector Drawer */}
          {selectedNode && (
            <div className="absolute top-4 right-4 z-20 w-80 bg-slate-900/95 backdrop-blur-md border border-slate-700/80 rounded-2xl p-4 shadow-2xl space-y-3 animate-fade-in text-xs">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="font-bold text-slate-200 text-xs">Entity Inspector</span>
                <button
                  onClick={() => setSelectedNode(null)}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="space-y-2">
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700">
                  {selectedNode.type}
                </span>
                <h4 className="font-semibold text-white text-sm leading-snug">
                  {selectedNode.fullLabel || selectedNode.label}
                </h4>

                {selectedNode.section && (
                  <div className="text-[11px] text-slate-400">
                    <span className="text-slate-500">Section: </span>
                    {selectedNode.section}
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      ) : (
        /* Accessible Table Alternative */
        <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl text-xs">
          <div className="p-4 border-b border-slate-800 bg-slate-900/60 font-semibold text-slate-200">
            Concept & Entity Relationships Table
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-900 border-b border-slate-800 text-slate-400">
                  <th className="p-3.5">Source Entity</th>
                  <th className="p-3.5">Relationship</th>
                  <th className="p-3.5">Target Entity</th>
                  <th className="p-3.5">Provenance</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/80">
                {graphData?.edges.map((e) => (
                  <tr key={e.id} className="hover:bg-slate-900/40">
                    <td className="p-3.5 text-slate-200 font-medium">{e.source}</td>
                    <td className="p-3.5 text-indigo-400 font-semibold">{e.label}</td>
                    <td className="p-3.5 text-slate-300">{e.target}</td>
                    <td className="p-3.5">
                      <ProvenanceBadge provenance={e.provenance} />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
