import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import { AlertCircle, CheckCircle, HelpCircle, ArrowRight } from 'lucide-react';
import type { GraphEdgeData } from '../../../types/graph';

export const FlowEdge: React.FC<EdgeProps> = memo(({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  data,
  selected,
}) => {
  const edgeData = (data || {}) as GraphEdgeData;
  const isAi = edgeData.provenance === 'AI_INTERPRETATION';
  const label = edgeData.label || '';
  const type = (edgeData.type || '') as string;

  // Determine edge stroke styling by relationship semantics
  let strokeColor = '#64748B'; // Default slate
  let badgeBg = 'bg-stone-800 text-stone-200 border-stone-700';

  if (type === 'CONTRADICTS' || label.includes('CONTRADICT')) {
    strokeColor = '#EF4444'; // Red
    badgeBg = 'bg-red-950/90 text-red-200 border-red-700/80';
  } else if (type === 'SUPPORTS' || label.includes('SUPPORT')) {
    strokeColor = '#10B981'; // Green
    badgeBg = 'bg-emerald-950/90 text-emerald-200 border-emerald-700/80';
  } else if (type === 'QUALIFIES' || label.includes('QUALIF')) {
    strokeColor = '#F59E0B'; // Amber
    badgeBg = 'bg-amber-950/90 text-amber-200 border-amber-700/80';
  } else if (type === 'EXTENDS' || label.includes('EXTEND')) {
    strokeColor = '#A855F7'; // Purple
    badgeBg = 'bg-purple-950/90 text-purple-200 border-purple-700/80';
  } else if (type === 'CITES' || label.includes('CITE')) {
    strokeColor = '#60A5FA'; // Sky/Blue
    badgeBg = 'bg-sky-950/90 text-sky-200 border-sky-700/80';
  }

  // Calculate smooth step path with rounded corners (like top-to-bottom flowchart)
  const [edgePath, labelX, labelY] = getSmoothStepPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
    borderRadius: 16,
  });

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={{
          stroke: selected ? '#FFFFFF' : strokeColor,
          strokeWidth: selected ? 3 : 2,
          strokeDasharray: isAi ? '6 4' : undefined,
          opacity: selected ? 1 : 0.85,
          transition: 'stroke 0.2s, stroke-width 0.2s',
        }}
      />

      {label && (
        <EdgeLabelRenderer>
          <div
            style={{
              position: 'absolute',
              transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
              pointerEvents: 'all',
            }}
            className={`flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold border backdrop-blur-md shadow-md transition-all ${badgeBg} ${
              selected ? 'ring-2 ring-white scale-105' : ''
            }`}
          >
            {isAi && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-ping mr-0.5" />
            )}
            <span>{label}</span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

FlowEdge.displayName = 'FlowEdge';

