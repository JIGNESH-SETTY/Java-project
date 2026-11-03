import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { BookOpen, FileText, ExternalLink } from 'lucide-react';
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
    // Secondary external card
    return (
      <div className="relative group w-[280px]">
        {/* Layered base shelf */}
        <div className="absolute inset-0 translate-y-1.5 rounded-2xl bg-slate-300 dark:bg-slate-800 transition-transform group-hover:translate-y-2" />

        {/* Main top surface */}
        <div
          className={`relative z-10 rounded-2xl p-4 bg-slate-100 dark:bg-slate-900 border transition-all duration-200 ${
            selected
              ? 'border-blue-600 ring-2 ring-blue-500/30 shadow-md'
              : 'border-slate-300/80 dark:border-slate-800 hover:border-slate-400 dark:hover:border-slate-700 shadow-sm'
          }`}
        >
          <Handle
            type="target"
            position={Position.Top}
            className="w-2.5 h-2.5 !bg-slate-500 !border-2 !border-slate-100 dark:!border-slate-800"
          />

          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              <FileText className="w-3 h-3 text-slate-500" />
              External Ref
            </span>
            {nodeData.year && (
              <span className="text-[11px] font-mono text-slate-500 dark:text-slate-400">{nodeData.year}</span>
            )}
          </div>

          <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 line-clamp-2 leading-snug mb-1">
            {nodeData.title || 'Untitled Reference'}
          </h4>

          <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3">{authorStr}</p>

          <div className="flex items-center justify-between pt-2 border-t border-slate-200 dark:border-slate-800 text-[11px] text-slate-500 dark:text-slate-400">
            <span className="inline-flex items-center gap-1 text-[10px] text-slate-400 dark:text-slate-500">
              <ExternalLink className="w-3 h-3" /> Unindexed
            </span>
            {citationCount > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-mono text-[10px] border border-slate-200 dark:border-slate-700">
                {citationCount} cites
              </span>
            )}
          </div>

          <Handle
            type="source"
            position={Position.Bottom}
            className="w-2.5 h-2.5 !bg-slate-500 !border-2 !border-slate-100 dark:!border-slate-800"
          />
        </div>
      </div>
    );
  }

  // Primary Indexed Paper Card (Crisp Titanium / Cobalt Light & Deep Obsidian Dark)
  return (
    <div className="relative group w-[280px]">
      {/* 3D Layered base tray/shelf */}
      <div className="absolute inset-0 translate-y-2 rounded-2xl bg-slate-300 dark:bg-slate-800 transition-transform group-hover:translate-y-2.5" />

      {/* Main elevated top card */}
      <div
        className={`relative z-10 rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all duration-200 ${
          selected
            ? 'border-blue-600 ring-2 ring-blue-500/30 shadow-md'
            : 'border-slate-200 dark:border-slate-800 hover:border-blue-400 shadow-sm'
        }`}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="w-2.5 h-2.5 !bg-blue-600 !border-2 !border-white dark:!border-slate-900"
        />

        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
            <NodeBadge provenance={nodeData.provenance} />
          </div>
          {nodeData.year && (
            <span className="px-1.5 py-0.5 rounded text-[11px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700">
              {nodeData.year}
            </span>
          )}
        </div>

        {/* Paper Title */}
        <h4 className="text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug mb-1">
          {nodeData.title || 'Untitled Paper'}
        </h4>

        {/* Authors */}
        <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-1 mb-3 font-medium">{authorStr}</p>

        {/* Bottom Pill Tray */}
        <div className="flex items-center justify-between pt-2.5 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300">
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 border border-blue-100 dark:border-blue-800 text-[10px] font-semibold text-blue-700 dark:text-blue-300">
            {citationCount} {citationCount === 1 ? 'citation' : 'citations'}
          </span>

          {nodeData.doi && (
            <span className="text-[10px] font-mono text-slate-400 dark:text-slate-500 truncate max-w-[100px]">
              {nodeData.doi.replace('https://doi.org/', '')}
            </span>
          )}
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2.5 h-2.5 !bg-blue-600 !border-2 !border-white dark:!border-slate-900"
        />
      </div>
    </div>
  );
});

PaperNode.displayName = 'PaperNode';
