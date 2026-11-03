import React, { useState } from 'react';
import {
  ArrowRight,
  Search,
} from 'lucide-react';
import { GraphNode, GraphEdge } from '../../types/graph';
import { ProvenanceBadge } from '../ProvenanceBadge';
import { RelationBadge, ReviewStatusBadge } from '../RelationBadge';
import { GlassTable, GlassTableHeader, GlassTableBody, GlassTableRow, GlassTableCell } from '../GlassTable';

interface GraphListViewProps {
  nodes: GraphNode[];
  edges: GraphEdge[];
  onSelectNode: (node: GraphNode) => void;
  onSelectEdge: (edge: GraphEdge) => void;
  className?: string;
}

export const GraphListView: React.FC<GraphListViewProps> = ({
  nodes,
  edges,
  onSelectNode,
  onSelectEdge,
  className = '',
}) => {
  const [activeTab, setActiveTab] = useState<'nodes' | 'edges'>('nodes');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredNodes = nodes.filter(
    (n) =>
      n.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.type.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredEdges = edges.filter(
    (e) =>
      e.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.source.toLowerCase().includes(searchTerm.toLowerCase()) ||
      e.target.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div
      className={`p-6 rounded-[28px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm space-y-5 text-xs select-none ${className}`}
    >
      {/* Top Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setActiveTab('nodes')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              activeTab === 'nodes'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Entities / Nodes ({nodes.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('edges')}
            className={`px-4 py-1.5 rounded-full text-xs font-semibold transition ${
              activeTab === 'edges'
                ? 'bg-blue-600 text-white shadow-xs'
                : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
            }`}
          >
            Relationships / Edges ({edges.length})
          </button>
        </div>

        {/* Local Search Input */}
        <div className="relative w-full sm:w-64">
          <Search className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder="Search list..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-1.5 rounded-full text-xs bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20"
          />
        </div>
      </div>

      {/* Nodes Tab */}
      {activeTab === 'nodes' && (
        <GlassTable>
          <GlassTableHeader>
            <tr>
              <th className="px-4 py-3 text-left">Type</th>
              <th className="px-4 py-3 text-left">Label / Title</th>
              <th className="px-4 py-3 text-left">Year / Category</th>
              <th className="px-4 py-3 text-left">Provenance</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </GlassTableHeader>
          <GlassTableBody>
            {filteredNodes.map((n) => (
              <GlassTableRow key={n.id} onClick={() => onSelectNode(n)} className="cursor-pointer">
                <GlassTableCell>
                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                      n.type === 'PAPER'
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : n.type === 'CLAIM'
                        ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
                        : n.type === 'METHOD'
                        ? 'bg-sky-50 dark:bg-sky-950/40 text-sky-700 dark:text-sky-300 border border-sky-200 dark:border-sky-800'
                        : n.type === 'DATASET'
                        ? 'bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-300 border border-amber-200 dark:border-amber-800'
                        : 'bg-teal-50 dark:bg-teal-950/40 text-teal-700 dark:text-teal-300 border border-teal-200 dark:border-teal-800'
                    }`}
                  >
                    {n.type}
                  </span>
                </GlassTableCell>
                <GlassTableCell className="font-semibold max-w-xs truncate">
                  {n.data.title || n.label}
                </GlassTableCell>
                <GlassTableCell className="text-slate-500 dark:text-slate-400">
                  {n.data.year || n.data.conceptType || '—'}
                </GlassTableCell>
                <GlassTableCell>
                  <ProvenanceBadge provenance={(n.data.provenance as any) || 'REPORTED_IN_PAPER'} />
                </GlassTableCell>
                <GlassTableCell className="text-right">
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      onSelectNode(n);
                    }}
                    className="p-1 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    title="Inspect details"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </GlassTableCell>
              </GlassTableRow>
            ))}
          </GlassTableBody>
        </GlassTable>
      )}

      {/* Edges Tab */}
      {activeTab === 'edges' && (
        <GlassTable>
          <GlassTableHeader>
            <tr>
              <th className="px-4 py-3 text-left">Relationship</th>
              <th className="px-4 py-3 text-left">Source Entity</th>
              <th className="px-4 py-3 text-left">Target Entity</th>
              <th className="px-4 py-3 text-left">Status / Provenance</th>
              <th className="px-4 py-3 text-right">Action</th>
            </tr>
          </GlassTableHeader>
          <GlassTableBody>
            {filteredEdges.map((e) => (
              <GlassTableRow key={e.id} onClick={() => onSelectEdge(e)} className="cursor-pointer">
                <GlassTableCell>
                  <RelationBadge type={e.type as any} />
                </GlassTableCell>
                <GlassTableCell className="font-medium max-w-xs truncate text-slate-700 dark:text-slate-300">
                  {e.source}
                </GlassTableCell>
                <GlassTableCell className="font-medium max-w-xs truncate text-slate-700 dark:text-slate-300">
                  {e.target}
                </GlassTableCell>
                <GlassTableCell>
                  <div className="flex items-center gap-1.5">
                    {e.data.reviewStatus && <ReviewStatusBadge status={e.data.reviewStatus} />}
                    {e.data.provenance && <ProvenanceBadge provenance={e.data.provenance as any} />}
                  </div>
                </GlassTableCell>
                <GlassTableCell className="text-right">
                  <button
                    type="button"
                    onClick={(eEvent) => {
                      eEvent.stopPropagation();
                      onSelectEdge(e);
                    }}
                    className="p-1 rounded-full text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40"
                    title="Inspect relationship"
                  >
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </GlassTableCell>
              </GlassTableRow>
            ))}
          </GlassTableBody>
        </GlassTable>
      )}
    </div>
  );
};
