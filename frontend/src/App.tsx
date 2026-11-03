import React, { useState, useEffect } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { Sidebar } from './components/Sidebar';
import { CommandPaletteModal } from './components/CommandPaletteModal';
import { DashboardPage } from './pages/DashboardPage';
import { LibraryPage } from './pages/LibraryPage';
import { ImportPaperPage } from './pages/ImportPaperPage';
import { PaperDetailPage } from './pages/PaperDetailPage';
import { SearchWorkspacePage } from './pages/SearchWorkspacePage';
import { ComparisonPage } from './pages/ComparisonPage';
import { ClaimExplorerPage } from './pages/ClaimExplorerPage';
import { CitationGraphPage } from './pages/CitationGraphPage';
import { ConceptGraphPage } from './pages/ConceptGraphPage';
import { LiteratureReviewPage } from './pages/LiteratureReviewPage';
import { CollectionsPage } from './pages/CollectionsPage';
import { SettingsPage } from './pages/SettingsPage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';
import { Menu } from 'lucide-react';

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
      staleTime: 1000 * 60 * 2, // 2 minutes
    },
  },
});

const ProtectedLayout: React.FC = () => {
  const { isAuthenticated, loading } = useAuth();
  const [isMobileNavOpen, setIsMobileNavOpen] = useState(false);
  const [isCommandPaletteOpen, setIsCommandPaletteOpen] = useState(false);

  // Global keyboard shortcut for Command Palette: Ctrl+K or Cmd+K
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setIsCommandPaletteOpen((prev) => !prev);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  if (loading) {
    return (
      <div className="h-screen w-screen flex items-center justify-center text-slate-500 bg-slate-50 dark:bg-[#030712]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-semibold tracking-wide text-slate-600 dark:text-slate-400">
            Initializing Scholarly Discovery Workspace...
          </p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="relative h-screen w-screen flex font-sans antialiased text-slate-900 dark:text-slate-100 selection:bg-blue-600 selection:text-white overflow-hidden bg-slate-50 dark:bg-[#030712] transition-colors duration-200">
      {/* Ambient Aurora Gradient Spheres for Optical Glass Refraction */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-20 w-[600px] h-[600px] rounded-full bg-blue-500/10 dark:bg-blue-600/15 blur-[130px] animate-pulse-slow" />
        <div className="absolute -top-20 -right-20 w-[550px] h-[550px] rounded-full bg-teal-500/10 dark:bg-indigo-600/15 blur-[140px] animate-pulse-slow" />
        <div className="absolute -bottom-40 left-1/3 w-[650px] h-[450px] rounded-full bg-indigo-500/8 dark:bg-violet-600/12 blur-[150px]" />
      </div>

      {/* Persistent Floating Glass Sidebar Command Center */}
      <Sidebar
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Workspace Stage */}
      <div className="relative flex-1 min-w-0 h-full flex flex-col overflow-hidden z-10">
        {/* Mobile Header Bar (Only visible on small screens < md) */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-slate-200/80 dark:border-slate-800/80 bg-white/70 dark:bg-slate-900/70 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="p-2 rounded-xl text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <div className="sense-orb-icon w-6 h-6" />
              <span className="font-extrabold text-xs text-slate-900 dark:text-slate-100">
                AI Research Engine
              </span>
            </div>
          </div>
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="p-2 rounded-xl text-slate-500 hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-400 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Search"
          >
            <span className="text-xs font-mono font-bold bg-slate-100 dark:bg-slate-800 px-2 py-1 rounded-lg border border-slate-200 dark:border-slate-700">⌘K</span>
          </button>
        </div>

        {/* Viewport Content Area */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto px-4 sm:px-8 py-5">
          <Routes>
            <Route path="/" element={<DashboardPage />} />
            <Route path="/library" element={<LibraryPage />} />
            <Route path="/import" element={<ImportPaperPage />} />
            <Route path="/papers/:paperId" element={<PaperDetailPage />} />
            <Route path="/search" element={<SearchWorkspacePage />} />
            <Route path="/compare" element={<ComparisonPage />} />
            <Route path="/claims" element={<ClaimExplorerPage />} />
            <Route path="/graph/citations" element={<CitationGraphPage />} />
            <Route path="/graph/concepts" element={<ConceptGraphPage />} />
            <Route path="/reviews" element={<LiteratureReviewPage />} />
            <Route path="/collections" element={<CollectionsPage />} />
            <Route path="/settings" element={<SettingsPage />} />
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
      </div>

      {/* Global Interactive Command Palette Spotlight Dialog */}
      <CommandPaletteModal
        isOpen={isCommandPaletteOpen}
        onClose={() => setIsCommandPaletteOpen(false)}
      />
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <BrowserRouter>
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              <Route path="/*" element={<ProtectedLayout />} />
            </Routes>
          </BrowserRouter>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
};

export default App;
