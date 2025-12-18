import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Switch } from "@/components/ui/switch";
import { ScrollArea } from "@/components/ui/scroll-area";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { 
  Plus, 
  Pencil, 
  Trash2, 
  BookOpen, 
  Users, 
  BarChart3,
  Loader2,
  X
} from "lucide-react";
import { GENRES, type Series, type Chapter } from "@shared/schema";

const seriesSchema = z.object({
  title: z.string().min(1, "Başlık gerekli"),
  description: z.string().optional(),
  coverImage: z.string().url("Geçerli bir URL girin").optional().or(z.literal("")),
  author: z.string().optional(),
  artist: z.string().optional(),
  genres: z.array(z.string()).default([]),
  status: z.enum(["ongoing", "completed", "hiatus"]).default("ongoing"),
  isFeatured: z.boolean().default(false),
  isTrending: z.boolean().default(false),
});

type SeriesFormData = z.infer<typeof seriesSchema>;

export function AdminPage() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [editingSeries, setEditingSeries] = useState<Series | null>(null);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);

  const { data: allSeries = [], isLoading } = useQuery<Series[]>({
    queryKey: ["/api/series"],
  });

  const form = useForm<SeriesFormData>({
    resolver: zodResolver(seriesSchema),
    defaultValues: {
      title: "",
      description: "",
      coverImage: "",
      author: "",
      artist: "",
      genres: [],
      status: "ongoing",
      isFeatured: false,
      isTrending: false,
    },
  });

  const createSeriesMutation = useMutation({
    mutationFn: (data: SeriesFormData) => 
      apiRequest("POST", "/api/series", { ...data, genres: selectedGenres }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/series"] });
      toast({ title: "Manga eklendi" });
      form.reset();
      setSelectedGenres([]);
    },
    onError: () => {
      toast({ title: "Hata oluştu", variant: "destructive" });
    },
  });

  const updateSeriesMutation = useMutation({
    mutationFn: (data: SeriesFormData) => 
      apiRequest("PATCH", `/api/series/${editingSeries?.id}`, { ...data, genres: selectedGenres }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/series"] });
      toast({ title: "Manga güncellendi" });
      setEditingSeries(null);
      form.reset();
      setSelectedGenres([]);
    },
    onError: () => {
      toast({ title: "Hata oluştu", variant: "destructive" });
    },
  });

  const deleteSeriesMutation = useMutation({
    mutationFn: (id: string) => apiRequest("DELETE", `/api/series/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/series"] });
      toast({ title: "Manga silindi" });
    },
    onError: () => {
      toast({ title: "Hata oluştu", variant: "destructive" });
    },
  });

  const handleSubmit = (data: SeriesFormData) => {
    if (editingSeries) {
      updateSeriesMutation.mutate(data);
    } else {
      createSeriesMutation.mutate(data);
    }
  };

  const handleEdit = (series: Series) => {
    setEditingSeries(series);
    setSelectedGenres(series.genres || []);
    form.reset({
      title: series.title,
      description: series.description || "",
      coverImage: series.coverImage || "",
      author: series.author || "",
      artist: series.artist || "",
      status: (series.status as "ongoing" | "completed" | "hiatus") || "ongoing",
      isFeatured: series.isFeatured || false,
      isTrending: series.isTrending || false,
    });
  };

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  if (!user?.isAdmin) {
    return (
      <div className="pt-16 pb-20 md:pb-8 min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-2">Erişim Engellendi</h1>
          <p className="text-muted-foreground">
            Bu sayfaya erişim yetkiniz bulunmuyor.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="pt-16 pb-20 md:pb-8 min-h-screen" data-testid="page-admin">
      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold mb-2">Admin Paneli</h1>
          <p className="text-muted-foreground">Manga ve içerik yönetimi</p>
        </div>

        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Toplam Manga</CardTitle>
              <BookOpen className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{allSeries.length}</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Öne Çıkan</CardTitle>
              <BarChart3 className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allSeries.filter((s) => s.isFeatured).length}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
              <CardTitle className="text-sm font-medium">Trend</CardTitle>
              <Users className="w-4 h-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {allSeries.filter((s) => s.isTrending).length}
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="series">
          <TabsList className="mb-6">
            <TabsTrigger value="series">Manga Yönetimi</TabsTrigger>
            <TabsTrigger value="add">
              {editingSeries ? "Manga Düzenle" : "Yeni Manga Ekle"}
            </TabsTrigger>
          </TabsList>

          <TabsContent value="series">
            {isLoading ? (
              <div className="text-center py-8">
                <Loader2 className="w-8 h-8 animate-spin mx-auto" />
              </div>
            ) : (
              <ScrollArea className="h-[600px]">
                <div className="space-y-4 pr-4">
                  {allSeries.map((series) => (
                    <Card key={series.id}>
                      <CardContent className="p-4">
                        <div className="flex items-center gap-4">
                          <div className="w-16 h-24 rounded-md overflow-hidden bg-muted flex-shrink-0">
                            {series.coverImage ? (
                              <img
                                src={series.coverImage}
                                alt={series.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                                {series.title.charAt(0)}
                              </div>
                            )}
                          </div>
                          
                          <div className="flex-1 min-w-0">
                            <h3 className="font-semibold truncate">{series.title}</h3>
                            <p className="text-sm text-muted-foreground truncate">
                              {series.author || "Yazar bilinmiyor"}
                            </p>
                            <div className="flex flex-wrap gap-1 mt-2">
                              {series.isFeatured && (
                                <Badge variant="default" className="text-xs">Öne Çıkan</Badge>
                              )}
                              {series.isTrending && (
                                <Badge variant="secondary" className="text-xs">Trend</Badge>
                              )}
                              <Badge variant="outline" className="text-xs">
                                {series.status === "ongoing" ? "Devam Ediyor" : 
                                 series.status === "completed" ? "Tamamlandı" : "Ara Verildi"}
                              </Badge>
                            </div>
                          </div>
                          
                          <div className="flex gap-2">
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => handleEdit(series)}
                            >
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="icon"
                              onClick={() => deleteSeriesMutation.mutate(series.id)}
                              disabled={deleteSeriesMutation.isPending}
                            >
                              <Trash2 className="w-4 h-4 text-destructive" />
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            )}
          </TabsContent>

          <TabsContent value="add">
            <Card>
              <CardContent className="p-6">
                <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                      <Label htmlFor="title">Başlık *</Label>
                      <Input
                        id="title"
                        {...form.register("title")}
                        placeholder="Manga başlığı"
                      />
                      {form.formState.errors.title && (
                        <p className="text-sm text-destructive">
                          {form.formState.errors.title.message}
                        </p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="coverImage">Kapak Resmi URL</Label>
                      <Input
                        id="coverImage"
                        {...form.register("coverImage")}
                        placeholder="https://..."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="author">Yazar</Label>
                      <Input
                        id="author"
                        {...form.register("author")}
                        placeholder="Yazar adı"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="artist">Çizer</Label>
                      <Input
                        id="artist"
                        {...form.register("artist")}
                        placeholder="Çizer adı"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="status">Durum</Label>
                      <Select
                        value={form.watch("status")}
                        onValueChange={(v) => form.setValue("status", v as "ongoing" | "completed" | "hiatus")}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ongoing">Devam Ediyor</SelectItem>
                          <SelectItem value="completed">Tamamlandı</SelectItem>
                          <SelectItem value="hiatus">Ara Verildi</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <Label htmlFor="isFeatured">Öne Çıkan</Label>
                        <Switch
                          id="isFeatured"
                          checked={form.watch("isFeatured")}
                          onCheckedChange={(v) => form.setValue("isFeatured", v)}
                        />
                      </div>
                      <div className="flex items-center justify-between">
                        <Label htmlFor="isTrending">Trend</Label>
                        <Switch
                          id="isTrending"
                          checked={form.watch("isTrending")}
                          onCheckedChange={(v) => form.setValue("isTrending", v)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Türler</Label>
                    <div className="flex flex-wrap gap-2">
                      {GENRES.map((genre) => (
                        <Badge
                          key={genre}
                          variant={selectedGenres.includes(genre) ? "default" : "outline"}
                          className="cursor-pointer"
                          onClick={() => toggleGenre(genre)}
                        >
                          {genre}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="description">Açıklama</Label>
                    <Textarea
                      id="description"
                      {...form.register("description")}
                      placeholder="Manga açıklaması..."
                      rows={4}
                    />
                  </div>

                  <div className="flex gap-2">
                    <Button
                      type="submit"
                      disabled={createSeriesMutation.isPending || updateSeriesMutation.isPending}
                    >
                      {(createSeriesMutation.isPending || updateSeriesMutation.isPending) && (
                        <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      )}
                      {editingSeries ? "Güncelle" : "Ekle"}
                    </Button>
                    {editingSeries && (
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setEditingSeries(null);
                          form.reset();
                          setSelectedGenres([]);
                        }}
                      >
                        İptal
                      </Button>
                    )}
                  </div>
                </form>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
