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
  HelpCircle
} from 'lucide-react';

export const Sidebar: React.FC = () => {
  const links = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/library', label: 'Paper Library', icon: BookOpen },
    { to: '/search', label: 'Hybrid Search', icon: Search },
    { to: '/compare', label: 'Paper Comparison', icon: Scale },
    { to: '/claims', label: 'Claims & Evidence', icon: GitCommit },
    { to: '/graph/citations', label: 'Citation Graph', icon: GitBranch },
    { to: '/graph/concepts', label: 'Concept Graph', icon: Network },
    { to: '/reviews', label: 'Literature Reviews', icon: FileSpreadsheet },
    { to: '/collections', label: 'Collections', icon: FolderKanban },
    { to: '/settings', label: 'Settings & Status', icon: Settings },
  ];

  return (
    <aside className="w-64 border-r border-slate-800 bg-[#0d1322] flex flex-col justify-between p-4 shrink-0">
      <nav className="space-y-1">
        <div className="px-3 pb-2 text-[10px] font-bold uppercase tracking-wider text-slate-500">
          Core Workspaces
        </div>
        {links.map((link) => {
          const Icon = link.icon;
          return (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                  isActive
                    ? 'bg-indigo-600/15 text-indigo-400 border border-indigo-500/30 font-semibold'
                    : 'text-slate-400 hover:text-slate-100 hover:bg-slate-800/50'
                }`
              }
            >
              <Icon className="w-4 h-4" />
              <span>{link.label}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Provenance Legend Widget */}
      <div className="p-3.5 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] space-y-2">
        <div className="font-semibold text-slate-300 flex items-center justify-between">
          <span>Evidence Provenance</span>
          <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
        </div>
        <div className="space-y-1.5 text-[10px]">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
            <span>Reported Paper Evidence</span>
          </div>
          <div className="flex items-center gap-2 text-violet-400">
            <span className="w-2 h-2 rounded-full bg-violet-500"></span>
            <span>AI Interpretation</span>
          </div>
          <div className="flex items-center gap-2 text-amber-400">
            <span className="w-2 h-2 rounded-full bg-amber-500"></span>
            <span>User Annotation</span>
          </div>
        </div>
      </div>
    </aside>
  );
};
