import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Navbar } from './components/Navbar';
import { Sidebar } from './components/Sidebar';
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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center text-[#77747A]">
        <div className="flex flex-col items-center gap-3">
          <div className="w-8 h-8 border-3 border-[#FF6F61] border-t-transparent rounded-full animate-spin" />
          <p className="text-xs font-medium tracking-wide">Initializing Scholarly Discovery Workspace...</p>
        </div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen flex flex-col font-sans antialiased text-[#29282B] selection:bg-[#FF6F61] selection:text-white relative">
      {/* Pink-Lavender Bottom Ambient Glow */}
      <div
        className="fixed bottom-0 left-0 right-0 h-64 pointer-events-none opacity-35 z-0"
        style={{
          background: 'linear-gradient(to top, rgba(220, 190, 255, 0.45) 0%, rgba(255, 195, 215, 0.2) 60%, transparent 100%)',
          filter: 'blur(45px)',
        }}
      />
      <div className="relative z-10 flex flex-col flex-1 overflow-hidden">
        <Navbar onToggleSidebar={() => setIsMobileNavOpen((prev) => !prev)} />
        <div className="flex flex-1 overflow-hidden">
          <Sidebar isOpen={isMobileNavOpen} onClose={() => setIsMobileNavOpen(false)} />
          <main className="flex-1 overflow-y-auto">
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
      </div>
    </div>
  );
};

export const App: React.FC = () => {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <BrowserRouter>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/register" element={<RegisterPage />} />
            <Route path="/*" element={<ProtectedLayout />} />
          </Routes>
        </BrowserRouter>
      </AuthProvider>
    </QueryClientProvider>
  );
};

export default App;
