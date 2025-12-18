import { useQuery } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Skeleton } from "@/components/ui/skeleton";
import { MangaCard } from "@/components/manga-card";
import { useAuth } from "@/lib/auth";
import { 
  BookOpen, 
  Heart, 
  Clock, 
  Settings, 
  LogOut,
  ChevronRight
} from "lucide-react";
import type { Series, Favorite, ReadingProgress } from "@shared/schema";

export function ProfilePage() {
  const [location] = useLocation();
  const { user, logout } = useAuth();

  const { data: allSeries = [] } = useQuery<Series[]>({
    queryKey: ["/api/series"],
  });

  const { data: favorites = [], isLoading: favoritesLoading } = useQuery<Favorite[]>({
    queryKey: ["/api/favorites", { userId: user?.id }],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/favorites?userId=${user.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  const { data: readingProgress = [], isLoading: progressLoading } = useQuery<ReadingProgress[]>({
    queryKey: ["/api/reading-progress", { userId: user?.id }],
    queryFn: async () => {
      if (!user) return [];
      const res = await fetch(`/api/reading-progress?userId=${user.id}`);
      if (!res.ok) return [];
      return res.json();
    },
    enabled: !!user,
  });

  const favoriteSeries = allSeries.filter((s) => 
    favorites.some((f) => f.seriesId === s.id)
  );

  const readingSeries = allSeries.filter((s) =>
    readingProgress.some((p) => p.seriesId === s.id)
  );

  const defaultTab = location === "/favorites" ? "favorites" : "reading";

  if (!user) {
    return (
      <div className="pt-16 pb-20 md:pb-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Giriş yapmanız gerekiyor</h1>
          <p className="text-muted-foreground mb-4">
            Profil sayfasını görüntülemek için lütfen giriş yapın.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 pb-20 md:pb-8 min-h-screen" data-testid="page-profile">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <Card className="p-6 mb-8">
          <div className="flex flex-col sm:flex-row items-center gap-6">
            <Avatar className="w-24 h-24">
              <AvatarImage src={user.avatar || undefined} />
              <AvatarFallback className="text-3xl bg-primary text-primary-foreground">
                {user.username.charAt(0).toUpperCase()}
              </AvatarFallback>
            </Avatar>
            
            <div className="flex-1 text-center sm:text-left">
              <h1 className="text-2xl font-bold mb-1">{user.username}</h1>
              {user.email && (
                <p className="text-muted-foreground mb-4">{user.email}</p>
              )}
              
              <div className="flex flex-wrap justify-center sm:justify-start gap-4">
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <Heart className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{favorites.length}</p>
                    <p className="text-xs text-muted-foreground">Favori</p>
                  </div>
                </div>
                
                <div className="flex items-center gap-2 text-sm">
                  <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                    <BookOpen className="w-5 h-5 text-primary" />
                  </div>
                  <div>
                    <p className="font-semibold">{readingProgress.length}</p>
                    <p className="text-xs text-muted-foreground">Okunan</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Settings className="w-4 h-4 mr-2" />
                Ayarlar
              </Button>
              <Button variant="outline" size="sm" onClick={logout}>
                <LogOut className="w-4 h-4 mr-2" />
                Çıkış
              </Button>
            </div>
          </div>
        </Card>

        <Tabs defaultValue={defaultTab}>
          <TabsList className="mb-6">
            <TabsTrigger value="reading" className="gap-2">
              <BookOpen className="w-4 h-4" />
              Okumaya Devam Et
            </TabsTrigger>
            <TabsTrigger value="favorites" className="gap-2">
              <Heart className="w-4 h-4" />
              Favoriler
            </TabsTrigger>
            <TabsTrigger value="history" className="gap-2">
              <Clock className="w-4 h-4" />
              Geçmiş
            </TabsTrigger>
          </TabsList>

          <TabsContent value="reading">
            {progressLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[2/3] rounded-md" />
                ))}
              </div>
            ) : readingSeries.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
                {readingSeries.map((series) => (
                  <MangaCard key={series.id} series={series} />
                ))}
              </div>
            ) : (
              <div className="text-center py-16">
                <BookOpen className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
                <p className="text-muted-foreground">Henüz okumaya başladığınız manga yok</p>
              </div>
            )}
          </TabsContent>

          <TabsContent value="favorites">
            {favoritesLoading ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
                {Array.from({ length: 6 }).map((_, i) => (
                  <Skeleton key={i} className="aspect-[2/3] rounded-md" />
                ))}
              </div>
            ) : favoriteSeries.length > 0 ? (
              <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 md:gap-6">
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

          <TabsContent value="history">
            <div className="text-center py-16">
              <Clock className="w-12 h-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">Okuma geçmişiniz burada görünecek</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
