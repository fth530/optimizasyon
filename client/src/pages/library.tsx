import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { Badge } from "@/components/ui/badge";
import { MangaCard } from "@/components/manga-card";
import { useAuth } from "@/lib/auth";
import { 
  Search, 
  Grid3X3, 
  List, 
  SortAsc,
  BookOpen,
  Heart,
  TrendingUp
} from "lucide-react";
import type { Series, Favorite } from "@shared/schema";
import { GENRES } from "@shared/schema";
import { cn } from "@/lib/utils";

export function LibraryPage() {
  const { user } = useAuth();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedGenre, setSelectedGenre] = useState<string | null>(null);

  const { data: allSeries = [], isLoading } = useQuery<Series[]>({
    queryKey: ["/api/series"],
  });

  const { data: favorites = [] } = useQuery<Favorite[]>({
    queryKey: ["/api/favorites", { userId: user?.id }],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/favorites?userId=${user.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  const filteredSeries = allSeries.filter((series) => {
    const matchesSearch = 
      !searchQuery ||
      series.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      series.author?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesGenre = 
      !selectedGenre ||
      series.genres?.includes(selectedGenre);
    
    return matchesSearch && matchesGenre;
  });

  const favoriteSeries = filteredSeries.filter((s) =>
    favorites.some((f) => f.seriesId === s.id)
  );

  return (
    <div className="pt-16 pb-20 md:pb-8 min-h-screen" data-testid="page-library">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="text-3xl font-bold mb-2">Kütüphane</h1>
            <p className="text-muted-foreground">
              Tüm mangaları keşfedin ve favorilerinizi yönetin
            </p>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto">
            <div className="relative flex-1 md:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Ara..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
                data-testid="input-library-search"
              />
            </div>

            <div className="flex border rounded-md">
              <Button
                variant={viewMode === "grid" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("grid")}
              >
                <Grid3X3 className="w-4 h-4" />
              </Button>
              <Button
                variant={viewMode === "list" ? "secondary" : "ghost"}
                size="icon"
                onClick={() => setViewMode("list")}
              >
                <List className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap gap-2 mb-6">
          <Badge
            variant={selectedGenre === null ? "default" : "outline"}
            className="cursor-pointer"
            onClick={() => setSelectedGenre(null)}
          >
            Tümü
          </Badge>
          {GENRES.map((genre) => (
            <Badge
              key={genre}
              variant={selectedGenre === genre ? "default" : "outline"}
              className="cursor-pointer"
              onClick={() => setSelectedGenre(selectedGenre === genre ? null : genre)}
            >
              {genre}
            </Badge>
          ))}
        </div>

        <Tabs defaultValue="all">
          <TabsList className="mb-6">
            <TabsTrigger value="all" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Tümü
              <Badge variant="secondary" className="ml-1">{filteredSeries.length}</Badge>
            </TabsTrigger>
            {user && (
              <TabsTrigger value="favorites" className="gap-2">
                <Heart className="w-4 h-4" />
                Favoriler
                <Badge variant="secondary" className="ml-1">{favoriteSeries.length}</Badge>
              </TabsTrigger>
            )}
            <TabsTrigger value="trending" className="gap-2">
              <TrendingUp className="w-4 h-4" />
              Trend
            </TabsTrigger>
          </TabsList>

          <TabsContent value="all">
            {isLoading ? (
              <div className={cn(
                viewMode === "grid" 
                  ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4" 
                  : "space-y-4"
              )}>
                {Array.from({ length: 12 }).map((_, i) => (
                  <Skeleton 
                    key={i} 
                    className={viewMode === "grid" ? "aspect-[2/3] rounded-md" : "h-24 rounded-md"}
                  />
                ))}
              </div>
            ) : filteredSeries.length > 0 ? (
              <div className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6"
                  : "space-y-4"
              )}>
                {filteredSeries.map((series) => (
                  <MangaCard key={series.id} series={series} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Sonuç bulunamadı</p>
              </div>
            )}
          </TabsContent>

          {user && (
            <TabsContent value="favorites">
              {favoriteSeries.length > 0 ? (
                <div className={cn(
                  viewMode === "grid"
                    ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6"
                    : "space-y-4"
                )}>
                  {favoriteSeries.map((series) => (
                    <MangaCard key={series.id} series={series} />
                  ))}
                </div>
              ) : (
                <div className="text-center py-16">
                  <Heart className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                  <p className="text-muted-foreground">Henüz favori eklemediniz</p>
                </div>
              )}
            </TabsContent>
          )}

          <TabsContent value="trending">
            {filteredSeries.filter((s) => s.isTrending).length > 0 ? (
              <div className={cn(
                viewMode === "grid"
                  ? "grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6"
                  : "space-y-4"
              )}>
                {filteredSeries.filter((s) => s.isTrending).map((series) => (
                  <MangaCard key={series.id} series={series} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <TrendingUp className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Trend manga bulunamadı</p>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
