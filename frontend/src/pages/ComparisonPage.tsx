import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { paperApi } from '../api/paperApi';
import { comparisonApi } from '../api/comparisonApi';
import { ComparisonResult, DocumentChunk } from '../types';
import { Scale, Sparkles, Check, FileText, AlertCircle, Info, ExternalLink, BookOpen, Quote } from 'lucide-react';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { ChunkViewerModal } from '../components/ChunkViewerModal';
import { GlassPanel, GlassPanelStrong } from '../components/GlassPanel';
import { GlassButton } from '../components/GlassButton';

export const ComparisonPage: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [selectedChunk, setSelectedChunk] = useState<DocumentChunk | null>(null);

  const { data: papers = [] } = useQuery({
    queryKey: ['papers'],
    queryFn: () => paperApi.listPapers(0, 50),
  });

  const compareMutation = useMutation({
    mutationFn: (ids: string[]) => comparisonApi.comparePapers(ids),
    onSuccess: (data) => setComparisonResult(data),
  });

  useEffect(() => {
    if (papers.length >= 2 && selectedIds.length === 0) {
      const defaultIds = [papers[0].paper.id, papers[1].paper.id];
      setSelectedIds(defaultIds);
      compareMutation.mutate(defaultIds);
    }
  }, [papers]);

  const toggleSelectPaper = (id: string) => {
    let next: string[];
    if (selectedIds.includes(id)) {
      if (selectedIds.length <= 2) return;
      next = selectedIds.filter((item) => item !== id);
    } else {
      if (selectedIds.length >= 5) return;
      next = [...selectedIds, id];
    }
    setSelectedIds(next);
    compareMutation.mutate(next);
  };

  const handleInspectEvidence = async (chunkId: string) => {
    for (const p of papers) {
      try {
        const chunks = await paperApi.getPaperChunks(p.paper.id);
        const match = chunks.find((c) => c.id === chunkId);
        if (match) {
          setSelectedChunk(match);
          return;
        }
      } catch (e) {}
    }
  };

  const rows = [
    { key: 'problem', label: 'Research Problem' },
    { key: 'methodology', label: 'Methodology & Architecture' },
    { key: 'datasets', label: 'Evaluated Datasets' },
    { key: 'metrics', label: 'Reported Metrics' },
    { key: 'findings', label: 'Key Empirical Results' },
    { key: 'limitations', label: 'Limitations & Caveats' },
    { key: 'contributions', label: 'Scientific Contributions' },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-1">
          <Scale className="w-4 h-4" />
          <span>Structured Multi-Paper Analysis</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Cross-Paper Comparison Matrix
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Side-by-side evidence matrix comparing research problems, architectures, metrics, empirical findings, and limitations. Every cell links directly to chunk citations.
        </p>
      </div>

      {/* Paper Selector Card */}
      <GlassPanel className="p-5 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-800">
            Select 2 to 5 papers to compare ({selectedIds.length} active):
          </span>
          <span className="text-[11px] text-slate-500 font-medium">Min 2, Max 5 papers</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {papers.map((p) => {
            const isSelected = selectedIds.includes(p.paper.id);
            return (
              <button
                key={p.paper.id}
                onClick={() => toggleSelectPaper(p.paper.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-1.5 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                    : 'bg-white/80 text-slate-700 border-slate-200 hover:bg-white hover:border-slate-300'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span className="truncate max-w-xs">{p.paper.title}</span>
                <span className="text-[10px] opacity-75">({p.paper.publicationYear})</span>
              </button>
            );
          })}
        </div>
      </GlassPanel>

      {/* Loading state */}
      {compareMutation.isPending && (
        <div className="glass-panel p-12 text-center text-slate-500 text-xs">
          <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
          <p>Synthesizing multi-paper aspect matrix & cross-verifying evidence...</p>
        </div>
      )}

      {/* Comparison Matrix Table */}
      {!compareMutation.isPending && comparisonResult && (
        <div className="space-y-6">
          <div className="w-full overflow-x-auto rounded-2xl border border-white/80 shadow-sm bg-white/75 backdrop-blur-md">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200/80 bg-slate-50/80">
                  <th className="p-4 w-48 font-bold text-slate-700 uppercase tracking-wider text-[11px]">
                    Aspect / Dimension
                  </th>
                  {comparisonResult.papers.map((p) => (
                    <th key={p.paper.id} className="p-4 min-w-[280px] font-bold text-slate-900 border-l border-slate-200/60">
                      <div className="space-y-1">
                        <div className="text-sm line-clamp-2 leading-snug">{p.paper.title}</div>
                        <div className="text-[11px] text-slate-500 font-normal">
                          {p.paper.publicationYear} • {p.paper.venue || 'Scholarly Publication'}
                        </div>
                      </div>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {(comparisonResult.rows && comparisonResult.rows.length > 0 ? comparisonResult.rows : rows.map(r => ({ aspectKey: r.key, aspectLabel: r.label, cells: {} }))).map((row) => (
                  <tr key={row.aspectKey} className="hover:bg-slate-50/50 transition-colors">
                    <td className="p-4 font-bold text-slate-800 bg-slate-50/50 align-top">
                      {row.aspectLabel}
                    </td>
                    {comparisonResult.papers.map((p) => {
                      const cellsMap = (row.cells || {}) as Record<string, any>;
                      const cell = cellsMap[p.paper.id];
                      const hasText = cell && cell.content && cell.content.trim().length > 0;
                      return (
                        <td key={p.paper.id} className="p-4 align-top border-l border-slate-100 space-y-2">
                          <p className="text-slate-800 font-sans leading-relaxed text-xs">
                            {hasText ? cell.content : (
                              <span className="text-slate-400 italic">
                                Not clearly reported in the available text
                              </span>
                            )}
                          </p>
                          {hasText && (
                            <div className="flex items-center justify-between pt-1">
                              <ProvenanceBadge provenance={cell.provenance || 'REPORTED_IN_PAPER'} />
                              {cell.evidenceChunkIds && cell.evidenceChunkIds.length > 0 && (
                                <button
                                  onClick={() => handleInspectEvidence(cell.evidenceChunkIds[0])}
                                  className="text-[11px] text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
                                >
                                  <span>View Evidence</span>
                                  <ExternalLink className="w-3 h-3" />
                                </button>
                              )}
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* AI Cross-Paper Synthesis Section */}
          <GlassPanelStrong className="p-6 border-indigo-200/80 shadow-md space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-indigo-100">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-purple-600" />
                <h2 className="font-bold text-slate-900 text-sm">
                  AI Cross-Paper Comparative Synthesis
                </h2>
              </div>
              <ProvenanceBadge provenance="AI_INTERPRETATION" />
            </div>

            <div className="p-4 rounded-xl bg-purple-50/40 border border-purple-100 text-xs text-slate-700 leading-relaxed font-sans space-y-3 whitespace-pre-wrap">
              {comparisonResult.aiSynthesis?.synthesisMarkdown || 'No comparative synthesis generated.'}
            </div>

            <div className="flex items-center gap-2 text-[11px] text-slate-500 font-medium">
              <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
              <span>
                Distinction Principle: The synthesis above is an AI interpretation. Always verify factual claims against individual paper chunk excerpts.
              </span>
            </div>
          </GlassPanelStrong>
        </div>
      )}

      {/* Chunk Viewer Modal */}
      {selectedChunk && (
        <ChunkViewerModal
          chunk={selectedChunk}
          paperTitle="Comparison Matrix Source Evidence"
          onClose={() => setSelectedChunk(null)}
        />
      )}
    </div>
  );
};
