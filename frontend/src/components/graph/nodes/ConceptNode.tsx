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
      <div className="absolute inset-0 translate-y-2 rounded-2xl bg-[#86EFAC] transition-transform group-hover:translate-y-2.5" />

      {/* Main elevated top card */}
      <div
        className={`relative z-10 rounded-2xl p-4 bg-[#EDFCF2] border transition-all duration-200 ${
          selected
            ? 'border-emerald-950 ring-2 ring-white/90 shadow-[0_0_25px_rgba(255,255,255,0.35)]'
            : 'border-emerald-200/80 hover:border-emerald-300 shadow-md'
        }`}
      >
        <Handle
          type="target"
          position={Position.Top}
          className="w-2.5 h-2.5 !bg-emerald-600 !border-2 !border-[#EDFCF2]"
        />

        {/* Top Badges */}
        <div className="flex items-center justify-between gap-1.5 mb-2">
          <div className="flex items-center gap-1.5">
            <div className="w-6 h-6 rounded-lg bg-emerald-200/80 flex items-center justify-center text-emerald-900">
              {isMethod ? <Cpu className="w-3.5 h-3.5" /> : <Layers className="w-3.5 h-3.5" />}
            </div>
            <NodeBadge
              customLabel={isMethod ? 'Method' : nodeData.conceptType || 'Concept'}
            />
          </div>
        </div>

        {/* Name */}
        <h4 className="text-sm font-bold text-emerald-950 line-clamp-2 leading-snug mb-1">
          {nodeData.title || nodeData.name || 'Concept'}
        </h4>

        {/* Subtitle / Description */}
        <p className="text-xs text-emerald-800 line-clamp-1 mb-3">
          {nodeData.content || (isMethod ? 'Technical Architecture' : 'Theoretical Paradigm')}
        </p>

        {/* Bottom Pill */}
        <div className="flex items-center justify-between pt-2 border-t border-emerald-200/70 text-emerald-900">
          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full bg-emerald-200/80 text-[10px] font-semibold text-emerald-950">
            <Tag className="w-2.5 h-2.5" />
            {nodeData.category || 'Core Model'}
          </span>
          <span className="text-[10px] text-emerald-700">Semantic Node</span>
        </div>

        <Handle
          type="source"
          position={Position.Bottom}
          className="w-2.5 h-2.5 !bg-emerald-600 !border-2 !border-[#EDFCF2]"
        />
      </div>
    </div>
  );
});

ConceptNode.displayName = 'ConceptNode';

