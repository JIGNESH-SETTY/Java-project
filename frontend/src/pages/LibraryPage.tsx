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
import { GlassPanel, GlassPanelStrong } from '../components/GlassPanel';
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
          <div className="flex items-center gap-2 text-blue-700 dark:text-blue-400 text-xs font-semibold uppercase tracking-wider mb-1">
            <BookOpen className="w-4 h-4" />
            <span>Curated Research Collection</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 dark:text-slate-100 tracking-tight">
            Scientific Paper Library
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 mt-0.5">
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
      <GlassPanel className="p-4 flex flex-col md:flex-row items-center justify-between gap-4">
        <div className="flex-1 w-full md:max-w-md relative">
          <GlassInput
            placeholder="Search papers by title, author, venue, DOI..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            icon={<Search className="w-4 h-4" />}
          />
        </div>

        <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-medium">
            {['ALL', 'COMPLETED', 'METADATA_ONLY'].map((status) => (
              <button
                key={status}
                onClick={() => setStatusFilter(status)}
                className={`px-3 py-1 rounded-lg transition-all ${
                  statusFilter === status
                    ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 font-semibold shadow-xs'
                    : 'text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-slate-100'
                }`}
              >
                {status === 'ALL' ? 'All' : status === 'COMPLETED' ? 'Vectorized' : 'Metadata Only'}
              </button>
            ))}
          </div>

          <div className="flex items-center gap-1 p-1 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700">
            <button
              onClick={() => setViewMode('grid')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'grid'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="Grid View"
              aria-label="Grid view"
            >
              <LayoutGrid className="w-4 h-4" />
            </button>
            <button
              onClick={() => setViewMode('list')}
              className={`p-1.5 rounded-lg transition-all ${
                viewMode === 'list'
                  ? 'bg-white dark:bg-slate-700 text-blue-700 dark:text-blue-300 shadow-xs'
                  : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
              }`}
              title="List View"
              aria-label="List view"
            >
              <ListIcon className="w-4 h-4" />
            </button>
          </div>
        </div>
      </GlassPanel>

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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredPapers.map((p) => {
            const authorsText = p.authors?.map((a) => a.displayName).join(', ');
            return (
              <GlassPanelStrong
                key={p.paper.id}
                className="p-6 flex flex-col justify-between hover:border-blue-300 dark:hover:border-blue-600 hover:shadow-md transition-all gap-5 group"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <StatusBadge status={p.paper.processingStatus} />
                    {p.paper.publicationYear && (
                      <span className="text-xs text-slate-500 dark:text-slate-400 font-semibold flex items-center gap-1">
                        <Calendar className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
                        {p.paper.publicationYear}
                      </span>
                    )}
                  </div>

                  <Link to={`/papers/${p.paper.id}`} className="block">
                    <h2 className="text-base font-bold text-slate-900 dark:text-slate-100 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors leading-snug line-clamp-2">
                      {p.paper.title}
                    </h2>
                  </Link>

                  {authorsText && (
                    <p className="text-xs text-slate-600 dark:text-slate-400 line-clamp-1 font-medium">{authorsText}</p>
                  )}

                  {p.paper.venue && (
                    <p className="text-[11px] text-slate-500 dark:text-slate-400 italic line-clamp-1">{p.paper.venue}</p>
                  )}

                  <p className="text-xs text-slate-600 dark:text-slate-300 font-serif line-clamp-3 bg-slate-50/70 dark:bg-slate-900/60 p-3 rounded-xl border border-slate-100 dark:border-slate-800 leading-relaxed">
                    {p.paper.abstractText || 'No abstract text reported.'}
                  </p>
                </div>

                <div className="pt-3 border-t border-slate-200/70 dark:border-slate-800 flex items-center justify-between">
                  {/* Evidence Available Indicators */}
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span
                      className="flex items-center gap-1"
                      title={`${p.chunkCount || 0} vectorized chunks`}
                    >
                      <Layers className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                      <span>{p.chunkCount || 0} chunks</span>
                    </span>
                    <span
                      className="flex items-center gap-1"
                      title={`${p.claimCount || 0} extracted claims`}
                    >
                      <GitCommit className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                      <span>{p.claimCount || 0} claims</span>
                    </span>
                  </div>

                  <div className="flex items-center gap-1">
                    <Link
                      to={`/papers/${p.paper.id}`}
                      className="p-1.5 rounded-lg text-slate-500 dark:text-slate-400 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-950/40 transition"
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
                      className="p-1.5 rounded-lg text-slate-400 hover:text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 transition"
                      title="Delete Paper"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </GlassPanelStrong>
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
              <GlassPanelStrong
                key={p.paper.id}
                className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:border-blue-300 dark:hover:border-blue-600 transition-all"
              >
                <div className="space-y-1 min-w-0 flex-1">
                  <div className="flex items-center gap-2.5">
                    <Link to={`/papers/${p.paper.id}`}>
                      <h2 className="text-sm font-bold text-slate-900 dark:text-slate-100 hover:text-blue-600 dark:hover:text-blue-400 transition-colors truncate">
                        {p.paper.title}
                      </h2>
                    </Link>
                    <StatusBadge status={p.paper.processingStatus} />
                  </div>
                  <div className="flex items-center gap-2 text-xs text-slate-600 dark:text-slate-400">
                    <span className="truncate max-w-md">{authorsText || 'Unknown Authors'}</span>
                    <span>•</span>
                    <span>{p.paper.venue || 'Scholarly Publication'}</span>
                    <span>•</span>
                    <span>{p.paper.publicationYear}</span>
                  </div>
                </div>

                <div className="flex items-center gap-4 shrink-0 self-end md:self-center">
                  <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-medium">
                    <span className="flex items-center gap-1">
                      <Layers className="w-3.5 h-3.5 text-blue-500 dark:text-blue-400" />
                      <span>{p.chunkCount || 0} chunks</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <GitCommit className="w-3.5 h-3.5 text-emerald-500 dark:text-emerald-400" />
                      <span>{p.claimCount || 0} claims</span>
                    </span>
                  </div>

                  <GlassButton
                    size="sm"
                    variant="secondary"
                    onClick={() => navigate(`/papers/${p.paper.id}`)}
                    icon={<ArrowRight className="w-3.5 h-3.5" />}
                  >
                    View
                  </GlassButton>
                </div>
              </GlassPanelStrong>
            );
          })}
        </div>
      )}

      {/* Manual Paper Entry Modal */}
      <GlassModal
        isOpen={isManualModalOpen}
        onClose={() => setIsManualModalOpen(false)}
        title="Create Manual Paper Entry"
        subtitle="Add bibliographic metadata without immediately attaching a PDF"
      >
        <form onSubmit={handleManualSubmit} className="space-y-4">
          <GlassInput
            label="Paper Title *"
            required
            placeholder="e.g. Attention Is All You Need"
            value={manualTitle}
            onChange={(e) => setManualTitle(e.target.value)}
          />

          <GlassInput
            label="Authors (comma-separated)"
            placeholder="e.g. Ashish Vaswani, Noam Shazeer, Niki Parmar"
            value={manualAuthors}
            onChange={(e) => setManualAuthors(e.target.value)}
          />

          <div className="grid grid-cols-2 gap-4">
            <GlassInput
              label="Publication Year"
              type="number"
              value={manualYear}
              onChange={(e) => setManualYear(parseInt(e.target.value) || new Date().getFullYear())}
            />
            <GlassInput
              label="Venue / Conference"
              placeholder="e.g. NeurIPS 2017"
              value={manualVenue}
              onChange={(e) => setManualVenue(e.target.value)}
            />
          </div>

          <GlassInput
            label="Digital Object Identifier (DOI)"
            placeholder="e.g. 10.48550/arXiv.1706.03762"
            value={manualDoi}
            onChange={(e) => setManualDoi(e.target.value)}
          />

          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold text-slate-700 dark:text-slate-300 tracking-wide uppercase">
              Abstract Text
            </label>
            <textarea
              rows={4}
              className="glass-input w-full font-serif text-xs leading-relaxed"
              placeholder="Paste reported paper abstract..."
              value={manualAbstract}
              onChange={(e) => setManualAbstract(e.target.value)}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4 border-t border-slate-200 dark:border-slate-800">
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
              {manualMutation.isPending ? 'Saving...' : 'Create Paper Entry'}
            </GlassButton>
          </div>
        </form>
      </GlassModal>
    </div>
  );
};
