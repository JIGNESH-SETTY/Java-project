import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { paperApi } from '../api/paperApi';
import { claimApi } from '../api/claimApi';
import { reviewApi } from '../api/reviewApi';
import { Link } from 'react-router-dom';
import { BookOpen, GitCommit, FileSpreadsheet, Search, Scale, Sparkles, ArrowRight, ShieldAlert, Cpu } from 'lucide-react';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { RelationBadge, ReviewStatusBadge } from '../components/RelationBadge';

export const DashboardPage: React.FC = () => {
  const { data: papers = [] } = useQuery({
    queryKey: ['papers'],
    queryFn: () => paperApi.listPapers(0, 50),
  });

  const { data: claims = [] } = useQuery({
    queryKey: ['claims'],
    queryFn: () => claimApi.listClaims(0, 20),
  });

  const { data: relations = [] } = useQuery({
    queryKey: ['relations'],
    queryFn: () => claimApi.listRelations(),
  });

  const { data: reviews = [] } = useQuery({
    queryKey: ['reviews'],
    queryFn: () => reviewApi.listReviews(),
  });

  const totalChunks = papers.reduce((acc, p) => acc + p.chunkCount, 0);

  return (
    <div className="space-y-8 animate-fade-in">
      {/* Hero Welcome Banner */}
      <div className="glass-panel p-8 rounded-2xl relative overflow-hidden border border-indigo-500/20 bg-gradient-to-r from-indigo-950/40 via-purple-950/20 to-slate-900/60">
        <div className="max-w-3xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/30">
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span>Academic B.Tech Capstone Project Architecture</span>
          </div>
          <h1 className="text-3xl font-extrabold text-white tracking-tight">
            AI Research Discovery & Evidence Engine
          </h1>
          <p className="text-slate-300 text-sm leading-relaxed">
            Index scholarly publications, verify research claims against exact chunk-level citations, discover cross-paper contradictions, and generate literature reviews with zero hallucination.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <Link
              to="/search"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
            >
              <Search className="w-4 h-4" />
              <span>Launch Hybrid Search</span>
            </Link>
            <Link
              to="/library"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700 flex items-center gap-2"
            >
              <BookOpen className="w-4 h-4" />
              <span>Browse Library ({papers.length})</span>
            </Link>
            <Link
              to="/reviews"
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold transition border border-slate-700 flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span>Draft Literature Review</span>
            </Link>
          </div>
        </div>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div className="glass-card p-5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Indexed Papers</span>
            <BookOpen className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{papers.length}</div>
          <div className="text-[11px] text-slate-500 mt-1">{totalChunks} semantic chunks vectorized</div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Reported Claims</span>
            <GitCommit className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{claims.length}</div>
          <div className="text-[11px] text-emerald-400/80 mt-1">100% tied to chunk excerpts</div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Claim Relations</span>
            <Scale className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{relations.length}</div>
          <div className="text-[11px] text-amber-400/80 mt-1">Supports / Qualifies / Contradicts</div>
        </div>

        <div className="glass-card p-5 rounded-xl border border-slate-800/80">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Literature Reviews</span>
            <FileSpreadsheet className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-bold text-white mt-2">{reviews.length}</div>
          <div className="text-[11px] text-purple-400/80 mt-1">Audited paragraph evidence</div>
        </div>
      </div>

      {/* Core Highlights Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Recent Papers */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-400" />
              <h2 className="font-bold text-slate-100 text-sm">Foundational Research Papers</h2>
            </div>
            <Link to="/library" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <span>View all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {papers.slice(0, 4).map((p) => (
              <Link
                key={p.paper.id}
                to={`/papers/${p.paper.id}`}
                className="block p-3.5 rounded-xl bg-slate-900/50 hover:bg-slate-800/60 border border-slate-800/70 transition"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1">
                    <h3 className="text-xs font-semibold text-slate-200 line-clamp-1">{p.paper.title}</h3>
                    <p className="text-[11px] text-slate-400 line-clamp-2">{p.paper.abstractText || 'No abstract available.'}</p>
                    <div className="flex items-center gap-2 text-[10px] text-slate-500 pt-1">
                      <span>{p.paper.venue || 'Scholarly Publication'}</span>
                      <span>•</span>
                      <span>{p.paper.publicationYear}</span>
                      <span>•</span>
                      <span>{p.chunkCount} chunks</span>
                    </div>
                  </div>
                  <span className="shrink-0 px-2 py-0.5 rounded text-[10px] font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    {p.paper.processingStatus}
                  </span>
                </div>
              </Link>
            ))}
          </div>
        </div>

        {/* Recent Claim Relationships */}
        <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-emerald-400" />
              <h2 className="font-bold text-slate-100 text-sm">Discovered Claim Relationships</h2>
            </div>
            <Link to="/claims" className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1">
              <span>Explore all</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {relations.slice(0, 4).map((rel) => (
              <div
                key={rel.id}
                className="p-3.5 rounded-xl bg-slate-900/50 border border-slate-800/70 space-y-2 text-xs"
              >
                <div className="flex items-center justify-between gap-2">
                  <RelationBadge type={rel.relationType} />
                  <ReviewStatusBadge status={rel.reviewStatus} />
                </div>
                <p className="text-slate-300 text-xs italic leading-snug">"{rel.rationale}"</p>
                <div className="flex items-center justify-between pt-1">
                  <ProvenanceBadge provenance={rel.provenanceType} confidence={rel.confidence} />
                  <span className="text-[10px] text-slate-500">{rel.evidenceChunkIds.length} evidence chunks</span>
                </div>
              </div>
            ))}
            {relations.length === 0 && (
              <div className="text-center py-8 text-xs text-slate-500">
                No claim relations proposed yet. Index papers to discover cross-paper evidence.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
