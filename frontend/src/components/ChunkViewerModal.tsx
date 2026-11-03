import React from 'react';
import { DocumentChunk } from '../types';
import { X, FileText, Layers, Hash, BookOpen } from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';
import { GlassButton } from './GlassButton';

interface Props {
  chunk: DocumentChunk | null;
  paperTitle?: string;
  onClose: () => void;
}

export const ChunkViewerModal: React.FC<Props> = ({ chunk, paperTitle, onClose }) => {
  if (!chunk) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-fade-in">
      <div className="glass-modal w-full max-w-2xl overflow-hidden shadow-2xl flex flex-col max-h-[85vh] bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800">
        {/* Header */}
        <div className="p-5 border-b border-slate-200 dark:border-slate-800 flex items-center justify-between bg-white dark:bg-slate-900">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-xl bg-blue-50 dark:bg-blue-950/60 text-blue-600 dark:text-blue-400 border border-blue-200 dark:border-blue-800 shadow-2xs">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-base">Verbatim Evidence Chunk</h3>
                <ProvenanceBadge provenance="REPORTED_IN_PAPER" />
              </div>
              <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 truncate max-w-md font-medium">
                {paperTitle || 'Primary Source Document'}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            aria-label="Close"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Metadata Strip */}
        <div className="px-5 py-2.5 bg-slate-50 dark:bg-slate-950 border-b border-slate-200 dark:border-slate-800 flex flex-wrap items-center gap-4 text-xs text-slate-600 dark:text-slate-300 font-medium">
          <div className="flex items-center gap-1.5 text-blue-700 dark:text-blue-400">
            <BookOpen className="w-3.5 h-3.5 text-blue-500" />
            <span>Section: <strong>{chunk.sectionName}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-emerald-800 dark:text-emerald-400">
            <Layers className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
            <span>Page: <strong>{chunk.pageNumber || 'N/A'}</strong></span>
          </div>
          <div className="flex items-center gap-1.5 text-slate-700 dark:text-slate-300">
            <Hash className="w-3.5 h-3.5 text-slate-400" />
            <span>Chunk #{chunk.chunkIndex}</span>
          </div>
          <div className="text-slate-400 dark:text-slate-500 text-[11px]">
            Offsets: {chunk.charStart}–{chunk.charEnd} (~{chunk.tokenCount} tokens)
          </div>
        </div>

        {/* Chunk Content */}
        <div className="p-6 overflow-y-auto flex-1 font-mono text-xs sm:text-sm leading-relaxed text-slate-800 dark:text-slate-200 bg-white dark:bg-slate-950 whitespace-pre-wrap select-text border-y border-slate-100 dark:border-slate-800">
          {chunk.content}
        </div>

        {/* Footer */}
        <div className="p-4 bg-white dark:bg-slate-900 border-t border-slate-100 dark:border-slate-800 flex justify-between items-center text-xs text-slate-500 dark:text-slate-400">
          <span>Vector embedding dimension: 384 ({chunk.embeddingModel || 'all-minilm-l6-v2'})</span>
          <GlassButton size="sm" variant="secondary" onClick={onClose}>
            Close
          </GlassButton>
        </div>
      </div>
    </div>
  );
};
