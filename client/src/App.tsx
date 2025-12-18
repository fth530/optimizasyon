import { useState, useCallback } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { ThemeProvider } from "@/lib/theme";
import { AuthProvider } from "@/lib/auth";
import { SplashScreen } from "@/components/splash-screen";
import { Navbar } from "@/components/navbar";
import { MobileNav } from "@/components/mobile-nav";
import { LoginModal } from "@/components/login-modal";
import { SearchModal, type SearchFilters } from "@/components/search-modal";
import { HomePage } from "@/pages/home";
import { SeriesDetailPage } from "@/pages/series-detail";
import { ReaderPage } from "@/pages/reader";
import { ProfilePage } from "@/pages/profile";
import { AdminPage } from "@/pages/admin";
import { LibraryPage } from "@/pages/library";
import NotFound from "@/pages/not-found";

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showSearchModal, setShowSearchModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [filters, setFilters] = useState<SearchFilters>({
    query: "",
    genres: [],
    status: "all",
  });
  const [readingProgress, setReadingProgress] = useState(0);
  const [isReading, setIsReading] = useState(false);

  const handleSplashComplete = useCallback(() => {
    setShowSplash(false);
  }, []);

  const handleApplyFilters = useCallback((newFilters: SearchFilters) => {
    setFilters(newFilters);
    setSearchQuery(newFilters.query);
  }, []);

  return (
    <div className="min-h-screen bg-background text-foreground">
      {showSplash && <SplashScreen onComplete={handleSplashComplete} />}

      <Navbar
        onLoginClick={() => setShowLoginModal(true)}
        onSearchClick={() => setShowSearchModal(true)}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
        readingProgress={readingProgress}
        isReading={isReading}
      />

      <MobileNav onSearchClick={() => setShowSearchModal(true)} />

      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
      />

      <SearchModal
        isOpen={showSearchModal}
        onClose={() => setShowSearchModal(false)}
        onApply={handleApplyFilters}
        initialFilters={filters}
      />

      <Switch>
        <Route path="/">
          <HomePage searchQuery={searchQuery} filters={filters} />
        </Route>
        <Route path="/series/:id">
          {(params) => <SeriesDetailPage id={params.id} />}
        </Route>
        <Route path="/read/:seriesId/:chapterId">
          {(params) => (
            <ReaderPage
              seriesId={params.seriesId}
              chapterId={params.chapterId}
              onProgressChange={setReadingProgress}
              onReadingStateChange={setIsReading}
            />
          )}
        </Route>
        <Route path="/profile" component={ProfilePage} />
        <Route path="/favorites" component={ProfilePage} />
        <Route path="/admin" component={AdminPage} />
        <Route path="/library" component={LibraryPage} />
        <Route component={NotFound} />
      </Switch>

      <Toaster />
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <AuthProvider>
          <TooltipProvider>
            <AppContent />
          </TooltipProvider>
        </AuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
