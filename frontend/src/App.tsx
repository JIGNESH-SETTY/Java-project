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
      <div className="h-screen w-screen flex items-center justify-center bg-[#F7F9FB] dark:bg-[#091920] transition-colors">
        <div className="flex flex-col items-center gap-3.5 smooth-page-load">
          <img src="/logo.png" alt="RINNE Logo" className="w-12 h-12 rounded-2xl object-contain shadow-md animate-pulse" />
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 border-2 border-[#0F4C5C] dark:border-[#38BDF8] border-t-transparent rounded-full animate-spin" />
            <p className="text-xs font-semibold tracking-wide text-[#334155] dark:text-[#8EB3C2]">
              Initializing RINNE Research Engine...
            </p>
          </div>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="relative h-screen w-screen flex font-sans antialiased text-[#334155] dark:text-[#C4DDE5] selection:bg-[#0F4C5C] selection:text-white overflow-hidden bg-[#F7F9FB] dark:bg-[#091920] transition-colors duration-200">
      {/* Ambient Lighting for Depth */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-40 -left-20 w-[600px] h-[600px] rounded-full bg-[#0F4C5C]/5 dark:bg-[#197B94]/10 blur-[130px] animate-pulse-slow" />
        <div className="absolute -top-20 -right-20 w-[550px] h-[550px] rounded-full bg-[#DCEBEE]/50 dark:bg-[#0E2D38]/30 blur-[140px] animate-pulse-slow" />
        <div className="absolute -bottom-40 left-1/3 w-[650px] h-[450px] rounded-full bg-[#C9A96A]/6 dark:bg-[#C9A96A]/8 blur-[150px]" />
      </div>

      {/* Persistent Floating Sidebar (14px Radius) */}
      <Sidebar
        isOpen={isMobileNavOpen}
        onClose={() => setIsMobileNavOpen(false)}
        onOpenCommandPalette={() => setIsCommandPaletteOpen(true)}
      />

      {/* Main Workspace Stage */}
      <div className="relative flex-1 min-w-0 h-full flex flex-col overflow-hidden z-10">
        {/* Mobile Header Bar (Only visible on small screens < md) */}
        <div className="md:hidden flex items-center justify-between px-4 py-3 border-b border-[#D9E1E9] dark:border-[#1E4656] bg-white/80 dark:bg-[#0D222B]/80 backdrop-blur-xl shrink-0">
          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsMobileNavOpen(true)}
              className="p-2 rounded-lg text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition cursor-pointer"
              aria-label="Open menu"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div className="flex items-center gap-2">
              <img src="/logo.png" alt="RINNE Logo" className="w-7 h-7 rounded-lg object-contain shadow-xs" />
              <span className="font-extrabold text-sm text-[#0B2A33] dark:text-[#E0F2F6]">
                RINNE
              </span>
              <span className="tag-engine">ENGINE</span>
            </div>
          </div>
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="p-1 rounded-lg text-slate-500 hover:text-[#0F4C5C] dark:text-slate-400 dark:hover:text-[#38BDF8] hover:bg-slate-100 dark:hover:bg-slate-800 transition"
            title="Search"
          >
            <div className="flex items-center gap-1 shrink-0 select-none">
              <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-[4px] border border-[#D9E1E9] dark:border-[#1E4656] text-[#5B6B7D] dark:text-[#8EB3C2] bg-[#F7F9FB] dark:bg-[#091920] text-[10px] font-mono font-bold leading-none">
                ⌘
              </kbd>
              <kbd className="inline-flex items-center justify-center min-w-[18px] h-[18px] px-1 rounded-[4px] border border-[#D9E1E9] dark:border-[#1E4656] text-[#5B6B7D] dark:text-[#8EB3C2] bg-[#F7F9FB] dark:bg-[#091920] text-[10px] font-mono font-bold leading-none">
                K
              </kbd>
            </div>
          </button>
        </div>

        {/* Viewport Content Area */}
        <main className="flex-1 min-w-0 h-full overflow-y-auto px-4 sm:px-8 py-5 smooth-page-load">
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
