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
  UploadCloud,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  ArrowRight,
} from 'lucide-react';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { RelationBadge, ReviewStatusBadge } from '../components/RelationBadge';
import { StatusBadge } from '../components/StatusBadge';
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
    <div className="p-4 sm:p-6 lg:p-7 max-w-7xl mx-auto space-y-6 select-none font-sans smooth-page-load">
      {/* Hero Header Card (12px Radius per Claude Proposal) */}
      <div className="relative p-6 sm:p-7 rounded-[12px] overflow-hidden border border-[#D9E1E9] dark:border-[#1E4656] shadow-sm bg-white dark:bg-[#122B36]">
        {/* Subtle Dotted Pattern Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-25 dot-matrix"
          style={{
            maskImage: 'radial-gradient(ellipse at 80% 30%, black 30%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 80% 30%, black 30%, transparent 85%)',
          }}
        />

        <div className="max-w-3xl relative z-10 space-y-3">
          {/* Pill Badge */}
          <div>
            <span className="pill">
              ✦ Academic Research &amp; Evidence Intelligence
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-extrabold text-[#0B2A33] dark:text-[#E0F2F6] tracking-tight">
            RINNE &mdash; AI Research Discovery &amp; Evidence Engine
          </h1>

          <p className="text-[#475569] dark:text-[#8EB3C2] text-xs sm:text-[13.5px] leading-relaxed max-w-2xl font-normal">
            Index academic PDFs, extract structured scientific claims, detect cross-paper contradictions, and generate literature reviews where every factual sentence is grounded in verbatim chunk citations.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-2.5">
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
              icon={<UploadCloud className="w-4 h-4 text-[#0F4C5C] dark:text-[#38BDF8]" />}
            >
              Import Scholarly Paper
            </GlassButton>
            <GlassButton
              variant="secondary"
              onClick={() => navigate('/reviews')}
              icon={<FileSpreadsheet className="w-4 h-4 text-[#4F46B8] dark:text-[#818CF8]" />}
            >
              Draft Evidence Review
            </GlassButton>
          </div>
        </div>
      </div>

      {/* Metrics Row (4 Clean Cards with 12px Radius) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Metric 1: Total Papers */}
        <div className="p-4.5 rounded-[12px] flex flex-col justify-between border border-[#D9E1E9] dark:border-[#1E4656] shadow-2xs bg-white dark:bg-[#122B36] transition-all hover:border-[#C3CED9]">
          <div className="flex items-center justify-between text-[#5B6B7D] dark:text-[#8EB3C2] text-[10.5px] font-bold uppercase tracking-[0.08em]">
            <span>Total Papers</span>
            <div className="w-7 h-7 rounded-[7px] bg-[#EEF2F6] dark:bg-[#163442] border border-[#D9E1E9] dark:border-[#1E4656] flex items-center justify-center text-[#0F4C5C] dark:text-[#38BDF8]">
              <BookOpen className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#0B2A33] dark:text-[#E0F2F6] tracking-tight">{papers.length}</div>
            <div className="text-[12px] text-[#1B6B43] dark:text-[#34D399] mt-1 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span>{processedPapers} fully vectorized ({totalChunks} chunks)</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Extracted Claims */}
        <div className="p-4.5 rounded-[12px] flex flex-col justify-between border border-[#D9E1E9] dark:border-[#1E4656] shadow-2xs bg-white dark:bg-[#122B36] transition-all hover:border-[#C3CED9]">
          <div className="flex items-center justify-between text-[#5B6B7D] dark:text-[#8EB3C2] text-[10.5px] font-bold uppercase tracking-[0.08em]">
            <span>Extracted Claims</span>
            <div className="w-7 h-7 rounded-[7px] bg-[#E3F3EA] dark:bg-[#163442] border border-[#BFE0CC] dark:border-[#1E4656] flex items-center justify-center text-[#1B6B43] dark:text-[#34D399]">
              <GitCommit className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#0B2A33] dark:text-[#E0F2F6] tracking-tight">{claims.length}</div>
            <div className="text-[12px] text-[#1B6B43] dark:text-[#34D399] mt-1 font-medium">
              100% grounded in source chunks
            </div>
          </div>
        </div>

        {/* Metric 3: Pending Relations */}
        <div className="p-4.5 rounded-[12px] flex flex-col justify-between border border-[#D9E1E9] dark:border-[#1E4656] shadow-2xs bg-white dark:bg-[#122B36] transition-all hover:border-[#C3CED9]">
          <div className="flex items-center justify-between text-[#5B6B7D] dark:text-[#8EB3C2] text-[10.5px] font-bold uppercase tracking-[0.08em]">
            <span>Pending Relations</span>
            <div className="w-7 h-7 rounded-[7px] bg-[#EEF2F6] dark:bg-[#163442] border border-[#D9E1E9] dark:border-[#1E4656] flex items-center justify-center text-[#5B6B7D] dark:text-[#8EB3C2]">
              <Clock className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#0B2A33] dark:text-[#E0F2F6] tracking-tight">{pendingRelations}</div>
            <div className="text-[12px] text-[#475569] dark:text-[#8EB3C2] mt-1 font-medium">
              {relations.length} total cross-paper links
            </div>
          </div>
        </div>

        {/* Metric 4: Literature Reviews */}
        <div className="p-4.5 rounded-[12px] flex flex-col justify-between border border-[#D9E1E9] dark:border-[#1E4656] shadow-2xs bg-white dark:bg-[#122B36] transition-all hover:border-[#C3CED9]">
          <div className="flex items-center justify-between text-[#5B6B7D] dark:text-[#8EB3C2] text-[10.5px] font-bold uppercase tracking-[0.08em]">
            <span>Literature Reviews</span>
            <div className="w-7 h-7 rounded-[7px] bg-[#ECEBFA] dark:bg-[#163442] border border-[#CFCBF1] dark:border-[#1E4656] flex items-center justify-center text-[#4F46B8] dark:text-[#818CF8]">
              <FileSpreadsheet className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="mt-3">
            <div className="text-3xl font-extrabold text-[#0B2A33] dark:text-[#E0F2F6] tracking-tight">{reviews.length}</div>
            <div className="text-[12px] text-[#0A6A80] dark:text-[#38BDF8] mt-1 font-medium">
              Audited paragraph provenance
            </div>
          </div>
        </div>
      </div>

      {/* Core Split Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
        {/* Left Column: Indexed Scientific Literature */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-[#0B2A33] dark:text-[#E0F2F6] text-sm tracking-tight">Indexed Scientific Literature</h2>
            </div>
            <Link
              to="/library"
              className="text-xs text-[#0A6A80] dark:text-[#38BDF8] hover:text-[#0F4C5C] font-semibold flex items-center gap-1 transition"
            >
              <span>View Library ({papers.length})</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {papers.slice(0, 4).map((p) => (
              <div
                key={p.paper.id}
                onClick={() => navigate(`/papers/${p.paper.id}`)}
                className="group p-4 rounded-[12px] cursor-pointer border border-[#D9E1E9] dark:border-[#1E4656] shadow-2xs hover:border-[#0F4C5C] dark:hover:border-[#38BDF8] bg-white dark:bg-[#122B36] transition-all space-y-2"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <h3 className="text-[13.5px] font-bold text-[#0B2A33] dark:text-[#E0F2F6] leading-snug truncate group-hover:text-[#0F4C5C] dark:group-hover:text-[#38BDF8] transition-colors">
                      {p.paper.title}
                    </h3>
                    <p className="text-[12px] text-[#475569] dark:text-[#8EB3C2] line-clamp-2 leading-relaxed">
                      {p.paper.abstractText || 'No abstract text extracted.'}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-[#5B6B7D] dark:text-[#8EB3C2] font-medium pt-0.5">
                      <span className="italic">{p.paper.venue || 'Scholarly Publication'}</span>
                      <span>·</span>
                      <span>{p.paper.publicationYear}</span>
                      <span>·</span>
                      <span className="doi">{p.paper.doi || 'arXiv'}</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <StatusBadge status={p.paper.processingStatus} />
                    <div className="w-6 h-6 rounded-[6px] bg-[#EEF2F6] dark:bg-[#163442] border border-[#D9E1E9] dark:border-[#1E4656] flex items-center justify-center text-[#5B6B7D] group-hover:text-[#0F4C5C] group-hover:scale-105 transition">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {papers.length === 0 && (
              <div className="p-8 rounded-[12px] text-center border border-[#D9E1E9] dark:border-[#1E4656] text-xs text-[#5B6B7D] dark:text-[#8EB3C2] bg-white dark:bg-[#122B36]">
                No indexed papers yet. Click "Import Scholarly Paper" to begin evidence ingestion.
              </div>
            )}
          </div>
        </div>

        {/* Right Column: Claim Relationships */}
        <div className="space-y-3.5">
          <div className="flex items-center justify-between px-1">
            <div className="flex items-center gap-2">
              <h2 className="font-bold text-[#0B2A33] dark:text-[#E0F2F6] text-sm tracking-tight">Cross-Paper Claim Relationships</h2>
            </div>
            <Link
              to="/claims"
              className="text-xs text-[#0A6A80] dark:text-[#38BDF8] hover:text-[#0F4C5C] font-semibold flex items-center gap-1 transition"
            >
              <span>Claim Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-2.5">
            {relations.slice(0, 4).map((rel) => (
              <div
                key={rel.id}
                className="p-4 rounded-[12px] border border-[#D9E1E9] dark:border-[#1E4656] shadow-2xs hover:border-[#0F4C5C] dark:hover:border-[#38BDF8] bg-white dark:bg-[#122B36] space-y-2.5 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <RelationBadge type={rel.relationType} />
                  <ReviewStatusBadge status={rel.reviewStatus} />
                </div>
                <div className="abs">
                  "{rel.rationale}"
                </div>
                <div className="flex items-center justify-between pt-1 border-t border-[#D9E1E9] dark:border-[#1E4656]">
                  <ProvenanceBadge provenance={rel.provenanceType} confidence={rel.confidence} />
                  <span className="text-[11px] text-[#5B6B7D] dark:text-[#8EB3C2] font-medium font-mono">
                    {rel.evidenceChunkIds?.length || 0} chunks
                  </span>
                </div>
              </div>
            ))}

            {relations.length === 0 && (
              <div className="p-8 rounded-[12px] text-center border border-[#D9E1E9] dark:border-[#1E4656] text-xs text-[#5B6B7D] dark:text-[#8EB3C2] bg-white dark:bg-[#122B36]">
                No claim relationships recorded yet. Import or compare papers to identify scientific consensus or contradictions.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
