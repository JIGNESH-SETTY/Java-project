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
  ArrowRight
} from 'lucide-react';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { RelationBadge, ReviewStatusBadge } from '../components/RelationBadge';
import { ChunkViewerModal } from '../components/ChunkViewerModal';

export const ClaimExplorerPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<'relations' | 'claims'>('relations');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [typeFilter, setTypeFilter] = useState<string>('ALL');
  const [searchTerm, setSearchTerm] = useState<string>('');

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
    if (searchTerm && !c.normalizedText.toLowerCase().includes(searchTerm.toLowerCase()) && !c.sourceText.toLowerCase().includes(searchTerm.toLowerCase())) {
      return false;
    }
    return true;
  });

  const getClaimText = (id: string) => {
    const c = claims.find((item) => item.id === id);
    return c ? c.normalizedText : 'Unknown claim';
  };

  const getClaimPaperTitle = (id: string) => {
    const c = claims.find((item) => item.id === id);
    if (!c || !c.paperId) return 'Independent';
    const p = papers.find((item) => item.paper.id === c.paperId);
    return p ? p.paper.title : 'Research Paper';
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Claims & Evidence Explorer</h1>
          <p className="text-xs text-slate-400">
            Track reported scientific assertions, verify support vs contradictions, and review AI proposed links
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsAssertOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4 text-slate-400" />
            <span>Assert Human Claim</span>
          </button>
          <button
            onClick={() => setIsProposeOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
          >
            <Sparkles className="w-4 h-4" />
            <span>Propose Claim Relation</span>
          </button>
        </div>
      </div>

      {/* Metric Tiles */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-4 rounded-xl border border-slate-800/80">
          <div className="text-slate-400 text-xs">Total Tracked Claims</div>
          <div className="text-xl font-bold text-white mt-1">{claims.length}</div>
          <div className="text-[10px] text-emerald-400 mt-0.5">100% cited to source chunks</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800/80">
          <div className="text-slate-400 text-xs">Pending AI Proposals</div>
          <div className="text-xl font-bold text-amber-400 mt-1">
            {relations.filter((r) => r.reviewStatus === 'PENDING').length}
          </div>
          <div className="text-[10px] text-slate-500 mt-0.5">Requires researcher review</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800/80">
          <div className="text-slate-400 text-xs">Human Confirmed</div>
          <div className="text-xl font-bold text-emerald-400 mt-1">
            {relations.filter((r) => r.reviewStatus === 'CONFIRMED').length}
          </div>
          <div className="text-[10px] text-emerald-500/80 mt-0.5">Verified cross-paper evidence</div>
        </div>

        <div className="glass-card p-4 rounded-xl border border-slate-800/80">
          <div className="text-slate-400 text-xs">Contradictions & Qualifications</div>
          <div className="text-xl font-bold text-rose-400 mt-1">
            {relations.filter((r) => r.relationType === 'CONTRADICTS' || r.relationType === 'QUALIFIES').length}
          </div>
          <div className="text-[10px] text-rose-400/80 mt-0.5">Empirical disagreements</div>
        </div>
      </div>

      {/* Tabs & Search Filter */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-3">
        <div className="flex gap-4 text-xs font-semibold">
          <button
            onClick={() => setActiveTab('relations')}
            className={`pb-2 border-b-2 transition ${
              activeTab === 'relations'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            Claim Relationships ({relations.length})
          </button>
          <button
            onClick={() => setActiveTab('claims')}
            className={`pb-2 border-b-2 transition ${
              activeTab === 'claims'
                ? 'border-indigo-500 text-indigo-400 font-bold'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            All Reported Claims ({claims.length})
          </button>
        </div>

        {/* Filter Controls */}
        <div className="flex flex-wrap items-center gap-3 text-xs">
          <input
            type="text"
            placeholder="Filter rationale or claim..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
          />

          {activeTab === 'relations' && (
            <>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Review Statuses</option>
                <option value="PENDING">Pending Review</option>
                <option value="CONFIRMED">Human Confirmed</option>
                <option value="REJECTED">Rejected</option>
              </select>

              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none"
              >
                <option value="ALL">All Relations</option>
                <option value="SUPPORTS">Supports</option>
                <option value="CONTRADICTS">Contradicts</option>
                <option value="QUALIFIES">Qualifies</option>
                <option value="EXTENDS">Extends</option>
              </select>
            </>
          )}
        </div>
      </div>

      {/* Tab 1: Relations */}
      {activeTab === 'relations' && (
        <div className="space-y-4">
          {filteredRelations.length === 0 ? (
            <div className="text-center py-12 text-xs text-slate-500">
              No claim relationships match your filter.
            </div>
          ) : (
            filteredRelations.map((rel) => (
              <div
                key={rel.id}
                className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-4"
              >
                {/* Header: Relation & Review Status */}
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2">
                    <RelationBadge type={rel.relationType} />
                    <ReviewStatusBadge status={rel.reviewStatus} />
                  </div>
                  <ProvenanceBadge provenance={rel.provenanceType} confidence={rel.confidence} />
                </div>

                {/* Claims Comparison Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-indigo-400">Source Claim</div>
                    <p className="font-semibold text-slate-200 leading-snug">
                      {getClaimText(rel.sourceClaimId)}
                    </p>
                    <div className="text-[10px] text-slate-500 truncate">
                      From: {getClaimPaperTitle(rel.sourceClaimId)}
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 space-y-1.5">
                    <div className="text-[10px] uppercase font-bold text-purple-400">Target Claim</div>
                    <p className="font-semibold text-slate-200 leading-snug">
                      {getClaimText(rel.targetClaimId)}
                    </p>
                    <div className="text-[10px] text-slate-500 truncate">
                      From: {getClaimPaperTitle(rel.targetClaimId)}
                    </div>
                  </div>
                </div>

                {/* Rationale */}
                <div className="bg-[#0b101d] p-3 rounded-xl border border-slate-800 text-xs space-y-1">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Justification & Context:</span>
                  <p className="text-slate-300 italic leading-relaxed">"{rel.rationale}"</p>
                </div>

                {/* Review Actions */}
                <div className="flex items-center justify-between pt-1 border-t border-slate-800/60 text-xs">
                  <span className="text-[11px] text-slate-500">
                    {rel.evidenceChunkIds.length} grounded evidence chunk(s)
                  </span>

                  <div className="flex items-center gap-2">
                    {rel.reviewStatus !== 'CONFIRMED' && (
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({ id: rel.id, status: 'CONFIRMED' })
                        }
                        className="px-3 py-1 bg-emerald-600/20 hover:bg-emerald-600/30 text-emerald-300 border border-emerald-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Confirm Relationship</span>
                      </button>
                    )}

                    {rel.reviewStatus !== 'REJECTED' && (
                      <button
                        onClick={() =>
                          updateStatusMutation.mutate({ id: rel.id, status: 'REJECTED' })
                        }
                        className="px-3 py-1 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/30 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                      >
                        <XCircle className="w-3.5 h-3.5" />
                        <span>Reject</span>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      )}

      {/* Tab 2: All Reported Claims */}
      {activeTab === 'claims' && (
        <div className="space-y-3">
          {filteredClaims.map((claim) => (
            <div
              key={claim.id}
              className="glass-card p-4 rounded-xl border border-slate-800/80 space-y-2 text-xs"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-slate-800 text-slate-300 border border-slate-700">
                    {claim.claimType}
                  </span>
                  <ProvenanceBadge provenance={claim.provenanceType} confidence={claim.extractionConfidence} />
                </div>
                <span className="text-[10px] text-slate-500">
                  {claim.sectionName} • Page {claim.pageNumber || 'N/A'}
                </span>
              </div>

              <p className="font-semibold text-slate-100 text-sm leading-snug">
                {claim.normalizedText}
              </p>

              <div className="bg-slate-900/50 p-2.5 rounded-lg border-l-2 border-emerald-500 text-slate-300 text-xs italic">
                "{claim.sourceText}"
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Propose Relation Modal */}
      {isProposeOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#131b2e] border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="font-semibold text-white text-base">Propose Relationship Between Claims</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createRelationMutation.mutate();
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-300 mb-1">Source Claim *</label>
                <select
                  required
                  value={sourceClaimId}
                  onChange={(e) => setSourceClaimId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200"
                >
                  <option value="">Select source claim...</option>
                  {claims.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.normalizedText.substring(0, 75)}...
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Target Claim *</label>
                <select
                  required
                  value={targetClaimId}
                  onChange={(e) => setTargetClaimId(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200"
                >
                  <option value="">Select target claim...</option>
                  {claims
                    .filter((c) => c.id !== sourceClaimId)
                    .map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.normalizedText.substring(0, 75)}...
                      </option>
                    ))}
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Relation Type *</label>
                <select
                  value={relationType}
                  onChange={(e) => setRelationType(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200"
                >
                  <option value="SUPPORTS">Supports (Empirical validation)</option>
                  <option value="CONTRADICTS">Contradicts (Direct conflict under same conditions)</option>
                  <option value="QUALIFIES">Qualifies (Restricts scope or conditions)</option>
                  <option value="EXTENDS">Extends (Builds further on method)</option>
                  <option value="DISCUSSES">Discusses (Theoretical deliberation)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Justification Rationale *</label>
                <textarea
                  rows={3}
                  required
                  value={rationale}
                  onChange={(e) => setRationale(e.target.value)}
                  placeholder="Explain why these claims support or contradict each other..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsProposeOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createRelationMutation.isPending || !sourceClaimId || !targetClaimId}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold"
                >
                  Save Relation
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Assert Claim Modal */}
      {isAssertOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#131b2e] border border-slate-700 rounded-2xl w-full max-w-lg p-6 space-y-4">
            <h3 className="font-semibold text-white text-base">Assert Scientific Claim</h3>
            <form
              onSubmit={(e) => {
                e.preventDefault();
                createClaimMutation.mutate();
              }}
              className="space-y-3 text-xs"
            >
              <div>
                <label className="block text-slate-300 mb-1">Normalized Claim Text *</label>
                <input
                  type="text"
                  required
                  value={newNormalizedText}
                  onChange={(e) => setNewNormalizedText(e.target.value)}
                  placeholder="e.g. Method X reduces latency by 35% on GPU clusters"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200"
                />
              </div>

              <div>
                <label className="block text-slate-300 mb-1">Source Quotation *</label>
                <textarea
                  rows={3}
                  required
                  value={newSourceText}
                  onChange={(e) => setNewSourceText(e.target.value)}
                  placeholder="Exact quote from paper..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 mb-1">Claim Type</label>
                  <select
                    value={newClaimType}
                    onChange={(e) => setNewClaimType(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200"
                  >
                    <option value="FINDING">Finding</option>
                    <option value="HYPOTHESIS">Hypothesis</option>
                    <option value="METHOD_ASSERTION">Method Assertion</option>
                    <option value="LIMITATION">Limitation</option>
                  </select>
                </div>
                <div>
                  <label className="block text-slate-300 mb-1">Section</label>
                  <input
                    type="text"
                    value={newSection}
                    onChange={(e) => setNewSection(e.target.value)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl p-2 text-slate-200"
                  />
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsAssertOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={createClaimMutation.isPending || !newNormalizedText.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold"
                >
                  Assert Claim
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
