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
      <div className="relative w-full max-w-xl rounded-[14px] bg-white dark:bg-[#122B36] border border-[#D9E1E9] dark:border-[#1E4656] shadow-[0_20px_50px_-12px_rgba(11,42,51,0.20)] dark:shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] overflow-hidden z-10 animate-scale-up">
        {/* Search Input Bar */}
        <div className="flex items-center gap-3 px-4 py-3.5 border-b border-[#D9E1E9] dark:border-[#1E4656]">
          <div className="w-8 h-8 rounded-[8px] bg-[#DCEBEE] dark:bg-[#1B4A59] border border-[#B7D9E2] dark:border-[#2A5A6E] text-[#0F4C5C] dark:text-[#E0F2F6] flex items-center justify-center shrink-0">
            <Search className="w-4 h-4" />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Type a command, search papers, or jump to view..."
            className="flex-1 bg-transparent text-sm font-medium text-[#0B2A33] dark:text-[#E0F2F6] placeholder:text-[#6B7785] dark:placeholder:text-[#8EB3C2] outline-none"
          />
          {query ? (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-md text-[#5B6B7D] hover:text-[#0B2A33] dark:hover:text-white transition"
              aria-label="Clear query"
            >
              <X className="w-4 h-4" />
            </button>
          ) : (
            <div className="flex items-center gap-1 px-2 py-0.5 rounded-[5px] bg-[#F7F9FB] dark:bg-[#091920] text-[10px] font-mono text-[#5B6B7D] dark:text-[#8EB3C2] border border-[#D9E1E9] dark:border-[#1E4656]">
              <Command className="w-3 h-3" />
              <span>K</span>
            </div>
          )}
        </div>

        {/* Command List View */}
        <div ref={listRef} className="max-h-[360px] overflow-y-auto p-2 space-y-0.5">
          {filtered.length === 0 ? (
            <div className="py-10 text-center px-4">
              <p className="text-xs font-semibold text-[#0B2A33] dark:text-[#E0F2F6]">
                No commands matching "{query}"
              </p>
              <p className="text-[11px] text-[#5B6B7D] dark:text-[#8EB3C2] mt-1">
                Press <span className="font-mono font-semibold text-[#0F4C5C] dark:text-[#38BDF8]">Enter</span> to run a full hybrid semantic search for this query across all ingested papers.
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
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-[9px] text-left transition-all duration-150 cursor-pointer ${
                    isSelected
                      ? 'bg-[#DCEBEE] dark:bg-[#1B4A59] border border-[#B7D9E2] dark:border-[#2A5A6E] shadow-2xs'
                      : 'hover:bg-[#F1F5F9] dark:hover:bg-[#163442] border border-transparent'
                  }`}
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div
                      className={`w-7 h-7 rounded-[7px] flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#0F4C5C] text-white shadow-2xs'
                          : 'bg-[#EEF2F6] dark:bg-[#163442] text-[#5B6B7D] dark:text-[#8EB3C2]'
                      }`}
                    >
                      <Icon className="w-3.5 h-3.5" />
                    </div>
                    <div className="min-w-0">
                      <div
                        className={`text-xs font-semibold truncate ${
                          isSelected
                            ? 'text-[#0F4C5C] dark:text-[#E0F2F6]'
                            : 'text-[#334155] dark:text-[#C4DDE5]'
                        }`}
                      >
                        {item.title}
                      </div>
                      <div className="text-[10px] text-[#5B6B7D] dark:text-[#8EB3C2] uppercase tracking-[0.08em] font-medium">
                        {item.category}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {item.shortcut && (
                      <span className="hidden sm:inline-block px-1.5 py-0.5 rounded-[5px] bg-[#F7F9FB] dark:bg-[#091920] text-[10px] font-mono text-[#5B6B7D] dark:text-[#8EB3C2] border border-[#D9E1E9] dark:border-[#1E4656]">
                        {item.shortcut}
                      </span>
                    )}
                    <ArrowRight
                      className={`w-3.5 h-3.5 transition-transform ${
                        isSelected
                          ? 'text-[#0F4C5C] dark:text-[#E0F2F6] translate-x-0.5'
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
        <div className="px-4 py-2.5 bg-[#EEF2F6] dark:bg-[#0D222B] border-t border-[#D9E1E9] dark:border-[#1E4656] flex items-center justify-between text-[11px] text-[#5B6B7D] dark:text-[#8EB3C2] font-medium">
          <div className="flex items-center gap-3">
            <span><kbd className="font-mono bg-white dark:bg-[#122B36] px-1.5 py-0.5 rounded border border-[#D9E1E9] dark:border-[#1E4656] shadow-2xs">↑</kbd> <kbd className="font-mono bg-white dark:bg-[#122B36] px-1.5 py-0.5 rounded border border-[#D9E1E9] dark:border-[#1E4656] shadow-2xs">↓</kbd> to navigate</span>
            <span><kbd className="font-mono bg-white dark:bg-[#122B36] px-1.5 py-0.5 rounded border border-[#D9E1E9] dark:border-[#1E4656] shadow-2xs">↵</kbd> to select</span>
          </div>
          <span><kbd className="font-mono bg-white dark:bg-[#122B36] px-1.5 py-0.5 rounded border border-[#D9E1E9] dark:border-[#1E4656] shadow-2xs">esc</kbd> to close</span>
        </div>
      </div>
    </div>
  );
};

