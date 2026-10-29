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
  Sparkles,
  ArrowRight,
  UploadCloud,
  CheckCircle2,
  Clock,
  ArrowUpRight,
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
    <div className="p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto space-y-8 select-none">
      {/* Hero Header Card with Dot Matrix Texture */}
      <div
        className="relative p-6 sm:p-8 rounded-[28px] overflow-hidden border border-white/85 shadow-[0_12px_32px_-8px_rgba(41,40,43,0.04)]"
        style={{
          background: 'rgba(255, 255, 255, 0.72)',
          backdropFilter: 'blur(24px)',
        }}
      >
        {/* Subtle Dotted Pattern Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-30 dot-matrix"
          style={{
            maskImage: 'radial-gradient(ellipse at 80% 30%, black 30%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 80% 30%, black 30%, transparent 85%)',
          }}
        />

        {/* Ambient Subtle Gradient Tint in Hero */}
        <div
          className="absolute -top-12 -right-12 w-80 h-80 rounded-full pointer-events-none opacity-30"
          style={{
            background: 'radial-gradient(circle, rgba(255, 178, 155, 0.5) 0%, rgba(228, 202, 255, 0.3) 60%, transparent 100%)',
            filter: 'blur(30px)',
          }}
        />

        <div className="max-w-3xl relative z-10 space-y-3.5">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-[#FFEAE6] text-[#E24354] border border-[#FFD5CE]">
            <Sparkles className="w-3.5 h-3.5 text-[#FF6F61]" />
            <span>Academic Research & Evidence Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-[#29282B] tracking-tight">
            AI Research Discovery & Evidence Engine
          </h1>

          <p className="text-[#615E65] text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
            Index academic PDFs, extract structured scientific claims, detect cross-paper contradictions, and generate literature reviews where every factual sentence is grounded in verbatim chunk citations.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
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
              icon={<UploadCloud className="w-4 h-4 text-[#FF6F61]" />}
            >
              Import Scholarly Paper
            </GlassButton>
            <GlassButton
              variant="secondary"
              onClick={() => navigate('/reviews')}
              icon={<FileSpreadsheet className="w-4 h-4 text-[#8B5CF6]" />}
            >
              Draft Evidence Review
            </GlassButton>
          </div>
        </div>
      </div>

      {/* Metrics Row (4 Large Rounded Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Papers */}
        <div
          className="p-6 rounded-[26px] flex flex-col justify-between border border-white/90 shadow-[0_12px_32px_-8px_rgba(41,40,43,0.04)] transition-transform hover:scale-[1.01]"
          style={{
            background: 'rgba(255, 255, 255, 0.86)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center justify-between text-[#8E8B92] text-[11px] font-bold uppercase tracking-wider">
            <span>Total Papers</span>
            <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-white flex items-center justify-center text-[#FF6F61]">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-[#29282B] tracking-tight">{papers.length}</div>
            <div className="text-xs text-[#615E65] mt-1.5 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{processedPapers} fully vectorized</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Extracted Claims */}
        <div
          className="p-6 rounded-[26px] flex flex-col justify-between border border-white/90 shadow-[0_12px_32px_-8px_rgba(41,40,43,0.04)] transition-transform hover:scale-[1.01]"
          style={{
            background: 'rgba(255, 255, 255, 0.86)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center justify-between text-[#8E8B92] text-[11px] font-bold uppercase tracking-wider">
            <span>Extracted Claims</span>
            <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-white flex items-center justify-center text-emerald-600">
              <GitCommit className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-[#29282B] tracking-tight">{claims.length}</div>
            <div className="text-xs text-emerald-700 mt-1.5 font-medium">
              100% grounded in source chunks
            </div>
          </div>
        </div>

        {/* Metric 3: Pending Relations */}
        <div
          className="p-6 rounded-[26px] flex flex-col justify-between border border-white/90 shadow-[0_12px_32px_-8px_rgba(41,40,43,0.04)] transition-transform hover:scale-[1.01]"
          style={{
            background: 'rgba(255, 255, 255, 0.86)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center justify-between text-[#8E8B92] text-[11px] font-bold uppercase tracking-wider">
            <span>Pending Relations</span>
            <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-white flex items-center justify-center text-amber-600">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-[#29282B] tracking-tight">{pendingRelations}</div>
            <div className="text-xs text-[#615E65] mt-1.5 font-medium">
              {relations.length} total cross-paper links
            </div>
          </div>
        </div>

        {/* Metric 4: Literature Reviews */}
        <div
          className="p-6 rounded-[26px] flex flex-col justify-between border border-white/90 shadow-[0_12px_32px_-8px_rgba(41,40,43,0.04)] transition-transform hover:scale-[1.01]"
          style={{
            background: 'rgba(255, 255, 255, 0.86)',
            backdropFilter: 'blur(20px)',
          }}
        >
          <div className="flex items-center justify-between text-[#8E8B92] text-[11px] font-bold uppercase tracking-wider">
            <span>Literature Reviews</span>
            <div className="w-8 h-8 rounded-full bg-white shadow-xs border border-white flex items-center justify-center text-[#8B5CF6]">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-[#29282B] tracking-tight">{reviews.length}</div>
            <div className="text-xs text-[#8B5CF6] mt-1.5 font-medium">
              Audited paragraph provenance
            </div>
          </div>
        </div>
      </div>

      {/* Core Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
        {/* Left Column: Foundational Papers */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white shadow-xs flex items-center justify-center text-[#FF6F61]">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-bold text-[#29282B] text-sm tracking-tight">Indexed Scientific Literature</h2>
            </div>
            <Link
              to="/library"
              className="text-xs text-[#FF6F61] hover:text-[#E24354] font-semibold flex items-center gap-1 transition"
            >
              <span>View Library ({papers.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {papers.slice(0, 4).map((p) => (
              <div
                key={p.paper.id}
                onClick={() => navigate(`/papers/${p.paper.id}`)}
                className="group p-5 rounded-[24px] cursor-pointer border border-white/90 shadow-[0_6px_20px_rgba(41,40,43,0.03)] hover:shadow-[0_12px_28px_rgba(41,40,43,0.06)] hover:scale-[1.01] transition-all space-y-2.5"
                style={{
                  background: 'rgba(255, 255, 255, 0.86)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-semibold text-[#29282B] leading-snug truncate group-hover:text-[#FF6F61] transition-colors">
                        {p.paper.title}
                      </h3>
                    </div>
                    <p className="text-xs text-[#77747A] line-clamp-2 font-normal leading-relaxed">
                      {p.paper.abstractText || 'No abstract text extracted.'}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-[#8E8B92] font-medium pt-1">
                      <span>{p.paper.venue || 'Scholarly Publication'}</span>
                      <span>•</span>
                      <span>{p.paper.publicationYear}</span>
                      <span>•</span>
                      <span>{p.chunkCount || 0} chunks</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <StatusBadge status={p.paper.processingStatus} />
                    <div className="w-7 h-7 rounded-full bg-white shadow-xs border border-white flex items-center justify-center text-[#8E8B92] group-hover:text-[#29282B] group-hover:scale-105 transition">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {papers.length === 0 && (
              <div
                className="p-8 rounded-[24px] text-center border border-white/85 text-xs text-[#77747A]"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                No indexed papers yet. Click "Import Scholarly Paper" to begin evidence ingestion.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Claim Relationships */}
        <div className="space-y-4">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2.5">
              <div className="w-7 h-7 rounded-full bg-white shadow-xs flex items-center justify-center text-emerald-600">
                <GitCommit className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-bold text-[#29282B] text-sm tracking-tight">Cross-Paper Claim Relationships</h2>
            </div>
            <Link
              to="/claims"
              className="text-xs text-[#FF6F61] hover:text-[#E24354] font-semibold flex items-center gap-1 transition"
            >
              <span>Claim Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {relations.slice(0, 4).map((rel) => (
              <div
                key={rel.id}
                className="p-5 rounded-[24px] border border-white/90 shadow-[0_6px_20px_rgba(41,40,43,0.03)] space-y-3 transition-transform hover:scale-[1.01]"
                style={{
                  background: 'rgba(255, 255, 255, 0.86)',
                  backdropFilter: 'blur(20px)',
                }}
              >
                <div className="flex items-center justify-between gap-2">
                  <RelationBadge type={rel.relationType} />
                  <ReviewStatusBadge status={rel.reviewStatus} />
                </div>
                <p className="text-[#29282B] text-xs italic font-serif leading-relaxed pl-1">
                  "{rel.rationale}"
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100/80">
                  <ProvenanceBadge provenance={rel.provenanceType} confidence={rel.confidence} />
                  <span className="text-[11px] text-[#8E8B92] font-medium">
                    {rel.evidenceChunkIds?.length || 0} evidence chunks
                  </span>
                </div>
              </div>
            ))}

            {relations.length === 0 && (
              <div
                className="p-8 rounded-[24px] text-center border border-white/85 text-xs text-[#77747A]"
                style={{
                  background: 'rgba(255, 255, 255, 0.65)',
                  backdropFilter: 'blur(16px)',
                }}
              >
                No claim relationships recorded yet. Import or compare papers to identify scientific consensus or contradictions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
