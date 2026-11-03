import React, { memo } from 'react';
import {
  BaseEdge,
  EdgeLabelRenderer,
  getSmoothStepPath,
  type EdgeProps,
} from '@xyflow/react';
import type { GraphEdgeData } from '../../../types/graph';
import { useTheme } from '../../../context/ThemeContext';

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
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const edgeData = (data || {}) as GraphEdgeData;
  const isAi = edgeData.provenance === 'AI_INTERPRETATION';
  const label = edgeData.label || '';
  const type = (edgeData.type || '') as string;

  // Determine edge stroke styling by relationship semantics
  let strokeColor = isDark ? '#94A3B8' : '#64748B';
  let badgeBg = isDark
    ? 'bg-slate-800 text-slate-200 border-slate-700'
    : 'bg-white text-slate-700 border-slate-200 shadow-2xs';

  if (type === 'CONTRADICTS' || label.includes('CONTRADICT')) {
    strokeColor = isDark ? '#F87171' : '#DC2626';
    badgeBg = isDark
      ? 'bg-red-950/90 text-red-200 border-red-800/80'
      : 'bg-red-50 text-red-700 border-red-200';
  } else if (type === 'SUPPORTS' || label.includes('SUPPORT')) {
    strokeColor = isDark ? '#34D399' : '#059669';
    badgeBg = isDark
      ? 'bg-emerald-950/90 text-emerald-200 border-emerald-800/80'
      : 'bg-emerald-50 text-emerald-700 border-emerald-200';
  } else if (type === 'QUALIFIES' || label.includes('QUALIF')) {
    strokeColor = isDark ? '#FBBF24' : '#D97706';
    badgeBg = isDark
      ? 'bg-amber-950/90 text-amber-200 border-amber-800/80'
      : 'bg-amber-50 text-amber-700 border-amber-200';
  } else if (type === 'EXTENDS' || label.includes('EXTEND')) {
    strokeColor = isDark ? '#60A5FA' : '#2563EB';
    badgeBg = isDark
      ? 'bg-blue-950/90 text-blue-200 border-blue-800/80'
      : 'bg-blue-50 text-blue-700 border-blue-200';
  } else if (type === 'CITES' || label.includes('CITE')) {
    strokeColor = isDark ? '#38BDF8' : '#0284C7';
    badgeBg = isDark
      ? 'bg-sky-950/90 text-sky-200 border-sky-800/80'
      : 'bg-sky-50 text-sky-700 border-sky-200';
  }

  // Calculate smooth step path with rounded corners
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
          stroke: selected ? (isDark ? '#60A5FA' : '#2563EB') : strokeColor,
          strokeWidth: selected ? 3.5 : 2,
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
            className={`flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-wider font-semibold border backdrop-blur-md shadow-sm transition-all ${badgeBg} ${
              selected ? (isDark ? 'ring-2 ring-white scale-105' : 'ring-2 ring-blue-500 scale-105') : ''
            }`}
          >
            {isAi && (
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 animate-ping mr-0.5" />
            )}
            <span>{label}</span>
          </div>
        </EdgeLabelRenderer>
      )}
    </>
  );
});

FlowEdge.displayName = 'FlowEdge';
