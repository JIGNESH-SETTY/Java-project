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
    <div className={`p-4 rounded-xl border border-white/80 bg-white/75 shadow-sm backdrop-blur-md flex flex-col gap-3 transition-all hover:border-indigo-200 hover:shadow-md ${className}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-2 text-xs font-semibold text-indigo-700 min-w-0">
          <BookOpen className="w-3.5 h-3.5 shrink-0" />
          <span className="truncate" title={paperTitle}>
            {paperTitle}
          </span>
        </div>
        <div className="shrink-0 flex items-center gap-2">
          {sectionName && (
            <span className="inline-flex items-center gap-1 text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md">
              <MapPin className="w-3 h-3 text-slate-400" />
              {sectionName}
              {pageNumber ? ` • p. ${pageNumber}` : ''}
            </span>
          )}
          <ProvenanceBadge provenance={provenance} confidence={confidence} />
        </div>
      </div>

      <div className="relative pl-3 border-l-2 border-indigo-400/60 text-xs text-slate-700 font-serif leading-relaxed italic bg-indigo-50/20 py-1 pr-2 rounded-r">
        <Quote className="w-3 h-3 text-indigo-300 absolute -top-1 -left-1.5 fill-current" />
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
