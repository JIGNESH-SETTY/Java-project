import React from 'react';
import { DocumentChunk } from '../types';
import { X, FileText, Layers, Hash, BookOpen } from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';

interface Props {
  chunk: DocumentChunk | null;
  paperTitle?: string;
  onClose: () => void;
}

export const ChunkViewerModal: React.FC<Props> = ({ chunk, paperTitle, onClose }) => {
  if (!chunk) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
      <div className="bg-[#131b2e] border border-slate-700/80 rounded-2xl w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh]">
        {/* Header */}
        <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-semibold text-slate-100 text-base">Source Evidence Chunk</h3>
                <ProvenanceBadge provenance="REPORTED_IN_PAPER" />
              </div>
              <p className="text-xs text-slate-400 mt-0.5 truncate max-w-md">
                {paperTitle || 'Primary Source Document'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Strip */}
        <div className="px-5 py-3 bg-slate-900/30 border-b border-slate-800/80 flex flex-wrap items-center gap-4 text-xs text-slate-300">
          <div className="flex items-center gap-1.5 text-indigo-300">
            <BookOpen className="w-3.5 h-3.5" />
            <span>Section: <strong>{chunk.sectionName}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-300">
            <Layers className="w-3.5 h-3.5" />
            <span>Page: <strong>{chunk.pageNumber || 'N/A'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-amber-300">
            <Hash className="w-3.5 h-3.5" />
            <span>Chunk #{chunk.chunkIndex}</span>
          </div>
          <div className="text-slate-400">
            Chars: {chunk.charStart} - {chunk.charEnd} (~{chunk.tokenCount} tokens)
          </div>
        </div>

        {/* Chunk Content */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-sm leading-relaxed text-slate-200 bg-[#0d1322]/50 whitespace-pre-wrap select-text">
          {chunk.content}
        </div>

        {/* Footer */}
        <div className="p-4 border-t border-slate-800 bg-slate-900/40 flex justify-between items-center text-xs text-slate-400">
          <span>Embedding model: {chunk.embeddingModel || 'all-minilm-l6-v2'}</span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
