import { useState, useEffect } from "react";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Play, Star } from "lucide-react";
import type { Series } from "@shared/schema";
import { cn } from "@/lib/utils";

interface HeroCarouselProps {
  series: Series[];
}

export function HeroCarousel({ series }: HeroCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (series.length <= 1) return;
    
    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % series.length);
    }, 5000);

    return () => clearInterval(interval);
  }, [series.length]);

  if (series.length === 0) {
    return (
      <div className="relative h-96 lg:h-[500px] bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-muted-foreground">Henüz öne çıkan manga yok</h2>
        </div>
      </div>
    );
  }

  const currentSeries = series[currentIndex];

  const goToPrev = () => {
    setCurrentIndex((prev) => (prev - 1 + series.length) % series.length);
  };

  const goToNext = () => {
    setCurrentIndex((prev) => (prev + 1) % series.length);
  };

  return (
    <div className="relative h-96 lg:h-[500px] overflow-hidden" data-testid="hero-carousel">
      {series.map((item, index) => (
        <div
          key={item.id}
          className={cn(
            "absolute inset-0 transition-opacity duration-700",
            index === currentIndex ? "opacity-100" : "opacity-0 pointer-events-none"
          )}
        >
          {item.coverImage ? (
            <img
              src={item.coverImage}
              alt={item.title}
              className="w-full h-full object-cover"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-primary/30 to-purple-600/30" />
          )}
          
          <div className="absolute inset-0 bg-gradient-to-r from-black/90 via-black/60 to-transparent" />
        </div>
      ))}

      <div className="absolute inset-0 flex items-center">
        <div className="max-w-7xl mx-auto px-4 w-full">
          <div className="max-w-xl">
            <h1 className="text-3xl md:text-5xl font-bold text-white mb-4 line-clamp-2">
              {currentSeries.title}
            </h1>
            
            <div className="flex items-center gap-4 mb-4">
              {currentSeries.rating && currentSeries.rating > 0 && (
                <span className="flex items-center gap-1 text-yellow-400">
                  <Star className="w-5 h-5 fill-current" />
                  <span className="font-semibold">{(currentSeries.rating / 10).toFixed(1)}</span>
                </span>
              )}
              {currentSeries.genres && currentSeries.genres.length > 0 && (
                <span className="text-white/70">
                  {currentSeries.genres.slice(0, 3).join(" • ")}
                </span>
              )}
            </div>
            
            <p className="text-white/80 text-sm md:text-base line-clamp-3 mb-6">
              {currentSeries.description || "Bu manga hakkında açıklama bulunmuyor."}
            </p>
            
            <div className="flex gap-3">
              <Link href={`/series/${currentSeries.id}`}>
                <Button size="lg" className="gap-2" data-testid="button-read-now">
                  <Play className="w-4 h-4" />
                  Okumaya Başla
                </Button>
              </Link>
              <Link href={`/series/${currentSeries.id}`}>
                <Button size="lg" variant="outline" className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Detaylar
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </div>

      {series.length > 1 && (
        <>
          <Button
            variant="ghost"
            size="icon"
            className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
            onClick={goToPrev}
            data-testid="button-carousel-prev"
          >
            <ChevronLeft className="w-6 h-6" />
          </Button>
          
          <Button
            variant="ghost"
            size="icon"
            className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/30 hover:bg-black/50 text-white"
            onClick={goToNext}
            data-testid="button-carousel-next"
          >
            <ChevronRight className="w-6 h-6" />
          </Button>

          <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
            {series.map((_, index) => (
              <button
                key={index}
                className={cn(
                  "w-2 h-2 rounded-full transition-all",
                  index === currentIndex ? "bg-primary w-6" : "bg-white/50 hover:bg-white/80"
                )}
                onClick={() => setCurrentIndex(index)}
                data-testid={`button-carousel-dot-${index}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
}
