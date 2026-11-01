import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Sparkles, CheckCircle2, AlertTriangle, ShieldCheck } from 'lucide-react';
import { NodeBadge } from './NodeBadge';
import type { GraphNodeData } from '../../../types/graph';

export const ClaimNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  const nodeData = data as unknown as GraphNodeData;
  const confidence = nodeData.confidence ? Math.round(nodeData.confidence * 100) : null;
  const isAi = nodeData.provenance === 'AI_INTERPRETATION';

  return (
    <div className="relative group w-[280px]">
      {/* 3D Layered base tray/shelf */}
      <div className="absolute inset-0 translate-y-2 rounded-2xl bg-[#D8B4FE] transition-transform group-hover:translate-y-2.5" />

      {/* Main elevated top card */}
      <div
        className={`relative z-10 rounded-2xl p-4 bg-[#F5EEFF] border transition-all duration-200 ${
          selected
            ? 'border-purple-950 ring-2 ring-white/90 shadow-[0_0_25px_rgba(255,255,255,0.35)]'
            : isAi
            ? 'border-purple-300/80 border-dashed hover:border-purple-400 shadow-md'
            : 'border-purple-300/80 hover:border-purple-400 shadow-md'
        }`}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="w-2.5 h-2.5 !bg-purple-600 !border-2 !border-[#F5EEFF]"
        />

        {/* Header */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-purple-200/80 flex items-center justify-center text-purple-900">
              <Sparkles className="w-3.5 h-3.5" />
            </div>
            <NodeBadge provenance={nodeData.provenance} />
          </div>

          {nodeData.claimType && (
            <span className="px-1.5 py-0.5 rounded text-[9px] font-mono font-semibold bg-purple-100 text-purple-900 truncate max-w-[90px]">
              {nodeData.claimType.replace('_', ' ')}
            </span>
          )}
        </div>

        {/* Claim Statement */}
        <p className="text-xs font-semibold text-purple-950 line-clamp-3 leading-relaxed mb-3">
          "{nodeData.normalizedText || nodeData.sourceText || nodeData.title || 'Claim assertion'}"
        </p>

        {/* Bottom Pill Shelf */}
        <div className="flex items-center justify-between pt-2 border-t border-purple-200/70 text-purple-900 text-[11px]">
          {confidence !== null ? (
            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-purple-200/80 text-[10px] font-semibold text-purple-950">
              {confidence}% confidence
            </span>
          ) : (
            <span className="text-[10px] text-purple-700">Empirical claim</span>
          )}

          {isAi && (
            <span className="inline-flex items-center gap-1 text-[10px] text-amber-700 font-medium">
              <AlertTriangle className="w-3 h-3" /> Needs review
            </span>
          )}
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2.5 h-2.5 !bg-purple-600 !border-2 !border-[#F5EEFF]"
        />
      </div>
    </div>
  );
});

ClaimNode.displayName = 'ClaimNode';

