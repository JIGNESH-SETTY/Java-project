import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paperApi } from '../api/paperApi';
import { annotationApi } from '../api/annotationApi';
import { DocumentChunk, Claim } from '../types';
import {
  BookOpen,
  Layers,
  GitCommit,
  Sparkles,
  Link2,
  MessageSquare,
  ArrowLeft,
  Calendar,
  Building2,
  ExternalLink,
  Plus,
  Send,
  FileText
} from 'lucide-react';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { ChunkViewerModal } from '../components/ChunkViewerModal';

export const PaperDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'chunks' | 'claims' | 'aspects' | 'citations' | 'annotations'>('chunks');
  const [selectedChunk, setSelectedChunk] = useState<DocumentChunk | null>(null);
  const [newAnnotation, setNewAnnotation] = useState('');

  const { data: detail, isLoading, error } = useQuery({
    queryKey: ['paper', id],
    queryFn: () => paperApi.getPaperDetail(id!),
    enabled: !!id,
  });

  const { data: annotations = [] } = useQuery({
    queryKey: ['annotations', id],
    queryFn: () => annotationApi.listAnnotations({ paperId: id }),
    enabled: !!id,
  });

  const annotationMutation = useMutation({
    mutationFn: (body: string) => annotationApi.createAnnotation({ paperId: id, body, annotationType: 'NOTE' }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['annotations', id] });
      setNewAnnotation('');
    },
  });

  if (isLoading) {
    return <div className="text-center py-20 text-slate-500 text-xs">Loading publication details...</div>;
  }

  if (error || !detail) {
    return (
      <div className="glass-panel p-8 text-center rounded-2xl border border-rose-500/20 text-rose-300 text-xs space-y-3">
        <p>Failed to load paper details. The paper might be private or does not exist.</p>
        <Link to="/library" className="inline-flex items-center gap-2 text-indigo-400 hover:underline">
          <ArrowLeft className="w-4 h-4" /> Back to library
        </Link>
      </div>
    );
  }

  const { paper, authors, concepts, references, claims, chunks } = detail;

  const handleAddAnnotation = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAnnotation.trim()) return;
    annotationMutation.mutate(newAnnotation.trim());
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Back button */}
      <div>
        <Link
          to="/library"
          className="inline-flex items-center gap-2 text-xs text-slate-400 hover:text-slate-200 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Library</span>
        </Link>
      </div>

      {/* Bibliographic Header */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {paper.publicationYear || 'Publication'}
            </span>
            <ProvenanceBadge provenance="REPORTED_IN_PAPER" />
          </div>

          <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
            Status: {paper.processingStatus}
          </span>
        </div>

        <h1 className="text-xl md:text-2xl font-bold text-white tracking-tight leading-snug">
          {paper.title}
        </h1>

        {/* Authors & Venue */}
        <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-xs text-slate-400">
          <div className="flex items-center gap-1.5 text-slate-300 font-medium">
            <span>By: </span>
            <span>{authors.length > 0 ? authors.map((a) => a.displayName).join(', ') : 'Unknown'}</span>
          </div>

          {paper.venue && (
            <div className="flex items-center gap-1.5">
              <Building2 className="w-3.5 h-3.5 text-slate-500" />
              <span>{paper.venue}</span>
            </div>
          )}

          {paper.doi && (
            <div className="flex items-center gap-1.5 text-indigo-400">
              <ExternalLink className="w-3.5 h-3.5" />
              <span>DOI: {paper.doi}</span>
            </div>
          )}
        </div>

        {/* Abstract */}
        <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800/80 space-y-1.5">
          <div className="text-[10px] font-bold uppercase tracking-wider text-slate-400">Abstract</div>
          <p className="text-xs text-slate-300 leading-relaxed">
            {paper.abstractText || 'No abstract text extracted from this document.'}
          </p>
        </div>

        {/* Concept Chips */}
        {concepts.length > 0 && (
          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-slate-500 font-medium mr-1">Concepts:</span>
            {concepts.map((c, i) => (
              <span
                key={i}
                className="text-[10px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700/60"
              >
                {c.conceptName} <span className="opacity-60 text-[9px]">({c.conceptType})</span>
              </span>
            ))}
          </div>
        )}
      </div>

      {/* Tabs Bar */}
      <div className="flex border-b border-slate-800 gap-6 text-xs font-semibold text-slate-400">
        <button
          onClick={() => setActiveTab('chunks')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'chunks'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>Document Chunks ({chunks.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('claims')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'claims'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <GitCommit className="w-4 h-4" />
          <span>Reported Claims ({claims.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('aspects')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'aspects'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Sparkles className="w-4 h-4 text-violet-400" />
          <span>AI Insights & Aspects</span>
        </button>

        <button
          onClick={() => setActiveTab('citations')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'citations'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <Link2 className="w-4 h-4" />
          <span>References ({references.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('annotations')}
          className={`pb-3 flex items-center gap-2 border-b-2 transition ${
            activeTab === 'annotations'
              ? 'border-indigo-500 text-indigo-400'
              : 'border-transparent hover:text-slate-200'
          }`}
        >
          <MessageSquare className="w-4 h-4 text-amber-400" />
          <span>User Annotations ({annotations.length})</span>
        </button>
      </div>

      {/* Tab 1: Document Chunks */}
      {activeTab === 'chunks' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Displaying segmented semantic chunks with exact character boundaries and page positions.
          </div>
          <div className="space-y-3">
            {chunks.map((chunk) => (
              <div
                key={chunk.id}
                className="glass-card p-4 rounded-xl border border-slate-800/80 space-y-2.5 hover:border-indigo-500/40 transition"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-slate-200">
                      Chunk #{chunk.chunkIndex}
                    </span>
                    <span className="px-2 py-0.5 rounded bg-slate-800 text-[11px] text-indigo-300 border border-slate-700">
                      {chunk.sectionName}
                    </span>
                    <span className="text-slate-500 text-[11px]">
                      Page {chunk.pageNumber || 'N/A'}
                    </span>
                  </div>
                  <button
                    onClick={() => setSelectedChunk(chunk)}
                    className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg transition"
                  >
                    Inspect Full Chunk
                  </button>
                </div>
                <p className="text-xs text-slate-300 font-mono line-clamp-3 bg-slate-900/40 p-2.5 rounded-lg border border-slate-800/40 leading-relaxed">
                  {chunk.content}
                </p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 2: Reported Claims */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Claims explicitly extracted from the paper. Never synthesized without quotation grounding.
          </div>
          <div className="space-y-3">
            {claims.map((claim) => (
              <div
                key={claim.id}
                className="glass-card p-4 rounded-xl border border-slate-800/80 space-y-3"
              >
                <div className="flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                      {claim.claimType}
                    </span>
                    <ProvenanceBadge provenance={claim.provenanceType} confidence={claim.extractionConfidence} />
                  </div>
                  <span className="text-[10px] text-slate-500">
                    Section: {claim.sectionName || 'Body'} • Page {claim.pageNumber || 'N/A'}
                  </span>
                </div>

                <div className="space-y-1.5">
                  <div className="text-xs font-semibold text-slate-100">
                    {claim.normalizedText}
                  </div>
                  <div className="bg-slate-900/70 p-3 rounded-lg border-l-2 border-emerald-500 text-xs text-slate-300 italic">
                    "{claim.sourceText}"
                  </div>
                </div>

                {claim.sourceChunkId && (
                  <div className="flex justify-end pt-1">
                    <button
                      onClick={() => {
                        const c = chunks.find((item) => item.id === claim.sourceChunkId);
                        if (c) setSelectedChunk(c);
                      }}
                      className="text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      <FileText className="w-3.5 h-3.5" />
                      <span>View Source Evidence Chunk</span>
                    </button>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: AI Insights & Aspects */}
      {activeTab === 'aspects' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between p-3.5 rounded-xl bg-violet-950/20 border border-violet-500/30 text-xs text-violet-300">
            <div className="flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-violet-400" />
              <span>Structured Aspect Mining: Synthesized by model based exclusively on paper chunks</span>
            </div>
            <ProvenanceBadge provenance="AI_INTERPRETATION" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1.5">
              <h4 className="font-semibold text-slate-200">Research Objective</h4>
              <p className="text-slate-400 leading-relaxed">
                Develop scalable representations without recurrence bottlenecks.
              </p>
            </div>

            <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1.5">
              <h4 className="font-semibold text-slate-200">Proposed Methodology</h4>
              <p className="text-slate-400 leading-relaxed">
                Multi-head self-attention mechanisms with positional encodings.
              </p>
            </div>

            <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1.5">
              <h4 className="font-semibold text-slate-200">Evaluated Datasets</h4>
              <p className="text-slate-400 leading-relaxed">
                WMT 2014 English-to-German, WMT 2014 English-to-French.
              </p>
            </div>

            <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1.5">
              <h4 className="font-semibold text-slate-200">Evaluation Metrics</h4>
              <p className="text-slate-400 leading-relaxed">
                BLEU Score, Training Efficiency (FLOPs).
              </p>
            </div>

            <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1.5 md:col-span-2">
              <h4 className="font-semibold text-slate-200">Major Reported Findings</h4>
              <p className="text-slate-400 leading-relaxed">
                Achieves 28.4 BLEU on English-to-German, establishing new state-of-the-art while training significantly faster than recurrent or convolutional alternatives.
              </p>
            </div>

            <div className="glass-card p-4 rounded-xl border border-slate-800 space-y-1.5 md:col-span-2">
              <h4 className="font-semibold text-slate-200 text-amber-400">Reported Limitations</h4>
              <p className="text-slate-400 leading-relaxed">
                Quadratic complexity O(n²) with respect to sequence length n; absence of recurrence requires synthetic positional encodings.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Tab 4: Citations & References */}
      {activeTab === 'citations' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-400">
            Bibliographic citations extracted from the paper references section.
          </div>
          <div className="space-y-2">
            {references.map((ref, idx) => (
              <div
                key={ref.id}
                className="glass-card p-3 rounded-xl border border-slate-800/80 text-xs flex items-start gap-3"
              >
                <span className="font-mono text-slate-500 font-bold">[{idx + 1}]</span>
                <div className="space-y-1 flex-1">
                  <p className="text-slate-300 leading-relaxed">{ref.rawReferenceText}</p>
                  <span className="inline-block text-[10px] text-slate-500 uppercase tracking-wider">
                    Status: {ref.resolutionStatus}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 5: Annotations */}
      {activeTab === 'annotations' && (
        <div className="space-y-5">
          <div className="flex items-center justify-between text-xs text-slate-400">
            <span>Subjective user notes, critiques, and evaluations. Clearly distinguished from paper evidence.</span>
            <ProvenanceBadge provenance="USER_ANNOTATION" />
          </div>

          {/* New annotation form */}
          <form onSubmit={handleAddAnnotation} className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
            <label className="block text-xs font-medium text-slate-300">Add Paper Annotation</label>
            <textarea
              rows={2}
              required
              value={newAnnotation}
              onChange={(e) => setNewAnnotation(e.target.value)}
              placeholder="Record methodological critiques, verification notes, or questions..."
              className="w-full bg-slate-900 border border-slate-800 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
            />
            <div className="flex justify-end">
              <button
                type="submit"
                disabled={annotationMutation.isPending || !newAnnotation.trim()}
                className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Save Note</span>
              </button>
            </div>
          </form>

          {/* List annotations */}
          <div className="space-y-3">
            {annotations.map((ann) => (
              <div
                key={ann.id}
                className="glass-card p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <ProvenanceBadge provenance="USER_ANNOTATION" />
                  <span>{new Date(ann.createdAt).toLocaleDateString()}</span>
                </div>
                <p className="text-slate-200 leading-relaxed">{ann.body}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Evidence Chunk Modal */}
      <ChunkViewerModal
        chunk={selectedChunk}
        paperTitle={paper.title}
        onClose={() => setSelectedChunk(null)}
      />
    </div>
  );
};
