import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Database, BarChart3 } from 'lucide-react';
import { NodeBadge } from './NodeBadge';
import type { GraphNodeData } from '../../../types/graph';

export const DatasetNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  const nodeData = data as unknown as GraphNodeData;

  return (
    <div className="relative group w-[250px]">
      {/* 3D Layered base tray/shelf */}
      <div className="absolute inset-0 translate-y-2 rounded-2xl bg-[#7DD3FC] transition-transform group-hover:translate-y-2.5" />

      {/* Main elevated top card */}
      <div
        className={`relative z-10 rounded-2xl p-4 bg-[#EDF8FF] border transition-all duration-200 ${
          selected
            ? 'border-sky-950 ring-2 ring-white/90 shadow-[0_0_25px_rgba(255,255,255,0.35)]'
            : 'border-sky-200/80 hover:border-sky-300 shadow-md'
        }`}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="w-2.5 h-2.5 !bg-sky-600 !border-2 !border-[#EDF8FF]"
        />

        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-sky-200/80 flex items-center justify-center text-sky-900">
              <Database className="w-3.5 h-3.5" />
            </div>
            <NodeBadge customLabel="Benchmark" />
          </div>
        </div>

        {/* Dataset Name */}
        <h4 className="text-sm font-bold text-sky-950 line-clamp-2 leading-snug mb-1">
          {nodeData.title || nodeData.name || 'Dataset'}
        </h4>

        {/* Subtitle / Domain */}
        <p className="text-xs text-sky-800 line-clamp-1 mb-3">
          {nodeData.domain || nodeData.content || 'Evaluation Benchmark'}
        </p>

        {/* Bottom Pill */}
        <div className="flex items-center justify-between pt-2 border-t border-sky-200/70 text-sky-900">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-200/80 text-[10px] font-semibold text-sky-950">
            <BarChart3 className="w-2.5 h-2.5" />
            Empirical Corpus
          </span>
          <span className="text-[10px] text-sky-700">Dataset</span>
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2.5 h-2.5 !bg-sky-600 !border-2 !border-[#EDF8FF]"
        />
      </div>
    </div>
  );
});

DatasetNode.displayName = 'DatasetNode';

