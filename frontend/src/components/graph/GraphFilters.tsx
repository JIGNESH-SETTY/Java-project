import React from 'react';
import {
  Search,
  Filter,
  RefreshCw,
  Database,
  Sliders,
  Check,
  Calendar,
  Layers,
  Sparkles,
} from 'lucide-react';
import {
  CitationGraphFilters,
  ConceptGraphFilters,
  GraphNodeType,
  GraphEdgeType,
  GraphProvenance,
  GraphReviewStatus,
} from '../../types/graph';

interface GraphFiltersProps {
  graphMode: 'citation' | 'concept';
  citationFilters?: CitationGraphFilters;
  onCitationFiltersChange?: (filters: CitationGraphFilters) => void;
  conceptFilters?: ConceptGraphFilters;
  onConceptFiltersChange?: (filters: ConceptGraphFilters) => void;
  isMockData: boolean;
  onToggleMockData: () => void;
  onReset: () => void;
  className?: string;
}

export const GraphFilters: React.FC<GraphFiltersProps> = ({
  graphMode,
  citationFilters = {},
  onCitationFiltersChange,
  conceptFilters = {},
  onConceptFiltersChange,
  isMockData,
  onToggleMockData,
  onReset,
  className = '',
}) => {
  const nodeTypeOptions: { id: GraphNodeType; label: string; color: string }[] = [
    { id: 'PAPER', label: 'Papers', color: 'bg-indigo-600' },
    { id: 'CONCEPT', label: 'Concepts', color: 'bg-teal-600' },
    { id: 'CLAIM', label: 'Claims', color: 'bg-purple-600' },
    { id: 'METHOD', label: 'Methods', color: 'bg-blue-600' },
    { id: 'DATASET', label: 'Datasets', color: 'bg-amber-600' },
    { id: 'AI_INTERPRETATION', label: 'AI Synthesis', color: 'bg-purple-400' },
    { id: 'CHUNK', label: 'Evidence Chunks', color: 'bg-slate-600' },
  ];

  const relationTypeOptions: { id: GraphEdgeType; label: string; color: string }[] = [
    { id: 'SUPPORTS', label: 'Supports', color: 'text-emerald-700 bg-emerald-50 border-emerald-200' },
    { id: 'CONTRADICTS', label: 'Contradicts', color: 'text-red-700 bg-red-50 border-red-200' },
    { id: 'QUALIFIES', label: 'Qualifies', color: 'text-orange-700 bg-orange-50 border-orange-200' },
    { id: 'EXTENDS', label: 'Extends', color: 'text-purple-700 bg-purple-50 border-purple-200' },
    { id: 'USES_METHOD', label: 'Uses Method', color: 'text-cyan-700 bg-cyan-50 border-cyan-200' },
    { id: 'EVALUATED_ON', label: 'Evaluated On', color: 'text-amber-700 bg-amber-50 border-amber-200' },
    { id: 'REPORTS', label: 'Reports Claim', color: 'text-blue-700 bg-blue-50 border-blue-200' },
  ];

  const provenanceOptions: { id: GraphProvenance; label: string }[] = [
    { id: 'REPORTED_IN_PAPER', label: 'Reported in paper' },
    { id: 'AI_INTERPRETATION', label: 'AI interpretation' },
    { id: 'USER_ASSERTED', label: 'User asserted' },
    { id: 'HUMAN_REVIEWED', label: 'Human reviewed' },
  ];

  const reviewStatusOptions: { id: GraphReviewStatus; label: string }[] = [
    { id: 'CONFIRMED', label: 'Confirmed' },
    { id: 'PENDING', label: 'Pending Review' },
    { id: 'REJECTED', label: 'Rejected' },
  ];

  // Handlers for Citation Filters
  const handleCitationQuery = (val: string) => {
    if (onCitationFiltersChange) {
      onCitationFiltersChange({ ...citationFilters, query: val });
    }
  };

  const handleYearChange = (key: 'yearFrom' | 'yearTo', val: string) => {
    const num = val ? parseInt(val, 10) : undefined;
    if (onCitationFiltersChange) {
      onCitationFiltersChange({ ...citationFilters, [key]: num });
    }
  };

  const handleDepthChange = (depth: number) => {
    if (onCitationFiltersChange) {
      onCitationFiltersChange({ ...citationFilters, citationDepth: depth });
    }
  };

  const handleImportedOnlyToggle = () => {
    if (onCitationFiltersChange) {
      onCitationFiltersChange({ ...citationFilters, importedOnly: !citationFilters.importedOnly });
    }
  };

  // Handlers for Concept Filters
  const handleConceptQuery = (val: string) => {
    if (onConceptFiltersChange) {
      onConceptFiltersChange({ ...conceptFilters, query: val });
    }
  };

  const toggleNodeType = (type: GraphNodeType) => {
    if (!onConceptFiltersChange) return;
    const current = conceptFilters.nodeTypes || ['PAPER', 'CONCEPT', 'CLAIM', 'METHOD', 'DATASET', 'AI_INTERPRETATION'];
    const updated = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    onConceptFiltersChange({ ...conceptFilters, nodeTypes: updated });
  };

  const toggleRelationType = (type: GraphEdgeType) => {
    if (!onConceptFiltersChange) return;
    const current = conceptFilters.relationshipTypes || [];
    const updated = current.includes(type) ? current.filter((t) => t !== type) : [...current, type];
    onConceptFiltersChange({ ...conceptFilters, relationshipTypes: updated });
  };

  const toggleProvenance = (prov: GraphProvenance) => {
    if (!onConceptFiltersChange) return;
    const current = conceptFilters.provenanceTypes || [];
    const updated = current.includes(prov) ? current.filter((p) => p !== prov) : [...current, prov];
    onConceptFiltersChange({ ...conceptFilters, provenanceTypes: updated });
  };

  const toggleReviewStatus = (status: GraphReviewStatus) => {
    if (!onConceptFiltersChange) return;
    const current = conceptFilters.reviewStatus || [];
    const updated = current.includes(status) ? current.filter((s) => s !== status) : [...current, status];
    onConceptFiltersChange({ ...conceptFilters, reviewStatus: updated });
  };

  const toggleEvidenceChunks = () => {
    if (!onConceptFiltersChange) return;
    onConceptFiltersChange({ ...conceptFilters, showEvidenceChunks: !conceptFilters.showEvidenceChunks });
  };

  return (
    <div
      className={`p-5 rounded-[26px] bg-white/85 border border-white/95 shadow-[0_12px_32px_-8px_rgba(41,40,43,0.04)] backdrop-blur-md space-y-6 text-xs select-none ${className}`}
    >
      {/* Top Header & Reset */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <Filter className="w-4 h-4 text-indigo-600" />
          <h3 className="font-bold text-[#29282B] text-sm tracking-tight">Graph Filters</h3>
        </div>
        <button
          type="button"
          onClick={onReset}
          className="flex items-center gap-1 text-[11px] font-semibold text-[#8E8B92] hover:text-[#29282B] transition"
        >
          <RefreshCw className="w-3 h-3" />
          <span>Reset</span>
        </button>
      </div>

      {/* Data Source Mode Toggle (Mock Demo vs Live PostgreSQL) */}
      <div className="p-3 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-[10px] uppercase font-bold text-[#8E8B92] tracking-wider">Data Source</span>
          <span
            className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
              isMockData
                ? 'bg-amber-100 text-amber-800 border border-amber-200'
                : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
            }`}
          >
            {isMockData ? 'Fictional Demo Data' : 'Live PostgreSQL DB'}
          </span>
        </div>
        <button
          type="button"
          onClick={onToggleMockData}
          className="w-full flex items-center justify-center gap-2 py-1.5 px-3 rounded-xl bg-white border border-slate-200 text-[#29282B] hover:bg-slate-100 font-semibold shadow-xs transition"
        >
          <Database className="w-3.5 h-3.5 text-indigo-600" />
          <span>{isMockData ? 'Switch to Live Database' : 'Switch to Demo Mock Data'}</span>
        </button>
      </div>

      {/* Search Filter */}
      <div>
        <label className="block text-[11px] font-bold text-[#615E65] uppercase tracking-wider mb-1.5">
          {graphMode === 'citation' ? 'Search Title, Author, or DOI' : 'Search Concepts, Claims, or Papers'}
        </label>
        <div className="relative">
          <Search className="w-3.5 h-3.5 text-[#8E8B92] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={graphMode === 'citation' ? 'e.g. Vaswani, BERT, 2017...' : 'e.g. Next Sentence, Attention...'}
            value={graphMode === 'citation' ? citationFilters.query || '' : conceptFilters.query || ''}
            onChange={(e) =>
              graphMode === 'citation' ? handleCitationQuery(e.target.value) : handleConceptQuery(e.target.value)
            }
            className="w-full pl-9 pr-3 py-2 rounded-xl text-xs bg-white border border-slate-200/90 text-[#29282B] placeholder:text-[#8E8B92] focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
          />
        </div>
      </div>

      {/* Citation Graph Specific Filters */}
      {graphMode === 'citation' && (
        <>
          {/* Publication Year Range */}
          <div>
            <label className="block text-[11px] font-bold text-[#615E65] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Calendar className="w-3 h-3 text-indigo-600" />
              <span>Publication Year</span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="From (e.g. 2017)"
                value={citationFilters.yearFrom || ''}
                onChange={(e) => handleYearChange('yearFrom', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl text-xs bg-white border border-slate-200/90 text-[#29282B]"
              />
              <input
                type="number"
                placeholder="To (e.g. 2024)"
                value={citationFilters.yearTo || ''}
                onChange={(e) => handleYearChange('yearTo', e.target.value)}
                className="w-full px-3 py-1.5 rounded-xl text-xs bg-white border border-slate-200/90 text-[#29282B]"
              />
            </div>
          </div>

          {/* Citation Traversal Depth */}
          <div>
            <label className="block text-[11px] font-bold text-[#615E65] uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
              <Layers className="w-3 h-3 text-indigo-600" />
              <span>Citation Traversal Depth</span>
            </label>
            <div className="flex items-center gap-1.5">
              {[1, 2, 3].map((lvl) => {
                const isActive = (citationFilters.citationDepth || 1) === lvl;
                return (
                  <button
                    key={lvl}
                    type="button"
                    onClick={() => handleDepthChange(lvl)}
                    className={`flex-1 py-1.5 rounded-xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-indigo-600 text-white shadow-xs'
                        : 'bg-white border border-slate-200 text-[#615E65] hover:bg-slate-50'
                    }`}
                  >
                    Level {lvl}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Imported Papers Only Toggle */}
          <div className="pt-2">
            <label className="flex items-center gap-2.5 cursor-pointer">
              <input
                type="checkbox"
                checked={!!citationFilters.importedOnly}
                onChange={handleImportedOnlyToggle}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
              <span className="text-xs font-medium text-[#29282B]">Show only imported library papers</span>
            </label>
          </div>
        </>
      )}

      {/* Concept & Claim Evidence Graph Specific Filters */}
      {graphMode === 'concept' && (
        <>
          {/* Node Types Selector */}
          <div>
            <span className="block text-[11px] font-bold text-[#615E65] uppercase tracking-wider mb-2">
              Entity Types
            </span>
            <div className="flex flex-wrap gap-1.5">
              {nodeTypeOptions.map((opt) => {
                const activeTypes = conceptFilters.nodeTypes || [
                  'PAPER',
                  'CONCEPT',
                  'CLAIM',
                  'METHOD',
                  'DATASET',
                  'AI_INTERPRETATION',
                ];
                const isSelected = activeTypes.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleNodeType(opt.id)}
                    className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-medium transition ${
                      isSelected
                        ? 'bg-indigo-50 text-indigo-800 border border-indigo-200 font-semibold'
                        : 'bg-white border border-slate-200 text-[#8E8B92] hover:text-[#29282B]'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${opt.color}`} />
                    <span>{opt.label}</span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Relationship Types Filter */}
          <div>
            <span className="block text-[11px] font-bold text-[#615E65] uppercase tracking-wider mb-2">
              Claim & Concept Relationships
            </span>
            <div className="flex flex-wrap gap-1.5">
              {relationTypeOptions.map((opt) => {
                const activeRels = conceptFilters.relationshipTypes || [];
                const isSelected = activeRels.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => toggleRelationType(opt.id)}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-medium transition border ${
                      isSelected
                        ? opt.color + ' font-semibold ring-1 ring-slate-400'
                        : 'bg-white border-slate-200 text-[#615E65] hover:bg-slate-50'
                    }`}
                  >
                    {opt.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Provenance Filter */}
          <div>
            <span className="block text-[11px] font-bold text-[#615E65] uppercase tracking-wider mb-2">
              Provenance Classification
            </span>
            <div className="space-y-1.5">
              {provenanceOptions.map((p) => {
                const activeProv = conceptFilters.provenanceTypes || [];
                const isSelected = activeProv.includes(p.id);
                return (
                  <label key={p.id} className="flex items-center gap-2 cursor-pointer text-xs text-[#29282B]">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => toggleProvenance(p.id)}
                      className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-3.5 h-3.5 cursor-pointer"
                    />
                    <span>{p.label}</span>
                  </label>
                );
              })}
            </div>
          </div>

          {/* Review Status Filter */}
          <div>
            <span className="block text-[11px] font-bold text-[#615E65] uppercase tracking-wider mb-2">
              Review Status
            </span>
            <div className="flex gap-1.5">
              {reviewStatusOptions.map((st) => {
                const activeSt = conceptFilters.reviewStatus || [];
                const isSelected = activeSt.includes(st.id);
                return (
                  <button
                    key={st.id}
                    type="button"
                    onClick={() => toggleReviewStatus(st.id)}
                    className={`flex-1 py-1 px-2 rounded-xl text-[11px] font-medium transition border ${
                      isSelected
                        ? 'bg-slate-900 text-white border-slate-900 font-semibold'
                        : 'bg-white border-slate-200 text-[#615E65] hover:bg-slate-50'
                    }`}
                  >
                    {st.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Evidence Chunks Visibility Toggle */}
          <div className="pt-2 border-t border-slate-100">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-xs font-semibold text-[#29282B]">Expand Evidence Passages</span>
              <input
                type="checkbox"
                checked={!!conceptFilters.showEvidenceChunks}
                onChange={toggleEvidenceChunks}
                className="rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 w-4 h-4 cursor-pointer"
              />
            </label>
            <p className="text-[10px] text-[#8E8B92] mt-1">
              Reveal raw document chunks attached to claims directly in graph canvas.
            </p>
          </div>
        </>
      )}
    </div>
  );
};

