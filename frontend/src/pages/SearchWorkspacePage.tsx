import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { searchApi, SearchParams } from '../api/searchApi';
import { paperApi } from '../api/paperApi';
import { SearchResult, DocumentChunk } from '../types';
import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  FileText,
  Sparkles,
  ExternalLink,
  BookOpen,
  Layers,
  ChevronDown,
  ChevronUp,
  MapPin,
  CheckCircle2,
  Quote,
} from 'lucide-react';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { ChunkViewerModal } from '../components/ChunkViewerModal';
import { GlassPanel, GlassPanelStrong } from '../components/GlassPanel';
import { GlassButton } from '../components/GlassButton';
import { GlassInput } from '../components/GlassInput';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const SearchWorkspacePage: React.FC = () => {
  const [query, setQuery] = useState(
    'How does retrieval augmentation address context limitations in transformers?'
  );
  const [searchMode, setSearchMode] = useState<'HYBRID' | 'SEMANTIC' | 'LEXICAL'>('HYBRID');
  const [semanticWeight, setSemanticWeight] = useState<number>(0.7);
  const [showFilters, setShowFilters] = useState<boolean>(false);

  // Filters
  const [yearFrom, setYearFrom] = useState<string>('');
  const [yearTo, setYearTo] = useState<string>('');
  const [authorFilter, setAuthorFilter] = useState<string>('');
  const [venueFilter, setVenueFilter] = useState<string>('');

  const [results, setResults] = useState<SearchResult[]>([]);
  const [selectedChunk, setSelectedChunk] = useState<DocumentChunk | null>(null);
  const [selectedPaperTitle, setSelectedPaperTitle] = useState<string>('');

  const searchMutation = useMutation({
    mutationFn: (params: SearchParams) => searchApi.search(params),
    onSuccess: (data) => setResults(data),
  });

  const handleSearch = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!query.trim()) return;

    searchMutation.mutate({
      query: query.trim(),
      searchMode,
      semanticWeight,
      yearFrom: yearFrom ? parseInt(yearFrom) : undefined,
      yearTo: yearTo ? parseInt(yearTo) : undefined,
      author: authorFilter.trim() || undefined,
      venue: venueFilter.trim() || undefined,
      topK: 15,
    });
  };

  const inspectChunk = async (result: SearchResult) => {
    try {
      const chunks = await paperApi.getPaperChunks(result.paperId);
      const match = chunks.find((c) => c.id === result.chunkId);
      if (match) {
        setSelectedChunk(match);
        setSelectedPaperTitle(result.paperTitle);
      }
    } catch (e) {
      console.error('Could not fetch chunk details', e);
    }
  };

  const presetQueries = [
    'How does retrieval augmentation address context limitations in transformers?',
    'Multi-head self-attention parallelization across sequence tokens',
    'Lost in the middle U-shaped accuracy degradation curve',
    'Decoupling parametric memory from external vector indices',
  ];

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-1">
          <Search className="w-4 h-4" />
          <span>Evidence Retrieval</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Hybrid Semantic Search
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 mt-1 max-w-2xl">
          Combines dense pgvector cosine distance (384-dimensional embeddings) with PostgreSQL full-text search (tsvector/tsquery) using reciprocal rank fusion.
        </p>
      </div>

      {/* Main Search Panel */}
      <GlassPanel className="p-6 space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-indigo-600 pointer-events-none" />
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a technical research question or query methodology..."
              className="glass-input w-full pl-12 pr-32 py-3.5 text-sm text-slate-900 placeholder:text-slate-400 bg-white/80 focus:bg-white shadow-xs"
            />
            <div className="absolute right-2 flex items-center gap-1.5">
              <GlassButton
                type="submit"
                variant="primary"
                disabled={searchMutation.isPending || !query.trim()}
              >
                {searchMutation.isPending ? 'Searching...' : 'Search'}
              </GlassButton>
            </div>
          </div>

          {/* Mode Selector and Filter Toggle */}
          <div className="flex flex-wrap items-center justify-between gap-3 text-xs">
            <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 border border-slate-200">
              <button
                type="button"
                onClick={() => setSearchMode('HYBRID')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  searchMode === 'HYBRID'
                    ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Hybrid (Vector + FTS)
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('SEMANTIC')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  searchMode === 'SEMANTIC'
                    ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Dense Vector
              </button>
              <button
                type="button"
                onClick={() => setSearchMode('LEXICAL')}
                className={`px-3 py-1.5 rounded-lg font-medium transition-all ${
                  searchMode === 'LEXICAL'
                    ? 'bg-white text-indigo-700 font-semibold shadow-xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Lexical Keywords
              </button>
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/70 border border-slate-200 text-slate-700 hover:bg-white font-medium transition"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
              <span>Advanced Filters</span>
              {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Collapsible Filter Panel */}
          {showFilters && (
            <div className="pt-4 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <GlassInput
                label="Year From"
                type="number"
                placeholder="2017"
                value={yearFrom}
                onChange={(e) => setYearFrom(e.target.value)}
              />
              <GlassInput
                label="Year To"
                type="number"
                placeholder="2024"
                value={yearTo}
                onChange={(e) => setYearTo(e.target.value)}
              />
              <GlassInput
                label="Author Name"
                placeholder="Vaswani, Lewis..."
                value={authorFilter}
                onChange={(e) => setAuthorFilter(e.target.value)}
              />
              <GlassInput
                label="Venue / Conference"
                placeholder="NeurIPS, ICML..."
                value={venueFilter}
                onChange={(e) => setVenueFilter(e.target.value)}
              />
            </div>
          )}
        </form>

        {/* Preset Query Chips */}
        <div className="pt-2 border-t border-slate-200/60 flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
            Curated Prompts:
          </span>
          {presetQueries.map((q) => (
            <button
              key={q}
              onClick={() => {
                setQuery(q);
                searchMutation.mutate({ query: q, searchMode, semanticWeight, topK: 15 });
              }}
              className="text-xs px-2.5 py-1 rounded-lg bg-indigo-50/70 hover:bg-indigo-100 text-indigo-700 border border-indigo-200/60 transition text-left"
            >
              {q}
            </button>
          ))}
        </div>
      </GlassPanel>

      {/* Loading Skeleton */}
      {searchMutation.isPending && <LoadingSkeleton count={4} type="card" />}

      {/* Results List */}
      <div className="space-y-4">
        {results.length > 0 && (
          <div className="flex items-center justify-between text-xs text-slate-500 px-1 font-medium">
            <span>
              Found <strong className="text-slate-800">{results.length}</strong> ranked evidence chunks for this query
            </span>
            <span>Mode: {searchMode}</span>
          </div>
        )}

        {results.map((res, index) => {
          const confidence = res.combinedScore ? Math.round(res.combinedScore * 100) : 85;
          return (
            <GlassPanelStrong
              key={`${res.chunkId}-${index}`}
              className="p-5 space-y-3 hover:border-indigo-300 transition-all shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2 text-xs">
                  <span className="w-6 h-6 rounded-lg bg-indigo-50 border border-indigo-200 text-indigo-700 font-bold flex items-center justify-center shrink-0">
                    #{index + 1}
                  </span>
                  <Link
                    to={`/papers/${res.paperId}`}
                    className="font-bold text-slate-900 hover:text-indigo-600 transition flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-indigo-500 shrink-0" />
                    <span>{res.paperTitle}</span>
                  </Link>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[11px] font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded-md flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-slate-400" />
                    {res.sectionName || 'Body'}
                    {res.pageNumber ? ` • p. ${res.pageNumber}` : ''}
                  </span>
                  <ProvenanceBadge provenance="REPORTED_IN_PAPER" confidence={res.combinedScore} />
                </div>
              </div>

              {/* Verbatim Snippet */}
              <div className="relative pl-3.5 border-l-2 border-indigo-500 text-xs text-slate-700 font-serif leading-relaxed italic bg-indigo-50/20 p-2.5 rounded-r-xl">
                <Quote className="w-3.5 h-3.5 text-indigo-300 absolute -top-1 -left-1.5 fill-current" />
                "{res.snippet}"
              </div>

              {/* Relevance Explanation & Inspect Action */}
              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-slate-500 flex items-center gap-2">
                  <span className="text-emerald-700 font-semibold bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    Match Confidence: {confidence}%
                  </span>
                  <span className="hidden md:inline text-[11px] text-slate-400">
                    pgvector cosine & lexical FTS rank fusion
                  </span>
                </div>

                <GlassButton
                  size="sm"
                  variant="ghost"
                  onClick={() => inspectChunk(res)}
                  icon={<ExternalLink className="w-3 h-3" />}
                >
                  Open Verbatim Evidence
                </GlassButton>
              </div>
            </GlassPanelStrong>
          );
        })}
      </div>

      {/* Chunk Viewer Modal */}
      {selectedChunk && (
        <ChunkViewerModal
          chunk={selectedChunk}
          paperTitle={selectedPaperTitle}
          onClose={() => setSelectedChunk(null)}
        />
      )}
    </div>
  );
};
