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
  FileText,
  MapPin,
  Globe,
  Quote,
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

  const { data: accessLinks = [] } = useQuery({
    queryKey: ['accessLinks', id],
    queryFn: () => scholarlyApi.getAccessLinks(id!),
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
      <div className="p-12 text-center text-slate-500 text-xs">
        <div className="w-8 h-8 border-3 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-3" />
        <p>Loading publication details & evidence chunks...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-8 max-w-2xl mx-auto glass-panel text-center space-y-4 my-12">
        <p className="text-sm text-red-600 font-medium">
          Failed to load paper details. The paper might be private or does not exist.
        </p>
        <Link to="/library" className="inline-flex items-center gap-2 text-indigo-600 hover:underline text-xs font-semibold">
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
          className="inline-flex items-center gap-2 text-xs font-semibold text-slate-500 hover:text-indigo-600 transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Paper Library</span>
        </Link>
      </div>

      {/* Bibliographic Header Card */}
      <GlassPanelStrong className="p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="text-xs font-semibold text-indigo-700 bg-indigo-50 px-2.5 py-0.5 rounded-md border border-indigo-200">
              {paper.publicationYear || 'Publication'}
            </span>
            <ProvenanceBadge provenance="REPORTED_IN_PAPER" />
          </div>

          <StatusBadge status={paper.processingStatus} />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 leading-snug tracking-tight">
            {paper.title}
          </h1>

          {authors && authors.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-slate-600 mt-2">
              <span>By</span>
              {authors.map((a, idx) => (
                <span
                  key={a.id || idx}
                  className="bg-slate-100/80 px-2 py-0.5 rounded-md text-slate-700"
                >
                  {a.displayName}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-slate-500 mt-3 pt-3 border-t border-slate-200/60 font-medium">
            {paper.venue && (
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-slate-400" />
                <span>{paper.venue}</span>
              </div>
            )}
            {paper.doi && (
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-slate-400" />
                <a
                  href={`https://doi.org/${paper.doi}`}
                  target="_blank"
                  rel="noreferrer"
                  className="text-indigo-600 hover:underline flex items-center gap-1"
                >
                  DOI: {paper.doi} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-slate-400" />
              <span>{chunks.length} chunks indexed</span>
            </div>
          </div>
        </div>
      </GlassPanelStrong>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-1 overflow-x-auto">
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
                ? 'bg-indigo-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200/80 text-slate-700'
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
              <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                Reported Abstract
              </h2>
              <ProvenanceBadge provenance="REPORTED_IN_PAPER" />
            </div>
            <p className="text-sm text-slate-700 font-serif leading-relaxed whitespace-pre-wrap">
              {paper.abstractText || 'No abstract text reported.'}
            </p>
          </GlassPanelStrong>

          {/* Concepts */}
          {concepts && concepts.length > 0 && (
            <GlassPanelStrong className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Indexed Scientific Concepts
                </h2>
                <ProvenanceBadge provenance="AI_INTERPRETATION" />
              </div>
              <div className="flex flex-wrap gap-2">
                {concepts.map((c, idx) => (
                  <span
                    key={c.conceptId || idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-indigo-50/80 border border-indigo-200/60 text-xs font-medium text-indigo-800"
                  >
                    <span>{c.conceptName}</span>
                    <span className="text-[10px] text-indigo-400">({Math.round((c.confidence || 0.8) * 100)}%)</span>
                  </span>
                ))}
              </div>
            </GlassPanelStrong>
          )}

          {/* External Identifiers & Attribution */}
          {externalIds && externalIds.length > 0 && (
            <GlassPanelStrong className="p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
                  Official Provider Attribution & External Identifiers
                </h2>
                <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Sources
                </span>
              </div>
              <div className="space-y-2">
                {externalIds.map((ext) => (
                  <div
                    key={ext.id}
                    className="flex items-center justify-between p-3 rounded-xl bg-slate-50 border border-slate-100 text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-800">{ext.provider}:</span>
                      <span className="font-mono text-slate-600">{ext.externalId}</span>
                    </div>
                    <span className="text-slate-400 text-[11px]">{ext.metadataSource}</span>
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
          <div className="text-xs text-slate-500 font-medium">
            Showing {chunks.length} semantically partitioned chunks with page labels and 384-d vector embeddings
          </div>

          <div className="space-y-3">
            {chunks.map((chunk) => (
              <GlassPanelStrong
                key={chunk.id}
                onClick={() => setSelectedChunk(chunk)}
                className="p-4 cursor-pointer hover:border-indigo-300 transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-800 bg-slate-100 px-2 py-0.5 rounded">
                      Chunk #{chunk.chunkIndex}
                    </span>
                    <span className="text-indigo-700 font-semibold bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                      {chunk.sectionName}
                    </span>
                    {chunk.pageNumber && (
                      <span className="text-slate-500 font-medium flex items-center gap-1">
                        <MapPin className="w-3 h-3 text-slate-400" /> Page {chunk.pageNumber}
                      </span>
                    )}
                  </div>
                  <ProvenanceBadge provenance="REPORTED_IN_PAPER" />
                </div>

                <div className="relative pl-3 border-l-2 border-indigo-400 text-xs text-slate-700 font-mono leading-relaxed bg-indigo-50/15 p-2 rounded-r">
                  {chunk.content}
                </div>

                <div className="flex justify-between items-center text-[11px] text-slate-400 pt-1">
                  <span>Chars: {chunk.charStart}–{chunk.charEnd}</span>
                  <span className="text-indigo-600 font-semibold hover:underline">Click to expand</span>
                </div>
              </GlassPanelStrong>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Claims */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-medium">
            Atomic scientific claims extracted from this publication. Every claim is anchored to a chunk excerpt.
          </div>

          <div className="space-y-3">
            {claims.map((claim) => (
              <GlassPanelStrong key={claim.id} className="p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {claim.claimType}
                    </span>
                    <ProvenanceBadge provenance={claim.provenanceType} confidence={claim.extractionConfidence} />
                  </div>
                </div>

                <p className="text-sm font-semibold text-slate-900 leading-snug">
                  "{claim.normalizedText || claim.sourceText}"
                </p>

                {claim.sourceText && (
                  <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-600 font-serif italic">
                    Evidence excerpt: "{claim.sourceText}"
                  </div>
                )}
              </GlassPanelStrong>
            ))}

            {claims.length === 0 && (
              <div className="p-8 text-center glass-panel text-xs text-slate-500">
                No atomic claims extracted for this publication yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Citations */}
      {activeTab === 'citations' && (
        <div className="space-y-4">
          <div className="text-xs text-slate-500 font-medium">
            Extracted bibliographic references from the bibliography section.
          </div>

          <div className="space-y-3">
            {references.map((ref, idx) => (
              <GlassPanelStrong key={ref.id || idx} className="p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-bold text-slate-800">[{idx + 1}]</span>
                  <StatusBadge status={ref.resolutionStatus} />
                </div>
                <p className="text-xs text-slate-700 font-serif leading-relaxed">
                  {ref.rawReferenceText}
                </p>
                {ref.citedDoi && (
                  <a
                    href={`https://doi.org/${ref.citedDoi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-indigo-600 hover:underline pt-1"
                  >
                    DOI: {ref.citedDoi} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </GlassPanelStrong>
            ))}

            {references.length === 0 && (
              <div className="p-8 text-center glass-panel text-xs text-slate-500">
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
              <label className="text-xs font-semibold text-slate-800 uppercase tracking-wider block">
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
                  <span className="text-[11px] text-slate-400">
                    {new Date(ann.createdAt).toLocaleDateString()}
                  </span>
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-sans">{ann.body}</p>
              </GlassPanelStrong>
            ))}

            {annotations.length === 0 && (
              <div className="p-8 text-center glass-panel text-xs text-slate-500">
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
