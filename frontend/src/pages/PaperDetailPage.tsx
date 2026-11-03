import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paperApi } from '../api/paperApi';
import { annotationApi } from '../api/annotationApi';
import { scholarlyApi } from '../api/scholarlyApi';
import { DocumentChunk, Claim } from '../types';
import {
  BookOpen,
  Layers,
  Sparkles,
  ArrowLeft,
  Building2,
  ExternalLink,
  Send,
  MapPin,
  Globe,
  ShieldCheck,
} from 'lucide-react';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { StatusBadge } from '../components/StatusBadge';
import { ChunkViewerModal } from '../components/ChunkViewerModal';
import { GlassPanel, GlassPanelStrong } from '../components/GlassPanel';
import { GlassButton } from '../components/GlassButton';

export const PaperDetailPage: React.FC = () => {
  const { paperId } = useParams<{ paperId: string }>();
  const id = paperId;
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'overview' | 'chunks' | 'claims' | 'citations' | 'annotations'>('overview');
  const [selectedChunk, setSelectedChunk] = useState<DocumentChunk | null>(null);
  const [newAnnotation, setNewAnnotation] = useState('');

  const { data: detail, isLoading, error } = useQuery({
    queryKey: ['paper', id],
    queryFn: () => paperApi.getPaperDetail(id!),
    enabled: !!id,
  });

  const { data: externalIds = [] } = useQuery({
    queryKey: ['externalIds', id],
    queryFn: () => scholarlyApi.getExternalIds(id!),
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
    return (
      <div className="p-12 text-center text-slate-500 dark:text-slate-400 text-xs">
        <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p>Loading publication details & evidence chunks...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-8 max-w-2xl mx-auto glass-panel text-center space-y-4 my-12">
        <p className="text-sm text-red-600 dark:text-red-400 font-medium">
          Failed to load paper details. The paper might be private or does not exist.
        </p>
        <Link to="/library" className="inline-flex items-center gap-2 text-blue-600 dark:text-blue-400 hover:underline text-xs font-semibold">
          <ArrowLeft className="w-4 h-4" /> Back to Library
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
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Back button */}
      <div>
        <Link
          to="/library"
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Paper Library</span>
        </Link>
      </div>

      {/* Bibliographic Header Card */}
      <GlassPanelStrong className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/40 px-2.5 py-0.5 rounded-md border border-blue-200 dark:border-blue-800">
              {paper.publicationYear || 'Publication'}
            </span>
            <ProvenanceBadge provenance="REPORTED_IN_PAPER" />
          </div>

          <StatusBadge status={paper.processingStatus} />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-slate-100 leading-snug tracking-tight">
            {paper.title}
          </h1>

          {authors && authors.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-400 mt-2">
              <span>By</span>
              {authors.map((a, idx) => (
                <span
                  key={a.id || idx}
                  className="bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-md text-slate-700 dark:text-slate-300"
                >
                  {a.displayName}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 dark:text-slate-400 mt-3 pt-3 border-t border-slate-200/60 dark:border-slate-800 font-medium">
            {paper.venue && (
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <span>{paper.venue}</span>
              </div>
            )}
            {paper.doi && (
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                <a
                  href={`https://doi.org/${paper.doi}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-blue-600 dark:text-blue-400 hover:underline flex items-center gap-1"
                >
                  DOI: {paper.doi} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
              <span>{chunks.length} chunks indexed</span>
            </div>
          </div>
        </div>
      </GlassPanelStrong>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-1 overflow-x-auto">
        {[
          { key: 'overview', label: 'Overview', count: null },
          { key: 'chunks', label: 'Document Chunks', count: chunks.length },
          { key: 'claims', label: 'Scientific Claims', count: claims.length },
          { key: 'citations', label: 'Citations & References', count: references.length },
          { key: 'annotations', label: 'Annotations', count: annotations.length },
        ].map((tab) => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as any)}
            className={`px-4 py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === tab.key
                ? 'bg-blue-600 text-white shadow-xs'
                : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100 hover:bg-white/60 dark:hover:bg-slate-800/60'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200/80 dark:bg-slate-800 text-slate-700 dark:text-slate-300'
                }`}
              >
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* TAB CONTENT: Overview */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          <GlassPanelStrong className="p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                Reported Abstract
              </h2>
              <ProvenanceBadge provenance="REPORTED_IN_PAPER" />
            </div>
            <p className="text-sm text-slate-700 dark:text-slate-300 font-serif leading-relaxed whitespace-pre-wrap">
              {paper.abstractText || 'No abstract text reported.'}
            </p>
          </GlassPanelStrong>

          {/* Concepts */}
          {concepts && concepts.length > 0 && (
            <GlassPanelStrong className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Indexed Scientific Concepts
                </h2>
                <ProvenanceBadge provenance="AI_INTERPRETATION" />
              </div>
              <div className="flex flex-wrap gap-2">
                {concepts.map((c, idx) => (
                  <span
                    key={c.conceptId || idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-50/80 dark:bg-blue-950/40 border border-blue-200/60 dark:border-blue-800 text-xs font-medium text-blue-800 dark:text-blue-300"
                  >
                    <span>{c.conceptName}</span>
                    <span className="text-[10px] text-blue-500 dark:text-blue-400">({Math.round((c.confidence || 0.8) * 100)}%)</span>
                  </span>
                ))}
              </div>
            </GlassPanelStrong>
          )}

          {/* External Identifiers & Attribution */}
          {externalIds && externalIds.length > 0 && (
            <GlassPanelStrong className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
                  Official Provider Attribution & External Identifiers
                </h2>
                <span className="text-xs text-emerald-700 dark:text-emerald-400 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Sources
                </span>
              </div>
              <div className="space-y-2">
                {externalIds.map((ext) => (
                  <div
                    key={ext.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-100 dark:border-slate-800 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800 dark:text-slate-200">{ext.provider}:</span>
                      <span className="font-mono text-slate-600 dark:text-slate-400">{ext.externalId}</span>
                    </div>
                    <span className="text-slate-400 dark:text-slate-500 text-[11px]">{ext.metadataSource}</span>
                  </div>
                ))}
              </div>
            </GlassPanelStrong>
          )}
        </div>
      )}

      {/* TAB CONTENT: Chunks */}
      {activeTab === 'chunks' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Showing {chunks.length} semantically partitioned chunks with page labels and 384-d vector embeddings
          </div>

          <div className="space-y-3">
            {chunks.map((chunk) => (
              <GlassPanelStrong
                key={chunk.id}
                onClick={() => setSelectedChunk(chunk)}
                className="p-4 cursor-pointer hover:border-blue-300 dark:hover:border-blue-600 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      Chunk #{chunk.chunkIndex}
                    </span>
                    <span className="text-blue-700 dark:text-blue-300 font-semibold bg-blue-50 dark:bg-blue-950/40 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-800">
                      {chunk.sectionName}
                    </span>
                    {chunk.pageNumber && (
                      <span className="text-slate-500 dark:text-slate-400 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400 dark:text-slate-500" /> Page {chunk.pageNumber}
                      </span>
                    )}
                  </div>
                  <ProvenanceBadge provenance="REPORTED_IN_PAPER" />
                </div>

                <div className="relative pl-3 border-l-2 border-blue-500 text-xs text-slate-700 dark:text-slate-300 font-mono leading-relaxed bg-blue-50/15 dark:bg-blue-950/30 p-2.5 rounded-r-xl">
                  {chunk.content}
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 dark:text-slate-500 pt-1">
                  <span>Chars: {chunk.charStart}–{chunk.charEnd}</span>
                  <span className="text-blue-600 dark:text-blue-400 font-semibold hover:underline">Click to expand</span>
                </div>
              </GlassPanelStrong>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Claims */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Atomic scientific claims extracted from this publication. Every claim is anchored to a chunk excerpt.
          </div>

          <div className="space-y-3">
            {claims.map((claim) => (
              <GlassPanelStrong key={claim.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {claim.claimType}
                    </span>
                    <ProvenanceBadge provenance={claim.provenanceType} confidence={claim.extractionConfidence} />
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug">
                  "{claim.normalizedText || claim.sourceText}"
                </p>

                {claim.sourceText && (
                  <div className="p-3 bg-slate-50 dark:bg-slate-900/60 rounded-xl border border-slate-100 dark:border-slate-800 text-xs text-slate-600 dark:text-slate-300 font-serif italic">
                    Evidence excerpt: "{claim.sourceText}"
                  </div>
                )}
              </GlassPanelStrong>
            ))}

            {claims.length === 0 && (
              <div className="p-8 text-center glass-panel text-xs text-slate-500 dark:text-slate-400">
                No atomic claims extracted for this publication yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Citations */}
      {activeTab === 'citations' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 dark:text-slate-400 font-medium">
            Extracted bibliographic references from the bibliography section.
          </div>

          <div className="space-y-3">
            {references.map((ref, idx) => (
              <GlassPanelStrong key={ref.id || idx} className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800 dark:text-slate-200">[{idx + 1}]</span>
                  <StatusBadge status={ref.resolutionStatus} />
                </div>
                <p className="text-xs text-slate-700 dark:text-slate-300 font-serif leading-relaxed">
                  {ref.rawReferenceText}
                </p>
                {ref.citedDoi && (
                  <a
                    href={`https://doi.org/${ref.citedDoi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 hover:underline pt-1"
                  >
                    DOI: {ref.citedDoi} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </GlassPanelStrong>
            ))}

            {references.length === 0 && (
              <div className="p-8 text-center glass-panel text-xs text-slate-500 dark:text-slate-400">
                No references parsed from document text.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Annotations */}
      {activeTab === 'annotations' && (
        <div className="space-y-6 max-w-3xl">
          <GlassPanelStrong className="p-5">
            <form onSubmit={handleAddAnnotation} className="space-y-3">
              <label className="text-xs font-semibold text-slate-800 dark:text-slate-200 uppercase tracking-wider block">
                Add Researcher Note
              </label>
              <textarea
                rows={3}
                required
                placeholder="Record critical observations, methodology limitations, or questions..."
                value={newAnnotation}
                onChange={(e) => setNewAnnotation(e.target.value)}
                className="glass-input w-full text-xs"
              />
              <div className="flex justify-end">
                <GlassButton
                  type="submit"
                  variant="primary"
                  size="sm"
                  disabled={annotationMutation.isPending || !newAnnotation.trim()}
                  icon={<Send className="w-3.5 h-3.5" />}
                >
                  {annotationMutation.isPending ? 'Saving...' : 'Add Note'}
                </GlassButton>
              </div>
            </form>
          </GlassPanelStrong>

          <div className="space-y-3">
            {annotations.map((ann) => (
              <GlassPanelStrong key={ann.id} className="p-4 space-y-2">
                <div className="flex items-center justify-between">
                  <ProvenanceBadge provenance="USER_ANNOTATION" />
                  <span className="text-[11px] text-slate-400 dark:text-slate-500">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-800 dark:text-slate-200 leading-relaxed font-sans">{ann.body}</p>
              </GlassPanelStrong>
            ))}

            {annotations.length === 0 && (
              <div className="p-8 text-center glass-panel text-xs text-slate-500 dark:text-slate-400">
                No user annotations added yet for this paper.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Chunk Viewer Modal */}
      {selectedChunk && (
        <ChunkViewerModal
          chunk={selectedChunk}
          paperTitle={paper.title}
          onClose={() => setSelectedChunk(null)}
        />
      )}
    </div>
  );
};
