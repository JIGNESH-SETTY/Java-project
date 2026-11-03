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
      {/* Hero Header Card with Technical Dot Texture */}
      <div
        className="relative p-6 sm:p-8 rounded-3xl overflow-hidden border border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-slate-900"
      >
        {/* Subtle Dotted Pattern Overlay */}
        <div
          className="absolute inset-0 pointer-events-none opacity-20 dot-matrix"
          style={{
            maskImage: 'radial-gradient(ellipse at 80% 30%, black 30%, transparent 85%)',
            WebkitMaskImage: 'radial-gradient(ellipse at 80% 30%, black 30%, transparent 85%)',
          }}
        />

        <div className="max-w-3xl relative z-10 space-y-3.5">
          {/* Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 dark:bg-blue-950/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800">
            <Sparkles className="w-3.5 h-3.5 text-blue-600 dark:text-blue-400" />
            <span>Academic Research & Evidence Intelligence</span>
          </div>

          <h1 className="text-2xl sm:text-3xl lg:text-4xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            AI Research Discovery & Evidence Engine
          </h1>

          <p className="text-slate-600 dark:text-slate-400 text-xs sm:text-sm leading-relaxed max-w-2xl font-normal">
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
              icon={<UploadCloud className="w-4 h-4 text-blue-600 dark:text-blue-400" />}
            >
              Import Scholarly Paper
            </GlassButton>
            <GlassButton
              variant="secondary"
              onClick={() => navigate('/reviews')}
              icon={<FileSpreadsheet className="w-4 h-4 text-indigo-600 dark:text-indigo-400" />}
            >
              Draft Evidence Review
            </GlassButton>
          </div>
        </div>
      </div>

      {/* Metrics Row (4 Clean Modern Cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {/* Metric 1: Total Papers */}
        <div
          className="p-5 rounded-2xl flex flex-col justify-between border border-slate-200 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900 transition-all hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Total Papers</span>
            <div className="w-8 h-8 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 flex items-center justify-center text-blue-600 dark:text-blue-400 shadow-2xs">
              <BookOpen className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{papers.length}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 flex items-center gap-1.5 font-medium">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>{processedPapers} fully vectorized ({totalChunks} chunks)</span>
            </div>
          </div>
        </div>

        {/* Metric 2: Extracted Claims */}
        <div
          className="p-5 rounded-2xl flex flex-col justify-between border border-slate-200 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900 transition-all hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Extracted Claims</span>
            <div className="w-8 h-8 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 shadow-2xs">
              <GitCommit className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{claims.length}</div>
            <div className="text-xs text-emerald-700 dark:text-emerald-400 mt-1.5 font-medium">
              100% grounded in source chunks
            </div>
          </div>
        </div>

        {/* Metric 3: Pending Relations */}
        <div
          className="p-5 rounded-2xl flex flex-col justify-between border border-slate-200 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900 transition-all hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Pending Relations</span>
            <div className="w-8 h-8 rounded-full bg-amber-50 dark:bg-amber-950/60 border border-amber-100 dark:border-amber-800 flex items-center justify-center text-amber-600 dark:text-amber-400 shadow-2xs">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{pendingRelations}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1.5 font-medium">
              {relations.length} total cross-paper links
            </div>
          </div>
        </div>

        {/* Metric 4: Literature Reviews */}
        <div
          className="p-5 rounded-2xl flex flex-col justify-between border border-slate-200 dark:border-slate-800 shadow-2xs bg-white dark:bg-slate-900 transition-all hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700"
        >
          <div className="flex items-center justify-between text-slate-500 dark:text-slate-400 text-[11px] font-bold uppercase tracking-wider">
            <span>Literature Reviews</span>
            <div className="w-8 h-8 rounded-full bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-100 dark:border-indigo-800 flex items-center justify-center text-indigo-600 dark:text-indigo-400 shadow-2xs">
              <FileSpreadsheet className="w-4 h-4" />
            </div>
          </div>
          <div className="mt-4">
            <div className="text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">{reviews.length}</div>
            <div className="text-xs text-indigo-700 dark:text-indigo-400 mt-1.5 font-medium">
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
              <div className="w-7 h-7 rounded-full bg-blue-50 dark:bg-blue-950/60 border border-blue-100 dark:border-blue-800 shadow-2xs flex items-center justify-center text-blue-600 dark:text-blue-400">
                <BookOpen className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">Indexed Scientific Literature</h2>
            </div>
            <Link
              to="/library"
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-1 transition"
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
                className="group p-5 rounded-2xl cursor-pointer border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 transition-all space-y-2.5"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="space-y-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <h3 className="text-xs sm:text-sm font-semibold text-slate-900 dark:text-slate-100 leading-snug truncate group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
                        {p.paper.title}
                      </h3>
                    </div>
                    <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 font-normal leading-relaxed">
                      {p.paper.abstractText || 'No abstract text extracted.'}
                    </p>
                    <div className="flex items-center gap-2 text-[11px] text-slate-400 dark:text-slate-500 font-medium pt-1">
                      <span>{p.paper.venue || 'Scholarly Publication'}</span>
                      <span>•</span>
                      <span>{p.paper.publicationYear}</span>
                      <span>•</span>
                      <span>{p.chunkCount || 0} chunks</span>
                    </div>
                  </div>
                  <div className="shrink-0 flex items-center gap-2">
                    <StatusBadge status={p.paper.processingStatus} />
                    <div className="w-7 h-7 rounded-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 flex items-center justify-center text-slate-400 dark:text-slate-400 group-hover:text-slate-900 dark:group-hover:text-slate-100 group-hover:scale-105 transition">
                      <ArrowUpRight className="w-3.5 h-3.5" />
                    </div>
                  </div>
                </div>
              </div>
            ))}

            {papers.length === 0 && (
              <div
                className="p-8 rounded-2xl text-center border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900"
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
              <div className="w-7 h-7 rounded-full bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-100 dark:border-emerald-800 shadow-2xs flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <GitCommit className="w-3.5 h-3.5" />
              </div>
              <h2 className="font-bold text-slate-900 dark:text-slate-100 text-sm tracking-tight">Cross-Paper Claim Relationships</h2>
            </div>
            <Link
              to="/claims"
              className="text-xs text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-semibold flex items-center gap-1 transition"
            >
              <span>Claim Explorer</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          <div className="space-y-3">
            {relations.slice(0, 4).map((rel) => (
              <div
                key={rel.id}
                className="p-5 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xs hover:shadow-xs hover:border-slate-300 dark:hover:border-slate-700 bg-white dark:bg-slate-900 space-y-3 transition-all"
              >
                <div className="flex items-center justify-between gap-2">
                  <RelationBadge type={rel.relationType} />
                  <ReviewStatusBadge status={rel.reviewStatus} />
                </div>
                <p className="text-slate-800 dark:text-slate-200 text-xs italic font-serif leading-relaxed pl-1">
                  "{rel.rationale}"
                </p>
                <div className="flex items-center justify-between pt-2 border-t border-slate-100 dark:border-slate-800">
                  <ProvenanceBadge provenance={rel.provenanceType} confidence={rel.confidence} />
                  <span className="text-[11px] text-slate-500 dark:text-slate-400 font-medium">
                    {rel.evidenceChunkIds?.length || 0} evidence chunks
                  </span>
                </div>
              </div>
            ))}

            {relations.length === 0 && (
              <div
                className="p-8 rounded-2xl text-center border border-slate-200 dark:border-slate-800 text-xs text-slate-500 dark:text-slate-400 bg-white dark:bg-slate-900"
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
