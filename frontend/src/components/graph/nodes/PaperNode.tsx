import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { BookOpen, FileText, ChevronDown, ChevronRight, ExternalLink } from 'lucide-react';
import { NodeBadge } from './NodeBadge';
import type { GraphNodeData } from '../../../types/graph';

export const PaperNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  const nodeData = data as unknown as GraphNodeData;
  const isUnresolved = nodeData.isUnresolved || !nodeData.isImported;
  const citationCount = nodeData.citationCount ?? 0;
  const authorStr = Array.isArray(nodeData.authors)
    ? nodeData.authors.join(', ')
    : nodeData.authors || 'Unknown Authors';

  if (isUnresolved) {
    // Dark secondary card (matches the London Meetup / dark card style in reference image)
    return (
      <div className="relative group w-[280px]">
        {/* Layered base shelf */}
        <div className="absolute inset-0 translate-y-1.5 rounded-2xl bg-zinc-950/80 transition-transform group-hover:translate-y-2" />

        {/* Main top surface */}
        <div
          className={`relative z-10 rounded-2xl p-4 bg-zinc-900 border transition-all duration-200 ${
            selected
              ? 'border-white ring-2 ring-white/80 shadow-[0_0_20px_rgba(255,255,255,0.25)]'
              : 'border-zinc-700/70 hover:border-zinc-500 shadow-lg'
          }`}
        >
          <Handle
            type="target"
            position={Position.Top}
            className="w-2.5 h-2.5 !bg-zinc-400 !border-2 !border-zinc-900"
          />

          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-zinc-800 text-zinc-300 border border-zinc-700">
              <FileText className="w-3 h-3 text-zinc-400" />
              External Ref
            </span>
            {nodeData.year && (
              <span className="text-[11px] font-mono text-zinc-400">{nodeData.year}</span>
            )}
          </div>

          <h4 className="text-sm font-semibold text-zinc-100 line-clamp-2 leading-snug mb-1">
            {nodeData.title || 'Untitled Reference'}
          </h4>

          <p className="text-xs text-zinc-400 line-clamp-1 mb-3">{authorStr}</p>

          <div className="flex items-center justify-between pt-2 border-t border-zinc-800/80 text-[11px] text-zinc-400">
            <span className="inline-flex items-center gap-1 text-[10px] text-zinc-500">
              <ExternalLink className="w-3 h-3" /> Unindexed
            </span>
            {citationCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-zinc-800 text-zinc-300 font-mono text-[10px]">
                {citationCount} cites
              </span>
            )}
          </div>

          <Handle
            type="source"
            position={Position.Bottom}
            className="w-2.5 h-2.5 !bg-zinc-400 !border-2 !border-zinc-900"
          />
        </div>
      </div>
    );
  }

  // Warm pastel peach/cream card (matches the primary card style in reference image)
  return (
    <div className="relative group w-[280px]">
      {/* 3D Layered base tray/shelf */}
      <div className="absolute inset-0 translate-y-2 rounded-2xl bg-[#E2CEAE] transition-transform group-hover:translate-y-2.5" />

      {/* Main elevated top card */}
      <div
        className={`relative z-10 rounded-2xl p-4 bg-[#FFF9EE] border transition-all duration-200 ${
          selected
            ? 'border-stone-900 ring-2 ring-white/90 shadow-[0_0_25px_rgba(255,255,255,0.35)]'
            : 'border-amber-200/80 hover:border-amber-300 shadow-md'
        }`}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="w-2.5 h-2.5 !bg-amber-600 !border-2 !border-[#FFF9EE]"
        />

        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-amber-200/70 flex items-center justify-center text-amber-900">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <NodeBadge provenance={nodeData.provenance} />
          </div>
          {nodeData.year && (
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-amber-100 text-amber-900">
              {nodeData.year}
            </span>
          )}
        </div>

        {/* Paper Title */}
        <h4 className="text-sm font-bold text-stone-900 line-clamp-2 leading-snug mb-1">
          {nodeData.title || 'Untitled Paper'}
        </h4>

        {/* Authors */}
        <p className="text-xs text-stone-600 line-clamp-1 mb-3 font-medium">{authorStr}</p>

        {/* Bottom Pill Tray */}
        <div className="flex items-center justify-between pt-2.5 border-t border-amber-200/60 text-stone-700">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-200/60 text-[10px] font-semibold text-amber-950">
            {citationCount} {citationCount === 1 ? 'citation' : 'citations'}
          </span>

          {nodeData.doi && (
            <span className="text-[10px] font-mono text-stone-500 truncate max-w-[100px]">
              {nodeData.doi.replace('https://doi.org/', '')}
            </span>
          )}
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2.5 h-2.5 !bg-amber-600 !border-2 !border-[#FFF9EE]"
        />
      </div>
    </div>
  );
});

PaperNode.displayName = 'PaperNode';

