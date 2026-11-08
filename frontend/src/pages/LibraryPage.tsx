import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paperApi } from '../api/paperApi';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  Search,
  LayoutGrid,
  List as ListIcon,
  UploadCloud,
  Plus,
  Trash2,
  Calendar,
  Layers,
  GitCommit,
  ArrowRight,
} from 'lucide-react';
import { GlassButton } from '../components/GlassButton';
import { GlassInput } from '../components/GlassInput';
import { StatusBadge } from '../components/StatusBadge';
import { GlassModal } from '../components/GlassModal';
import { EmptyState } from '../components/EmptyState';
import { LoadingSkeleton } from '../components/LoadingSkeleton';

export const LibraryPage: React.FC = () => {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [searchTerm, setSearchTerm] = useState('');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isManualModalOpen, setIsManualModalOpen] = useState(false);

  // Manual paper state
  const [manualTitle, setManualTitle] = useState('');
  const [manualAbstract, setManualAbstract] = useState('');
  const [manualAuthors, setManualAuthors] = useState('');
  const [manualYear, setManualYear] = useState<number>(new Date().getFullYear());
  const [manualVenue, setManualVenue] = useState('');
  const [manualDoi, setManualDoi] = useState('');

  const { data: papers = [], isLoading } = useQuery({
    queryKey: ['papers'],
    queryFn: () => paperApi.listPapers(0, 100),
  });

  const manualMutation = useMutation({
    mutationFn: (data: any) => paperApi.createManual(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      setIsManualModalOpen(false);
      setManualTitle('');
      setManualAbstract('');
      setManualAuthors('');
      setManualVenue('');
      setManualDoi('');
    },
  });

  const deleteMutation = useMutation({
    mutationFn: (id: string) => paperApi.deletePaper(id),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ['papers'] }),
  });

  const filteredPapers = papers.filter((p) => {
    const q = searchTerm.toLowerCase();
    const titleMatch = p.paper.title.toLowerCase().includes(q);
    const authorMatch = p.authors.some((a) => a.displayName.toLowerCase().includes(q));
    const venueMatch = p.paper.venue?.toLowerCase().includes(q) || false;
    const doiMatch = p.paper.doi?.toLowerCase().includes(q) || false;

    const matchesSearch = !q || titleMatch || authorMatch || venueMatch || doiMatch;

    if (statusFilter === 'ALL') return matchesSearch;
    return matchesSearch && p.paper.processingStatus === statusFilter;
  });

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;

    const authorsList = manualAuthors
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    manualMutation.mutate({
      title: manualTitle.trim(),
      abstractText: manualAbstract.trim(),
      authors: authorsList,
      publicationYear: manualYear,
      venue: manualVenue.trim(),
      doi: manualDoi.trim() || undefined,
      visibility: 'PRIVATE',
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto space-y-6">
      {/* Top Header Bar */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="mb-2">
            <span className="pill">
              <BookOpen className="w-3.5 h-3.5 text-[#0F4C5C] dark:text-[#2293B0]" />
              <span>Curated Research Collection</span>
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-[#0B2A33] dark:text-[#E0F2F6] tracking-tight">
            Scientific Paper Library
          </h1>
          <p className="text-xs sm:text-sm text-[#475569] dark:text-[#8EB3C2] mt-0.5">
            {papers.length} scholarly papers indexed with verbatim chunk citations and claim mappings.
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <GlassButton
            variant="primary"
            onClick={() => navigate('/import')}
            icon={<UploadCloud className="w-4 h-4" />}
          >
            Import Paper
          </GlassButton>
          <GlassButton
            variant="secondary"
            onClick={() => setIsManualModalOpen(true)}
            icon={<Plus className="w-4 h-4" />}
          >
            Manual Entry
          </GlassButton>
        </div>
      </div>

      {/* Filter and View Controls */}
      <div className="card p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full md:max-w-md relative">
          <GlassInput
            placeholder="Search papers by title, author, venue, DOI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 p-1 rounded-[10px] bg-[#EEF2F6] dark:bg-[#0D222B] border border-[#D9E1E9] dark:border-[#1E4656] text-xs font-semibold">
            {[
              { id: 'ALL', label: 'All' },
              { id: 'COMPLETED', label: 'Vectorized' },
              { id: 'METADATA_ONLY', label: 'Metadata Only' },
            ].map((f) => (
              <button
                key={f.id}
                onClick={() => setStatusFilter(f.id)}
                className={`px-3 py-1 rounded-[8px] transition-all ${
                  statusFilter === f.id
                    ? 'bg-[#0F4C5C] text-white shadow-xs'
                    : 'text-[#475569] dark:text-[#8EB3C2] hover:text-[#0B2A33] dark:hover:text-[#E0F2F6]'
                }`}
              >
                {f.label}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-[10px] bg-[#EEF2F6] dark:bg-[#0D222B] border border-[#D9E1E9] dark:border-[#1E4656]">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-[8px] transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-[#122B36] text-[#0F4C5C] dark:text-[#2293B0] shadow-xs'
                  : 'text-[#5B6B7D] dark:text-[#6B8F9E] hover:text-[#0B2A33] dark:hover:text-[#E0F2F6]'
              }`}
              title="Grid View"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-[8px] transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-[#122B36] text-[#0F4C5C] dark:text-[#2293B0] shadow-xs'
                  : 'text-[#5B6B7D] dark:text-[#6B8F9E] hover:text-[#0B2A33] dark:hover:text-[#E0F2F6]'
              }`}
              title="List View"
              aria-label="List view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>

      {/* Loading Skeleton */}
      {isLoading && <LoadingSkeleton count={6} type="card" />}

      {/* Empty State */}
      {!isLoading && filteredPapers.length === 0 && (
        <EmptyState
          icon={<BookOpen className="w-8 h-8" />}
          title={searchTerm ? 'No matching papers found' : 'No research papers in library'}
          description={
            searchTerm
              ? 'Try adjusting your search keywords or clear your status filters.'
              : 'Import scientific papers from arXiv, Crossref, OpenAlex, or upload a PDF document to begin.'
          }
          actionLabel="Import Paper Now"
          onAction={() => navigate('/import')}
        />
      )}

      {/* Grid View */}
      {!isLoading && filteredPapers.length > 0 && viewMode === 'grid' && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPapers.map((p) => {
            const authorsText = p.authors?.map((a) => a.displayName).join(', ');
            return (
              <div
                key={p.paper.id}
                className="card p-5 flex flex-col justify-between hover:border-[#0F4C5C] dark:hover:border-[#2293B0] hover:shadow-md transition-all gap-4 group"
              >
                <div className="space-y-2.5">
                  <div className="flex items-center justify-between gap-2">
                    <StatusBadge status={p.paper.processingStatus} />
                    {p.paper.publicationYear && (
                      <span className="text-xs text-[#5B6B7D] dark:text-[#6B8F9E] font-semibold flex items-center gap-1 font-mono">
                        <Calendar className="w-3.5 h-3.5 text-[#5B6B7D]" />
                        {p.paper.publicationYear}
                      </span>
                    )}
                  </div>

                  <Link to={`/papers/${p.paper.id}`} className="block">
                    <h2 className="text-sm font-bold text-[#0B2A33] dark:text-[#E0F2F6] group-hover:text-[#0F4C5C] dark:group-hover:text-[#2293B0] transition-colors leading-snug line-clamp-2">
                      {p.paper.title}
                    </h2>
                  </Link>

                  {authorsText && (
                    <p className="text-xs text-[#475569] dark:text-[#8EB3C2] line-clamp-1 font-medium">
                      {authorsText}
                    </p>
                  )}

                  <div className="text-[11.5px] text-[#5B6B7D] dark:text-[#6B8F9E] flex items-center gap-2 truncate">
                    {p.paper.venue && <span>{p.paper.venue}</span>}
                    {p.paper.venue && p.paper.doi && <span>·</span>}
                    {p.paper.doi && <span className="doi truncate">{p.paper.doi}</span>}
                  </div>

                  <div className="abs line-clamp-3">
                    {p.paper.abstractText || 'No abstract text reported.'}
                  </div>
                </div>

                <div className="pt-3 border-t border-[#D9E1E9] dark:border-[#1E4656] flex items-center justify-between">
                  {/* Evidence Available Indicators */}
                  <div className="flex items-center gap-3 text-xs text-[#5B6B7D] dark:text-[#6B8F9E] font-medium">
                    <span
                      className="flex items-center gap-1"
                      title={`${p.chunkCount || 0} vectorized chunks`}
                    >
                      <Layers className="w-3.5 h-3.5 text-[#0A6A80] dark:text-[#38BDF8]" />
                      <span>{p.chunkCount || 0} chunks</span>
                    </span>
                    <span
                      className="flex items-center gap-1"
                      title={`${p.claimCount || 0} extracted claims`}
                    >
                      <GitCommit className="w-3.5 h-3.5 text-[#1B6B43] dark:text-[#34D399]" />
                      <span>{p.claimCount || 0} claims</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/papers/${p.paper.id}`}
                      className="p-1.5 rounded-[8px] text-[#5B6B7D] dark:text-[#6B8F9E] hover:text-[#0F4C5C] dark:hover:text-[#2293B0] hover:bg-[#EEF2F6] dark:hover:bg-[#1A3E4E] transition"
                      title="Open Paper Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`Remove "${p.paper.title}" from library?`)) {
                          deleteMutation.mutate(p.paper.id);
                        }
                      }}
                      className="p-1.5 rounded-[8px] text-[#94A3B8] hover:text-[#B3261E] hover:bg-[#FBE7E4] dark:hover:bg-[#1E293B] transition"
                      title="Delete Paper"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* List View */}
      {!isLoading && filteredPapers.length > 0 && viewMode === 'list' && (
        <div className="space-y-3">
          {filteredPapers.map((p) => {
            const authorsText = p.authors?.map((a) => a.displayName).join(', ');
            return (
              <div
                key={p.paper.id}
                className="card p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-[#0F4C5C] dark:hover:border-[#2293B0] transition-all"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <Link to={`/papers/${p.paper.id}`}>
                      <h2 className="text-sm font-bold text-[#0B2A33] dark:text-[#E0F2F6] hover:text-[#0F4C5C] dark:hover:text-[#2293B0] transition-colors truncate">
                        {p.paper.title}
                      </h2>
                    </Link>
                    <StatusBadge status={p.paper.processingStatus} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#5B6B7D] dark:text-[#6B8F9E]">
                    <span className="truncate max-w-md">{authorsText || 'Unknown Authors'}</span>
                    <span>•</span>
                    <span>{p.paper.venue || 'Scholarly Publication'}</span>
                    <span>•</span>
                    <span className="font-mono">{p.paper.publicationYear}</span>
                    {p.paper.doi && (
                      <>
                        <span>•</span>
                        <span className="doi truncate max-w-xs">{p.paper.doi}</span>
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                  <div className="flex items-center gap-3 text-xs text-[#5B6B7D] dark:text-[#6B8F9E] font-medium">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-[#0A6A80] dark:text-[#38BDF8]" />
                      <span>{p.chunkCount || 0} chunks</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <GitCommit className="w-3.5 h-3.5 text-[#1B6B43] dark:text-[#34D399]" />
                      <span>{p.claimCount || 0} claims</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/papers/${p.paper.id}`}
                      className="p-1.5 rounded-[8px] text-[#5B6B7D] dark:text-[#6B8F9E] hover:text-[#0F4C5C] dark:hover:text-[#2293B0] hover:bg-[#EEF2F6] dark:hover:bg-[#1A3E4E] transition"
                      title="Open Paper Details"
                    >
                      <ArrowRight className="w-4 h-4" />
                    </Link>
                    <button
                      onClick={() => {
                        if (confirm(`Remove "${p.paper.title}" from library?`)) {
                          deleteMutation.mutate(p.paper.id);
                        }
                      }}
                      className="p-1.5 rounded-[8px] text-[#94A3B8] hover:text-[#B3261E] hover:bg-[#FBE7E4] dark:hover:bg-[#1E293B] transition"
                      title="Delete Paper"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Manual Entry Modal */}
      <GlassModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Add Manual Scholarly Publication"
        subtitle="Manually index paper metadata or paste an abstract for immediate chunking"
      >
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <GlassInput
            label="Publication Title *"
            required
            placeholder="e.g. Attention Is All You Need"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
          />

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Authors (comma-separated)"
              placeholder="e.g. Ashish Vaswani, Noam Shazeer"
              value={manualAuthors}
              onChange={(e) => setManualAuthors(e.target.value)}
            />
            <GlassInput
              label="Publication Year"
              type="number"
              value={manualYear}
              onChange={(e) => setManualYear(parseInt(e.target.value) || new Date().getFullYear())}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <GlassInput
              label="Venue / Conference"
              placeholder="e.g. NeurIPS 2017"
              value={manualVenue}
              onChange={(e) => setManualVenue(e.target.value)}
            />
            <GlassInput
              label="DOI"
              placeholder="e.g. 10.48550/arXiv.1706.03762"
              value={manualDoi}
              onChange={(e) => setManualDoi(e.target.value)}
            />
          </div>

          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-[#5B6B7D] dark:text-[#8EB3C2] tracking-[0.08em] uppercase block">
              Abstract Text
            </label>
            <textarea
              rows={4}
              placeholder="Paste publication abstract text here..."
              value={manualAbstract}
              onChange={(e) => setManualAbstract(e.target.value)}
              className="glass-input w-full text-xs font-serif leading-relaxed"
            />
          </div>

          <div className="flex justify-end gap-2 pt-3 border-t border-[#D9E1E9] dark:border-[#1E4656]">
            <GlassButton
              type="button"
              variant="secondary"
              onClick={() => setIsManualModalOpen(false)}
            >
              Cancel
            </GlassButton>
            <GlassButton
              type="submit"
              variant="primary"
              disabled={manualMutation.isPending || !manualTitle.trim()}
            >
              {manualMutation.isPending ? 'Indexing...' : 'Save Publication'}
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
