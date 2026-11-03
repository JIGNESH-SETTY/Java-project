import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ExternalLink,
  BookOpen,
  Crosshair,
  Filter,
  Quote,
  Sparkles,
} from 'lucide-react';
import { GraphNode, GraphEdge } from '../../types/graph';
import { ProvenanceBadge } from '../ProvenanceBadge';
import { RelationBadge, ReviewStatusBadge } from '../RelationBadge';
import { GlassButton } from '../GlassButton';

interface GraphDetailsPanelProps {
  selectedNode: GraphNode | null;
  selectedEdge: GraphEdge | null;
  onClose: () => void;
  onCenterGraph?: (id: string) => void;
  onFilterConnected?: (id: string) => void;
  className?: string;
}

export const GraphDetailsPanel: React.FC<GraphDetailsPanelProps> = ({
  selectedNode,
  selectedEdge,
  onClose,
  onCenterGraph,
  onFilterConnected,
  className = '',
}) => {
  const navigate = useNavigate();

  if (!selectedNode && !selectedEdge) {
    return (
      <div
        className={`p-6 rounded-[26px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm flex flex-col items-center justify-center text-center text-xs select-none ${className}`}
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 dark:bg-slate-800 flex items-center justify-center text-slate-400 dark:text-slate-500 mb-3">
          <Crosshair className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">Entity Inspector</h4>
        <p className="text-slate-500 dark:text-slate-400 text-xs mt-1.5 leading-relaxed max-w-xs">
          Click on any node or relationship edge in the graph to inspect verified provenance, source passages, and citations.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`p-5 rounded-[26px] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-y-auto space-y-5 text-xs select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-slate-800">
        <div className="flex items-center gap-2">
          {selectedNode && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                selectedNode.type === 'PAPER'
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                  : selectedNode.type === 'CLAIM'
                  ? 'bg-blue-100 dark:bg-blue-950/60 text-blue-800 dark:text-blue-300'
                  : selectedNode.type === 'METHOD'
                  ? 'bg-sky-100 dark:bg-sky-950/60 text-sky-800 dark:text-sky-300'
                  : selectedNode.type === 'DATASET'
                  ? 'bg-amber-100 dark:bg-amber-950/60 text-amber-800 dark:text-amber-300'
                  : 'bg-teal-100 dark:bg-teal-950/60 text-teal-800 dark:text-teal-300'
              }`}
            >
              {selectedNode.type}
            </span>
          )}
          {selectedEdge && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200">
              RELATIONSHIP: {selectedEdge.type}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
          aria-label="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Paper Details */}
      {selectedNode && selectedNode.type === 'PAPER' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">
              {selectedNode.data.title || selectedNode.label}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-slate-500 dark:text-slate-400 mt-2">
              <span>{selectedNode.data.venue || 'Academic Publication'}</span>
              <span>•</span>
              <span>{selectedNode.data.year || 'N/A'}</span>
              {selectedNode.data.citationCount !== undefined && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-blue-600 dark:text-blue-400">
                    {selectedNode.data.citationCount.toLocaleString()} citations
                  </span>
                </>
              )}
            </div>
            {selectedNode.data.authors && (
              <p className="text-[11px] text-slate-600 dark:text-slate-300 mt-1 font-medium">
                Authors: {Array.isArray(selectedNode.data.authors) ? selectedNode.data.authors.join(', ') : selectedNode.data.authors}
              </p>
            )}
          </div>

          {selectedNode.data.abstract && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Abstract Preview</span>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed line-clamp-4">
                {selectedNode.data.abstract}
              </p>
            </div>
          )}

          {selectedNode.data.doi && (
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-slate-500 dark:text-slate-400 font-medium">DOI:</span>
              <a
                href={`https://doi.org/${selectedNode.data.doi}`}
                target="_blank"
                rel="noreferrer"
                className="text-blue-600 dark:text-blue-400 hover:underline font-semibold flex items-center gap-1 truncate max-w-[200px]"
              >
                <span>{selectedNode.data.doi}</span>
                <ExternalLink className="w-3 h-3 shrink-0" />
              </a>
            </div>
          )}

          {/* Actions */}
          <div className="pt-2 flex flex-col gap-2">
            {selectedNode.data.paperId && selectedNode.data.isImported !== false && (
              <GlassButton
                variant="primary"
                size="sm"
                icon={<BookOpen className="w-3.5 h-3.5" />}
                onClick={() => navigate(`/papers/${selectedNode.data.paperId}`)}
                className="w-full"
              >
                Open Paper Workspace
              </GlassButton>
            )}
            {onCenterGraph && (
              <button
                type="button"
                onClick={() => onCenterGraph(selectedNode.id)}
                className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Crosshair className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>Center Graph Here</span>
              </button>
            )}
            {onFilterConnected && (
              <button
                type="button"
                onClick={() => onFilterConnected(selectedNode.id)}
                className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Filter className="w-3.5 h-3.5 text-teal-600 dark:text-teal-400" />
                <span>Show Only Connected Papers</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* Selected Claim Details */}
      {selectedNode && selectedNode.type === 'CLAIM' && (
        <div className="space-y-4">
          <div>
            <div className="flex items-center justify-between gap-2 mb-2">
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                {selectedNode.data.claimType || 'FINDING'}
              </span>
              <ProvenanceBadge provenance={(selectedNode.data.provenance as any) || 'REPORTED_IN_PAPER'} confidence={selectedNode.data.confidence} />
            </div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs leading-snug">
              "{selectedNode.data.normalizedText || selectedNode.label}"
            </h3>
          </div>

          {selectedNode.data.sourceText && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 dark:bg-amber-950/30 border border-amber-200/80 dark:border-amber-800/60 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-800 dark:text-amber-300 font-bold text-[10px] uppercase">
                <Quote className="w-3 h-3 text-amber-600 dark:text-amber-400" />
                <span>Verbatim Source Passage</span>
              </div>
              <p className="text-xs text-slate-800 dark:text-slate-200 italic font-serif leading-relaxed">
                "{selectedNode.data.sourceText}"
              </p>
              {selectedNode.data.sectionName && (
                <span className="block text-[10px] text-amber-800 dark:text-amber-300 font-medium">
                  {selectedNode.data.sectionName} · Page {selectedNode.data.pageNumber || 'N/A'}
                </span>
              )}
            </div>
          )}

          {onCenterGraph && (
            <button
              type="button"
              onClick={() => onCenterGraph(selectedNode.id)}
              className="w-full py-1.5 px-3 rounded-xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-700 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Crosshair className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
              <span>Center Focus on Claim</span>
            </button>
          )}
        </div>
      )}

      {/* Selected Concept / Method / Dataset */}
      {selectedNode && ['CONCEPT', 'METHOD', 'DATASET', 'AI_INTERPRETATION', 'CHUNK', 'UNRESOLVED_PAPER'].includes(selectedNode.type) && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-slate-900 dark:text-slate-100 text-sm leading-snug">
              {selectedNode.label}
            </h3>
            {selectedNode.data.conceptType && (
              <span className="text-[10px] font-semibold text-slate-500 dark:text-slate-400 uppercase mt-1 block">
                Category: {selectedNode.data.conceptType}
              </span>
            )}
          </div>

          {selectedNode.data.content && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Passage / Note</span>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed">
                {selectedNode.data.content}
              </p>
            </div>
          )}

          {selectedNode.type === 'AI_INTERPRETATION' && (
            <div className="p-3 rounded-2xl bg-blue-50 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 text-xs leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[11px] text-blue-800 dark:text-blue-300">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>AI Synthesis Warning</span>
              </div>
              <p className="text-[11px] text-blue-700 dark:text-blue-300">
                This is an AI-generated synthesis combining multiple cross-paper insights. Verify against linked source chunks before citing.
              </p>
            </div>
          )}
        </div>
      )}

      {/* Selected Edge (Relationship) Details */}
      {selectedEdge && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <RelationBadge type={selectedEdge.type as any} />
            {selectedEdge.data.reviewStatus && (
              <ReviewStatusBadge status={selectedEdge.data.reviewStatus} />
            )}
          </div>

          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800">
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Source Entity</span>
              <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">{selectedEdge.source}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-slate-400 dark:text-slate-500 block">Target Entity</span>
              <p className="font-semibold text-xs text-slate-800 dark:text-slate-200">{selectedEdge.target}</p>
            </div>
          </div>

          {selectedEdge.data.rationale && (
            <div className="p-3.5 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-xs space-y-1">
              <span className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Relationship Rationale</span>
              <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed italic font-serif">
                "{selectedEdge.data.rationale}"
              </p>
            </div>
          )}

          {selectedEdge.data.rawReferenceText && (
            <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 space-y-1">
              <span className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">Extracted Citation Text</span>
              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-mono">
                {selectedEdge.data.rawReferenceText}
              </p>
            </div>
          )}

          {/* AI Proposed Warning Notice */}
          {selectedEdge.data.isAiProposed && (
            <div className="p-3.5 rounded-2xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200 dark:border-blue-800 text-blue-900 dark:text-blue-200 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[11px] text-blue-800 dark:text-blue-300">
                <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
                <span>AI-Proposed Evidence Link</span>
              </div>
              <p className="text-[11px] text-blue-700 dark:text-blue-300 leading-relaxed">
                AI-proposed relationship based on the linked evidence. Review before treating it as a research conclusion.
              </p>
            </div>
          )}

          {/* Evidence Chunk Snippets */}
          {selectedEdge.data.evidenceChunkIds && selectedEdge.data.evidenceChunkIds.length > 0 && (
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold uppercase text-slate-400 dark:text-slate-500">
                Supporting Evidence ({selectedEdge.data.evidenceChunkIds.length} Chunks)
              </span>
              <div className="space-y-2">
                {selectedEdge.data.evidenceChunkIds.map((cid, i) => (
                  <div key={cid} className="p-2.5 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-[11px] text-slate-600 dark:text-slate-300">
                    <span className="font-bold text-slate-800 dark:text-slate-200 block mb-0.5">Evidence Chunk #{i + 1}</span>
                    <span className="font-mono text-[10px] text-slate-400 dark:text-slate-500">{cid}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
