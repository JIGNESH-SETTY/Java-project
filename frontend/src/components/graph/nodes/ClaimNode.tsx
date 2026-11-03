import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Sparkles, AlertTriangle } from 'lucide-react';
import { NodeBadge } from './NodeBadge';
import type { GraphNodeData } from '../../../types/graph';

export const ClaimNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  const nodeData = data as unknown as GraphNodeData;
  const confidence = nodeData.confidence ? Math.round(nodeData.confidence * 100) : null;
  const isAi = nodeData.provenance === 'AI_INTERPRETATION';

  return (
    <div className="relative group w-[280px]">
      {/* 3D Layered base tray/shelf */}
      <div className="absolute inset-0 translate-y-2 rounded-2xl bg-slate-300 dark:bg-slate-800 transition-transform group-hover:translate-y-2.5" />

      {/* Main elevated top card */}
      <div
        className={`relative z-10 rounded-2xl p-4 bg-white dark:bg-slate-900 border transition-all duration-200 ${
          selected
            ? 'border-blue-600 ring-2 ring-blue-500/30 shadow-md'
            : isAi
            ? 'border-blue-300 dark:border-blue-800 border-dashed hover:border-blue-400 shadow-sm'
            : 'border-slate-200 dark:border-slate-800 hover:border-blue-300 dark:hover:border-blue-600 shadow-sm'
        }`}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="w-2.5 h-2.5 !bg-blue-600 !border-2 !border-white dark:!border-slate-900"
        />

        {/* Header */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-blue-50 dark:bg-blue-950/40 flex items-center justify-center text-blue-700 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <NodeBadge provenance={nodeData.provenance} />
          </div>

          {nodeData.claimType && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 truncate max-w-[90px]">
              {nodeData.claimType.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Claim Statement */}
        <p className="text-xs font-semibold text-slate-900 dark:text-slate-100 line-clamp-3 leading-relaxed mb-3">
          "{nodeData.normalizedText || nodeData.sourceText || nodeData.title || 'Claim assertion'}"
        </p>

        {/* Bottom Pill Shelf */}
        <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800 text-slate-600 dark:text-slate-300 text-[11px]">
          {confidence !== null ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-blue-50 dark:bg-blue-950/40 text-[10px] font-semibold text-blue-800 dark:text-blue-300 border border-blue-100 dark:border-blue-800">
              {confidence}% confidence
            </span>
          ) : (
            <span className="text-[10px] text-slate-500 dark:text-slate-400">Empirical claim</span>
          )}

          {isAi && (
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 dark:text-amber-300 font-medium">
              <AlertTriangle className="w-3 h-3 text-amber-600 dark:text-amber-400" /> Needs review
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

ClaimNode.displayName = 'ClaimNode';
