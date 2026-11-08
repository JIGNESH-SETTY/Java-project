import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paperApi } from '../api/paperApi';
import { annotationApi } from '../api/annotationApi';
import { scholarlyApi } from '../api/scholarlyApi';
import { DocumentChunk } from '../types';
import {
  Layers,
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
      <div className="p-12 text-center text-[#5B6B7D] dark:text-[#6B8F9E] text-xs space-y-3">
        <div className="w-7 h-7 border-2 border-[#0F4C5C] border-t-transparent rounded-full animate-spin mx-auto" />
        <p>Loading publication details & evidence chunks...</p>
      </div>
    );
  }

  if (error || !detail) {
    return (
      <div className="p-8 max-w-2xl mx-auto card text-center space-y-4 my-12">
        <p className="text-sm text-[#B3261E] dark:text-[#F87171] font-medium">
          Failed to load paper details. The paper might be private or does not exist.
        </p>
        <Link to="/library" className="inline-flex items-center gap-2 text-[#0A6A80] dark:text-[#38BDF8] hover:underline text-xs font-semibold">
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
    <div className="p-6 max-w-6xl mx-auto space-y-6 smooth-page-load">
      {/* Back button */}
      <div>
        <Link
          to="/library"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#5B6B7D] dark:text-[#6B8F9E] hover:text-[#0F4C5C] dark:hover:text-[#2293B0] transition"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Paper Library</span>
        </Link>
      </div>

      {/* Bibliographic Header Card */}
      <div className="card p-6 space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <span className="pill font-mono">
              {paper.publicationYear || 'Publication'}
            </span>
            <ProvenanceBadge provenance="REPORTED_IN_PAPER" />
          </div>

          <StatusBadge status={paper.processingStatus} />
        </div>

        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2A33] dark:text-[#E0F2F6] leading-snug tracking-tight">
            {paper.title}
          </h1>

          {authors && authors.length > 0 && (
            <div className="flex flex-wrap items-center gap-2 text-xs font-medium text-[#475569] dark:text-[#8EB3C2] mt-2.5">
              <span className="text-[#5B6B7D]">By</span>
              {authors.map((a, idx) => (
                <span
                  key={a.id || idx}
                  className="bg-[#EEF2F6] dark:bg-[#0D222B] px-2.5 py-0.5 rounded-[6px] text-[#0B2A33] dark:text-[#E0F2F6] border border-[#D9E1E9] dark:border-[#1E4656]"
                >
                  {a.displayName}
                </span>
              ))}
            </div>
          )}

          <div className="flex flex-wrap items-center gap-4 text-xs text-[#5B6B7D] dark:text-[#6B8F9E] mt-3.5 pt-3 border-t border-[#D9E1E9] dark:border-[#1E4656] font-medium">
            {paper.venue && (
              <div className="flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#5B6B7D]" />
                <span>{paper.venue}</span>
              </div>
            )}
            {paper.doi && (
              <div className="flex items-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-[#5B6B7D]" />
                <a
                  href={`https://doi.org/${paper.doi}`}
                  target="_blank"
                  rel="noreferrer"
                  className="doi hover:underline flex items-center gap-1"
                >
                  DOI: {paper.doi} <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            )}
            <div className="flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#0A6A80] dark:text-[#38BDF8]" />
              <span>{chunks.length} chunks indexed</span>
            </div>
          </div>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-[#D9E1E9] dark:border-[#1E4656] pb-1 overflow-x-auto">
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
            className={`px-3.5 py-2 rounded-[9px] text-xs font-semibold transition-all flex items-center gap-2 shrink-0 ${
              activeTab === tab.key
                ? 'bg-[#0F4C5C] text-white shadow-xs'
                : 'text-[#475569] dark:text-[#8EB3C2] hover:text-[#0B2A33] dark:hover:text-[#E0F2F6] hover:bg-[#EEF2F6] dark:hover:bg-[#1A3E4E]'
            }`}
          >
            <span>{tab.label}</span>
            {tab.count !== null && (
              <span
                className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                  activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-[#D9E1E9] dark:bg-[#1E4656] text-[#334155] dark:text-[#C4DDE5]'
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
          <div className="card p-6 space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="text-xs font-bold text-[#0B2A33] dark:text-[#E0F2F6] uppercase tracking-[0.08em]">
                Reported Abstract
              </h2>
              <ProvenanceBadge provenance="REPORTED_IN_PAPER" />
            </div>
            <div className="abs font-serif text-sm leading-relaxed whitespace-pre-wrap">
              {paper.abstractText || 'No abstract text reported.'}
            </div>
          </div>

          {/* Concepts */}
          {concepts && concepts.length > 0 && (
            <div className="card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#0B2A33] dark:text-[#E0F2F6] uppercase tracking-[0.08em]">
                  Indexed Scientific Concepts
                </h2>
                <ProvenanceBadge provenance="AI_INTERPRETATION" />
              </div>
              <div className="flex flex-wrap gap-2">
                {concepts.map((c, idx) => (
                  <span
                    key={c.conceptId || idx}
                    className="inline-flex items-center gap-1.5 px-3 py-1 rounded-[8px] bg-[#EEF2F6] dark:bg-[#0D222B] border border-[#D9E1E9] dark:border-[#1E4656] text-xs font-medium text-[#0F4C5C] dark:text-[#2293B0]"
                  >
                    <span>{c.conceptName}</span>
                    <span className="text-[10px] text-[#5B6B7D] dark:text-[#6B8F9E]">({Math.round((c.confidence || 0.8) * 100)}%)</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* External Identifiers & Attribution */}
          {externalIds && externalIds.length > 0 && (
            <div className="card p-6 space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="text-xs font-bold text-[#0B2A33] dark:text-[#E0F2F6] uppercase tracking-[0.08em]">
                  Official Provider Attribution & External Identifiers
                </h2>
                <span className="text-xs text-[#1B6B43] dark:text-[#34D399] font-semibold flex items-center gap-1">
                  <ShieldCheck className="w-3.5 h-3.5" /> Verified Sources
                </span>
              </div>
              <div className="space-y-2">
                {externalIds.map((ext) => (
                  <div
                    key={ext.id}
                    className="flex items-center justify-between p-3 rounded-[9px] bg-[#FAFBFD] dark:bg-[#0D222B] border border-[#D9E1E9] dark:border-[#1E4656] text-xs"
                  >
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-[#0B2A33] dark:text-[#E0F2F6]">{ext.provider}:</span>
                      <span className="font-mono text-[#0A6A80] dark:text-[#38BDF8]">{ext.externalId}</span>
                    </div>
                    <span className="text-[#5B6B7D] dark:text-[#6B8F9E] text-[11px]">{ext.metadataSource}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* TAB CONTENT: Chunks */}
      {activeTab === 'chunks' && (
        <div className="space-y-4">
          <div className="text-xs text-[#5B6B7D] dark:text-[#6B8F9E] font-medium">
            Showing {chunks.length} semantically partitioned chunks with page labels and 384-d vector embeddings
          </div>

          <div className="space-y-3">
            {chunks.map((chunk) => (
              <div
                key={chunk.id}
                onClick={() => setSelectedChunk(chunk)}
                className="card p-4 cursor-pointer hover:border-[#0F4C5C] dark:hover:border-[#2293B0] transition-all space-y-2.5"
              >
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-[#0B2A33] dark:text-[#E0F2F6] bg-[#EEF2F6] dark:bg-[#0D222B] px-2 py-0.5 rounded-[6px] border border-[#D9E1E9] dark:border-[#1E4656]">
                      Chunk #{chunk.chunkIndex}
                    </span>
                    <span className="text-[#0F4C5C] dark:text-[#2293B0] font-semibold bg-[#DCEBEE] dark:bg-[#1B4A59] px-2 py-0.5 rounded-[6px]">
                      {chunk.sectionName}
                    </span>
                    {chunk.pageNumber && (
                      <span className="text-[#5B6B7D] dark:text-[#6B8F9E] font-medium flex items-center gap-1 font-mono">
                        <MapPin className="w-3 h-3 text-[#5B6B7D]" /> Page {chunk.pageNumber}
                      </span>
                    )}
                  </div>
                  <ProvenanceBadge provenance="REPORTED_IN_PAPER" />
                </div>

                <div className="relative pl-3 border-l-2 border-[#0F4C5C] text-xs text-[#334155] dark:text-[#C4DDE5] font-mono leading-relaxed bg-[#FAFBFD] dark:bg-[#0D222B] p-2.5 rounded-r-[8px]">
                  {chunk.content}
                </div>

                <div className="flex justify-between items-center text-[11px] text-[#5B6B7D] dark:text-[#6B8F9E] pt-1">
                  <span className="font-mono">Chars: {chunk.charStart}–{chunk.charEnd}</span>
                  <span className="text-[#0A6A80] dark:text-[#38BDF8] font-semibold hover:underline">Click to expand</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Claims */}
      {activeTab === 'claims' && (
        <div className="space-y-4">
          <div className="text-xs text-[#5B6B7D] dark:text-[#6B8F9E] font-medium">
            Atomic scientific claims extracted from this publication. Every claim is anchored to a chunk excerpt.
          </div>

          <div className="space-y-3">
            {claims.map((claim) => (
              <div key={claim.id} className="card p-5 space-y-3">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#DCEBEE] dark:bg-[#1B4A59] text-[#0F4C5C] dark:text-[#2293B0] border border-[#B7D9E2] dark:border-[#2A5A6E]">
                      {claim.claimType}
                    </span>
                    <ProvenanceBadge provenance={claim.provenanceType} confidence={claim.extractionConfidence} />
                  </div>
                </div>

                <p className="text-sm font-semibold text-[#0B2A33] dark:text-[#E0F2F6] leading-snug">
                  "{claim.normalizedText || claim.sourceText}"
                </p>

                {claim.sourceText && (
                  <div className="abs font-serif italic text-xs">
                    Evidence excerpt: "{claim.sourceText}"
                  </div>
                )}
              </div>
            ))}

            {claims.length === 0 && (
              <div className="p-8 text-center card text-xs text-[#5B6B7D] dark:text-[#6B8F9E]">
                No atomic claims extracted for this publication yet.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Citations */}
      {activeTab === 'citations' && (
        <div className="space-y-4">
          <div className="text-xs text-[#5B6B7D] dark:text-[#6B8F9E] font-medium">
            Extracted bibliographic references from the bibliography section.
          </div>

          <div className="space-y-3">
            {references.map((ref, idx) => (
              <div key={ref.id || idx} className="card p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-mono font-bold text-[#0B2A33] dark:text-[#E0F2F6]">[{idx + 1}]</span>
                  <StatusBadge status={ref.resolutionStatus} />
                </div>
                <p className="text-xs text-[#334155] dark:text-[#C4DDE5] font-serif leading-relaxed">
                  {ref.rawReferenceText}
                </p>
                {ref.citedDoi && (
                  <a
                    href={`https://doi.org/${ref.citedDoi}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-[#0A6A80] dark:text-[#38BDF8] hover:underline pt-1 font-mono"
                  >
                    DOI: {ref.citedDoi} <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            ))}

            {references.length === 0 && (
              <div className="p-8 text-center card text-xs text-[#5B6B7D] dark:text-[#6B8F9E]">
                No references parsed from document text.
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB CONTENT: Annotations */}
      {activeTab === 'annotations' && (
        <div className="space-y-6 max-w-3xl">
          <div className="card p-5">
            <form onSubmit={handleAddAnnotation} className="space-y-3">
              <label className="text-[11px] font-bold text-[#5B6B7D] dark:text-[#8EB3C2] tracking-[0.08em] uppercase block">
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
                  {annotationMutation.isPending ? 'Saving...' : 'Post Note'}
                </GlassButton>
              </div>
            </form>
          </div>

          <div className="space-y-3">
            {annotations.map((ann) => (
              <div key={ann.id} className="card p-4 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <ProvenanceBadge provenance="USER_ANNOTATION" />
                  <span className="text-[#5B6B7D] dark:text-[#6B8F9E] text-[11px] font-mono">
                    {ann.createdAt ? new Date(ann.createdAt).toLocaleDateString() : 'Recent'}
                  </span>
                </div>
                <p className="text-xs text-[#334155] dark:text-[#C4DDE5] whitespace-pre-wrap leading-relaxed">
                  {ann.body}
                </p>
              </div>
            ))}

            {annotations.length === 0 && (
              <div className="p-6 text-center card text-xs text-[#5B6B7D] dark:text-[#6B8F9E]">
                No annotations added yet. Write researcher notes above.
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
