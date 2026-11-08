import React, { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { searchApi, SearchParams } from '../api/searchApi';
import { paperApi } from '../api/paperApi';
import { SearchResult, DocumentChunk } from '../types';
import { Link } from 'react-router-dom';
import {
  Search,
  SlidersHorizontal,
  ExternalLink,
  BookOpen,
  ChevronDown,
  ChevronUp,
  MapPin,
  Quote,
} from 'lucide-react';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { ChunkViewerModal } from '../components/ChunkViewerModal';
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
    <div className="p-6 max-w-6xl mx-auto space-y-6 smooth-page-load">
      {/* Header */}
      <div>
        <div className="mb-2">
          <span className="pill">
            <Search className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#38BDF8]" />
            <span>Evidence Retrieval</span>
          </span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-[#0B2A33] dark:text-[#E0F2F6] tracking-tight">
          Hybrid Semantic Search
        </h1>
        <p className="text-xs sm:text-sm text-[#475569] dark:text-[#8EB3C2] mt-1 max-w-2xl leading-relaxed">
          Combines dense pgvector cosine distance (384-dimensional embeddings) with PostgreSQL full-text search (tsvector/tsquery) using reciprocal rank fusion.
        </p>
      </div>

      {/* Main Search Panel */}
      <div className="card p-6 space-y-4">
        <form onSubmit={handleSearch} className="space-y-4">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-[#0F4C5C] dark:text-[#38BDF8] pointer-events-none" />
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a technical research question or query methodology..."
              className="glass-input w-full !pl-12 !pr-32 py-3.5 text-sm font-medium text-[#0B2A33] dark:text-[#E0F2F6] placeholder-[#6B7785] dark:placeholder-[#527584] shadow-2xs"
            />
            <div className="absolute right-2.5 flex items-center gap-1.5">
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
            <div className="flex items-center gap-1.5 p-1 rounded-[10px] bg-[#EEF2F6] dark:bg-[#0D222B] border border-[#D9E1E9] dark:border-[#1E4656]">
              {[
                { id: 'HYBRID', label: 'Hybrid (Vector + FTS)' },
                { id: 'SEMANTIC', label: 'Dense Vector' },
                { id: 'LEXICAL', label: 'Lexical Keywords' },
              ].map((m) => (
                <button
                  key={m.id}
                  type="button"
                  onClick={() => setSearchMode(m.id as any)}
                  className={`px-3 py-1.5 rounded-[8px] font-semibold transition-all ${
                    searchMode === m.id
                      ? 'bg-[#0F4C5C] text-white shadow-xs'
                      : 'text-[#475569] dark:text-[#8EB3C2] hover:text-[#0B2A33] dark:hover:text-[#E0F2F6]'
                  }`}
                >
                  {m.label}
                </button>
              ))}
            </div>

            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-[9px] bg-white dark:bg-[#122B36] border border-[#D9E1E9] dark:border-[#1E4656] text-[#334155] dark:text-[#C4DDE5] hover:bg-[#FAFBFD] dark:hover:bg-[#163442] font-medium transition cursor-pointer"
            >
              <SlidersHorizontal className="w-3.5 h-3.5 text-[#5B6B7D]" />
              <span>Advanced Filters</span>
              {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Collapsible Filter Panel */}
          {showFilters && (
            <div className="pt-4 border-t border-[#D9E1E9] dark:border-[#1E4656] grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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
        <div className="pt-2 border-t border-[#D9E1E9] dark:border-[#1E4656] flex flex-wrap items-center gap-2">
          <span className="text-[11px] font-bold text-[#5B6B7D] dark:text-[#8EB3C2] uppercase tracking-[0.08em]">
            Curated Prompts:
          </span>
          {presetQueries.map((q) => (
            <button
              key={q}
              onClick={() => {
                setQuery(q);
                searchMutation.mutate({ query: q, searchMode, semanticWeight, topK: 15 });
              }}
              className="text-xs px-2.5 py-1 rounded-[8px] bg-[#EEF2F6] hover:bg-[#DCEBEE] dark:bg-[#0D222B] dark:hover:bg-[#1B4A59] text-[#0F4C5C] dark:text-[#E0F2F6] border border-[#D9E1E9] dark:border-[#1E4656] transition text-left cursor-pointer"
            >
              {q}
            </button>
          ))}
        </div>
      </div>

      {/* Loading Skeleton */}
      {searchMutation.isPending && <LoadingSkeleton count={4} type="card" />}

      {/* Results List */}
      <div className="space-y-4">
        {results.length > 0 && (
          <div className="flex items-center justify-between text-xs text-[#5B6B7D] dark:text-[#8EB3C2] px-1 font-medium">
            <span>
              Found <strong className="text-[#0B2A33] dark:text-[#E0F2F6]">{results.length}</strong> ranked evidence chunks for this query
            </span>
            <span>Mode: {searchMode}</span>
          </div>
        )}

        {results.map((res, index) => {
          const confidence = res.combinedScore ? Math.round(res.combinedScore * 100) : 85;
          return (
            <div
              key={`${res.chunkId}-${index}`}
              className="card p-5 space-y-3 hover:border-[#0F4C5C] dark:hover:border-[#38BDF8] transition-all shadow-xs"
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-2.5 text-xs">
                  <span className="w-6 h-6 rounded-[6px] bg-[#DCEBEE] dark:bg-[#1B4A59] text-[#0F4C5C] dark:text-[#E0F2F6] font-bold flex items-center justify-center shrink-0 text-xs">
                    #{index + 1}
                  </span>
                  <Link
                    to={`/papers/${res.paperId}`}
                    className="font-bold text-[#0B2A33] dark:text-[#E0F2F6] hover:text-[#0F4C5C] dark:hover:text-[#38BDF8] transition flex items-center gap-1.5"
                  >
                    <BookOpen className="w-3.5 h-3.5 text-[#0A6A80] dark:text-[#38BDF8] shrink-0" />
                    <span>{res.paperTitle}</span>
                  </Link>
                </div>

                <div className="flex items-center gap-2 self-start sm:self-auto">
                  <span className="text-[11px] font-mono text-[#5B6B7D] dark:text-[#8EB3C2] bg-[#EEF2F6] dark:bg-[#0D222B] px-2 py-0.5 rounded-[6px] border border-[#D9E1E9] dark:border-[#1E4656] flex items-center gap-1">
                    <MapPin className="w-3 h-3 text-[#5B6B7D]" />
                    {res.sectionName || 'Body'}
                    {res.pageNumber ? ` • p. ${res.pageNumber}` : ''}
                  </span>
                  <ProvenanceBadge provenance="REPORTED_IN_PAPER" confidence={res.combinedScore} />
                </div>
              </div>

              {/* Verbatim Snippet */}
              <div className="abs text-xs leading-relaxed italic relative pl-4">
                <Quote className="w-3.5 h-3.5 text-[#C9A96A] absolute top-2 left-1 fill-current opacity-60" />
                "{res.snippet}"
              </div>

              {/* Relevance Explanation & Inspect Action */}
              <div className="pt-2 border-t border-[#D9E1E9] dark:border-[#1E4656] flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs">
                <div className="text-[#5B6B7D] dark:text-[#8EB3C2] flex items-center gap-2">
                  <span className="b-rep">
                    Match Confidence: {confidence}%
                  </span>
                  <span className="hidden md:inline text-[11px] font-mono text-[#5B6B7D] dark:text-[#6B8F9E]">
                    pgvector cosine &amp; lexical FTS rank fusion
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
            </div>
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
