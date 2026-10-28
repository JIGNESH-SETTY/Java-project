import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { reviewApi } from '../api/reviewApi';
import { paperApi } from '../api/paperApi';
import { collectionApi } from '../api/collectionApi';
import { DocumentChunk } from '../types';
import {
  Sparkles,
  Download,
  AlertTriangle,
  FileText,
  Layers,
  BookOpen,
  Filter,
  CheckCircle2,
  FolderKanban
} from 'lucide-react';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { ChunkViewerModal } from '../components/ChunkViewerModal';
import { GlassPanel, GlassPanelStrong } from '../components/GlassPanel';
import { GlassButton } from '../components/GlassButton';

export const LiteratureReviewPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [topic, setTopic] = useState('How does Retrieval-Augmented Generation address context limitations in transformers?');
  const [scope, setScope] = useState('Comprehensive (Architectural evolution, empirical trade-offs, and open research gaps)');
  const [customOutline, setCustomOutline] = useState('');
  const [selectedCollectionId, setSelectedCollectionId] = useState<string>('all');
  const [selectedReviewId, setSelectedReviewId] = useState<string | null>(null);
  const [selectedChunk, setSelectedChunk] = useState<DocumentChunk | null>(null);

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => reviewApi.listReviews(),
  });

  const { data: collections = [] } = useQuery({
    queryKey: ['collections'],
    queryFn: () => collectionApi.listCollections(),
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
          <div className="flex items-center gap-2">
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">Evidence-Backed Literature Reviews</h1>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-purple-50 text-purple-700 border border-purple-200">
              AI-generated synthesis
            </span>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">
            RAG-driven scholarly review synthesis with audited paragraph-to-chunk provenance
          </p>
        </div>

        {activeReview && (
          <div className="flex items-center gap-2">
            <GlassButton
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={() => handleExport('markdown')}
            >
              Export Markdown
            </GlassButton>
            <GlassButton
              variant="secondary"
              size="sm"
              icon={Download}
              onClick={() => handleExport('bibtex')}
            >
              Export BibTeX
            </GlassButton>
          </div>
        )}
      </div>

      {/* Generation Workspace Card */}
      <GlassPanel className="p-6 space-y-4">
        <div className="flex items-center gap-2 font-semibold text-slate-900 text-sm">
          <Sparkles className="w-4 h-4 text-indigo-600" />
          <span>Synthesis Workspace & Research Parameters</span>
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            generateMutation.mutate();
          }}
          className="space-y-4 text-xs"
        >
          <div>
            <label className="block text-slate-700 font-semibold mb-1.5">
              Research Question or Literature Inquiry *
            </label>
            <input
              type="text"
              required
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
              placeholder="e.g. How does Retrieval-Augmented Generation address context limitations in transformers?"
              className="w-full glass-input px-3.5 py-2.5 text-slate-900 placeholder-slate-400 font-medium"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Corpus / Collection Filter</label>
              <div className="relative">
                <select
                  value={selectedCollectionId}
                  onChange={(e) => setSelectedCollectionId(e.target.value)}
                  className="w-full glass-select px-3 py-2 text-slate-900 font-medium"
                >
                  <option value="all">Entire Research Library ({papers.length} papers)</option>
                  {collections.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name} ({c.paperCount} papers)
                    </option>
                  ))}
                </select>
              </div>
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Synthesis Scope</label>
              <input
                type="text"
                value={scope}
                onChange={(e) => setScope(e.target.value)}
                placeholder="e.g. Comprehensive, Critical Comparative, Brief Overview"
                className="w-full glass-input px-3 py-2 text-slate-900"
              />
            </div>

            <div>
              <label className="block text-slate-700 font-semibold mb-1.5">Custom Outline Instructions</label>
              <input
                type="text"
                value={customOutline}
                onChange={(e) => setCustomOutline(e.target.value)}
                placeholder="e.g. Highlight Lost in the Middle and positional bias in Section 3"
                className="w-full glass-input px-3 py-2 text-slate-900"
              />
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 border-t border-slate-200/60">
            <span className="text-[11px] text-slate-500">
              Pipeline: Hybrid chunk retrieval → Thematic grouping → Grounded drafting → Verbatim citation verification
            </span>
            <GlassButton
              type="submit"
              variant="primary"
              size="md"
              icon={Sparkles}
              disabled={generateMutation.isPending || !topic.trim()}
            >
              {generateMutation.isPending ? 'Synthesizing...' : 'Synthesize Review'}
            </GlassButton>
          </div>
        </form>
      </GlassPanel>

      {/* Previous Reviews Strip */}
      {reviews.length > 1 && (
        <div className="flex items-center gap-2 overflow-x-auto pb-1 text-xs">
          <span className="text-slate-500 font-medium text-[11px] shrink-0">Previous Reviews:</span>
          {reviews.map((r) => (
            <button
              key={r.id}
              onClick={() => setSelectedReviewId(r.id)}
              className={`px-3 py-1.5 rounded-xl border truncate max-w-xs transition font-medium ${
                selectedReviewId === r.id
                  ? 'bg-indigo-600 text-white border-indigo-600 shadow-sm'
                  : 'glass-panel text-slate-700 border-white/80 hover:bg-white/80'
              }`}
            >
              {r.title}
            </button>
          ))}
        </div>
      )}

      {/* Active Review & Evidence Panel Split View */}
      {isReviewLoading ? (
        <div className="text-center py-20 text-slate-500 text-xs font-medium">Loading review synthesis...</div>
      ) : activeReview ? (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Review Column on GlassPanelStrong for maximum readability */}
          <div className="lg:col-span-2">
            <GlassPanelStrong className="p-7 space-y-6">
              {/* Review Title & Provenance Badges */}
              <div className="space-y-3 border-b border-slate-200/80 pb-4">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <ProvenanceBadge provenance="AI_INTERPRETATION" />
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded bg-purple-50 text-purple-700 border border-purple-200">
                      AI-generated synthesis
                    </span>
                  </div>
                  <span className="text-[11px] text-slate-500">
                    Model: {activeReview.modelName} • {new Date(activeReview.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <h2 className="text-2xl font-bold text-slate-900 tracking-tight leading-snug">
                  {activeReview.title}
                </h2>
              </div>

              {/* Coverage Warning Banner if applicable */}
              {activeReview.coverageWarning && (
                <div className="p-4 rounded-xl bg-amber-50/90 border border-amber-300 text-amber-900 text-xs flex items-start gap-3 shadow-sm">
                  <AlertTriangle className="w-4 h-4 shrink-0 text-amber-600 mt-0.5" />
                  <div className="space-y-1">
                    <span className="font-bold text-amber-900">Corpus Coverage & Uncertainty Warning</span>
                    <p className="text-[11px] text-amber-800 leading-relaxed">
                      {activeReview.coverageWarning}
                    </p>
                  </div>
                </div>
              )}

              {/* Review Content */}
              <div className="text-xs leading-relaxed text-slate-800 whitespace-pre-wrap font-sans space-y-4">
                {activeReview.contentMarkdown}
              </div>
            </GlassPanelStrong>
          </div>

          {/* Right Column: Audited Evidence Panel */}
          <div className="space-y-4">
            <GlassPanel className="p-4 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-xs text-slate-900">Audited Evidence Panel</h3>
                <p className="text-[10px] text-slate-500">
                  Every paragraph is grounded in primary source chunks
                </p>
              </div>
              <span className="px-2.5 py-0.5 rounded text-[11px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200">
                {activeReview.evidence.length} citations
              </span>
            </GlassPanel>

            <div className="space-y-3 max-h-[750px] overflow-y-auto pr-1">
              {activeReview.evidence.map((ev) => (
                <GlassPanel
                  key={ev.id}
                  className="p-4 space-y-2.5 text-xs hover:shadow-glass-hover transition"
                >
                  <div className="flex items-center justify-between text-[11px]">
                    <span className="font-bold text-indigo-700">
                      Paragraph #{ev.paragraphIndex + 1}
                    </span>
                    <span className="text-[10px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                      {ev.citationLabel}
                    </span>
                  </div>

                  <div className="font-semibold text-slate-900 line-clamp-1">
                    {ev.paperTitle}
                  </div>

                  <div className="text-[10px] text-slate-500">
                    Section: <span className="font-medium text-slate-700">{ev.sectionName}</span> • Page {ev.pageNumber || 'N/A'}
                  </div>

                  <p className="bg-slate-50/90 p-2.5 rounded-xl border border-slate-200/80 text-[11px] text-slate-800 font-mono italic line-clamp-4 leading-relaxed">
                    "{ev.snippet}"
                  </p>

                  <div className="pt-1 flex justify-end">
                    <button
                      onClick={() => handleInspectChunk(ev.chunkId)}
                      className="text-[11px] text-indigo-600 hover:text-indigo-800 flex items-center gap-1 font-semibold transition"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>Inspect Source Chunk</span>
                    </button>
                  </div>
                </GlassPanel>
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
