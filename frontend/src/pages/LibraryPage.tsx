import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { paperApi } from '../api/paperApi';
import { Link } from 'react-router-dom';
import {
  BookOpen,
  Upload,
  Plus,
  Search,
  Filter,
  FileText,
  Clock,
  Trash2,
  CheckCircle,
  AlertCircle,
  ExternalLink,
  X
} from 'lucide-react';

export const LibraryPage: React.FC = () => {
  const queryClient = useQueryClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [isUploadOpen, setIsUploadOpen] = useState(false);
  const [isManualOpen, setIsManualOpen] = useState(false);

  // Upload state
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [visibility, setVisibility] = useState<'PRIVATE' | 'PUBLIC'>('PRIVATE');

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

  const uploadMutation = useMutation({
    mutationFn: (file: File) => paperApi.uploadPaper(file, visibility),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      setIsUploadOpen(false);
      setSelectedFile(null);
    },
  });

  const manualMutation = useMutation({
    mutationFn: (data: any) => paperApi.createManual(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['papers'] });
      setIsManualOpen(false);
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
    return titleMatch || authorMatch || venueMatch;
  });

  const handleUploadSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (selectedFile) {
      uploadMutation.mutate(selectedFile);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualTitle.trim()) return;
    const authorList = manualAuthors
      .split(',')
      .map((a) => a.trim())
      .filter((a) => a.length > 0);

    manualMutation.mutate({
      title: manualTitle.trim(),
      abstractText: manualAbstract.trim(),
      authors: authorList,
      publicationYear: manualYear,
      venue: manualVenue.trim() || 'Manual Reference',
      doi: manualDoi.trim() || undefined,
      visibility,
    });
  };

  return (
    <div className="space-y-6 animate-fade-in">
      {/* Top Header & Actions */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-white tracking-tight">Paper Library</h1>
          <p className="text-xs text-slate-400">
            Vectorized repository of indexed scholarly publications, chunks, and claims
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setIsManualOpen(true)}
            className="px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold border border-slate-700 flex items-center gap-2 transition"
          >
            <Plus className="w-4 h-4 text-slate-400" />
            <span>Manual Entry</span>
          </button>
          <button
            onClick={() => setIsUploadOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 flex items-center gap-2 transition"
          >
            <Upload className="w-4 h-4" />
            <span>Upload Research PDF</span>
          </button>
        </div>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-4 h-4 absolute left-3.5 top-3 text-slate-500" />
        <input
          type="text"
          placeholder="Filter library by title, author, or venue..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="w-full bg-[#131b2e] border border-slate-800 rounded-xl pl-10 pr-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500/80 transition"
        />
      </div>

      {/* Paper Cards Grid */}
      {isLoading ? (
        <div className="text-center py-16 text-slate-500 text-xs">Loading indexed publications...</div>
      ) : filteredPapers.length === 0 ? (
        <div className="glass-panel p-12 text-center rounded-2xl border border-dashed border-slate-800 space-y-3">
          <BookOpen className="w-8 h-8 text-slate-600 mx-auto" />
          <h3 className="text-sm font-semibold text-slate-300">No papers found</h3>
          <p className="text-xs text-slate-500 max-w-sm mx-auto">
            Upload a scholarly PDF or add metadata manually to populate your research knowledge base.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredPapers.map((item) => (
            <div
              key={item.paper.id}
              className="glass-card rounded-2xl p-5 border border-slate-800/80 flex flex-col justify-between space-y-4 hover:border-slate-700 transition"
            >
              <div className="space-y-2.5">
                <div className="flex items-center justify-between gap-2">
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-slate-800 text-indigo-400 border border-slate-700/60">
                    {item.paper.publicationYear || 'Publication'}
                  </span>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded ${
                      item.paper.processingStatus === 'COMPLETED'
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {item.paper.processingStatus}
                  </span>
                </div>

                <Link
                  to={`/papers/${item.paper.id}`}
                  className="font-bold text-sm text-slate-100 hover:text-indigo-400 transition line-clamp-2"
                >
                  {item.paper.title}
                </Link>

                <p className="text-xs text-slate-400 line-clamp-3 leading-relaxed">
                  {item.paper.abstractText || 'No abstract text extracted.'}
                </p>
              </div>

              <div className="space-y-3 pt-3 border-t border-slate-800/60">
                <div className="text-[11px] text-slate-400 truncate">
                  <span className="text-slate-500">Authors: </span>
                  {item.authors.length > 0
                    ? item.authors.map((a) => a.displayName).join(', ')
                    : 'Unknown'}
                </div>

                <div className="flex items-center justify-between text-[11px] text-slate-500">
                  <div className="flex items-center gap-3">
                    <span>{item.chunkCount} chunks</span>
                    <span>•</span>
                    <span>{item.claimCount} claims</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => deleteMutation.mutate(item.paper.id)}
                      className="p-1 text-slate-500 hover:text-rose-400 transition"
                      title="Delete paper"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                    <Link
                      to={`/papers/${item.paper.id}`}
                      className="p-1 text-indigo-400 hover:text-indigo-300 transition"
                      title="Open Detail"
                    >
                      <ExternalLink className="w-3.5 h-3.5" />
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Upload Modal */}
      {isUploadOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#131b2e] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Upload className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Upload Scholarly PDF</h3>
                  <p className="text-xs text-slate-400">Automated text chunking, embedding & claim extraction</p>
                </div>
              </div>
              <button
                onClick={() => setIsUploadOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">PDF File</label>
                <input
                  type="file"
                  accept="application/pdf"
                  required
                  onChange={(e) => setSelectedFile(e.target.files ? e.target.files[0] : null)}
                  className="w-full text-xs text-slate-400 file:mr-4 file:py-2 file:px-4 file:rounded-xl file:border-0 file:text-xs file:font-semibold file:bg-indigo-600/20 file:text-indigo-300 hover:file:bg-indigo-600/30 file:cursor-pointer border border-slate-800 rounded-xl p-2 bg-slate-900/50"
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">Visibility</label>
                <select
                  value={visibility}
                  onChange={(e) => setVisibility(e.target.value as any)}
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="PRIVATE">Private (Only visible to you)</option>
                  <option value="PUBLIC">Public (Shared with all workspace users)</option>
                </select>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsUploadOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl text-xs font-medium hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={uploadMutation.isPending || !selectedFile}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl text-xs font-semibold shadow-lg shadow-indigo-600/30 transition flex items-center gap-2"
                >
                  {uploadMutation.isPending ? 'Ingesting...' : 'Start Ingestion'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Manual Entry Modal */}
      {isManualOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
          <div className="bg-[#131b2e] border border-slate-700 rounded-2xl w-full max-w-lg overflow-hidden shadow-2xl p-6 space-y-5">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                  <Plus className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-semibold text-white text-base">Manual Paper Entry</h3>
                  <p className="text-xs text-slate-400">Add bibliographic paper record without a PDF</p>
                </div>
              </div>
              <button
                onClick={() => setIsManualOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-white"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleManualSubmit} className="space-y-3.5 text-xs">
              <div>
                <label className="block font-medium text-slate-300 mb-1">Paper Title *</label>
                <input
                  type="text"
                  required
                  value={manualTitle}
                  onChange={(e) => setManualTitle(e.target.value)}
                  placeholder="e.g. Scalable Vector Search in Relational Databases"
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block font-medium text-slate-300 mb-1">Abstract Text</label>
                <textarea
                  rows={3}
                  value={manualAbstract}
                  onChange={(e) => setManualAbstract(e.target.value)}
                  placeholder="Summary of objectives, methodology, and key results..."
                  className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Authors (comma separated)</label>
                  <input
                    type="text"
                    value={manualAuthors}
                    onChange={(e) => setManualAuthors(e.target.value)}
                    placeholder="e.g. John Doe, Jane Smith"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Publication Year</label>
                  <input
                    type="number"
                    value={manualYear}
                    onChange={(e) => setManualYear(parseInt(e.target.value) || 2024)}
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-medium text-slate-300 mb-1">Venue / Journal</label>
                  <input
                    type="text"
                    value={manualVenue}
                    onChange={(e) => setManualVenue(e.target.value)}
                    placeholder="e.g. IEEE Transactions, NeurIPS"
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div>
                  <label className="block font-medium text-slate-300 mb-1">DOI</label>
                  <input
                    type="text"
                    value={manualDoi}
                    onChange={(e) => setManualDoi(e.target.value)}
                    placeholder="10.xxxx/..."
                    className="w-full bg-slate-900 border border-slate-800 rounded-xl px-3 py-2 text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsManualOpen(false)}
                  className="px-4 py-2 bg-slate-800 text-slate-300 rounded-xl font-medium hover:bg-slate-700 transition"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={manualMutation.isPending || !manualTitle.trim()}
                  className="px-5 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-xl font-semibold shadow-lg shadow-indigo-600/30 transition"
                >
                  {manualMutation.isPending ? 'Saving...' : 'Create Paper Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
