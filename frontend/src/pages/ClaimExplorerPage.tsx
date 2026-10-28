import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { claimApi } from '../api/claimApi';
import { paperApi } from '../api/paperApi';
import { Claim, ClaimRelation, ClaimType, RelationType, ReviewStatus, DocumentChunk } from '../types';
import {
  GitCommit,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Plus,
  Filter,
  FileText,
  Search,
  MessageSquare,
  Sparkles,
  User,
  ArrowRight,
  ShieldCheck,
  Quote,
  Layers,
  BookOpen,
} from 'lucide-react';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { RelationBadge, ReviewStatusBadge } from '../components/RelationBadge';
import { ChunkViewerModal } from '../components/ChunkViewerModal';
import { GlassPanel, GlassPanelStrong } from '../components/GlassPanel';
import { GlassButton } from '../components/GlassButton';
import { GlassInput, GlassSelect } from '../components/GlassInput';
import { GlassModal } from '../components/GlassModal';

export const ClaimExplorerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'relations' | 'claims'>('relations');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

  const [selectedRelation, setSelectedRelation] = useState<ClaimRelation | null>(null);
  const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);

  const [isProposeOpen, setIsProposeOpen] = useState(false);
  const [isAssertOpen, setIsAssertOpen] = useState(false);
  const [selectedChunk, setSelectedChunk] = useState<DocumentChunk | null>(null);

  // New relation state
  const [sourceClaimId, setSourceClaimId] = useState('');
  const [targetClaimId, setTargetClaimId] = useState('');
  const [relationType, setRelationType] = useState<RelationType>('SUPPORTS');
  const [rationale, setRationale] = useState('');

  // New claim state
  const [newNormalizedText, setNewNormalizedText] = useState('');
  const [newSourceText, setNewSourceText] = useState('');
  const [newClaimType, setNewClaimType] = useState<ClaimType>('FINDING');
  const [newSection, setNewSection] = useState('Introduction');

  const { data: claims = [] } = useQuery({
    queryKey: ['claims'],
    queryFn: () => claimApi.listClaims(0, 100),
  });

  const { data: relations = [] } = useQuery({
    queryKey: ['relations'],
    queryFn: () => claimApi.listRelations(),
  });

  const { data: papers = [] } = useQuery({
    queryKey: ['papers'],
    queryFn: () => paperApi.listPapers(0, 50),
  });

  const updateStatusMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: ReviewStatus }) =>
      claimApi.updateReviewStatus(id, status),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['relations'] }),
  });

  const createRelationMutation = useMutation({
    mutationFn: () =>
      claimApi.createRelation(sourceClaimId, {
        targetClaimId,
        relationType,
        rationale,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['relations'] });
      setIsProposeOpen(false);
      setRationale('');
    },
  });

  const createClaimMutation = useMutation({
    mutationFn: () =>
      claimApi.createClaim({
        normalizedText: newNormalizedText,
        sourceText: newSourceText,
        claimType: newClaimType,
        sectionName: newSection,
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['claims'] });
      setIsAssertOpen(false);
      setNewNormalizedText('');
      setNewSourceText('');
    },
  });

  const filteredRelations = relations.filter((r) => {
    if (statusFilter !== 'ALL' && r.reviewStatus !== statusFilter) return false;
    if (typeFilter !== 'ALL' && r.relationType !== typeFilter) return false;
    if (searchTerm && !r.rationale.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const filteredClaims = claims.filter((c) => {
    if (typeFilter !== 'ALL' && c.claimType !== typeFilter) return false;
    const text = c.normalizedText || c.sourceText || '';
    if (searchTerm && !text.toLowerCase().includes(searchTerm.toLowerCase())) return false;
    return true;
  });

  const activeRelation = selectedRelation || (filteredRelations.length > 0 ? filteredRelations[0] : null);
  const activeClaim = selectedClaim || (filteredClaims.length > 0 ? filteredClaims[0] : null);

  const inspectEvidence = async (chunkId: string) => {
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
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-1">
            <GitCommit className="w-4 h-4" />
            <span>Directional Claim Graph & Auditing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
            Claims & Evidence Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Track atomic scientific claims and review directional relationships (Supports, Contradicts, Qualifies, Extends).
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <GlassButton
            variant="secondary"
            onClick={() => setIsAssertOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Assert Claim
          </GlassButton>
          <GlassButton
            variant="primary"
            onClick={() => setIsProposeOpen(true)}
            icon={<Sparkles className="w-4 h-4" />}
          >
            Propose Relation
          </GlassButton>
        </div>
      </div>

      {/* Main Filter & Tabs Header */}
      <GlassPanel className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-2 w-full md:w-auto">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200 text-xs font-medium">
            <button
              onClick={() => setActiveTab('relations')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'relations'
                  ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Cross-Paper Relations ({relations.length})
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'claims'
                  ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Atomic Claims ({claims.length})
            </button>
          </div>
        </div>

        <div className="flex flex-1 max-w-md w-full">
          <GlassInput
            placeholder="Search claims or relation rationales..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-2">
          {activeTab === 'relations' ? (
            <GlassSelect
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Review Statuses' },
                { value: 'PENDING', label: 'Proposed (Pending)' },
                { value: 'CONFIRMED', label: 'Human Reviewed' },
                { value: 'REJECTED', label: 'Rejected' },
              ]}
            />
          ) : (
            <GlassSelect
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              options={[
                { value: 'ALL', label: 'All Claim Types' },
                { value: 'FINDING', label: 'Findings' },
                { value: 'HYPOTHESIS', label: 'Hypotheses' },
                { value: 'METHOD_ASSERTION', label: 'Method Assertions' },
                { value: 'LIMITATION', label: 'Limitations' },
              ]}
            />
          )}
        </div>
      </GlassPanel>

      {/* Side-by-Side Explorer Split */}
      {activeTab === 'relations' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          {/* Left Column: Relation Cards */}
          <div className="lg:col-span-5 space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {filteredRelations.map((rel) => {
              const isSelected = activeRelation?.id === rel.id;
              return (
                <GlassPanelStrong
                  key={rel.id}
                  onClick={() => setSelectedRelation(rel)}
                  className={`p-4 cursor-pointer transition-all space-y-2 border ${
                    isSelected
                      ? 'border-indigo-400 bg-white ring-2 ring-indigo-100 shadow-md'
                      : 'hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <RelationBadge type={rel.relationType} />
                    <ReviewStatusBadge status={rel.reviewStatus} />
                  </div>

                  <p className="text-xs text-slate-800 line-clamp-2 font-serif italic">
                    "{rel.rationale}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    <ProvenanceBadge provenance={rel.provenanceType} confidence={rel.confidence} />
                    <span>{rel.evidenceChunkIds?.length || 0} chunks</span>
                  </div>
                </GlassPanelStrong>
              );
            })}

            {filteredRelations.length === 0 && (
              <div className="p-8 text-center glass-panel text-xs text-slate-500">
                No claim relationships match current filters.
              </div>
            )}
          </div>

          {/* Right Column: Detailed Relation Audit View */}
          <div className="lg:col-span-7 sticky top-24">
            {activeRelation ? (
              <GlassPanelStrong className="p-6 space-y-5 border-white/90 shadow-md">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Selected Relationship
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <RelationBadge type={activeRelation.relationType} />
                      <ReviewStatusBadge status={activeRelation.reviewStatus} />
                    </div>
                  </div>

                  {/* Human Review Actions */}
                  <div className="flex items-center gap-2">
                    <GlassButton
                      size="sm"
                      variant="secondary"
                      disabled={updateStatusMutation.isPending || activeRelation.reviewStatus === 'CONFIRMED'}
                      onClick={() =>
                        updateStatusMutation.mutate({ id: activeRelation.id, status: 'CONFIRMED' })
                      }
                      icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />}
                    >
                      Confirm
                    </GlassButton>
                    <GlassButton
                      size="sm"
                      variant="danger"
                      disabled={updateStatusMutation.isPending || activeRelation.reviewStatus === 'REJECTED'}
                      onClick={() =>
                        updateStatusMutation.mutate({ id: activeRelation.id, status: 'REJECTED' })
                      }
                      icon={<XCircle className="w-3.5 h-3.5 text-red-600" />}
                    >
                      Reject
                    </GlassButton>
                  </div>
                </div>

                {/* Synthesis Rationale */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Scientific Synthesis & Rationale
                  </span>
                  <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-xs text-slate-800 font-serif leading-relaxed">
                    "{activeRelation.rationale}"
                  </div>
                </div>

                {/* Grounded Evidence Chunks */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Verbatim Grounded Evidence ({activeRelation.evidenceChunkIds?.length || 0})
                    </span>
                    <ProvenanceBadge provenance={activeRelation.provenanceType} confidence={activeRelation.confidence} />
                  </div>

                  <div className="space-y-2">
                    {activeRelation.evidenceChunkIds?.map((chunkId, idx) => (
                      <div
                        key={chunkId}
                        className="p-3 rounded-xl bg-white border border-slate-200/80 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 text-slate-700">
                          <FileText className="w-4 h-4 text-indigo-500" />
                          <span className="font-mono text-[11px]">Chunk Ref #{idx + 1} ({chunkId.substring(0, 8)}...)</span>
                        </div>
                        <button
                          onClick={() => inspectEvidence(chunkId)}
                          className="text-xs font-semibold text-indigo-600 hover:text-indigo-800"
                        >
                          Open Chunk Text
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassPanelStrong>
            ) : (
              <div className="p-12 text-center glass-panel text-xs text-slate-500">
                Select a claim relation from the list to inspect grounded evidence and audit status.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Side-by-Side Claims Split */}
      {activeTab === 'claims' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
          <div className="lg:col-span-5 space-y-3 max-h-[75vh] overflow-y-auto pr-1">
            {filteredClaims.map((claim) => {
              const isSelected = activeClaim?.id === claim.id;
              return (
                <GlassPanelStrong
                  key={claim.id}
                  onClick={() => setSelectedClaim(claim)}
                  className={`p-4 cursor-pointer transition-all space-y-2 border ${
                    isSelected
                      ? 'border-indigo-400 bg-white ring-2 ring-indigo-100 shadow-md'
                      : 'hover:border-slate-300'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2 py-0.5 rounded text-[11px] font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                      {claim.claimType}
                    </span>
                    <ProvenanceBadge provenance={claim.provenanceType} confidence={claim.extractionConfidence} />
                  </div>
                  <p className="text-xs text-slate-900 font-semibold line-clamp-2">
                    "{claim.normalizedText || claim.sourceText}"
                  </p>
                </GlassPanelStrong>
              );
            })}
          </div>

          <div className="lg:col-span-7 sticky top-24">
            {activeClaim ? (
              <GlassPanelStrong className="p-6 space-y-4">
                <div className="flex items-start justify-between pb-3 border-b border-slate-200">
                  <div className="space-y-1">
                    <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
                      Selected Claim
                    </span>
                    <div className="flex items-center gap-2">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-50 text-indigo-700 border border-indigo-200">
                        {activeClaim.claimType}
                      </span>
                    </div>
                  </div>
                  <ProvenanceBadge provenance={activeClaim.provenanceType} confidence={activeClaim.extractionConfidence} />
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                    Claim Statement
                  </span>
                  <p className="text-sm font-semibold text-slate-900 leading-snug">
                    "{activeClaim.normalizedText || activeClaim.sourceText}"
                  </p>
                </div>

                {activeClaim.sourceText && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      Verbatim Source Excerpt
                    </span>
                    <div className="p-3.5 bg-slate-50 rounded-xl border border-slate-200 text-xs text-slate-700 font-serif italic leading-relaxed">
                      "{activeClaim.sourceText}"
                    </div>
                  </div>
                )}
              </GlassPanelStrong>
            ) : (
              <div className="p-12 text-center glass-panel text-xs text-slate-500">
                Select a claim to inspect its verbatim source excerpt.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Propose Relation Modal */}
      <GlassModal
        isOpen={isProposeOpen}
        onClose={() => setIsProposeOpen(false)}
        title="Propose Cross-Paper Claim Relation"
        subtitle="Formally link two scientific claims with supporting or contradicting evidence"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createRelationMutation.mutate();
          }}
          className="space-y-4"
        >
          <GlassSelect
            label="Source Claim *"
            required
            value={sourceClaimId}
            onChange={(e) => setSourceClaimId(e.target.value)}
          >
            <option value="">Select source claim...</option>
            {claims.map((c) => (
              <option key={c.id} value={c.id}>
                [{c.claimType}] {(c.normalizedText || c.sourceText).substring(0, 70)}...
              </option>
            ))}
          </GlassSelect>

          <GlassSelect
            label="Directional Relationship *"
            value={relationType}
            onChange={(e) => setRelationType(e.target.value as RelationType)}
            options={[
              { value: 'SUPPORTS', label: 'SUPPORTS (Corroborating findings)' },
              { value: 'CONTRADICTS', label: 'CONTRADICTS (Direct empirical conflict)' },
              { value: 'QUALIFIES', label: 'QUALIFIES (True only under conditions)' },
              { value: 'EXTENDS', label: 'EXTENDS (Builds on foundation)' },
              { value: 'DISCUSSES', label: 'DISCUSSES (Related topic without stance)' },
            ]}
          />

          <GlassSelect
            label="Target Claim *"
            required
            value={targetClaimId}
            onChange={(e) => setTargetClaimId(e.target.value)}
          >
            <option value="">Select target claim...</option>
            {claims
              .filter((c) => c.id !== sourceClaimId)
              .map((c) => (
                <option key={c.id} value={c.id}>
                  [{c.claimType}] {(c.normalizedText || c.sourceText).substring(0, 70)}...
                </option>
              ))}
          </GlassSelect>

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
              Scientific Rationale *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Explain why this directional relationship exists based on reported data..."
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
              className="glass-input w-full text-xs font-serif leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <GlassButton type="button" variant="secondary" onClick={() => setIsProposeOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              disabled={createRelationMutation.isPending || !sourceClaimId || !targetClaimId || !rationale.trim()}
            >
              {createRelationMutation.isPending ? 'Proposing...' : 'Submit Proposed Relation'}
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* Assert Claim Modal */}
      <GlassModal
        isOpen={isAssertOpen}
        onClose={() => setIsAssertOpen(false)}
        title="Assert New Scientific Claim"
        subtitle="Manually anchor an atomic claim to document excerpts"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createClaimMutation.mutate();
          }}
          className="space-y-4"
        >
          <GlassInput
            label="Claim Statement (Normalized) *"
            required
            placeholder="e.g. Multi-head attention allows parallel sequence processing"
            value={newNormalizedText}
            onChange={(e) => setNewNormalizedText(e.target.value)}
          />

          <GlassSelect
            label="Claim Type *"
            value={newClaimType}
            onChange={(e) => setNewClaimType(e.target.value as ClaimType)}
            options={[
              { value: 'FINDING', label: 'FINDING (Reported experimental result)' },
              { value: 'HYPOTHESIS', label: 'HYPOTHESIS (Proposed theory)' },
              { value: 'METHOD_ASSERTION', label: 'METHOD_ASSERTION (Architecture or algorithm)' },
              { value: 'LIMITATION', label: 'LIMITATION (Boundaries or failure cases)' },
              { value: 'DATASET_ASSERTION', label: 'DATASET_ASSERTION (Data distribution)' },
            ]}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 tracking-wide uppercase">
              Exact Source Text Excerpt *
            </label>
            <textarea
              rows={3}
              required
              placeholder="Verbatim sentence or paragraph from source PDF..."
              value={newSourceText}
              onChange={(e) => setNewSourceText(e.target.value)}
              className="glass-input w-full text-xs font-serif leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200">
            <GlassButton type="button" variant="secondary" onClick={() => setIsAssertOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              disabled={createClaimMutation.isPending || !newNormalizedText.trim()}
            >
              {createClaimMutation.isPending ? 'Saving...' : 'Assert Claim'}
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* Chunk Viewer Modal */}
      {selectedChunk && (
        <ChunkViewerModal
          chunk={selectedChunk}
          paperTitle="Claim Evidence Chunk"
          onClose={() => setSelectedChunk(null)}
        />
      )}
    </div>
  );
};
