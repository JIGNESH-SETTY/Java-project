import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  UploadCloud,
  Search,
  Globe,
  FileText,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  BookOpen,
  Calendar,
  Layers,
  ArrowRight,
  ShieldCheck,
  Download,
  Info,
} from 'lucide-react';
import { scholarlyApi } from '../api/scholarlyApi';
import { paperApi } from '../api/paperApi';
import { SourceSearchResult, PaperMetadata, ScholarlyImportResult } from '../types';
import { GlassPanel, GlassPanelStrong } from '../components/GlassPanel';
import { GlassButton } from '../components/GlassButton';
import { GlassInput, GlassSelect } from '../components/GlassInput';
import { StatusBadge } from '../components/StatusBadge';

export const ImportPaperPage: React.FC = () => {
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'search' | 'doi' | 'upload'>('search');
  const [searchQuery, setSearchQuery] = useState('');
  const [providerFilter, setProviderFilter] = useState('ALL');
  const [isSearching, setIsSearching] = useState(false);
  const [searchResults, setSearchResults] = useState<SourceSearchResult[]>([]);
  const [searchError, setSearchError] = useState<string | null>(null);

  // DOI Lookup state
  const [doiInput, setDoiInput] = useState('');
  const [doiResolving, setDoiResolving] = useState(false);
  const [doiResult, setDoiResult] = useState<PaperMetadata | null>(null);
  const [doiError, setDoiError] = useState<string | null>(null);

  // Import Action state
  const [importingPaperId, setImportingPaperId] = useState<string | null>(null);
  const [importResult, setImportResult] = useState<ScholarlyImportResult | null>(null);

  // Direct File Upload state
  const [uploadFile, setUploadFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);

  const handleSearch = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!searchQuery.trim()) return;

    setIsSearching(true);
    setSearchError(null);
    setSearchResults([]);
    setImportResult(null);

    try {
      const results = await scholarlyApi.searchSources({
        query: searchQuery.trim(),
        provider: providerFilter,
        limit: 10,
      });
      setSearchResults(results);
      if (results.length === 0 || results.every((r) => r.papers.length === 0)) {
        setSearchError('No papers found across official scholarly APIs for this query.');
      }
    } catch (err: any) {
      setSearchError(err?.response?.data?.message || 'Failed to search scholarly sources. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleResolveDoi = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!doiInput.trim()) return;

    setDoiResolving(true);
    setDoiError(null);
    setDoiResult(null);
    setImportResult(null);

    try {
      const metadata = await scholarlyApi.resolveDoi(doiInput.trim());
      setDoiResult(metadata);
    } catch (err: any) {
      setDoiError('Could not resolve DOI. Please verify the identifier format (e.g. 10.1145/3292500.3330964).');
    } finally {
      setDoiResolving(false);
    }
  };

  const handleImport = async (metadata: PaperMetadata, downloadPdf: boolean) => {
    setImportingPaperId(metadata.doi || metadata.externalId || metadata.title);
    setImportResult(null);

    try {
      const result = await scholarlyApi.importPaper({
        metadata,
        downloadOpenAccessPdfIfAvailable: downloadPdf,
      });
      setImportResult(result);
    } catch (err: any) {
      setSearchError(err?.response?.data?.message || 'Failed to import scholarly metadata.');
    } finally {
      setImportingPaperId(null);
    }
  };

  const handleFileUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!uploadFile) return;

    setIsUploading(true);
    setUploadError(null);

    try {
      const response = await paperApi.uploadPaper(uploadFile, 'PRIVATE');
      navigate(`/papers/${response.paper.id}`);
    } catch (err: any) {
      setUploadError(err?.response?.data?.message || 'Failed to upload and parse PDF file.');
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 text-indigo-700 text-xs font-semibold uppercase tracking-wider mb-1">
          <Globe className="w-4 h-4" />
          <span>Real Scholarly Data & Ingestion</span>
        </div>
        <h1 className="text-2xl sm:text-3xl font-bold text-slate-900 tracking-tight">
          Import Scientific Papers
        </h1>
        <p className="text-sm text-slate-500 mt-1 max-w-2xl leading-relaxed">
          Search official scholarly APIs (Crossref, OpenAlex, arXiv, Semantic Scholar, Europe PMC) or enter a DOI. Legal open-access documents are automatically verified and ingested into the vector evidence engine.
        </p>
      </div>

      {/* Import Feedback Banner */}
      {importResult && (
        <div className="p-5 rounded-2xl bg-emerald-50 border border-emerald-200 shadow-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div>
              <div className="text-sm font-semibold text-emerald-900">
                Imported: {importResult.title}
              </div>
              <p className="text-xs text-emerald-700 mt-0.5">{importResult.message}</p>
              <div className="text-[11px] text-emerald-600 mt-1 font-mono">{importResult.attribution}</div>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            <GlassButton
              size="sm"
              variant="primary"
              onClick={() => navigate(`/papers/${importResult.paperId}`)}
              icon={<ArrowRight className="w-3.5 h-3.5" />}
            >
              Open Paper
            </GlassButton>
            <GlassButton size="sm" variant="secondary" onClick={() => setImportResult(null)}>
              Dismiss
            </GlassButton>
          </div>
        </div>
      )}

      {/* Workspace Tabs */}
      <div className="flex items-center gap-2 p-1.5 rounded-2xl bg-white/70 border border-white/80 max-w-md shadow-xs">
        <button
          onClick={() => setActiveTab('search')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'search'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          API Search
        </button>
        <button
          onClick={() => setActiveTab('doi')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'doi'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          DOI Lookup
        </button>
        <button
          onClick={() => setActiveTab('upload')}
          className={`flex-1 py-2 px-3 text-xs font-semibold rounded-xl transition-all ${
            activeTab === 'upload'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          PDF File Upload
        </button>
      </div>

      {/* TAB 1: Real Scholarly API Search */}
      {activeTab === 'search' && (
        <div className="space-y-6">
          <GlassPanel className="p-6">
            <form onSubmit={handleSearch} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <GlassInput
                    placeholder="Enter research topic, keywords, or title (e.g. attention mechanism transformers)..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    icon={<Search className="w-4 h-4" />}
                  />
                </div>
                <div className="w-full sm:w-48">
                  <GlassSelect
                    value={providerFilter}
                    onChange={(e) => setProviderFilter(e.target.value)}
                    options={[
                      { value: 'ALL', label: 'All Scholarly Sources' },
                      { value: 'arXiv', label: 'arXiv (Preprints)' },
                      { value: 'OpenAlex', label: 'OpenAlex' },
                      { value: 'Crossref', label: 'Crossref' },
                      { value: 'Semantic Scholar', label: 'Semantic Scholar' },
                      { value: 'Europe PMC', label: 'Europe PMC' },
                    ]}
                  />
                </div>
                <GlassButton
                  type="submit"
                  variant="primary"
                  disabled={isSearching || !searchQuery.trim()}
                  icon={<Search className="w-4 h-4" />}
                >
                  {isSearching ? 'Searching...' : 'Search Sources'}
                </GlassButton>
              </div>

              <div className="flex items-center gap-2 text-xs text-slate-500">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>
                  Connects to official endpoints only. Never scrapes publisher websites or bypasses paywalls.
                </span>
              </div>
            </form>
          </GlassPanel>

          {searchError && (
            <div className="p-4 rounded-xl bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-amber-600" />
              <span>{searchError}</span>
            </div>
          )}

          {/* Results grouped by provider */}
          <div className="space-y-8">
            {searchResults.map((group) => (
              <div key={group.provider} className="space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-200">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900 text-sm">{group.provider}</span>
                    <span className="text-xs text-slate-500">
                      ({group.papers.length} matches shown
                      {group.totalEstimatedResults > group.papers.length
                        ? ` of ~${group.totalEstimatedResults.toLocaleString()}`
                        : ''}
                      )
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {group.papers.map((paper, idx) => {
                    const isImporting =
                      importingPaperId === (paper.doi || paper.externalId || paper.title);
                    return (
                      <GlassPanelStrong key={idx} className="p-5 flex flex-col justify-between gap-4">
                        <div className="space-y-2">
                          <div className="flex items-start justify-between gap-2">
                            <StatusBadge status={paper.accessStatus} />
                            {paper.publicationYear && (
                              <span className="text-xs text-slate-500 font-medium flex items-center gap-1">
                                <Calendar className="w-3 h-3" />
                                {paper.publicationYear}
                              </span>
                            )}
                          </div>

                          <h3 className="font-semibold text-slate-900 text-sm leading-snug">
                            {paper.title}
                          </h3>

                          {paper.authors && paper.authors.length > 0 && (
                            <p className="text-xs text-slate-600 line-clamp-1">
                              {paper.authors.join(', ')}
                            </p>
                          )}

                          {paper.venue && (
                            <p className="text-[11px] text-slate-500 italic line-clamp-1">
                              {paper.venue}
                            </p>
                          )}

                          {paper.abstractText && (
                            <p className="text-xs text-slate-600 font-serif line-clamp-3 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                              {paper.abstractText}
                            </p>
                          )}
                        </div>

                        <div className="pt-3 border-t border-slate-100 flex flex-col gap-2">
                          <div className="flex items-center justify-between text-[11px] text-slate-500">
                            <span className="truncate" title={paper.metadataSource}>
                              {paper.metadataSource}
                            </span>
                            {paper.externalUrl && (
                              <a
                                href={paper.externalUrl}
                                target="_blank"
                                rel="noreferrer"
                                className="flex items-center gap-1 text-indigo-600 hover:underline shrink-0"
                              >
                                Source Record <ExternalLink className="w-3 h-3" />
                              </a>
                            )}
                          </div>

                          <div className="flex items-center gap-2 pt-1">
                            {Boolean(paper.openAccessPdfUrl) ? (
                              <GlassButton
                                size="sm"
                                variant="primary"
                                disabled={isImporting}
                                onClick={() => handleImport(paper, true)}
                                icon={<Download className="w-3.5 h-3.5" />}
                                className="w-full"
                              >
                                {isImporting ? 'Ingesting...' : 'Import & Ingest Open-Access PDF'}
                              </GlassButton>
                            ) : (
                              <GlassButton
                                size="sm"
                                variant="secondary"
                                disabled={isImporting}
                                onClick={() => handleImport(paper, false)}
                                icon={<BookOpen className="w-3.5 h-3.5" />}
                                className="w-full"
                              >
                                {isImporting ? 'Importing...' : 'Import Metadata Only'}
                              </GlassButton>
                            )}
                          </div>
                        </div>
                      </GlassPanelStrong>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 2: DOI Lookup */}
      {activeTab === 'doi' && (
        <div className="space-y-6 max-w-3xl">
          <GlassPanel className="p-6">
            <form onSubmit={handleResolveDoi} className="space-y-4">
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="flex-1">
                  <GlassInput
                    label="Digital Object Identifier (DOI)"
                    placeholder="e.g. 10.1145/3292500.3330964 or 10.48550/arXiv.1706.03762"
                    value={doiInput}
                    onChange={(e) => setDoiInput(e.target.value)}
                  />
                </div>
                <div className="sm:self-end">
                  <GlassButton
                    type="submit"
                    variant="primary"
                    disabled={doiResolving || !doiInput.trim()}
                    icon={<Search className="w-4 h-4" />}
                  >
                    {doiResolving ? 'Resolving...' : 'Lookup DOI'}
                  </GlassButton>
                </div>
              </div>
            </form>
          </GlassPanel>

          {doiError && (
            <div className="p-4 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{doiError}</span>
            </div>
          )}

          {doiResult && (
            <GlassPanelStrong className="p-6 space-y-4">
              <div className="flex items-start justify-between gap-2">
                <StatusBadge status={doiResult.accessStatus} />
                <span className="text-xs text-slate-500 font-medium">{doiResult.provider}</span>
              </div>

              <div>
                <h3 className="text-lg font-bold text-slate-900 leading-snug">{doiResult.title}</h3>
                {doiResult.authors && doiResult.authors.length > 0 && (
                  <p className="text-xs text-slate-600 mt-1">{doiResult.authors.join(', ')}</p>
                )}
                <p className="text-xs text-slate-500 mt-0.5">
                  {doiResult.venue} {doiResult.publicationYear ? `(${doiResult.publicationYear})` : ''}
                </p>
              </div>

              {doiResult.abstractText && (
                <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 text-xs text-slate-700 font-serif leading-relaxed">
                  {doiResult.abstractText}
                </div>
              )}

              <div className="pt-3 border-t border-slate-200 flex items-center justify-between">
                <span className="text-xs text-slate-500">{doiResult.metadataSource}</span>
                <GlassButton
                  variant="primary"
                  onClick={() => handleImport(doiResult, Boolean(doiResult.openAccessPdfUrl))}
                  icon={<Download className="w-4 h-4" />}
                >
                  {Boolean(doiResult.openAccessPdfUrl) ? 'Import & Ingest Legal PDF' : 'Import Canonical Metadata'}
                </GlassButton>
              </div>
            </GlassPanelStrong>
          )}
        </div>
      )}

      {/* TAB 3: Local PDF File Upload */}
      {activeTab === 'upload' && (
        <div className="max-w-2xl space-y-6">
          <GlassPanel className="p-8">
            <form onSubmit={handleFileUpload} className="space-y-6">
              <div className="border-2 border-dashed border-indigo-200 rounded-2xl p-8 text-center bg-indigo-50/30 hover:bg-indigo-50/50 transition flex flex-col items-center">
                <UploadCloud className="w-12 h-12 text-indigo-500 mb-3" />
                <label className="cursor-pointer">
                  <span className="text-sm font-semibold text-indigo-700 hover:underline">
                    Choose PDF document
                  </span>
                  <input
                    type="file"
                    accept="application/pdf"
                    className="hidden"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setUploadFile(e.target.files[0]);
                      }
                    }}
                  />
                </label>
                <p className="text-xs text-slate-500 mt-1">
                  Upload an authorized scholarly PDF file (max 50MB)
                </p>
                {uploadFile && (
                  <div className="mt-4 p-2.5 rounded-xl bg-white border border-indigo-200 text-xs text-indigo-800 font-medium flex items-center gap-2">
                    <FileText className="w-4 h-4 text-indigo-600" />
                    <span>{uploadFile.name}</span>
                    <span className="text-slate-400 text-[10px]">
                      ({(uploadFile.size / 1024 / 1024).toFixed(2)} MB)
                    </span>
                  </div>
                )}
              </div>

              {uploadError && (
                <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{uploadError}</span>
                </div>
              )}

              <div className="flex justify-end">
                <GlassButton
                  type="submit"
                  variant="primary"
                  disabled={!uploadFile || isUploading}
                  icon={<UploadCloud className="w-4 h-4" />}
                >
                  {isUploading ? 'Parsing & Ingesting...' : 'Upload & Start Pipeline'}
                </GlassButton>
              </div>
            </form>
          </GlassPanel>

          <div className="p-4 rounded-xl bg-white/70 border border-white/80 text-xs text-slate-600 space-y-2">
            <div className="font-semibold text-slate-800 flex items-center gap-1.5">
              <Info className="w-4 h-4 text-indigo-600" />
              <span>Evidence Pipeline Principles</span>
            </div>
            <p>
              When a PDF is uploaded, Apache PDFBox extracts sections, character offsets, and page numbers. Chunks are embedded into 384-dimensional dense vectors stored directly in PostgreSQL with pgvector. Atomic scientific claims are structured and tracked with directional relationships.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};
