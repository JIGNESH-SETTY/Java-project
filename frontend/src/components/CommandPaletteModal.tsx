import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Search,
  BookOpen,
  GitBranch,
  Layers,
  FileSpreadsheet,
  UploadCloud,
  FileCheck2,
  FolderKanban,
  Settings,
  Sun,
  Moon,
  ArrowRight,
  Sparkles,
  Command,
  X,
} from 'lucide-react';
import { useTheme } from '../context/ThemeContext';

interface CommandItem {
  id: string;
  title: string;
  category: 'Navigation' | 'Actions' | 'Tools';
  icon: React.ComponentType<{ className?: string }>;
  shortcut?: string;
  action: () => void;
  keywords?: string[];
}

interface CommandPaletteModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const CommandPaletteModal: React.FC<CommandPaletteModalProps> = ({ isOpen, onClose }) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  const commands: CommandItem[] = [
    {
      id: 'nav-dashboard',
      title: 'Workspace Dashboard',
      category: 'Navigation',
      icon: Layers,
      shortcut: 'G D',
      action: () => { navigate('/'); onClose(); },
      keywords: ['home', 'overview', 'metrics', 'stats'],
    },
    {
      id: 'nav-library',
      title: 'Research Paper Library',
      category: 'Navigation',
      icon: BookOpen,
      shortcut: 'G L',
      action: () => { navigate('/library'); onClose(); },
      keywords: ['papers', 'documents', 'pdf', 'catalog'],
    },
    {
      id: 'nav-import',
      title: 'Import New Scholarly Paper',
      category: 'Actions',
      icon: UploadCloud,
      shortcut: '⌘ I',
      action: () => { navigate('/import'); onClose(); },
      keywords: ['upload', 'pdf', 'doi', 'bibtex', 'ingest'],
    },
    {
      id: 'nav-search',
      title: 'Deep Semantic & Lexical Search',
      category: 'Navigation',
      icon: Search,
      shortcut: '⌘ S',
      action: () => { navigate('/search'); onClose(); },
      keywords: ['vector', 'hybrid', 'query', 'chunks', 'evidence'],
    },
    {
      id: 'nav-compare',
      title: 'Multi-Paper Methodology Comparison',
      category: 'Tools',
      icon: FileSpreadsheet,
      action: () => { navigate('/compare'); onClose(); },
      keywords: ['matrix', 'benchmark', 'metrics', 'datasets', 'results'],
    },
    {
      id: 'nav-claims',
      title: 'Claim & Evidence Explorer',
      category: 'Tools',
      icon: Sparkles,
      shortcut: 'G C',
      action: () => { navigate('/claims'); onClose(); },
      keywords: ['supports', 'contradicts', 'qualifies', 'scientific claims'],
    },
    {
      id: 'nav-citation-graph',
      title: 'Citation Network Graph (Cytoscape)',
      category: 'Tools',
      icon: GitBranch,
      action: () => { navigate('/graph/citations'); onClose(); },
      keywords: ['cites', 'cited-by', 'network', 'references'],
    },
    {
      id: 'nav-concept-graph',
      title: 'Concept & Evidence Knowledge Graph',
      category: 'Tools',
      icon: Layers,
      action: () => { navigate('/graph/concepts'); onClose(); },
      keywords: ['knowledge graph', 'relationships', 'react flow', 'entities'],
    },
    {
      id: 'nav-reviews',
      title: 'Evidence-Backed Literature Reviews',
      category: 'Tools',
      icon: FileCheck2,
      action: () => { navigate('/reviews'); onClose(); },
      keywords: ['synthesis', 'markdown', 'export', 'latex'],
    },
    {
      id: 'nav-collections',
      title: 'Scholarly Collections',
      category: 'Navigation',
      icon: FolderKanban,
      action: () => { navigate('/collections'); onClose(); },
      keywords: ['folders', 'projects', 'tags', 'groups'],
    },
    {
      id: 'nav-settings',
      title: 'AI Provider & Engine Settings',
      category: 'Navigation',
      icon: Settings,
      action: () => { navigate('/settings'); onClose(); },
      keywords: ['ollama', 'gemini', 'openai', 'claude', 'models', 'api keys'],
    },
    {
      id: 'action-theme',
      title: theme === 'dark' ? 'Switch to Crisp Titanium Light Mode' : 'Switch to Pure Obsidian Dark Mode',
      category: 'Actions',
      icon: theme === 'dark' ? Sun : Moon,
      shortcut: '⌘ T',
      action: () => { toggleTheme(); onClose(); },
      keywords: ['dark', 'light', 'theme', 'color', 'palette'],
    },
  ];

  const filtered = commands.filter((cmd) => {
    const q = query.toLowerCase().trim();
    if (!q) return true;
    return (
      cmd.title.toLowerCase().includes(q) ||
      cmd.category.toLowerCase().includes(q) ||
      cmd.keywords?.some((k) => k.toLowerCase().includes(q))
    );
  });

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setSelectedIndex(0);
      setTimeout(() => inputRef.current?.focus(), 50);
    }
  }, [isOpen]);

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Handle keyboard navigation
  useEffect(() => {
    if (!isOpen) return;
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : 0));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : filtered.length - 1));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        } else if (query.trim()) {
          navigate(`/search?q=${encodeURIComponent(query.trim())}`);
          onClose();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, query, navigate, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 sm:pt-28 p-4">
      {/* Blurred Backdrop with Refraction */}
      <div
        className="fixed inset-0 bg-slate-900/40 dark:bg-black/60 backdrop-blur-md transition-opacity animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Floating Spotlight Glass Island */}
      <div className="relative w-full max-w-xl rounded-3xl backdrop-blur-2xl bg-white/92 dark:bg-[#212832]/95 border border-[#DFD1B7] dark:border-[#393D46] shadow-[0_25px_60px_-15px_rgba(33,40,50,0.20)] dark:shadow-[0_30px_70px_-15px_rgba(0,0,0,0.85)] overflow-hidden z-10 animate-scale-up">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-5 py-4 border-b border-[#E6DDCF] dark:border-[#393D46]">
          <div className="w-8 h-8 rounded-xl bg-[#DFD1B7]/40 dark:bg-[#393D46] border border-[#DFD1B7] dark:border-[#948878]/30 text-[#212832] dark:text-[#DFD1B7] flex items-center justify-center shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search papers, or jump to view..."
            className="flex-1 bg-transparent text-sm sm:text-base font-medium text-slate-900 dark:text-[#F5EFE6] placeholder:text-slate-400 dark:placeholder:text-slate-500 outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 transition"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-lg bg-slate-100 dark:bg-[#181C22] text-[10px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200 dark:border-slate-700">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          )}
        </div>

        {/* Command List View */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto p-2.5 space-y-1">
          {filtered.length === 0 ? (
            <div className="py-10 text-center px-4">
              <p className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                No commands matching "{query}"
              </p>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-1">
                Press <span className="font-mono font-semibold text-[#212832] dark:text-[#DFD1B7]">Enter</span> to run a full hybrid semantic search for this query across all ingested papers.
              </p>
            </div>
          ) : (
            filtered.map((item, idx) => {
              const Icon = item.icon;
              const isSelected = idx === selectedIndex;
              return (
                <button
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-[#DFD1B7]/40 dark:bg-[#DFD1B7]/15 border border-[#DFD1B7] dark:border-[#948878]/40 shadow-2xs'
                      : 'hover:bg-slate-50/80 dark:hover:bg-slate-800/40 border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-xl flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#212832] dark:bg-[#DFD1B7] text-[#FAF7F2] dark:text-[#181C22] shadow-2xs'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-semibold truncate ${
                          isSelected
                            ? 'text-[#212832] dark:text-[#DFD1B7]'
                            : 'text-slate-800 dark:text-slate-200'
                        }`}
                      >
                        {item.title}
                      </div>
                      <div className="text-[10px] text-slate-400 dark:text-slate-500 uppercase tracking-wider font-medium">
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.shortcut && (
                      <span className="hidden sm:inline-block px-2 py-0.5 rounded-md bg-white dark:bg-slate-800 text-[10px] font-mono text-slate-500 dark:text-slate-400 border border-slate-200/80 dark:border-slate-700">
                        {item.shortcut}
                      </span>
                    )}
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected
                          ? 'text-[#212832] dark:text-[#DFD1B7] translate-x-0.5'
                          : 'text-slate-300 dark:text-slate-600'
                      }`}
                    />
                  </div>
                </button>
              );
            })
          )}
        </div>

        {/* Footer Shortcut Helper */}
        <div className="px-5 py-2.5 bg-slate-50/80 dark:bg-slate-950/60 border-t border-slate-100 dark:border-slate-800/80 flex items-center justify-between text-[11px] text-slate-500 dark:text-slate-400 font-medium">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">↑</kbd> <kbd className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">↓</kbd> to navigate</span>
            <span><kbd className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">↵</kbd> to select</span>
          </div>
          <span><kbd className="font-mono bg-white dark:bg-slate-800 px-1.5 py-0.5 rounded border border-slate-200 dark:border-slate-700 shadow-2xs">esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};

