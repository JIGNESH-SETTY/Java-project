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
  ChevronUp
} from 'lucide-react';
import { ProvenanceBadge } from '../components/ProvenanceBadge';
import { ChunkViewerModal } from '../components/ChunkViewerModal';

export const SearchWorkspacePage: React.FC = () => {
  const [query, setQuery] = useState('How does retrieval augmentation address context limitations in transformers?');
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
    <div className="space-y-6 animate-fade-in">
      {/* Header */}
      <div>
        <h1 className="text-xl font-bold text-white tracking-tight">Hybrid Search Workspace</h1>
        <p className="text-xs text-slate-400">
          Combine dense vector embeddings with lexical keyword matching, ranked by Reciprocal Rank Fusion
        </p>
      </div>

      {/* Main Search Panel */}
      <div className="glass-panel p-6 rounded-2xl border border-slate-800 space-y-4">
        <form onSubmit={handleSearch} className="space-y-3">
          <div className="relative flex items-center">
            <Search className="w-5 h-5 absolute left-4 text-indigo-400" />
            <input
              type="text"
              required
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Ask a technical research question or query a method..."
              className="w-full bg-[#0d1322] border border-slate-700/80 rounded-xl pl-12 pr-28 py-3 text-sm text-slate-100 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition shadow-inner"
            />
            <button
              type="submit"
              disabled={searchMutation.isPending}
              className="absolute right-2 px-4 py-1.5 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold shadow-md transition"
            >
              {searchMutation.isPending ? 'Searching...' : 'Search'}
            </button>
          </div>

          {/* Quick preset queries */}
          <div className="flex flex-wrap items-center gap-2 pt-1 text-[11px]">
            <span className="text-slate-500 font-medium">Try:</span>
            {presetQueries.map((q, idx) => (
              <button
                key={idx}
                type="button"
                onClick={() => {
                  setQuery(q);
                }}
                className="px-2.5 py-1 rounded-lg bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800 transition truncate max-w-xs"
              >
                {q}
              </button>
            ))}
          </div>

          {/* Controls Bar */}
          <div className="flex flex-wrap items-center justify-between gap-4 pt-3 border-t border-slate-800/80 text-xs">
            {/* Search Mode */}
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Mode:</span>
              <div className="flex rounded-lg bg-slate-900 p-0.5 border border-slate-800">
                {(['HYBRID', 'SEMANTIC', 'LEXICAL'] as const).map((m) => (
                  <button
                    key={m}
                    type="button"
                    onClick={() => setSearchMode(m)}
                    className={`px-3 py-1 rounded-md text-[11px] font-semibold transition ${
                      searchMode === m
                        ? 'bg-indigo-600 text-white shadow'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {m}
                  </button>
                ))}
              </div>
            </div>

            {/* Semantic Weight Slider (if Hybrid) */}
            {searchMode === 'HYBRID' && (
              <div className="flex items-center gap-3">
                <span className="text-slate-400 text-[11px]">
                  Dense vs Sparse: <strong>{Math.round(semanticWeight * 100)}% Semantic</strong>
                </span>
                <input
                  type="range"
                  min="0.1"
                  max="0.9"
                  step="0.1"
                  value={semanticWeight}
                  onChange={(e) => setSemanticWeight(parseFloat(e.target.value))}
                  className="w-24 accent-indigo-500 cursor-pointer"
                />
              </div>
            )}

            {/* Filters toggle */}
            <button
              type="button"
              onClick={() => setShowFilters(!showFilters)}
              className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1.5"
            >
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>{showFilters ? 'Hide Filters' : 'Advanced Filters'}</span>
              {showFilters ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
            </button>
          </div>

          {/* Collapsible Filter Row */}
          {showFilters && (
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 pt-3 border-t border-slate-800/60 animate-fade-in text-xs">
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Year From</label>
                <input
                  type="number"
                  placeholder="2017"
                  value={yearFrom}
                  onChange={(e) => setYearFrom(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Year To</label>
                <input
                  type="number"
                  placeholder="2024"
                  value={yearTo}
                  onChange={(e) => setYearTo(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Author</label>
                <input
                  type="text"
                  placeholder="e.g. Vaswani"
                  value={authorFilter}
                  onChange={(e) => setAuthorFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-slate-400 text-[11px] mb-1">Venue</label>
                <input
                  type="text"
                  placeholder="e.g. NeurIPS"
                  value={venueFilter}
                  onChange={(e) => setVenueFilter(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          )}
        </form>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        <div className="flex items-center justify-between text-xs text-slate-400">
          <span>
            {results.length > 0
              ? `Found ${results.length} evidence chunks ranked by relevance`
              : 'Enter a research query above to retrieve grounded chunks.'}
          </span>
          <ProvenanceBadge provenance="REPORTED_IN_PAPER" />
        </div>

        <div className="space-y-4">
          {results.map((res, idx) => (
            <div
              key={res.chunkId}
              className="glass-card p-5 rounded-2xl border border-slate-800/80 space-y-3 hover:border-slate-700 transition"
            >
              {/* Paper Title & Metadata */}
              <div className="flex items-start justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold text-indigo-400">#{idx + 1}</span>
                    <Link
                      to={`/papers/${res.paperId}`}
                      className="font-bold text-sm text-slate-100 hover:text-indigo-400 transition"
                    >
                      {res.paperTitle}
                    </Link>
                  </div>
                  <div className="flex items-center gap-2 text-[11px] text-slate-400">
                    <span>{res.authors.join(', ') || 'Scholarly Authors'}</span>
                    <span>•</span>
                    <span>{res.publicationYear}</span>
                    <span>•</span>
                    <span>{res.venue}</span>
                  </div>
                </div>

                {/* Score Tag */}
                <div className="text-right shrink-0">
                  <div className="px-2.5 py-1 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 font-mono text-xs font-bold">
                    {(res.combinedScore * 100).toFixed(1)}% match
                  </div>
                  <div className="text-[10px] text-slate-500 mt-1">
                    Sem: {(res.semanticScore * 100).toFixed(0)}% • Lex: {(res.lexicalScore * 100).toFixed(0)}%
                  </div>
                </div>
              </div>

              {/* Exact Snippet Box */}
              <div className="bg-[#0b101d] p-3.5 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex items-center justify-between text-[11px] text-slate-400">
                  <div className="flex items-center gap-2">
                    <span className="font-semibold text-emerald-400">Section: {res.sectionName}</span>
                    <span>•</span>
                    <span>Page {res.pageNumber || 'N/A'}</span>
                    <span>•</span>
                    <span>Chunk #{res.chunkIndex}</span>
                  </div>
                </div>

                <p className="text-xs text-slate-200 font-mono leading-relaxed whitespace-pre-wrap">
                  {res.snippet}
                </p>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-1">
                <span className="text-[10px] text-slate-500 italic">
                  {res.scoringRationale}
                </span>

                <div className="flex items-center gap-3">
                  <button
                    onClick={() => inspectChunk(res)}
                    className="px-3 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <FileText className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Inspect Full Chunk</span>
                  </button>
                  <Link
                    to={`/papers/${res.paperId}`}
                    className="px-3 py-1 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium transition flex items-center gap-1.5"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    <span>Open Paper</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Chunk Viewer Modal */}
      <ChunkViewerModal
        chunk={selectedChunk}
        paperTitle={selectedPaperTitle}
        onClose={() => setSelectedChunk(null)}
      />
    </div>
  );
};
