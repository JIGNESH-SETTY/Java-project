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
      className={`flex items-center gap-1.5 p-2 rounded-2xl bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 shadow-sm ${className}`}
    >
      {/* Zoom and Fit */}
      <div className="flex items-center gap-1 pr-1.5 border-r border-slate-200/80 dark:border-slate-800">
        <button
          type="button"
          onClick={onZoomIn}
          className="p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition"
          title="Zoom In"
          aria-label="Zoom in"
        >
          <ZoomIn className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onZoomOut}
          className="p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition"
          title="Zoom Out"
          aria-label="Zoom out"
        >
          <ZoomOut className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onFit}
          className="p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition"
          title="Fit Graph to Viewport"
          aria-label="Fit graph"
        >
          <Maximize2 className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={onReset}
          className="p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition"
          title="Reset Layout & Positions"
          aria-label="Reset layout"
        >
          <RotateCcw className="w-4 h-4" />
        </button>
      </div>

      {/* Layout Selection */}
      <div className="flex items-center gap-1 px-1.5 border-r border-slate-200/80 dark:border-slate-800">
        <Layers className="w-3.5 h-3.5 text-slate-400 dark:text-slate-500" />
        <select
          value={layoutName}
          onChange={(e) => onChangeLayout(e.target.value as any)}
          className="bg-transparent text-xs font-semibold text-slate-800 dark:text-slate-200 outline-none cursor-pointer pr-1"
          aria-label="Graph layout algorithm"
        >
          <option value="cose" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Force-Directed (CoSE)</option>
          <option value="concentric" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Concentric Hierarchy</option>
          <option value="circle" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Circular Radial</option>
          <option value="breadthfirst" className="bg-white dark:bg-slate-900 text-slate-800 dark:text-slate-200">Breadth-First Tree</option>
        </select>
      </div>

      {/* Visual Toggles */}
      <div className="flex items-center gap-1 px-1.5 border-r border-slate-200/80 dark:border-slate-800">
        <button
          type="button"
          onClick={onToggleLabels}
          className={`p-1.5 rounded-xl transition flex items-center gap-1 text-xs font-medium ${
            showLabels
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
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
              ? 'bg-blue-50 dark:bg-blue-950/40 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800'
              : 'text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-slate-800 dark:hover:text-slate-200'
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
            className="p-1.5 rounded-xl text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 hover:text-blue-600 dark:hover:text-blue-400 transition"
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
              ? 'bg-blue-600 text-white shadow-xs'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
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
