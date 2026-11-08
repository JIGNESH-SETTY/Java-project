import React, { useState, useEffect, useRef } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { paperApi } from '../api/paperApi';
import { comparisonApi } from '../api/comparisonApi';
import { ComparisonResult, DocumentChunk } from '../types';
import {
  Scale,
  Sparkles,
  Check,
  Info,
  ExternalLink,
  Target,
  Cpu,
  Database,
  BarChart2,
  CheckCircle2,
  AlertTriangle,
  Award,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { ChunkViewerModal } from '../components/ChunkViewerModal';

export const ComparisonPage: React.FC = () => {
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [comparisonResult, setComparisonResult] = useState<ComparisonResult | null>(null);
  const [selectedChunk, setSelectedChunk] = useState<DocumentChunk | null>(null);

  const tableScrollRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);
  const [scrollProgress, setScrollProgress] = useState(0);

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

  const updateScrollState = () => {
    const el = tableScrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    setCanScrollLeft(el.scrollLeft > 10);
    setCanScrollRight(el.scrollLeft < maxScroll - 10);
    if (maxScroll > 0) {
      setScrollProgress(Math.round((el.scrollLeft / maxScroll) * 100));
    } else {
      setScrollProgress(0);
    }
  };

  useEffect(() => {
    updateScrollState();
    window.addEventListener('resize', updateScrollState);
    return () => window.removeEventListener('resize', updateScrollState);
  }, [comparisonResult]);

  const slideLeft = () => {
    tableScrollRef.current?.scrollBy({ left: -340, behavior: 'smooth' });
  };

  const slideRight = () => {
    tableScrollRef.current?.scrollBy({ left: 340, behavior: 'smooth' });
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = Number(e.target.value);
    setScrollProgress(val);
    const el = tableScrollRef.current;
    if (!el) return;
    const maxScroll = el.scrollWidth - el.clientWidth;
    el.scrollLeft = (val / 100) * maxScroll;
  };

  const scrollToPaper = (index: number) => {
    const el = tableScrollRef.current;
    if (!el) return;
    // Aspect column is 230px, each paper is ~320px
    el.scrollTo({ left: index * 320, behavior: 'smooth' });
  };

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
    { key: 'problem', label: 'Research Problem', icon: Target, desc: 'Motivation & target gap' },
    { key: 'methodology', label: 'Methodology & Architecture', icon: Cpu, desc: 'Algorithms & model design' },
    { key: 'datasets', label: 'Evaluated Datasets', icon: Database, desc: 'Benchmarks, corpora & splits' },
    { key: 'metrics', label: 'Reported Metrics', icon: BarChart2, desc: 'Quantitative evaluation criteria' },
    { key: 'findings', label: 'Key Empirical Results', icon: CheckCircle2, desc: 'Validated performance gains' },
    { key: 'limitations', label: 'Limitations & Caveats', icon: AlertTriangle, desc: 'Known failure modes & bounds' },
    { key: 'contributions', label: 'Scientific Contributions', icon: Award, desc: 'Primary conceptual advances' },
  ];

  return (
    <div className="p-6 max-w-[1600px] mx-auto space-y-6 smooth-page-load">
      {/* Header */}
      <div>
        <div className="mb-2">
          <span className="pill">
            <Scale className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#38BDF8]" />
            <span>Structured Multi-Paper Analysis</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0B2A33] dark:text-[#E0F2F6] tracking-tight">
          Cross-Paper Comparison Matrix
        </h1>
        <p className="text-xs sm:text-sm text-[#475569] dark:text-[#8EB3C2] mt-1 max-w-2xl leading-relaxed">
          Side-by-side evidence matrix comparing research problems, architectures, metrics, empirical findings, and limitations. Every cell links directly to chunk citations.
        </p>
      </div>

      {/* Paper Selector Card */}
      <div className="card p-5 space-y-3.5">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-1 border-b border-[#D9E1E9]/70 dark:border-[#1E4656]/70">
          <div className="flex items-center gap-2.5">
            <span className="text-xs font-bold text-[#0B2A33] dark:text-[#E0F2F6]">
              Select Papers to Compare
            </span>
            <span className="pill text-[11px] font-mono font-semibold">
              {selectedIds.length} / 5 active
            </span>
          </div>
          <span className="text-[11px] text-[#5B6B7D] dark:text-[#6B8F9E] font-medium">
            Select between 2 and 5 papers for simultaneous matrix synthesis
          </span>
        </div>

        <div className="flex flex-wrap gap-2 pt-0.5">
          {papers.map((p) => {
            const isSelected = selectedIds.includes(p.paper.id);
            return (
              <button
                key={p.paper.id}
                onClick={() => toggleSelectPaper(p.paper.id)}
                className={`px-3 py-1.5 rounded-[9px] text-xs font-medium transition flex items-center gap-2 border cursor-pointer ${
                  isSelected
                    ? 'bg-[#0F4C5C] text-white border-[#0F4C5C] shadow-sm font-semibold'
                    : 'bg-[#FFFFFF] dark:bg-[#122B36] text-[#334155] dark:text-[#C4DDE5] border-[#D9E1E9] dark:border-[#1E4656] hover:bg-[#FAFBFD] dark:hover:bg-[#1A3E4E]'
                }`}
              >
                <span className={`w-3.5 h-3.5 rounded-[4px] flex items-center justify-center shrink-0 border ${
                  isSelected
                    ? 'bg-white text-[#0F4C5C] border-white'
                    : 'border-[#C3CED9] dark:border-[#2A5A6E]'
                }`}>
                  {isSelected && <Check className="w-2.5 h-2.5 stroke-[3]" />}
                </span>
                <span className="truncate max-w-xs">{p.paper.title}</span>
                {p.paper.publicationYear && (
                  <span className={`text-[10px] font-mono px-1.5 py-0.2 rounded ${
                    isSelected ? 'bg-white/20 text-white' : 'bg-[#EEF2F6] dark:bg-[#0D222B] text-[#5B6B7D] dark:text-[#8EB3C2]'
                  }`}>
                    {p.paper.publicationYear}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Loading state */}
      {compareMutation.isPending && (
        <div className="card p-12 text-center text-[#5B6B7D] dark:text-[#6B8F9E] text-xs space-y-3">
          <div className="w-7 h-7 border-2 border-[#0F4C5C] dark:border-[#38BDF8] border-t-transparent rounded-full animate-spin mx-auto" />
          <p className="font-medium">Synthesizing multi-paper aspect matrix &amp; cross-verifying evidence...</p>
        </div>
      )}

      {/* Comparison Matrix Table */}
      {!compareMutation.isPending && comparisonResult && (
        <div className="space-y-4">
          {/* Top Info Bar & Slide Controls */}
          <div className="card p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3.5 bg-white dark:bg-[#122B36] border border-[#D9E1E9] dark:border-[#1E4656] shadow-2xs">
            {/* Left: Quick Slide to Column buttons */}
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="text-[11px] font-bold uppercase tracking-[0.08em] text-[#5B6B7D] dark:text-[#8EB3C2] mr-1">
                Slide to Paper:
              </span>
              {comparisonResult.papers.map((p, pIdx) => (
                <button
                  key={p.paper.id}
                  onClick={() => scrollToPaper(pIdx)}
                  className="px-2.5 py-1 rounded-[6px] text-xs font-semibold bg-[#EEF2F6] hover:bg-[#DCEBEE] dark:bg-[#0D222B] dark:hover:bg-[#1B4A59] text-[#0F4C5C] dark:text-[#38BDF8] border border-[#D9E1E9] dark:border-[#1E4656] transition cursor-pointer flex items-center gap-1.5"
                >
                  <span className="w-4 h-4 rounded-full bg-[#0F4C5C] text-white text-[10px] flex items-center justify-center font-bold">
                    {pIdx + 1}
                  </span>
                  <span className="truncate max-w-[130px] sm:max-w-[170px]">{p.paper.title}</span>
                </button>
              ))}
            </div>

            {/* Right: Slide Bar Slider + Nav Buttons */}
            <div className="flex items-center gap-3 self-end md:self-auto shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-[11px] text-[#5B6B7D] dark:text-[#8EB3C2] font-semibold hidden sm:inline">
                  Slide Matrix:
                </span>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={scrollProgress}
                  onChange={handleSliderChange}
                  className="w-28 sm:w-36 h-2 bg-[#EEF2F6] dark:bg-[#0D222B] rounded-lg appearance-none cursor-pointer accent-[#0F4C5C] border border-[#D9E1E9] dark:border-[#1E4656]"
                  title="Drag slide bar to scroll through papers"
                />
              </div>

              <div className="flex items-center gap-1">
                <button
                  onClick={slideLeft}
                  disabled={!canScrollLeft}
                  className={`p-1.5 rounded-[7px] border transition cursor-pointer ${
                    canScrollLeft
                      ? 'bg-white dark:bg-[#122B36] text-[#0F4C5C] dark:text-[#38BDF8] border-[#D9E1E9] dark:border-[#1E4656] hover:bg-[#EEF2F6] dark:hover:bg-[#1A3E4E]'
                      : 'bg-[#F7F9FB] dark:bg-[#091920] text-[#94A3B8] dark:text-[#527584] border-[#D9E1E9]/50 dark:border-[#1E4656]/50 cursor-not-allowed opacity-40'
                  }`}
                  title="Slide left to previous papers"
                  aria-label="Slide Left"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>

                <button
                  onClick={slideRight}
                  disabled={!canScrollRight}
                  className={`p-1.5 rounded-[7px] border transition cursor-pointer ${
                    canScrollRight
                      ? 'bg-white dark:bg-[#122B36] text-[#0F4C5C] dark:text-[#38BDF8] border-[#D9E1E9] dark:border-[#1E4656] hover:bg-[#EEF2F6] dark:hover:bg-[#1A3E4E]'
                      : 'bg-[#F7F9FB] dark:bg-[#091920] text-[#94A3B8] dark:text-[#527584] border-[#D9E1E9]/50 dark:border-[#1E4656]/50 cursor-not-allowed opacity-40'
                  }`}
                  title="Slide right to view 4th / 5th papers"
                  aria-label="Slide Right"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Matrix Table with Sticky Aspect Column & Custom Scrollbar */}
          <div className="tbl shadow-sm overflow-hidden">
            <div
              ref={tableScrollRef}
              onScroll={updateScrollState}
              className="custom-table-scrollbar w-full overflow-x-auto"
            >
              <table>
                <thead>
                  <tr>
                    <th className="sticky-col w-[230px] min-w-[210px] max-w-[250px] align-bottom">
                      <span className="text-[11px] font-bold text-[#5B6B7D] dark:text-[#8EB3C2] tracking-[0.06em] uppercase">
                        Aspect / Dimension
                      </span>
                    </th>
                    {comparisonResult.papers.map((p, idx) => (
                      <th key={p.paper.id} className="min-w-[320px] w-[320px] sm:min-w-[340px] align-top">
                        <div className="space-y-2">
                          <div className="flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <span className="w-4 h-4 rounded-full bg-[#0F4C5C] text-white text-[10px] flex items-center justify-center font-bold">
                                {idx + 1}
                              </span>
                              <span className="text-[10.5px] font-mono font-bold px-2 py-0.5 rounded-[5px] bg-[#EEF2F6] dark:bg-[#0D222B] text-[#0F4C5C] dark:text-[#38BDF8] border border-[#D9E1E9] dark:border-[#1E4656]">
                                {p.paper.publicationYear || 'Publication'}
                              </span>
                            </div>
                            <Link
                              to={`/papers/${p.paper.id}`}
                              className="text-[11px] font-semibold text-[#0A6A80] dark:text-[#38BDF8] hover:underline flex items-center gap-1"
                              title="Open full paper details"
                            >
                              <span>Open details</span>
                              <ExternalLink className="w-3 h-3" />
                            </Link>
                          </div>
                          <div className="text-xs font-bold text-[#0B2A33] dark:text-[#E0F2F6] line-clamp-2 leading-snug">
                            {p.paper.title}
                          </div>
                          {p.paper.venue && (
                            <div className="text-[10.5px] text-[#5B6B7D] dark:text-[#6B8F9E] font-normal truncate">
                              {p.paper.venue}
                            </div>
                          )}
                        </div>
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {(comparisonResult.rows && comparisonResult.rows.length > 0 ? comparisonResult.rows : rows.map(r => ({ aspectKey: r.key, aspectLabel: r.label, cells: {} }))).map((row, idx) => {
                    const rowMeta = rows.find(r => r.key === row.aspectKey) || {
                      label: row.aspectLabel,
                      icon: Target,
                      desc: '',
                    };
                    const RowIcon = rowMeta.icon;

                    return (
                      <tr key={row.aspectKey} className={idx % 2 === 1 ? 'sel' : ''}>
                        <td className="k sticky-col align-top">
                          <div className="flex items-start gap-2.5">
                            <div className="w-6 h-6 rounded-[6px] bg-[#EEF2F6] dark:bg-[#0D222B] border border-[#D9E1E9] dark:border-[#1E4656] text-[#0F4C5C] dark:text-[#38BDF8] flex items-center justify-center shrink-0 mt-0.5">
                              <RowIcon className="w-3.5 h-3.5" />
                            </div>
                            <div>
                              <div className="font-bold text-xs text-[#0B2A33] dark:text-[#E0F2F6] leading-snug">
                                {row.aspectLabel}
                              </div>
                              {rowMeta.desc && (
                                <div className="text-[10px] text-[#5B6B7D] dark:text-[#6B8F9E] font-normal mt-0.5">
                                  {rowMeta.desc}
                                </div>
                              )}
                            </div>
                          </div>
                        </td>
                        {comparisonResult.papers.map((p) => {
                          const cellsMap = (row.cells || {}) as Record<string, any>;
                          const cell = cellsMap[p.paper.id];
                          const hasText = cell && cell.content && cell.content.trim().length > 0;
                          return (
                            <td key={p.paper.id} className="min-w-[320px] w-[320px] sm:min-w-[340px] space-y-3 align-top">
                              <div className="text-xs font-serif leading-relaxed text-[#334155] dark:text-[#C4DDE5] whitespace-pre-wrap">
                                {hasText ? (
                                  cell.content
                                ) : (
                                  <div className="flex items-center gap-1.5 text-[#94A3B8] dark:text-[#527584] italic text-[11.5px] py-1 font-sans">
                                    <Info className="w-3.5 h-3.5 shrink-0 opacity-60" />
                                    <span>Not reported in available document text</span>
                                  </div>
                                )}
                              </div>
                              {hasText && (
                                <div className="flex items-center justify-between pt-2 border-t border-[#D9E1E9]/70 dark:border-[#1E4656]/70">
                                  <ProvenanceBadge provenance={cell.provenance || 'REPORTED_IN_PAPER'} />
                                  {cell.evidenceChunkIds && cell.evidenceChunkIds.length > 0 && (
                                    <button
                                      onClick={() => handleInspectEvidence(cell.evidenceChunkIds[0])}
                                      className="text-[11px] text-[#0A6A80] dark:text-[#38BDF8] hover:underline font-semibold flex items-center gap-1 cursor-pointer"
                                    >
                                      <span>Examine Chunk</span>
                                      <ExternalLink className="w-3 h-3" />
                                    </button>
                                  )}
                                </div>
                              )}
                            </td>
                          );
                        })}
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* AI Cross-Paper Synthesis Section */}
          <div className="space-y-3 pt-2">
            <div className="conc">
              <b>Important Conclusion &amp; Cross-Paper Synthesis</b>
              <div className="mt-2 whitespace-pre-wrap leading-relaxed text-xs sm:text-[13px] font-sans">
                {comparisonResult.aiSynthesis?.synthesisMarkdown || 'No comparative synthesis generated.'}
              </div>
            </div>

            <div className="card p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#4F46B8] dark:text-[#818CF8]" />
                <span className="font-bold text-[#0B2A33] dark:text-[#E0F2F6]">
                  Distinction Principle
                </span>
                <span className="text-[#5B6B7D] dark:text-[#6B8F9E]">
                  The synthesis above is an AI interpretation. Verify factual claims against source chunk citations.
                </span>
              </div>
              <ProvenanceBadge provenance="AI_INTERPRETATION" />
            </div>
          </div>
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
