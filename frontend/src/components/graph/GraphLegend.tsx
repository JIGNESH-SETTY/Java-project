import React, { useState } from 'react';
import { ChevronDown, ChevronUp, HelpCircle } from 'lucide-react';

interface GraphLegendProps {
  graphMode?: 'citation' | 'concept';
  className?: string;
}

export const GraphLegend: React.FC<GraphLegendProps> = ({
  graphMode = 'concept',
  className = '',
}) => {
  const [isExpanded, setIsExpanded] = useState(false);

  const nodeTypesCitation = [
    { label: 'Indexed Paper', shape: 'rounded-md', color: 'bg-blue-600', border: 'border-blue-400' },
    { label: 'Imported (User)', shape: 'rounded-md', color: 'bg-blue-600', border: 'border-teal-400 border-2' },
    { label: 'External / Unresolved', shape: 'rounded-md', color: 'bg-slate-300 dark:bg-slate-700', border: 'border-slate-500 border-dashed' },
  ];

  const nodeTypesConcept = [
    { label: 'Paper', shape: 'rounded-md', color: 'bg-blue-600', border: 'border-blue-400' },
    { label: 'Concept / Topic', shape: 'rounded-full', color: 'bg-teal-600', border: 'border-teal-400' },
    { label: 'Claim', shape: 'rounded-sm rotate-45', color: 'bg-blue-600', border: 'border-blue-400' },
    { label: 'Evidence Chunk', shape: 'rounded-none', color: 'bg-slate-600', border: 'border-slate-400' },
    { label: 'Dataset', shape: 'rounded-full px-2', color: 'bg-amber-600', border: 'border-amber-400' },
    { label: 'Method / Model', shape: 'rounded-sm rotate-45', color: 'bg-sky-600', border: 'border-sky-400' },
    { label: 'AI Interpretation', shape: 'rounded-md', color: 'bg-blue-50 dark:bg-blue-950', border: 'border-blue-400 border-dashed text-blue-700 dark:text-blue-300' },
  ];

  const edgeTypes = [
    { label: 'CITES', color: '#64748B', style: 'solid', description: 'Direct paper citation' },
    { label: 'REPORTS', color: '#2563EB', style: 'solid', description: 'Paper reports claim' },
    { label: 'HAS_EVIDENCE', color: '#94A3B8', style: 'dotted', description: 'Grounded in verbatim chunk' },
    { label: 'USES_METHOD', color: '#0891B2', style: 'solid', description: 'Uses method or model' },
    { label: 'EVALUATED_ON', color: '#D97706', style: 'solid', description: 'Evaluated on benchmark dataset' },
    { label: 'SUPPORTS', color: '#059669', style: 'solid', description: 'Empirical/logical support' },
    { label: 'CONTRADICTS', color: '#DC2626', style: 'solid-thick', description: 'Conflicting empirical finding' },
    { label: 'QUALIFIES', color: '#EA580C', style: 'dashed', description: 'Limits scope or boundary' },
    { label: 'EXTENDS', color: '#2563EB', style: 'dashed', description: 'Builds upon or generalizes' },
    { label: 'AI_PROPOSED', color: '#1D4ED8', style: 'dashed', description: 'AI generated proposal (unconfirmed)' },
  ];

  const relevantNodeTypes = graphMode === 'citation' ? nodeTypesCitation : nodeTypesConcept;

  return (
    <div
      className={`rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300 ${className}`}
    >
      <button
        type="button"
        onClick={() => setIsExpanded(!isExpanded)}
        className="w-full flex items-center justify-between px-3.5 py-2 text-xs font-semibold text-slate-800 dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-slate-800/60 transition"
      >
        <div className="flex items-center gap-1.5">
          <HelpCircle className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
          <span>Graph Legend & Taxonomy</span>
        </div>
        {isExpanded ? <ChevronUp className="w-3.5 h-3.5 text-slate-400" /> : <ChevronDown className="w-3.5 h-3.5 text-slate-400" />}
      </button>

      {isExpanded && (
        <div className="p-3.5 pt-1 border-t border-slate-100 dark:border-slate-800 max-h-72 overflow-y-auto space-y-3 text-[11px]">
          {/* Node Types Section */}
          <div>
            <span className="block font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wider mb-1.5">
              Node Types
            </span>
            <div className="grid grid-cols-2 gap-2">
              {relevantNodeTypes.map((n) => (
                <div key={n.label} className="flex items-center gap-2">
                  <span
                    className={`w-3.5 h-3.5 shrink-0 ${n.shape} ${n.color} border ${n.border} shadow-xs`}
                  />
                  <span className="text-slate-800 dark:text-slate-200 font-medium truncate">{n.label}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Edge Types Section */}
          <div>
            <span className="block font-bold text-slate-400 dark:text-slate-500 uppercase text-[9px] tracking-wider mb-1.5">
              Relationship / Edge Types
            </span>
            <div className="space-y-1.5">
              {edgeTypes.map((e) => (
                <div key={e.label} className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2 min-w-0">
                    <span
                      className="w-5 h-0 shrink-0 inline-block"
                      style={{
                        borderTop:
                          e.style === 'solid-thick'
                            ? `3px solid ${e.color}`
                            : e.style === 'dashed'
                            ? `2px dashed ${e.color}`
                            : e.style === 'dotted'
                            ? `2px dotted ${e.color}`
                            : `2px solid ${e.color}`,
                      }}
                    />
                    <span className="font-semibold text-slate-800 dark:text-slate-200 truncate">{e.label}</span>
                  </div>
                  <span className="text-slate-500 dark:text-slate-400 text-[10px] truncate max-w-[140px] text-right">
                    {e.description}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
