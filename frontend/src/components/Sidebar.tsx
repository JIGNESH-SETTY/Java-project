import React from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  BookOpen,
  Search,
  Scale,
  GitCommit,
  GitBranch,
  Network,
  FileSpreadsheet,
  FolderKanban,
  Settings,
  UploadCloud,
  HelpCircle,
  X,
  FileCheck,
  Sparkles,
  User,
} from 'lucide-react';

interface SidebarProps {
  isOpen?: boolean;
  onClose?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({ isOpen, onClose }) => {
  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/library', label: 'Paper Library', icon: BookOpen },
    { to: '/import', label: 'Import Paper', icon: UploadCloud, highlight: true },
    { to: '/search', label: 'Semantic Search', icon: Search },
    { to: '/compare', label: 'Compare Papers', icon: Scale },
    { to: '/claims', label: 'Claims & Evidence', icon: GitCommit },
    { to: '/graph/citations', label: 'Citation Graph', icon: GitBranch },
    { to: '/graph/concepts', label: 'Concept Graph', icon: Network },
    { to: '/reviews', label: 'Literature Reviews', icon: FileSpreadsheet },
    { to: '/collections', label: 'Collections', icon: FolderKanban },
    { to: '/settings', label: 'Settings & Status', icon: Settings },
  ];

  const content = (
    <div className="flex flex-col justify-between h-full p-4 overflow-y-auto">
      <div>
        <div className="flex items-center justify-between pb-3 px-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500">
            Workspaces
          </span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 md:hidden"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        <nav className="space-y-1">
          {links.map((link) => {
            const Icon = link.icon;
            return (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={onClose}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-50/90 text-indigo-700 font-semibold border border-indigo-200/80 shadow-xs'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-white/60'
                  } ${link.highlight && !isActive ? 'text-indigo-600 font-semibold' : ''}`
                }
              >
                <Icon className={`w-4 h-4 shrink-0 ${link.highlight ? 'text-indigo-600' : ''}`} />
                <span>{link.label}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>

      {/* Provenance Legend Widget */}
      <div className="mt-6 p-4 rounded-2xl bg-white/70 border border-white/80 shadow-xs text-xs space-y-3">
        <div className="font-semibold text-slate-800 flex items-center justify-between">
          <span className="text-[11px] uppercase tracking-wider text-slate-500">Evidence Taxonomy</span>
          <HelpCircle className="w-3.5 h-3.5 text-slate-400" />
        </div>
        <div className="space-y-2 text-[11px]">
          <div className="flex items-center gap-2 text-emerald-800">
            <span className="w-2 h-2 rounded-full bg-emerald-600 shrink-0" />
            <FileCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
            <span>Reported in paper</span>
          </div>
          <div className="flex items-center gap-2 text-purple-900">
            <span className="w-2 h-2 rounded-full bg-purple-600 shrink-0" />
            <Sparkles className="w-3.5 h-3.5 text-purple-600 shrink-0" />
            <span>AI interpretation</span>
          </div>
          <div className="flex items-center gap-2 text-amber-900">
            <span className="w-2 h-2 rounded-full bg-amber-600 shrink-0" />
            <User className="w-3.5 h-3.5 text-amber-600 shrink-0" />
            <span>User annotation</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 glass-sidebar shrink-0 h-[calc(100vh-4rem)]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-slate-900/30 backdrop-blur-xs transition-opacity"
            onClick={onClose}
            aria-hidden="true"
          />
          <aside className="relative w-72 glass-sidebar z-10 h-full shadow-2xl flex flex-col">
            {content}
          </aside>
        </div>
      )}
    </>
  );
};
