import React, { useState, useEffect } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { paperApi } from '../api/paperApi';
import { comparisonApi } from '../api/comparisonApi';
import { ComparisonResult, DocumentChunk } from '../types';
import { Scale, Sparkles, Check, FileText, AlertCircle, Info, ExternalLink } from 'lucide-react';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { ChunkViewerModal } from '../components/ChunkViewerModal';

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

  // Default to first 2 papers if available
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
      if (selectedIds.length <= 2) return; // Minimum 2 papers required
      next = selectedIds.filter((item) => item !== id);
    } else {
      if (selectedIds.length >= 5) return; // Maximum 5 papers allowed
      next = [...selectedIds, id];
    }
    setSelectedIds(next);
    compareMutation.mutate(next);
  };

  const handleInspectEvidence = async (chunkId: string) => {
    // Find in all papers' chunks
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

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Paper Comparison Workspace</h1>
        <p className="text-xs text-slate-400">
          Side-by-side evidence matrix comparing problems, architectures, metrics, results, and limitations
        </p>
      </div>

      {/* Paper Selector Card */}
      <div className="glass-panel p-5 rounded-2xl border border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-slate-200">
            Select 2 to 5 papers to compare ({selectedIds.length} selected):
          </span>
          <span className="text-[11px] text-slate-500">Min 2, Max 5 papers</span>
        </div>

        <div className="flex flex-wrap gap-2">
          {papers.map((p) => {
            const isSelected = selectedIds.includes(p.paper.id);
            return (
              <button
                key={p.paper.id}
                onClick={() => toggleSelectPaper(p.paper.id)}
                className={`px-3 py-1.5 rounded-xl text-xs font-medium transition flex items-center gap-2 border ${
                  isSelected
                    ? 'bg-indigo-600 text-white border-indigo-500 shadow-md shadow-indigo-600/30'
                    : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
                }`}
              >
                {isSelected && <Check className="w-3.5 h-3.5" />}
                <span className="truncate max-w-xs">{p.paper.title}</span>
                <span className="text-[10px] opacity-75">({p.paper.publicationYear})</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Comparison Loading / Content */}
      {compareMutation.isPending ? (
        <div className="text-center py-20 text-slate-500 text-xs">
          Synthesizing structured comparison matrix from paper chunks...
        </div>
      ) : !comparisonResult ? (
        <div className="text-center py-16 text-slate-500 text-xs">
          Select at least 2 papers above to view structured comparison.
        </div>
      ) : (
        <div className="space-y-8">
          {/* Structured Comparison Table */}
          <div className="glass-panel rounded-2xl border border-slate-800 overflow-hidden shadow-xl">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="bg-slate-900/90 border-b border-slate-800">
                    <th className="p-4 font-bold text-slate-300 w-48 shrink-0">
                      Scientific Aspect
                    </th>
                    {comparisonResult.papers.map((p) => (
                      <th key={p.paper.id} className="p-4 font-bold text-slate-100 min-w-[280px]">
                        <div className="space-y-1">
                          <div className="text-sm font-semibold text-indigo-300 line-clamp-2">
                            {p.paper.title}
                          </div>
                          <div className="text-[11px] font-normal text-slate-400">
                            {p.paper.venue} • {p.paper.publicationYear}
                          </div>
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>

                <tbody className="divide-y divide-slate-800/80">
                  {comparisonResult.rows.map((row) => (
                    <tr key={row.aspectKey} className="hover:bg-slate-900/40 transition">
                      <td className="p-4 font-semibold text-slate-300 align-top bg-slate-900/30">
                        {row.aspectLabel}
                      </td>
                      {comparisonResult.papers.map((p) => {
                        const cell = row.cells[p.paper.id];
                        const isMissing =
                          !cell || cell.content.includes('Not clearly reported');

                        return (
                          <td key={p.paper.id} className="p-4 align-top space-y-2 leading-relaxed">
                            <p
                              className={`text-xs ${
                                isMissing ? 'text-slate-500 italic' : 'text-slate-200'
                              }`}
                            >
                              {cell?.content || 'Not clearly reported in the available text'}
                            </p>

                            {cell && cell.evidenceChunkIds.length > 0 && !isMissing && (
                              <button
                                onClick={() => handleInspectEvidence(cell.evidenceChunkIds[0])}
                                className="inline-flex items-center gap-1.5 text-[10px] text-indigo-400 hover:text-indigo-300 pt-1 font-mono"
                              >
                                <FileText className="w-3 h-3" />
                                <span>Evidence Chunk Grounding</span>
                              </button>
                            )}
                          </td>
                        );
                      })}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Cross-Paper Synthesis Section */}
          <div className="glass-panel p-6 rounded-2xl border border-violet-500/30 bg-gradient-to-br from-violet-950/20 via-slate-900/60 to-slate-900/90 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-xl bg-violet-500/20 text-violet-300 border border-violet-500/30">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-100 text-sm">Cross-Paper AI Synthesis</h3>
                  <p className="text-xs text-slate-400">
                    Model-generated pattern discovery, technical consensus, and empirical divergences
                  </p>
                </div>
              </div>
              <ProvenanceBadge provenance="AI_INTERPRETATION" />
            </div>

            {/* Markdown Synthesis */}
            <div className="prose prose-invert max-w-none text-xs leading-relaxed text-slate-300 whitespace-pre-wrap font-sans">
              {comparisonResult.aiSynthesis.synthesisMarkdown}
            </div>

            {/* Consensus vs Divergence Split */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
              <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-xs text-emerald-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span>Identified Consensus Across Papers</span>
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  {comparisonResult.aiSynthesis.consensusPoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>

              <div className="bg-amber-950/20 border border-amber-500/30 rounded-xl p-4 space-y-2">
                <h4 className="font-semibold text-xs text-amber-300 flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                  <span>Methodological & Empirical Divergence</span>
                </h4>
                <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                  {comparisonResult.aiSynthesis.divergencePoints.map((pt, i) => (
                    <li key={i}>{pt}</li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Chunk Evidence Inspector Modal */}
      <ChunkViewerModal
        chunk={selectedChunk}
        onClose={() => setSelectedChunk(null)}
      />
    </div>
  );
};
