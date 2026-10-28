import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../api/reviewApi';
import { paperApi } from '../api/paperApi';
import { ReviewDetail, ReviewSummary, DocumentChunk } from '../types';
import {
  FileSpreadsheet,
  Sparkles,
  Download,
  AlertTriangle,
  FileText,
  Layers,
  ChevronRight,
  BookOpen,
  Send,
  Check
} from 'lucide-react';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { ChunkViewerModal } from '../components/ChunkViewerModal';

export const LiteratureReviewPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState('How does Retrieval-Augmented Generation address context limitations in transformers?');
  const [scope, setScope] = useState('Comprehensive (Architectural evolution, empirical trade-offs, and open research gaps)');
  const [customOutline, setCustomOutline] = useState('');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [selectedChunk, setSelectedChunk] = useState<DocumentChunk | null>(null);

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => reviewApi.listReviews(),
  });

  const { data: papers = [] } = useQuery({
    queryKey: ['papers'],
    queryFn: () => paperApi.listPapers(0, 50),
  });

  const { data: activeReview, isLoading: isReviewLoading } = useQuery({
    queryKey: ['review', selectedReviewId],
    queryFn: () => reviewApi.getReviewDetail(selectedReviewId!),
    enabled: !!selectedReviewId,
  });

  // Select first review automatically if available
  React.useEffect(() => {
    if (reviews.length > 0 && !selectedReviewId) {
      setSelectedReviewId(reviews[0].id);
    }
  }, [reviews]);

  const generateMutation = useMutation({
    mutationFn: () =>
      reviewApi.generateReview({
        query: topic,
        scope,
        customOutline: customOutline.trim() || undefined,
      }),
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['reviews'] });
      setSelectedReviewId(data.id);
    },
  });

  const handleExport = async (format: 'markdown' | 'bibtex') => {
    if (!selectedReviewId) return;
    try {
      const text = await reviewApi.exportReview(selectedReviewId, format);
      const blob = new Blob([text], { type: 'text/plain' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = format === 'bibtex' ? `citations_${selectedReviewId}.bib` : `review_${selectedReviewId}.md`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (e) {
      console.error('Export failed', e);
    }
  };

  const handleInspectChunk = async (chunkId: string) => {
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
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Evidence-Backed Literature Reviews</h1>
          <p className="text-xs text-slate-400">
            RAG-driven scholarly review synthesis with audited paragraph-to-chunk provenance
          </p>
        </div>

        {activeReview && (
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleExport('markdown')}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-indigo-400" />
              <span>Export Markdown</span>
            </button>
            <button
              onClick={() => handleExport('bibtex')}
              className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-medium border border-slate-700 flex items-center gap-1.5 transition"
            >
              <Download className="w-3.5 h-3.5 text-emerald-400" />
              <span>Export BibTeX</span>
            </button>
          </div>
        )}
      </div>

      {/* Generation Wizard Form Card */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex items-center gap-2 font-semibold text-slate-200 text-sm">
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span>Generate New Evidence-Grounded Review</span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            generateMutation.mutate();
          }}
          className="space-y-3.5 text-xs"
        >
          <div>
            <label className="block text-slate-300 font-medium mb-1">Research Question or Topic *</label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How does Retrieval-Augmented Generation address context limitations in transformers?"
              className="w-full bg-[#0d1322] border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div>
              <label className="block text-slate-300 font-medium mb-1">Desired Synthesis Scope</label>
              <input
                type="text"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="e.g. Comprehensive, Critical Comparative, Brief Overview"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div>
              <label className="block text-slate-300 font-medium mb-1">Custom Outline Instructions (Optional)</label>
              <input
                type="text"
                value={customOutline}
                onChange={(e) => setCustomOutline(e.target.value)}
                placeholder="e.g. Highlight Lost in the Middle and positional bias in Section 3"
                className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>
          </div>

          <div className="flex items-center justify-between pt-1">
            <span className="text-[11px] text-slate-500">
              Pipeline: Hybrid chunk retrieval → Thematic grouping → Grounded drafting → Citation verification
            </span>
            <button
              type="submit"
              disabled={generateMutation.isPending || !topic.trim()}
              className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>{generateMutation.isPending ? 'Synthesizing...' : 'Generate Review'}</span>
            </button>
          </div>
        </form>
      </div>

      {/* Saved Reviews History Strip */}
      {reviews.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-medium text-[11px] shrink-0">Previous Reviews:</span>
          {reviews.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedReviewId(r.id)}
              className={`px-3 py-1.5 rounded-xl border truncate max-w-xs transition ${
                selectedReviewId === r.id
                  ? 'bg-indigo-600 text-white border-indigo-500 shadow'
                  : 'bg-slate-900 text-slate-300 border-slate-800 hover:bg-slate-800'
              }`}
            >
              {r.title}
            </button>
          ))}
        </div>
      )}

      {/* Active Review & Evidence Panel Split View */}
      {isReviewLoading ? (
        <div className="text-center py-20 text-slate-500 text-xs">Loading review synthesis...</div>
      ) : activeReview ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Review Column (2 cols) */}
          <div className="lg:col-span-2 glass-panel p-6 rounded-2xl border border-slate-800 space-y-5">
            {/* Review Title & Provenance Badges */}
            <div className="space-y-2 border-b border-slate-800 pb-4">
              <div className="flex items-center justify-between gap-2">
                <ProvenanceBadge provenance="AI_INTERPRETATION" />
                <span className="text-[10px] text-slate-500">
                  Model: {activeReview.modelName} • {new Date(activeReview.createdAt).toLocaleDateString()}
                </span>
              </div>
              <h2 className="text-xl font-bold text-white tracking-tight leading-snug">
                {activeReview.title}
              </h2>
            </div>

            {/* Coverage Warning Banner if applicable */}
            {activeReview.coverageWarning && (
              <div className="p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-amber-300 text-xs flex items-start gap-2.5">
                <AlertTriangle className="w-4 h-4 shrink-0 text-amber-400 mt-0.5" />
                <div className="space-y-0.5">
                  <span className="font-semibold">Corpus Coverage Warning</span>
                  <p className="text-[11px] text-amber-200/90 leading-relaxed">
                    {activeReview.coverageWarning}
                  </p>
                </div>
              </div>
            )}

            {/* Review Content */}
            <div className="prose prose-invert max-w-none text-xs leading-relaxed text-slate-200 whitespace-pre-wrap font-sans space-y-4">
              {activeReview.contentMarkdown}
            </div>
          </div>

          {/* Right Column: Audited Evidence Panel (1 col) */}
          <div className="space-y-4">
            <div className="glass-panel p-4 rounded-xl border border-slate-800 flex items-center justify-between">
              <div>
                <h3 className="font-semibold text-xs text-slate-200">Review Evidence Panel</h3>
                <p className="text-[10px] text-slate-400">
                  Every paragraph is tied to primary source chunks
                </p>
              </div>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                {activeReview.evidence.length} citations
              </span>
            </div>

            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {activeReview.evidence.map((ev, i) => (
                <div
                  key={ev.id}
                  className="glass-card p-3.5 rounded-xl border border-slate-800/80 space-y-2 text-xs hover:border-slate-700 transition"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-semibold text-indigo-400">
                      Paragraph #{ev.paragraphIndex + 1}
                    </span>
                    <span className="text-[10px] text-slate-500">{ev.citationLabel}</span>
                  </div>

                  <div className="font-medium text-slate-200 line-clamp-1">
                    {ev.paperTitle}
                  </div>

                  <div className="text-[10px] text-slate-400">
                    Section: {ev.sectionName} • Page {ev.pageNumber || 'N/A'}
                  </div>

                  <p className="bg-[#0b101d] p-2 rounded-lg border border-slate-800 text-[11px] text-slate-300 font-mono italic line-clamp-3">
                    "{ev.snippet}"
                  </p>

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => handleInspectChunk(ev.chunkId)}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-medium"
                    >
                      <FileText className="w-3 h-3" />
                      <span>Inspect Source Chunk</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      ) : null}

      {/* Chunk Viewer Modal */}
      <ChunkViewerModal
        chunk={selectedChunk}
        onClose={() => setSelectedChunk(null)}
      />
    </div>
  );
};
