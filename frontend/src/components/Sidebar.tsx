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
  const workspaceLinks = [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/library', label: 'Paper Library', icon: BookOpen },
    { to: '/import', label: 'Import Paper', icon: UploadCloud, highlight: true },
    { to: '/search', label: 'Semantic Search', icon: Search },
  ];

  const analysisLinks = [
    { to: '/compare', label: 'Compare Papers', icon: Scale },
    { to: '/claims', label: 'Claims & Evidence', icon: GitCommit },
    { to: '/graph/citations', label: 'Citation Graph', icon: GitBranch },
    { to: '/graph/concepts', label: 'Concept Graph', icon: Network },
    { to: '/reviews', label: 'Literature Reviews', icon: FileSpreadsheet },
  ];

  const systemLinks = [
    { to: '/collections', label: 'Collections', icon: FolderKanban },
    { to: '/settings', label: 'Settings & Status', icon: Settings },
  ];

  const renderNavLink = (link: { to: string; label: string; icon: React.ComponentType<{ className?: string }>; highlight?: boolean }) => {
    const Icon = link.icon;
    return (
      <NavLink
        key={link.to}
        to={link.to}
        onClick={onClose}
        className={({ isActive }) =>
          `w-full flex items-center gap-3.5 px-4 py-2.5 rounded-full text-xs font-medium transition-all duration-200 select-none ${
            isActive
              ? 'bg-white text-[#29282B] shadow-[0_4px_16px_rgba(41,40,43,0.04)] font-semibold border border-white/80'
              : 'text-[#615E65] hover:text-[#29282B] hover:bg-white/40'
          } ${link.highlight && !isActive ? 'text-[#FF6F61] font-semibold' : ''}`
        }
      >
        {({ isActive }) => (
          <>
            <Icon
              className={`w-4 h-4 shrink-0 transition-colors ${
                isActive
                  ? 'text-[#FF6F61]'
                  : link.highlight
                  ? 'text-[#FF6F61]'
                  : 'text-[#8E8B92]'
              }`}
            />
            <span className="truncate">{link.label}</span>
          </>
        )}
      </NavLink>
    );
  };

  const content = (
    <div className="flex flex-col justify-between h-full p-4 sm:p-5 overflow-y-auto">
      <div className="space-y-6">
        {/* Mobile Header with close button */}
        <div className="flex items-center justify-between pb-1 px-2 md:hidden">
          <span className="text-xs font-bold text-[#29282B]">Navigation</span>
          {onClose && (
            <button
              onClick={onClose}
              className="p-1.5 rounded-full text-[#8E8B92] hover:text-[#29282B] hover:bg-white/80"
              aria-label="Close menu"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* WORKSPACE Section */}
        <div>
          <span className="block text-[10px] font-bold text-[#8E8B92] tracking-wider mb-2 px-3 uppercase">
            WORKSPACE
          </span>
          <nav className="flex flex-col gap-1">
            {workspaceLinks.map(renderNavLink)}
          </nav>
        </div>

        {/* ANALYSIS & EVIDENCE Section */}
        <div>
          <span className="block text-[10px] font-bold text-[#8E8B92] tracking-wider mb-2 px-3 uppercase">
            ANALYSIS & EVIDENCE
          </span>
          <nav className="flex flex-col gap-1">
            {analysisLinks.map(renderNavLink)}
          </nav>
        </div>

        {/* SYSTEM Section */}
        <div>
          <span className="block text-[10px] font-bold text-[#8E8B92] tracking-wider mb-2 px-3 uppercase">
            SYSTEM
          </span>
          <nav className="flex flex-col gap-1">
            {systemLinks.map(renderNavLink)}
          </nav>
        </div>
      </div>

      {/* Provenance Legend Widget */}
      <div className="mt-6 p-4 rounded-[22px] bg-white/70 border border-white/85 shadow-[0_4px_16px_rgba(41,40,43,0.03)] text-xs space-y-3">
        <div className="font-semibold text-[#29282B] flex items-center justify-between">
          <span className="text-[10px] uppercase tracking-wider text-[#8E8B92] font-bold">Evidence Taxonomy</span>
          <HelpCircle className="w-3.5 h-3.5 text-[#8E8B92]" />
        </div>
        <div className="space-y-2 text-[11px]">
          <div className="flex items-center gap-2 text-[#0D9488]">
            <span className="w-2 h-2 rounded-full bg-[#0D9488] shrink-0" />
            <FileCheck className="w-3.5 h-3.5 text-[#0D9488] shrink-0" />
            <span className="font-medium">Reported in paper</span>
          </div>
          <div className="flex items-center gap-2 text-[#7E22CE]">
            <span className="w-2 h-2 rounded-full bg-[#7E22CE] shrink-0" />
            <Sparkles className="w-3.5 h-3.5 text-[#7E22CE] shrink-0" />
            <span className="font-medium">AI interpretation</span>
          </div>
          <div className="flex items-center gap-2 text-[#D97706]">
            <span className="w-2 h-2 rounded-full bg-[#D97706] shrink-0" />
            <User className="w-3.5 h-3.5 text-[#D97706] shrink-0" />
            <span className="font-medium">User annotation</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden md:block w-64 glass-sidebar shrink-0 h-[calc(100vh-4.5rem)]">
        {content}
      </aside>

      {/* Mobile Drawer */}
      {isOpen && (
        <div className="fixed inset-0 z-50 md:hidden flex">
          <div
            className="fixed inset-0 bg-[#29282B]/20 backdrop-blur-xs transition-opacity"
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
