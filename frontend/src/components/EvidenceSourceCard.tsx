import React from 'react';
import { BookOpen, MapPin, ExternalLink, Quote } from 'lucide-react';
import { ProvenanceBadge } from './ProvenanceBadge';
import { GlassButton } from './GlassButton';

interface EvidenceSourceCardProps {
  paperTitle: string;
  sectionName?: string;
  pageNumber?: number;
  content: string;
  provenance?: string;
  confidence?: number;
  onViewChunk?: () => void;
  className?: string;
}

export const EvidenceSourceCard: React.FC<EvidenceSourceCardProps> = ({
  paperTitle,
  sectionName = 'Body',
  pageNumber,
  content,
  provenance = 'REPORTED_IN_PAPER',
  confidence,
  onViewChunk,
  className = '',
}) => {
  return (
    <div className={`p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-2xs flex flex-col gap-3 transition-all hover:border-blue-300 dark:hover:border-blue-700 hover:shadow-xs ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-blue-700 dark:text-blue-400 min-w-0">
          <BookOpen className="w-3.5 h-3.5 shrink-0 text-blue-600 dark:text-blue-400" />
          <span className="truncate" title={paperTitle}>
            {paperTitle}
          </span>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {sectionName && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2.5 py-0.5 rounded-full">
              <MapPin className="w-3 h-3 text-slate-400" />
              {sectionName}
              {pageNumber ? ` • p. ${pageNumber}` : ''}
            </span>
          )}
          <ProvenanceBadge provenance={provenance} confidence={confidence} />
        </div>
      </div>

      <div className="relative pl-3.5 border-l-2 border-blue-500 text-xs text-slate-700 dark:text-slate-300 font-serif leading-relaxed italic bg-blue-50/40 dark:bg-blue-950/40 py-2 pr-3 rounded-r-xl">
        <Quote className="w-3.5 h-3.5 text-blue-400 dark:text-blue-500 absolute -top-1 -left-1.5 fill-current" />
        "{content}"
      </div>

      {onViewChunk && (
        <div className="flex justify-end pt-1">
          <GlassButton size="sm" variant="ghost" onClick={onViewChunk} icon={<ExternalLink className="w-3 h-3" />}>
            Open Verbatim Chunk
          </GlassButton>
        </div>
      )}
    </div>
  );
};
