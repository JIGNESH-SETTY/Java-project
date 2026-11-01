import React from 'react';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  RotateCcw,
  Download,
  List,
  Network,
  Tag,
  ArrowRight,
  Layers,
} from 'lucide-react';

interface GraphControlsProps {
  onZoomIn: () => void;
  onZoomOut: () => void;
  onFit: () => void;
  onReset: () => void;
  onExportPng?: () => void;
  layoutName: 'cose' | 'concentric' | 'circle' | 'breadthfirst';
  onChangeLayout: (layout: 'cose' | 'concentric' | 'circle' | 'breadthfirst') => void;
  showLabels: boolean;
  onToggleLabels: () => void;
  showArrows: boolean;
  onToggleArrows: () => void;
  viewMode: 'graph' | 'list';
  onToggleViewMode: () => void;
  className?: string;
}

export const GraphControls: React.FC<GraphControlsProps> = ({
  onZoomIn,
  onZoomOut,
  onFit,
  onReset,
  onExportPng,
  layoutName,
  onChangeLayout,
  showLabels,
  onToggleLabels,
  showArrows,
  onToggleArrows,
  viewMode,
  onToggleViewMode,
  className = '',
}) => {
  return (
    <div
      className={`flex items-center gap-1.5 p-2 rounded-2xl bg-white/95 border border-white/90 shadow-[0_4px_20px_rgba(41,40,43,0.08)] backdrop-blur-md ${className}`}
    >
      {/* Zoom and Fit */}
      <div className="flex items-center gap-1 pr-1.5 border-r border-slate-200/80">
        <button
          type="button"
          onClick={onZoomIn}
          className="p-1.5 rounded-xl text-[#29282B] hover:bg-slate-100 hover:text-indigo-600 transition"
          title="Zoom In"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          className="p-1.5 rounded-xl text-[#29282B] hover:bg-slate-100 hover:text-indigo-600 transition"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onFit}
          className="p-1.5 rounded-xl text-[#29282B] hover:bg-slate-100 hover:text-indigo-600 transition"
          title="Fit Graph to Viewport"
          aria-label="Fit graph"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onReset}
          className="p-1.5 rounded-xl text-[#29282B] hover:bg-slate-100 hover:text-indigo-600 transition"
          title="Reset Layout & Positions"
          aria-label="Reset layout"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Layout Selection */}
      <div className="flex items-center gap-1 px-1.5 border-r border-slate-200/80">
        <Layers className="w-3.5 h-3.5 text-[#8E8B92]" />
        <select
          value={layoutName}
          onChange={(e) => onChangeLayout(e.target.value as any)}
          className="bg-transparent text-xs font-semibold text-[#29282B] outline-none cursor-pointer pr-1"
          aria-label="Graph layout algorithm"
        >
          <option value="cose">Force-Directed (CoSE)</option>
          <option value="concentric">Concentric Hierarchy</option>
          <option value="circle">Circular Radial</option>
          <option value="breadthfirst">Breadth-First Tree</option>
        </select>
      </div>

      {/* Visual Toggles */}
      <div className="flex items-center gap-1 px-1.5 border-r border-slate-200/80">
        <button
          type="button"
          onClick={onToggleLabels}
          className={`p-1.5 rounded-xl transition flex items-center gap-1 text-xs font-medium ${
            showLabels
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
              : 'text-[#8E8B92] hover:bg-slate-100 hover:text-[#29282B]'
          }`}
          title="Toggle Labels"
          aria-label="Toggle node labels"
        >
          <Tag className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Labels</span>
        </button>
        <button
          type="button"
          onClick={onToggleArrows}
          className={`p-1.5 rounded-xl transition flex items-center gap-1 text-xs font-medium ${
            showArrows
              ? 'bg-indigo-50 text-indigo-700 border border-indigo-200/80'
              : 'text-[#8E8B92] hover:bg-slate-100 hover:text-[#29282B]'
          }`}
          title="Toggle Directional Arrows"
          aria-label="Toggle arrows"
        >
          <ArrowRight className="w-3.5 h-3.5" />
          <span className="hidden sm:inline text-[11px]">Arrows</span>
        </button>
      </div>

      {/* View Mode & Export */}
      <div className="flex items-center gap-1 pl-1">
        {onExportPng && (
          <button
            type="button"
            onClick={onExportPng}
            className="p-1.5 rounded-xl text-[#29282B] hover:bg-slate-100 hover:text-indigo-600 transition"
            title="Export High-Res PNG"
            aria-label="Export graph image"
          >
            <Download className="w-4 h-4" />
          </button>
        )}
        <button
          type="button"
          onClick={onToggleViewMode}
          className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition ${
            viewMode === 'list'
              ? 'bg-indigo-600 text-white shadow-sm'
              : 'bg-slate-100 text-[#29282B] hover:bg-slate-200/80'
          }`}
          title={viewMode === 'graph' ? 'Switch to Accessible List View' : 'Switch to Graph View'}
          aria-label="Toggle list/graph view"
        >
          {viewMode === 'graph' ? <List className="w-3.5 h-3.5" /> : <Network className="w-3.5 h-3.5" />}
          <span>{viewMode === 'graph' ? 'List View' : 'Graph View'}</span>
        </button>
      </div>
    </div>
  );
};

