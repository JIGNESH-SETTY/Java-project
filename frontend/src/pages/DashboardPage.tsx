import React from 'react';
import { useQuery } from '@tanstack/react-query';
import { paperApi } from '../api/paperApi';
import { claimApi } from '../api/claimApi';
import { reviewApi } from '../api/reviewApi';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  GitCommit,
  FileSpreadsheet,
  Search,
  Scale,
  Sparkles,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  Clock,
  Layers,
  ShieldCheck,
} from 'lucide-react';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { RelationBadge, ReviewStatusBadge } from '../components/RelationBadge';
import { StatusBadge } from '../components/StatusBadge';
import { GlassPanel, GlassPanelStrong } from '../components/GlassPanel';
import { GlassButton } from '../components/GlassButton';

export const DashboardPage: React.FC = () => {
  const navigate = useNavigate();

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

  const totalChunks = papers.reduce((acc, p) => acc + (p.chunkCount || 0), 0);
  const processedPapers = papers.filter(
    (p) => p.paper.processingStatus === 'COMPLETED' || p.paper.processingStatus === 'RESOLVED'
  ).length;
  const pendingRelations = relations.filter((r) => r.reviewStatus === 'PENDING').length;

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-8">
      {/* Hero Header */}
      <GlassPanel className="p-8 relative overflow-hidden bg-gradient-to-br from-indigo-50/90 via-white/80 to-purple-50/60 border-white/80 shadow-md">
        <div className="max-w-3xl relative z-10 space-y-3">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-indigo-100/80 text-indigo-800 border border-indigo-200">
            <Sparkles className="w-3.5 h-3.5 text-indigo-600" />
            <span>Academic Research & Evidence Intelligence</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-slate-900 tracking-tight">
            AI Research Discovery & Evidence Engine
          </h1>
          <p className="text-slate-600 text-sm leading-relaxed max-w-2xl font-normal">
            Index academic PDFs, extract structured scientific claims, detect cross-paper contradictions, and generate literature reviews where every factual sentence is grounded in verbatim chunk citations.
          </p>

          <div className="pt-3 flex flex-wrap items-center gap-3">
            <GlassButton
              variant="primary"
              onClick={() => navigate('/search')}
              icon={<Search className="w-4 h-4" />}
            >
              Hybrid Semantic Search
            </GlassButton>
            <GlassButton
              variant="secondary"
              onClick={() => navigate('/import')}
              icon={<UploadCloud className="w-4 h-4 text-indigo-600" />}
            >
              Import Scholarly Paper
            </GlassButton>
            <GlassButton
              variant="secondary"
              onClick={() => navigate('/reviews')}
              icon={<FileSpreadsheet className="w-4 h-4 text-purple-600" />}
            >
              Draft Evidence Review
            </GlassButton>
          </div>
        </div>
      </GlassPanel>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-5">
        <GlassPanelStrong className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Total Papers</span>
            <BookOpen className="w-4 h-4 text-indigo-600" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900">{papers.length}</div>
            <div className="text-xs text-slate-500 mt-1 flex items-center gap-1 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{processedPapers} fully vectorized</span>
            </div>
          </div>
        </GlassPanelStrong>

        <GlassPanelStrong className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Extracted Claims</span>
            <GitCommit className="w-4 h-4 text-emerald-600" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900">{claims.length}</div>
            <div className="text-xs text-emerald-700 mt-1 font-medium">
              100% grounded in source chunks
            </div>
          </div>
        </GlassPanelStrong>

        <GlassPanelStrong className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Pending Relations</span>
            <Clock className="w-4 h-4 text-amber-600" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900">{pendingRelations}</div>
            <div className="text-xs text-slate-500 mt-1 font-medium">
              {relations.length} total cross-paper links
            </div>
          </div>
        </GlassPanelStrong>

        <GlassPanelStrong className="p-5 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-500 text-xs font-semibold uppercase tracking-wider">
            <span>Literature Reviews</span>
            <FileSpreadsheet className="w-4 h-4 text-purple-600" />
          </div>
          <div className="mt-3">
            <div className="text-3xl font-bold text-slate-900">{reviews.length}</div>
            <div className="text-xs text-purple-700 mt-1 font-medium">
              Audited paragraph provenance
            </div>
          </div>
        </GlassPanelStrong>
      </div>

      {/* Core Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Foundational Papers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <BookOpen className="w-4 h-4 text-indigo-600" />
              <h2 className="font-bold text-slate-900 text-sm">Indexed Scientific Literature</h2>
            </div>
            <Link
              to="/library"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <span>View Library ({papers.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {papers.slice(0, 4).map((p) => (
              <GlassPanelStrong
                key={p.paper.id}
                onClick={() => navigate(`/papers/${p.paper.id}`)}
                className="p-4 cursor-pointer hover:border-indigo-300 hover:shadow-md transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-sm font-semibold text-slate-900 leading-snug truncate">
                      {p.paper.title}
                    </h3>
                    <p className="text-xs text-slate-500 line-clamp-2 font-normal leading-relaxed">
                      {p.paper.abstractText || 'No abstract text extracted.'}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 font-medium pt-1">
                      <span>{p.paper.venue || 'Scholarly Publication'}</span>
                      <span>•</span>
                      <span>{p.paper.publicationYear}</span>
                      <span>•</span>
                      <span>{p.chunkCount || 0} chunks</span>
                    </div>
                  </div>
                  <div className="shrink-0">
                    <StatusBadge status={p.paper.processingStatus} />
                  </div>
                </div>
              </GlassPanelStrong>
            ))}
          </div>
        </div>

        {/* Claim Relationships */}
        <div className="space-y-4">
          <div className="flex items-center justify-between pb-2">
            <div className="flex items-center gap-2">
              <GitCommit className="w-4 h-4 text-emerald-600" />
              <h2 className="font-bold text-slate-900 text-sm">Cross-Paper Claim Relationships</h2>
            </div>
            <Link
              to="/claims"
              className="text-xs text-indigo-600 hover:text-indigo-800 font-semibold flex items-center gap-1"
            >
              <span>Claim Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {relations.slice(0, 4).map((rel) => (
              <GlassPanelStrong key={rel.id} className="p-4 space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <RelationBadge type={rel.relationType} />
                  <ReviewStatusBadge status={rel.reviewStatus} />
                </div>
                <p className="text-slate-700 text-xs italic font-serif leading-relaxed">
                  "{rel.rationale}"
                </p>
                <div className="flex items-center justify-between pt-1 border-t border-slate-100">
                  <ProvenanceBadge provenance={rel.provenanceType} confidence={rel.confidence} />
                  <span className="text-[11px] text-slate-400 font-medium">
                    {rel.evidenceChunkIds?.length || 0} evidence chunks
                  </span>
                </div>
              </GlassPanelStrong>
            ))}

            {relations.length === 0 && (
              <div className="p-8 text-center glass-panel text-xs text-slate-500">
                No claim relationships recorded yet. Import or compare papers to identify scientific consensus or contradictions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
