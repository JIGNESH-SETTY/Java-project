import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Quote, FileText } from 'lucide-react';
import { NodeBadge } from './NodeBadge';
import type { GraphNodeData } from '../../../types/graph';

export const EvidenceNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  const nodeData = data as unknown as GraphNodeData;
  const pageStr = nodeData.pageNumber ? `Page ${nodeData.pageNumber}` : 'Excerpt';
  const sectionStr = nodeData.sectionName || 'Passage';

  return (
    <div className="relative group w-[300px]">
      {/* 3D Layered base tray/shelf */}
      <div className="absolute inset-0 translate-y-2 rounded-2xl bg-[#FDE047] transition-transform group-hover:translate-y-2.5" />

      {/* Main elevated top card */}
      <div
        className={`relative z-10 rounded-2xl p-4 bg-[#FEFDE8] border transition-all duration-200 ${
          selected
            ? 'border-amber-950 ring-2 ring-white/90 shadow-[0_0_25px_rgba(255,255,255,0.35)]'
            : 'border-yellow-200/80 hover:border-yellow-300 shadow-md'
        }`}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="w-2.5 h-2.5 !bg-amber-600 !border-2 !border-[#FEFDE8]"
        />

        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-yellow-200/80 flex items-center justify-center text-amber-950">
              <Quote className="w-3.5 h-3.5" />
            </div>
            <NodeBadge provenance="REPORTED_IN_PAPER" customLabel="Verbatim Chunk" />
          </div>

          <span className="px-1.5 py-0.5 rounded text-[10px] font-mono font-semibold bg-yellow-100 text-amber-950">
            {pageStr}
          </span>
        </div>

        {/* Section Header */}
        <div className="text-[11px] font-semibold text-amber-900/80 uppercase tracking-wider mb-1 flex items-center gap-1">
          <FileText className="w-3 h-3" />
          {sectionStr}
        </div>

        {/* Verbatim quote */}
        <p className="text-xs font-serif italic text-amber-950/90 line-clamp-3 leading-relaxed mb-3 bg-amber-50/70 p-2 rounded-lg border border-amber-200/50">
          "{nodeData.content || nodeData.sourceText || 'Verbatim empirical evidence extracted from paper.'}"
        </p>

        {/* Bottom info */}
        <div className="flex items-center justify-between pt-1 text-[10px] text-amber-900/80">
          <span className="font-mono">Primary Source</span>
          <span className="font-semibold text-amber-950">Non-Hallucinatory</span>
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2.5 h-2.5 !bg-amber-600 !border-2 !border-[#FEFDE8]"
        />
      </div>
    </div>
  );
});

EvidenceNode.displayName = 'EvidenceNode';

