import React, { memo } from 'react';
import { Handle, Position, type NodeProps } from '@xyflow/react';
import { Cpu, Layers, Tag } from 'lucide-react';
import { NodeBadge } from './NodeBadge';
import type { GraphNodeData } from '../../../types/graph';

export const ConceptNode: React.FC<NodeProps> = memo(({ data, selected }) => {
  const nodeData = data as unknown as GraphNodeData;
  const isMethod = nodeData.conceptType === 'METHOD' || nodeData.type === 'METHOD';

  return (
    <div className="relative group w-[250px]">
      {/* 3D Layered base tray/shelf */}
      <div className="absolute inset-0 translate-y-2 rounded-2xl bg-emerald-200 dark:bg-emerald-950/60 transition-transform group-hover:translate-y-2.5" />

      {/* Main elevated top card */}
      <div
        className={`relative z-10 rounded-2xl p-4 bg-emerald-50/90 dark:bg-slate-900 border transition-all duration-200 ${
          selected
            ? 'border-emerald-600 dark:border-emerald-400 ring-2 ring-emerald-500/30 shadow-md'
            : 'border-emerald-200 dark:border-emerald-800/60 hover:border-emerald-300 dark:hover:border-emerald-700 shadow-sm'
        }`}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="w-2.5 h-2.5 !bg-emerald-600 !border-2 !border-white dark:!border-slate-900"
        />

        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-100 dark:bg-emerald-950/80 flex items-center justify-center text-emerald-800 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800">
              {isMethod ? <Cpu className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
            </div>
            <NodeBadge
              customLabel={isMethod ? 'Method' : nodeData.conceptType || 'Concept'}
            />
          </div>
        </div>

        {/* Name */}
        <h4 className="text-sm font-bold text-emerald-950 dark:text-emerald-100 line-clamp-2 leading-snug mb-1">
          {nodeData.title || nodeData.name || 'Concept'}
        </h4>

        {/* Subtitle / Description */}
        <p className="text-xs text-emerald-800 dark:text-emerald-300/80 line-clamp-1 mb-3">
          {nodeData.content || (isMethod ? 'Technical Architecture' : 'Theoretical Paradigm')}
        </p>

        {/* Bottom Pill */}
        <div className="flex items-center justify-between pt-2 border-t border-emerald-200/60 dark:border-emerald-800/50 text-emerald-900 dark:text-emerald-200">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-100 dark:bg-emerald-950/80 text-[10px] font-semibold text-emerald-900 dark:text-emerald-200 border border-emerald-200/80 dark:border-emerald-800">
            <Tag className="w-2.5 h-2.5" />
            {nodeData.category || 'Core Model'}
          </span>
          <span className="text-[10px] text-emerald-700 dark:text-emerald-400">Semantic Node</span>
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2.5 h-2.5 !bg-emerald-600 !border-2 !border-white dark:!border-slate-900"
        />
      </div>
    </div>
  );
});

ConceptNode.displayName = 'ConceptNode';
