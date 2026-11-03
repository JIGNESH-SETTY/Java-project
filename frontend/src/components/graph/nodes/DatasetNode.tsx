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
      <div className="absolute inset-0 translate-y-2 rounded-2xl bg-sky-200 dark:bg-sky-950/60 transition-transform group-hover:translate-y-2.5" />

      {/* Main elevated top card */}
      <div
        className={`relative z-10 rounded-2xl p-4 bg-sky-50/90 dark:bg-slate-900 border transition-all duration-200 ${
          selected
            ? 'border-sky-600 dark:border-sky-400 ring-2 ring-sky-500/30 shadow-md'
            : 'border-sky-200 dark:border-sky-800/60 hover:border-sky-300 dark:hover:border-sky-700 shadow-sm'
        }`}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="w-2.5 h-2.5 !bg-sky-600 !border-2 !border-white dark:!border-slate-900"
        />

        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-sky-100 dark:bg-sky-950/80 flex items-center justify-center text-sky-800 dark:text-sky-300 border border-sky-200 dark:border-sky-800">
              <Database className="w-3.5 h-3.5" />
            </div>
            <NodeBadge customLabel="Benchmark" />
          </div>
        </div>

        {/* Dataset Name */}
        <h4 className="text-sm font-bold text-sky-950 dark:text-sky-100 line-clamp-2 leading-snug mb-1">
          {nodeData.title || nodeData.name || 'Dataset'}
        </h4>

        {/* Subtitle / Domain */}
        <p className="text-xs text-sky-800 dark:text-sky-300/80 line-clamp-1 mb-3">
          {nodeData.domain || nodeData.content || 'Evaluation Benchmark'}
        </p>

        {/* Bottom Pill */}
        <div className="flex items-center justify-between pt-2 border-t border-sky-200/60 dark:border-sky-800/50 text-sky-900 dark:text-sky-200">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-sky-100 dark:bg-sky-950/80 text-[10px] font-semibold text-sky-900 dark:text-sky-200 border border-sky-200/80 dark:border-sky-800">
            <BarChart3 className="w-2.5 h-2.5" />
            Empirical Corpus
          </span>
          <span className="text-[10px] text-sky-700 dark:text-sky-400">Dataset</span>
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2.5 h-2.5 !bg-sky-600 !border-2 !border-white dark:!border-slate-900"
        />
      </div>
    </div>
  );
});

DatasetNode.displayName = 'DatasetNode';
