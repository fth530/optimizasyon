import { useQuery, useMutation } from "@tanstack/react-query";
import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import { MangaCard } from "@/components/manga-card";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Play, 
  Heart, 
  Star, 
  Eye, 
  Clock, 
  User as UserIcon,
  ChevronRight,
  BookOpen
} from "lucide-react";
import type { Series, Chapter } from "@shared/schema";

interface SeriesDetailPageProps {
  id: string;
}

export function SeriesDetailPage({ id }: SeriesDetailPageProps) {
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: series, isLoading: seriesLoading } = useQuery<Series>({
    queryKey: ["/api/series", id],
  });

  const { data: chapters = [], isLoading: chaptersLoading } = useQuery<Chapter[]>({
    queryKey: ["/api/series", id, "chapters"],
  });

  const { data: allSeries = [] } = useQuery<Series[]>({
    queryKey: ["/api/series"],
  });

  const { data: favorites = [] } = useQuery<{ seriesId: string }[]>({
    queryKey: ["/api/favorites", { userId: user?.id }],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/favorites?userId=${user.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  const isFavorite = favorites.some((f) => f.seriesId === id);

  const toggleFavoriteMutation = useMutation({
    mutationFn: async () => {
      if (!user) throw new Error("Not authenticated");
      if (isFavorite) {
        return apiRequest("DELETE", `/api/favorites/${id}?userId=${user.id}`);
      } else {
        return apiRequest("POST", "/api/favorites", { userId: user.id, seriesId: id });
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/favorites", { userId: user?.id }] });
      toast({
        title: isFavorite ? "Favorilerden kaldırıldı" : "Favorilere eklendi",
      });
    },
  });

  const relatedSeries = allSeries
    .filter((s) => s.id !== id && s.genres?.some((g) => series?.genres?.includes(g)))
    .slice(0, 6);

  const sortedChapters = [...chapters].sort((a, b) => b.chapterNumber - a.chapterNumber);
  const firstChapter = chapters.length > 0 
    ? chapters.reduce((min, ch) => ch.chapterNumber < min.chapterNumber ? ch : min, chapters[0])
    : null;

  if (seriesLoading) {
    return (
      <div className="pt-16 pb-20 md:pb-8 min-h-screen">
        <div className="h-64 bg-muted animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid lg:grid-cols-3 gap-8">
            <Skeleton className="aspect-[2/3] rounded-lg" />
            <div className="lg:col-span-2 space-y-4">
              <Skeleton className="h-10 w-3/4" />
              <Skeleton className="h-4 w-1/2" />
              <Skeleton className="h-32" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!series) {
    return (
      <div className="pt-16 pb-20 md:pb-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Manga bulunamadı</h1>
          <p className="text-muted-foreground mb-4">Bu manga mevcut değil veya kaldırılmış olabilir.</p>
          <Link href="/">
            <Button>Ana Sayfaya Dön</Button>
          </Link>
        </div>
      </div>
    );
  }

  const statusLabels: Record<string, string> = {
    ongoing: "Devam Ediyor",
    completed: "Tamamlandı",
    hiatus: "Ara Verildi",
  };

  return (
    <div className="pt-16 pb-20 md:pb-8 min-h-screen" data-testid="page-series-detail">
      <div className="relative h-64 overflow-hidden">
        {series.coverImage ? (
          <img
            src={series.coverImage}
            alt={series.title}
            className="w-full h-full object-cover blur-xl scale-110 opacity-50"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-br from-primary/30 to-purple-600/30" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background to-transparent" />
      </div>

      <div className="max-w-7xl mx-auto px-4 -mt-32 relative z-10">
        <div className="grid lg:grid-cols-3 gap-8">
          <div className="space-y-4">
            <div className="aspect-[2/3] rounded-lg overflow-hidden shadow-2xl">
              {series.coverImage ? (
                <img
                  src={series.coverImage}
                  alt={series.title}
                  className="w-full h-full object-cover"
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
                  <span className="text-6xl font-bold text-primary/50">{series.title.charAt(0)}</span>
                </div>
              )}
            </div>
            
            <div className="flex gap-2">
              {firstChapter && (
                <Link href={`/read/${series.id}/${firstChapter.id}`} className="flex-1">
                  <Button className="w-full gap-2" size="lg" data-testid="button-start-reading">
                    <Play className="w-4 h-4" />
                    Okumaya Başla
                  </Button>
                </Link>
              )}
              {user && (
                <Button
                  variant={isFavorite ? "default" : "outline"}
                  size="lg"
                  onClick={() => toggleFavoriteMutation.mutate()}
                  disabled={toggleFavoriteMutation.isPending}
                  data-testid="button-toggle-favorite"
                >
                  <Heart className={isFavorite ? "w-4 h-4 fill-current" : "w-4 h-4"} />
                </Button>
              )}
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div>
              <h1 className="text-3xl md:text-4xl font-bold mb-2">{series.title}</h1>
              
              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground mb-4">
                {series.author && (
                  <span className="flex items-center gap-1">
                    <UserIcon className="w-4 h-4" />
                    {series.author}
                  </span>
                )}
                {series.rating && series.rating > 0 && (
                  <span className="flex items-center gap-1 text-yellow-500">
                    <Star className="w-4 h-4 fill-current" />
                    {(series.rating / 10).toFixed(1)}
                  </span>
                )}
                {series.views && series.views > 0 && (
                  <span className="flex items-center gap-1">
                    <Eye className="w-4 h-4" />
                    {series.views.toLocaleString()} görüntülenme
                  </span>
                )}
                {series.status && (
                  <Badge variant="outline">{statusLabels[series.status]}</Badge>
                )}
              </div>
              
              <div className="flex flex-wrap gap-2 mb-4">
                {series.genres?.map((genre) => (
                  <Badge key={genre} variant="secondary">
                    {genre}
                  </Badge>
                ))}
              </div>
              
              <p className="text-muted-foreground leading-relaxed">
                {series.description || "Bu manga hakkında açıklama bulunmuyor."}
              </p>
            </div>

            <Separator />

            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-semibold flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-primary" />
                  Bölümler
                </h2>
                <span className="text-sm text-muted-foreground">
                  {chapters.length} bölüm
                </span>
              </div>
              
              {chaptersLoading ? (
                <div className="space-y-2">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Skeleton key={i} className="h-14" />
                  ))}
                </div>
              ) : chapters.length > 0 ? (
                <ScrollArea className="h-80">
                  <div className="space-y-2 pr-4">
                    {sortedChapters.map((chapter) => (
                      <Link key={chapter.id} href={`/read/${series.id}/${chapter.id}`}>
                        <Card className="p-4 hover-elevate cursor-pointer">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-md bg-primary/10 flex items-center justify-center">
                                <span className="text-sm font-semibold text-primary">
                                  {chapter.chapterNumber}
                                </span>
                              </div>
                              <div>
                                <p className="font-medium">
                                  Bölüm {chapter.chapterNumber}
                                  {chapter.title && `: ${chapter.title}`}
                                </p>
                                {chapter.releaseDate && (
                                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                                    <Clock className="w-3 h-3" />
                                    {chapter.releaseDate}
                                  </p>
                                )}
                              </div>
                            </div>
                            <ChevronRight className="w-5 h-5 text-muted-foreground" />
                          </div>
                        </Card>
                      </Link>
                    ))}
                  </div>
                </ScrollArea>
              ) : (
                <div className="text-center py-8">
                  <p className="text-muted-foreground">Henüz bölüm eklenmemiş</p>
                </div>
              )}
            </div>
          </div>
        </div>

        {relatedSeries.length > 0 && (
          <section className="mt-12">
            <h2 className="text-xl font-bold mb-6">Benzer Mangalar</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {relatedSeries.map((s) => (
                <MangaCard key={s.id} series={s} />
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
}
