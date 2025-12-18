import { Link } from "wouter";
import { Badge } from "@/components/ui/badge";
import { Star, Eye, Clock } from "lucide-react";
import type { Series } from "@shared/schema";
import { cn } from "@/lib/utils";

interface MangaCardProps {
  series: Series;
  showBadge?: boolean;
}

export function MangaCard({ series, showBadge = true }: MangaCardProps) {
  const statusLabels: Record<string, string> = {
    ongoing: "Devam Ediyor",
    completed: "Tamamlandı",
    hiatus: "Ara Verildi",
  };

  const statusColors: Record<string, string> = {
    ongoing: "bg-green-500/20 text-green-400 border-green-500/30",
    completed: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    hiatus: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
  };

  return (
    <Link href={`/series/${series.id}`}>
      <a
        className="group block relative aspect-[2/3] rounded-md overflow-hidden bg-muted hover-elevate"
        data-testid={`card-series-${series.id}`}
      >
        {series.coverImage ? (
          <img
            src={series.coverImage}
            alt={series.title}
            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            loading="lazy"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-primary/20 to-purple-600/20">
            <span className="text-4xl font-bold text-primary/50">{series.title.charAt(0)}</span>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        <div className="absolute inset-x-0 bottom-0 p-3 translate-y-2 group-hover:translate-y-0 opacity-0 group-hover:opacity-100 transition-all duration-300">
          <h3 className="text-sm font-semibold text-white line-clamp-2 mb-1">
            {series.title}
          </h3>
          
          <div className="flex items-center gap-2 text-xs text-white/80">
            {series.rating && series.rating > 0 && (
              <span className="flex items-center gap-1">
                <Star className="w-3 h-3 fill-yellow-400 text-yellow-400" />
                {(series.rating / 10).toFixed(1)}
              </span>
            )}
            {series.views && series.views > 0 && (
              <span className="flex items-center gap-1">
                <Eye className="w-3 h-3" />
                {series.views > 1000 ? `${(series.views / 1000).toFixed(1)}K` : series.views}
              </span>
            )}
          </div>
        </div>

        {showBadge && series.status && (
          <Badge
            variant="outline"
            className={cn(
              "absolute top-2 left-2 text-[10px] px-1.5 py-0.5",
              statusColors[series.status]
            )}
          >
            {statusLabels[series.status]}
          </Badge>
        )}

        {series.isTrending && (
          <Badge className="absolute top-2 right-2 bg-primary text-[10px] px-1.5 py-0.5">
            Trend
          </Badge>
        )}
      </a>
    </Link>
  );
}
