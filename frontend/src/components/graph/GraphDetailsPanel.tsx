import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  X,
  ExternalLink,
  BookOpen,
  ArrowUpRight,
  GitCommit,
  Layers,
  HelpCircle,
  ShieldCheck,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Crosshair,
  Filter,
  FileText,
  Quote,
  Check,
  XCircle,
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
        className={`p-6 rounded-[26px] bg-white/85 border border-white/95 shadow-[0_12px_32px_-8px_rgba(41,40,43,0.04)] backdrop-blur-md flex flex-col items-center justify-center text-center text-xs select-none ${className}`}
      >
        <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-[#8E8B92] mb-3">
          <Crosshair className="w-6 h-6" />
        </div>
        <h4 className="font-bold text-[#29282B] text-sm tracking-tight">Entity Inspector</h4>
        <p className="text-[#8E8B92] text-xs mt-1.5 leading-relaxed max-w-xs">
          Click on any node or relationship edge in the graph to inspect verified provenance, source passages, and citations.
        </p>
      </div>
    );
  }

  return (
    <div
      className={`p-5 rounded-[26px] bg-white/90 border border-white/95 shadow-[0_12px_32px_-8px_rgba(41,40,43,0.06)] backdrop-blur-md overflow-y-auto space-y-5 text-xs select-none ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div className="flex items-center gap-2">
          {selectedNode && (
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                selectedNode.type === 'PAPER'
                  ? 'bg-indigo-100 text-indigo-800'
                  : selectedNode.type === 'CLAIM'
                  ? 'bg-purple-100 text-purple-800'
                  : selectedNode.type === 'METHOD'
                  ? 'bg-blue-100 text-blue-800'
                  : selectedNode.type === 'DATASET'
                  ? 'bg-amber-100 text-amber-800'
                  : 'bg-teal-100 text-teal-800'
              }`}
            >
              {selectedNode.type}
            </span>
          )}
          {selectedEdge && (
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-slate-100 text-slate-800">
              RELATIONSHIP: {selectedEdge.type}
            </span>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="p-1 rounded-full text-[#8E8B92] hover:text-[#29282B] hover:bg-slate-100 transition"
          aria-label="Close details"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {/* Selected Paper Details */}
      {selectedNode && selectedNode.type === 'PAPER' && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-[#29282B] text-sm leading-snug">
              {selectedNode.data.title || selectedNode.label}
            </h3>
            <div className="flex flex-wrap items-center gap-2 text-[11px] text-[#77747A] mt-2">
              <span>{selectedNode.data.venue || 'Academic Publication'}</span>
              <span>•</span>
              <span>{selectedNode.data.year || 'N/A'}</span>
              {selectedNode.data.citationCount !== undefined && (
                <>
                  <span>•</span>
                  <span className="font-semibold text-indigo-600">
                    {selectedNode.data.citationCount.toLocaleString()} citations
                  </span>
                </>
              )}
            </div>
            {selectedNode.data.authors && (
              <p className="text-[11px] text-[#615E65] mt-1 font-medium">
                Authors: {Array.isArray(selectedNode.data.authors) ? selectedNode.data.authors.join(', ') : selectedNode.data.authors}
              </p>
            )}
          </div>

          {selectedNode.data.abstract && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="block text-[10px] font-bold uppercase text-[#8E8B92]">Abstract Preview</span>
              <p className="text-xs text-[#29282B] leading-relaxed line-clamp-4">
                {selectedNode.data.abstract}
              </p>
            </div>
          )}

          {selectedNode.data.doi && (
            <div className="flex items-center justify-between text-xs pt-1">
              <span className="text-[#8E8B92] font-medium">DOI:</span>
              <a
                href={`https://doi.org/${selectedNode.data.doi}`}
                target="_blank"
                rel="noreferrer"
                className="text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1 truncate max-w-[200px]"
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
                className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-[#29282B] hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Crosshair className="w-3.5 h-3.5 text-indigo-600" />
                <span>Center Graph Here</span>
              </button>
            )}
            {onFilterConnected && (
              <button
                type="button"
                onClick={() => onFilterConnected(selectedNode.id)}
                className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-[#29282B] hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
              >
                <Filter className="w-3.5 h-3.5 text-teal-600" />
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
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                {selectedNode.data.claimType || 'FINDING'}
              </span>
              <ProvenanceBadge provenance={(selectedNode.data.provenance as any) || 'REPORTED_IN_PAPER'} confidence={selectedNode.data.confidence} />
            </div>
            <h3 className="font-bold text-[#29282B] text-xs leading-snug">
              "{selectedNode.data.normalizedText || selectedNode.label}"
            </h3>
          </div>

          {selectedNode.data.sourceText && (
            <div className="p-3.5 rounded-2xl bg-amber-50/60 border border-amber-200/80 space-y-1.5">
              <div className="flex items-center gap-1.5 text-amber-800 font-bold text-[10px] uppercase">
                <Quote className="w-3 h-3 text-amber-600" />
                <span>Verbatim Source Passage</span>
              </div>
              <p className="text-xs text-[#29282B] italic font-serif leading-relaxed">
                "{selectedNode.data.sourceText}"
              </p>
              {selectedNode.data.sectionName && (
                <span className="block text-[10px] text-amber-800 font-medium">
                  {selectedNode.data.sectionName} · Page {selectedNode.data.pageNumber || 'N/A'}
                </span>
              )}
            </div>
          )}

          {onCenterGraph && (
            <button
              type="button"
              onClick={() => onCenterGraph(selectedNode.id)}
              className="w-full py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-[#29282B] hover:bg-slate-50 font-semibold text-xs flex items-center justify-center gap-1.5 transition"
            >
              <Crosshair className="w-3.5 h-3.5 text-purple-600" />
              <span>Center Focus on Claim</span>
            </button>
          )}
        </div>
      )}

      {/* Selected Concept / Method / Dataset */}
      {selectedNode && ['CONCEPT', 'METHOD', 'DATASET', 'AI_INTERPRETATION', 'CHUNK', 'UNRESOLVED_PAPER'].includes(selectedNode.type) && (
        <div className="space-y-4">
          <div>
            <h3 className="font-bold text-[#29282B] text-sm leading-snug">
              {selectedNode.label}
            </h3>
            {selectedNode.data.conceptType && (
              <span className="text-[10px] font-semibold text-[#8E8B92] uppercase mt-1 block">
                Category: {selectedNode.data.conceptType}
              </span>
            )}
          </div>

          {selectedNode.data.content && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="block text-[10px] font-bold uppercase text-[#8E8B92]">Passage / Note</span>
              <p className="text-xs text-[#29282B] leading-relaxed">
                {selectedNode.data.content}
              </p>
            </div>
          )}

          {selectedNode.type === 'AI_INTERPRETATION' && (
            <div className="p-3 rounded-2xl bg-purple-50 border border-purple-200 text-purple-900 text-xs leading-relaxed space-y-1">
              <div className="flex items-center gap-1.5 font-bold text-[11px] text-purple-800">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>AI Synthesis Warning</span>
              </div>
              <p className="text-[11px] text-purple-700">
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

          <div className="space-y-2 p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80">
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8E8B92] block">Source Entity</span>
              <p className="font-semibold text-xs text-[#29282B]">{selectedEdge.source}</p>
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold text-[#8E8B92] block">Target Entity</span>
              <p className="font-semibold text-xs text-[#29282B]">{selectedEdge.target}</p>
            </div>
          </div>

          {selectedEdge.data.rationale && (
            <div className="p-3.5 rounded-2xl bg-white border border-slate-200 shadow-xs space-y-1">
              <span className="block text-[10px] font-bold uppercase text-[#8E8B92]">Relationship Rationale</span>
              <p className="text-xs text-[#29282B] leading-relaxed italic font-serif">
                "{selectedEdge.data.rationale}"
              </p>
            </div>
          )}

          {selectedEdge.data.rawReferenceText && (
            <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-1">
              <span className="block text-[10px] font-bold uppercase text-[#8E8B92]">Extracted Citation Text</span>
              <p className="text-xs text-[#615E65] leading-relaxed font-mono">
                {selectedEdge.data.rawReferenceText}
              </p>
            </div>
          )}

          {/* AI Proposed Warning Notice */}
          {selectedEdge.data.isAiProposed && (
            <div className="p-3.5 rounded-2xl bg-purple-50/80 border border-purple-200 text-purple-900 space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-[11px] text-purple-800">
                <Sparkles className="w-3.5 h-3.5 text-purple-600" />
                <span>AI-Proposed Evidence Link</span>
              </div>
              <p className="text-[11px] text-purple-700 leading-relaxed">
                AI-proposed relationship based on the linked evidence. Review before treating it as a research conclusion.
              </p>
            </div>
          )}

          {/* Evidence Chunk Snippets */}
          {selectedEdge.data.evidenceChunkIds && selectedEdge.data.evidenceChunkIds.length > 0 && (
            <div className="space-y-1.5">
              <span className="block text-[10px] font-bold uppercase text-[#8E8B92]">
                Supporting Evidence ({selectedEdge.data.evidenceChunkIds.length} Chunks)
              </span>
              <div className="space-y-2">
                {selectedEdge.data.evidenceChunkIds.map((cid, i) => (
                  <div key={cid} className="p-2.5 rounded-xl bg-slate-50 border border-slate-200/80 text-[11px] text-[#615E65]">
                    <span className="font-bold text-[#29282B] block mb-0.5">Evidence Chunk #{i + 1}</span>
                    <span className="font-mono text-[10px] text-[#8E8B92]">{cid}</span>
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

