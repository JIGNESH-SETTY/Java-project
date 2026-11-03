import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { claimApi } from '../api/claimApi';
import { paperApi } from '../api/paperApi';
import { Claim, ClaimRelation, ClaimType, RelationType, ReviewStatus, DocumentChunk } from '../types';
import {
  GitCommit,
  CheckCircle2,
  XCircle,
  Plus,
  FileText,
  Search,
  Sparkles,
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
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <GitCommit className="w-4 h-4" />
            <span>Directional Claim Graph & Auditing</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Claims & Evidence Explorer
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
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
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium">
            <button
              onClick={() => setActiveTab('relations')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'relations'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
              }`}
            >
              Cross-Paper Relations ({relations.length})
            </button>
            <button
              onClick={() => setActiveTab('claims')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                activeTab === 'claims'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                  : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
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
                      ? 'border-blue-500 bg-white dark:bg-slate-900 ring-2 ring-blue-100 dark:ring-blue-900/50 shadow-md'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <RelationBadge type={rel.relationType} />
                    <ReviewStatusBadge status={rel.reviewStatus} />
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 font-serif italic">
                    "{rel.rationale}"
                  </p>

                  <div className="flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 pt-1 border-t border-slate-100 dark:border-slate-800">
                    <ProvenanceBadge provenance={rel.provenanceType} confidence={rel.confidence} />
                    <span>{rel.evidenceChunkIds?.length || 0} chunks</span>
                  </div>
                </GlassPanelStrong>
              );
            })}

            {filteredRelations.length === 0 && (
              <div className="p-8 text-center glass-panel text-xs text-slate-500 dark:text-slate-400">
                No claim relationships match current filters.
              </div>
            )}
          </div>

          {/* Right Column: Detailed Relation Audit View */}
          <div className="lg:col-span-7 sticky top-24">
            {activeRelation ? (
              <GlassPanelStrong className="p-6 space-y-5 shadow-md">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
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
                      icon={<CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />}
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
                      icon={<XCircle className="w-3.5 h-3.5 text-red-600 dark:text-red-400" />}
                    >
                      Reject
                    </GlassButton>
                  </div>
                </div>

                {/* Synthesis Rationale */}
                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Scientific Synthesis & Rationale
                  </span>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-serif leading-relaxed">
                    "{activeRelation.rationale}"
                  </div>
                </div>

                {/* Grounded Evidence Chunks */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Verbatim Grounded Evidence ({activeRelation.evidenceChunkIds?.length || 0})
                    </span>
                    <ProvenanceBadge provenance={activeRelation.provenanceType} confidence={activeRelation.confidence} />
                  </div>

                  <div className="space-y-2">
                    {activeRelation.evidenceChunkIds?.map((chunkId, idx) => (
                      <div
                        key={chunkId}
                        className="p-3 rounded-xl bg-white dark:bg-slate-900 border border-slate-200/80 dark:border-slate-800 flex items-center justify-between text-xs"
                      >
                        <div className="flex items-center gap-2 text-slate-700 dark:text-slate-300">
                          <FileText className="w-4 h-4 text-blue-500 dark:text-blue-400" />
                          <span className="font-mono text-[11px]">Chunk Ref #{idx + 1} ({chunkId.substring(0, 8)}...)</span>
                        </div>
                        <button
                          onClick={() => inspectEvidence(chunkId)}
                          className="text-xs font-semibold text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                        >
                          Open Chunk Text
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </GlassPanelStrong>
            ) : (
              <div className="p-12 text-center glass-panel text-xs text-slate-500 dark:text-slate-400">
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
                      ? 'border-blue-500 bg-white dark:bg-slate-900 ring-2 ring-blue-100 dark:ring-blue-900/50 shadow-md'
                      : 'border-slate-200/80 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                      {claim.claimType}
                    </span>
                    <ProvenanceBadge provenance={claim.provenanceType} confidence={claim.extractionConfidence} />
                  </div>

                  <p className="text-xs text-slate-800 dark:text-slate-200 line-clamp-2 font-serif font-medium">
                    "{claim.normalizedText || claim.sourceText}"
                  </p>
                </GlassPanelStrong>
              );
            })}

            {filteredClaims.length === 0 && (
              <div className="p-8 text-center glass-panel text-xs text-slate-500 dark:text-slate-400">
                No atomic claims match current filters.
              </div>
            )}
          </div>

          <div className="lg:col-span-7 sticky top-24">
            {activeClaim ? (
              <GlassPanelStrong className="p-6 space-y-5 shadow-md">
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-slate-200 dark:border-slate-800">
                  <div className="space-y-1">
                    <div className="text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider">
                      Selected Claim
                    </div>
                    <div className="flex items-center gap-2 pt-0.5">
                      <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
                        {activeClaim.claimType}
                      </span>
                      <ProvenanceBadge provenance={activeClaim.provenanceType} confidence={activeClaim.extractionConfidence} />
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                    Normalized Claim Text
                  </span>
                  <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-800 dark:text-slate-200 font-sans leading-relaxed">
                    "{activeClaim.normalizedText || activeClaim.sourceText}"
                  </div>
                </div>

                {activeClaim.sourceText && (
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">
                      Original Source Text
                    </span>
                    <div className="p-4 rounded-xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200/80 dark:border-slate-800 text-xs text-slate-700 dark:text-slate-300 font-serif italic leading-relaxed">
                      "{activeClaim.sourceText}"
                    </div>
                  </div>
                )}
              </GlassPanelStrong>
            ) : (
              <div className="p-12 text-center glass-panel text-xs text-slate-500 dark:text-slate-400">
                Select a claim from the list to inspect details.
              </div>
            )}
          </div>
        </div>
      )}

      {/* Propose Relation Modal */}
      <GlassModal
        isOpen={isProposeOpen}
        onClose={() => setIsProposeOpen(false)}
        title="Propose Claim Relationship"
        subtitle="Establish directional link between two atomic claims with grounded rationale"
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
            options={[
              { value: '', label: '-- Select source claim --' },
              ...claims.map((c) => ({
                value: c.id,
                label: `[${c.claimType}] ${c.normalizedText || c.sourceText}`.substring(0, 90) + '...',
              })),
            ]}
          />

          <GlassSelect
            label="Target Claim *"
            required
            value={targetClaimId}
            onChange={(e) => setTargetClaimId(e.target.value)}
            options={[
              { value: '', label: '-- Select target claim --' },
              ...claims
                .filter((c) => c.id !== sourceClaimId)
                .map((c) => ({
                  value: c.id,
                  label: `[${c.claimType}] ${c.normalizedText || c.sourceText}`.substring(0, 90) + '...',
                })),
            ]}
          />

          <GlassSelect
            label="Directional Relationship Type *"
            value={relationType}
            onChange={(e) => setRelationType(e.target.value as RelationType)}
            options={[
              { value: 'SUPPORTS', label: 'SUPPORTS - Empirical or logical confirmation' },
              { value: 'CONTRADICTS', label: 'CONTRADICTS - Conflicting findings or irreproducibility' },
              { value: 'QUALIFIES', label: 'QUALIFIES - Adds conditional bounds or limits scope' },
              { value: 'EXTENDS', label: 'EXTENDS - Generalizes or expands methodology' },
              { value: 'DISCUSSES', label: 'DISCUSSES - Neutral thematic citation' },
            ]}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
              Scientific Synthesis Rationale *
            </label>
            <textarea
              rows={3}
              required
              className="glass-input w-full font-serif text-xs leading-relaxed"
              placeholder="State precisely how source claim supports, contradicts, or qualifies target claim..."
              value={rationale}
              onChange={(e) => setRationale(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <GlassButton type="button" variant="secondary" onClick={() => setIsProposeOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              disabled={createRelationMutation.isPending || !sourceClaimId || !targetClaimId || !rationale.trim()}
            >
              {createRelationMutation.isPending ? 'Saving...' : 'Propose Relationship'}
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* Assert Claim Modal */}
      <GlassModal
        isOpen={isAssertOpen}
        onClose={() => setIsAssertOpen(false)}
        title="Assert Atomic Scientific Claim"
        subtitle="Manually declare a claim directly tied to evidence excerpt"
      >
        <form
          onSubmit={(e) => {
            e.preventDefault();
            createClaimMutation.mutate();
          }}
          className="space-y-4"
        >
          <GlassInput
            label="Normalized Claim Text *"
            required
            placeholder="e.g. FlashAttention reduces memory footprint by avoiding materialize intermediate attention matrix."
            value={newNormalizedText}
            onChange={(e) => setNewNormalizedText(e.target.value)}
          />

          <GlassSelect
            label="Claim Classification *"
            value={newClaimType}
            onChange={(e) => setNewClaimType(e.target.value as ClaimType)}
            options={[
              { value: 'FINDING', label: 'FINDING - Empirical experimental discovery' },
              { value: 'HYPOTHESIS', label: 'HYPOTHESIS - Theoretical conjecture to be tested' },
              { value: 'METHOD_ASSERTION', label: 'METHOD_ASSERTION - Algorithmic or architectural claim' },
              { value: 'LIMITATION', label: 'LIMITATION - Explicit caveat or boundary' },
            ]}
          />

          <GlassInput
            label="Section Name"
            placeholder="e.g. Results, Discussion, Methodology"
            value={newSection}
            onChange={(e) => setNewSection(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
              Verbatim Evidence Excerpt *
            </label>
            <textarea
              rows={3}
              required
              className="glass-input w-full font-serif text-xs leading-relaxed"
              placeholder="Paste exact excerpt from paper text that verifies this claim..."
              value={newSourceText}
              onChange={(e) => setNewSourceText(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
            <GlassButton type="button" variant="secondary" onClick={() => setIsAssertOpen(false)}>
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              disabled={createClaimMutation.isPending || !newNormalizedText.trim() || !newSourceText.trim()}
            >
              {createClaimMutation.isPending ? 'Asserting...' : 'Assert Claim'}
            </GlassButton>
          </div>
        </form>
      </GlassModal>

      {/* Chunk Viewer Modal */}
      {selectedChunk && (
        <ChunkViewerModal
          chunk={selectedChunk}
          paperTitle="Claim Evidence Document"
          onClose={() => setSelectedChunk(null)}
        />
      )}
    </div>
  );
};
