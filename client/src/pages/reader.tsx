import { useState, useEffect, useCallback } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { 
  ChevronLeft, 
  ChevronRight, 
  Home, 
  Settings, 
  X,
  Maximize2,
  Minimize2,
  ZoomIn,
  ZoomOut
} from "lucide-react";
import type { Series, Chapter } from "@shared/schema";
import { cn } from "@/lib/utils";

interface ReaderPageProps {
  seriesId: string;
  chapterId: string;
  onProgressChange?: (progress: number) => void;
  onReadingStateChange?: (isReading: boolean) => void;
}

export function ReaderPage({ 
  seriesId, 
  chapterId, 
  onProgressChange, 
  onReadingStateChange 
}: ReaderPageProps) {
  const [, setLocation] = useLocation();
  const [currentPage, setCurrentPage] = useState(0);
  const [showControls, setShowControls] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(100);

  const { data: series } = useQuery<Series>({
    queryKey: ["/api/series", seriesId],
  });

  const { data: chapters = [] } = useQuery<Chapter[]>({
    queryKey: ["/api/series", seriesId, "chapters"],
  });

  const { data: chapter, isLoading } = useQuery<Chapter>({
    queryKey: ["/api/chapters", chapterId],
  });

  const sortedChapters = [...chapters].sort((a, b) => a.chapterNumber - b.chapterNumber);
  const currentChapterIndex = sortedChapters.findIndex((c) => c.id === chapterId);
  const prevChapter = currentChapterIndex > 0 ? sortedChapters[currentChapterIndex - 1] : null;
  const nextChapter = currentChapterIndex < sortedChapters.length - 1 ? sortedChapters[currentChapterIndex + 1] : null;

  const pages = chapter?.pages || [];
  const totalPages = pages.length;

  useEffect(() => {
    onReadingStateChange?.(true);
    return () => onReadingStateChange?.(false);
  }, [onReadingStateChange]);

  useEffect(() => {
    if (totalPages > 0) {
      const progress = ((currentPage + 1) / totalPages) * 100;
      onProgressChange?.(progress);
    }
  }, [currentPage, totalPages, onProgressChange]);

  useEffect(() => {
    setCurrentPage(0);
  }, [chapterId]);

  const goToPrevPage = useCallback(() => {
    if (currentPage > 0) {
      setCurrentPage((p) => p - 1);
    } else if (prevChapter) {
      setLocation(`/read/${seriesId}/${prevChapter.id}`);
    }
  }, [currentPage, prevChapter, seriesId, setLocation]);

  const goToNextPage = useCallback(() => {
    if (currentPage < totalPages - 1) {
      setCurrentPage((p) => p + 1);
    } else if (nextChapter) {
      setLocation(`/read/${seriesId}/${nextChapter.id}`);
    }
  }, [currentPage, totalPages, nextChapter, seriesId, setLocation]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") goToPrevPage();
      if (e.key === "ArrowRight") goToNextPage();
      if (e.key === "Escape") setShowControls((s) => !s);
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToPrevPage, goToNextPage]);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const handleChapterChange = (value: string) => {
    setLocation(`/read/${seriesId}/${value}`);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <Skeleton className="w-full max-w-4xl aspect-[3/4]" />
      </div>
    );
  }

  if (!chapter) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Bölüm bulunamadı</h1>
          <Link href={`/series/${seriesId}`}>
            <Button>Seriye Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div 
      className="min-h-screen bg-black relative select-none"
      onClick={() => setShowControls((s) => !s)}
      data-testid="page-reader"
    >
      <div 
        className={cn(
          "fixed top-0 left-0 right-0 z-50 bg-gradient-to-b from-black/80 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Link href={`/series/${seriesId}`}>
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <X className="w-5 h-5" />
              </Button>
            </Link>
            <div className="hidden sm:block">
              <p className="text-white text-sm font-medium line-clamp-1">
                {series?.title}
              </p>
              <p className="text-white/60 text-xs">
                Bölüm {chapter.chapterNumber}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Select value={chapterId} onValueChange={handleChapterChange}>
              <SelectTrigger className="w-40 bg-white/10 border-white/20 text-white">
                <SelectValue placeholder="Bölüm seç" />
              </SelectTrigger>
              <SelectContent>
                {sortedChapters.map((ch) => (
                  <SelectItem key={ch.id} value={ch.id}>
                    Bölüm {ch.chapterNumber}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Link href="/">
              <Button variant="ghost" size="icon" className="text-white hover:bg-white/20">
                <Home className="w-5 h-5" />
              </Button>
            </Link>
          </div>
        </div>
      </div>

      <div className="min-h-screen flex items-center justify-center px-4 py-16">
        {pages.length > 0 ? (
          <div className="relative">
            <button
              className="absolute left-0 top-0 w-1/3 h-full z-10 cursor-w-resize"
              onClick={(e) => {
                e.stopPropagation();
                goToPrevPage();
              }}
              data-testid="button-prev-page"
            />
            <button
              className="absolute right-0 top-0 w-1/3 h-full z-10 cursor-e-resize"
              onClick={(e) => {
                e.stopPropagation();
                goToNextPage();
              }}
              data-testid="button-next-page"
            />
            <img
              src={pages[currentPage]}
              alt={`Sayfa ${currentPage + 1}`}
              className="max-h-[90vh] w-auto mx-auto"
              style={{ transform: `scale(${zoom / 100})` }}
              draggable={false}
            />
          </div>
        ) : (
          <div className="text-center text-white">
            <p className="text-lg">Bu bölümde sayfa bulunmuyor</p>
          </div>
        )}
      </div>

      <div 
        className={cn(
          "fixed bottom-0 left-0 right-0 z-50 bg-gradient-to-t from-black/80 to-transparent p-4 transition-opacity duration-300",
          showControls ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="max-w-4xl mx-auto flex items-center justify-between gap-4">
          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={goToPrevPage}
            disabled={currentPage === 0 && !prevChapter}
            data-testid="button-prev"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setZoom((z) => Math.max(50, z - 10))}
              >
                <ZoomOut className="w-4 h-4" />
              </Button>
              <span className="text-white text-sm w-12 text-center">{zoom}%</span>
              <Button
                variant="ghost"
                size="icon"
                className="text-white hover:bg-white/20"
                onClick={() => setZoom((z) => Math.min(200, z + 10))}
              >
                <ZoomIn className="w-4 h-4" />
              </Button>
            </div>

            <div className="text-white text-sm">
              {currentPage + 1} / {totalPages}
            </div>

            <Button
              variant="ghost"
              size="icon"
              className="text-white hover:bg-white/20"
              onClick={toggleFullscreen}
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </Button>
          </div>

          <Button
            variant="ghost"
            size="icon"
            className="text-white hover:bg-white/20"
            onClick={goToNextPage}
            disabled={currentPage === totalPages - 1 && !nextChapter}
            data-testid="button-next"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>
        </div>
      </div>
    </div>
  );
}
