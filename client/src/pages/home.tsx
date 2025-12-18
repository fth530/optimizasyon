import { useQuery } from "@tanstack/react-query";
import { HeroCarousel } from "@/components/hero-carousel";
import { MangaCard } from "@/components/manga-card";
import { Skeleton } from "@/components/ui/skeleton";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { TrendingUp, Clock, Sparkles } from "lucide-react";
import type { Series, SearchFilters } from "@shared/schema";

interface HomePageProps {
  searchQuery: string;
  filters: SearchFilters;
}

export function HomePage({ searchQuery, filters }: HomePageProps) {
  const { data: allSeries = [], isLoading } = useQuery<Series[]>({
    queryKey: ["/api/series"],
  });

  const featuredSeries = allSeries.filter((s) => s.isFeatured);
  const trendingSeries = allSeries.filter((s) => s.isTrending);
  const recentSeries = [...allSeries].sort((a, b) => (b.id || "").localeCompare(a.id || "")).slice(0, 12);

  const filteredSeries = allSeries.filter((series) => {
    const matchesQuery =
      !searchQuery ||
      series.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      series.author?.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesGenres =
      filters.genres.length === 0 ||
      filters.genres.some((g) => series.genres?.includes(g));

    const matchesStatus = filters.status === "all" || series.status === filters.status;

    return matchesQuery && matchesGenres && matchesStatus;
  });

  const showFiltered = searchQuery || filters.genres.length > 0 || filters.status !== "all";

  if (isLoading) {
    return (
      <div className="pt-16 pb-20 md:pb-8">
        <div className="h-96 lg:h-[500px] bg-muted animate-pulse" />
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 12 }).map((_, i) => (
              <Skeleton key={i} className="aspect-[2/3] rounded-md" />
            ))}
          </div>
        </div>
      </div>
    );
  }

  if (showFiltered) {
    return (
      <div className="pt-16 pb-20 md:pb-8 min-h-screen">
        <div className="max-w-7xl mx-auto px-4 py-8">
          <h1 className="text-2xl font-bold mb-6">
            Arama Sonuçları
            <span className="text-muted-foreground text-base font-normal ml-2">
              ({filteredSeries.length} sonuç)
            </span>
          </h1>
          
          {filteredSeries.length > 0 ? (
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {filteredSeries.map((series) => (
                <MangaCard key={series.id} series={series} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-muted-foreground text-lg">Sonuç bulunamadı</p>
              <p className="text-sm text-muted-foreground mt-2">
                Farklı arama terimleri veya filtreler deneyin
              </p>
            </div>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 pb-20 md:pb-8 min-h-screen" data-testid="page-home">
      <HeroCarousel series={featuredSeries} />

      <div className="max-w-7xl mx-auto px-4 py-8 space-y-12">
        {trendingSeries.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <TrendingUp className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Trend Olanlar</h2>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
              {trendingSeries.slice(0, 6).map((series) => (
                <MangaCard key={series.id} series={series} />
              ))}
            </div>
          </section>
        )}

        {recentSeries.length > 0 && (
          <section>
            <div className="flex items-center gap-2 mb-6">
              <Clock className="w-5 h-5 text-primary" />
              <h2 className="text-xl font-bold">Son Eklenenler</h2>
            </div>
            <ScrollArea className="w-full whitespace-nowrap">
              <div className="flex gap-4 pb-4">
                {recentSeries.map((series) => (
                  <div key={series.id} className="w-32 md:w-40 flex-shrink-0">
                    <MangaCard series={series} showBadge={false} />
                  </div>
                ))}
              </div>
              <ScrollBar orientation="horizontal" />
            </ScrollArea>
          </section>
        )}

        <section>
          <div className="flex items-center gap-2 mb-6">
            <Sparkles className="w-5 h-5 text-primary" />
            <h2 className="text-xl font-bold">Türlere Göre</h2>
          </div>
          <Tabs defaultValue="all" className="w-full">
            <TabsList className="flex-wrap h-auto gap-1 bg-transparent p-0 mb-6">
              <TabsTrigger value="all" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Tümü
              </TabsTrigger>
              <TabsTrigger value="action" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Action
              </TabsTrigger>
              <TabsTrigger value="romance" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Romance
              </TabsTrigger>
              <TabsTrigger value="fantasy" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Fantasy
              </TabsTrigger>
              <TabsTrigger value="comedy" className="data-[state=active]:bg-primary data-[state=active]:text-primary-foreground">
                Comedy
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="all">
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {allSeries.slice(0, 12).map((series) => (
                  <MangaCard key={series.id} series={series} />
                ))}
              </div>
            </TabsContent>
            
            {["action", "romance", "fantasy", "comedy"].map((genre) => (
              <TabsContent key={genre} value={genre}>
                <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                  {allSeries
                    .filter((s) => s.genres?.some((g) => g.toLowerCase() === genre))
                    .slice(0, 12)
                    .map((series) => (
                      <MangaCard key={series.id} series={series} />
                    ))}
                </div>
              </TabsContent>
            ))}
          </Tabs>
        </section>
      </div>
    </div>
  );
}
