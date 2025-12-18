import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Search, X } from "lucide-react";
import { GENRES, type SearchFilters } from "@shared/schema";
import { cn } from "@/lib/utils";

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onApply: (filters: SearchFilters) => void;
  initialFilters: SearchFilters;
}

export function SearchModal({ isOpen, onClose, onApply, initialFilters }: SearchModalProps) {
  const [query, setQuery] = useState(initialFilters.query);
  const [selectedGenres, setSelectedGenres] = useState<string[]>(initialFilters.genres);
  const [status, setStatus] = useState<SearchFilters["status"]>(initialFilters.status);

  const toggleGenre = (genre: string) => {
    setSelectedGenres((prev) =>
      prev.includes(genre) ? prev.filter((g) => g !== genre) : [...prev, genre]
    );
  };

  const handleApply = () => {
    onApply({ query, genres: selectedGenres, status });
    onClose();
  };

  const handleReset = () => {
    setQuery("");
    setSelectedGenres([]);
    setStatus("all");
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-lg max-h-[85vh] overflow-hidden flex flex-col">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Search className="w-5 h-5 text-primary" />
            Gelişmiş Arama
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 flex-1 overflow-hidden flex flex-col">
          <div className="space-y-2">
            <Label htmlFor="search-query">Arama</Label>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                id="search-query"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Manga adı, yazar..."
                className="pl-10"
                data-testid="input-search-query"
              />
              {query && (
                <Button
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3"
                  onClick={() => setQuery("")}
                >
                  <X className="w-4 h-4" />
                </Button>
              )}
            </div>
          </div>

          <div className="space-y-2 flex-1 overflow-hidden flex flex-col">
            <Label>Türler</Label>
            <ScrollArea className="flex-1 pr-4">
              <div className="flex flex-wrap gap-2">
                {GENRES.map((genre) => (
                  <Badge
                    key={genre}
                    variant={selectedGenres.includes(genre) ? "default" : "outline"}
                    className={cn(
                      "cursor-pointer transition-colors",
                      selectedGenres.includes(genre) && "bg-primary"
                    )}
                    onClick={() => toggleGenre(genre)}
                    data-testid={`badge-genre-${genre.toLowerCase()}`}
                  >
                    {genre}
                  </Badge>
                ))}
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-3">
            <Label>Durum</Label>
            <RadioGroup value={status} onValueChange={(v) => setStatus(v as SearchFilters["status"])}>
              <div className="flex flex-wrap gap-4">
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="all" id="status-all" />
                  <Label htmlFor="status-all" className="font-normal cursor-pointer">Tümü</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="ongoing" id="status-ongoing" />
                  <Label htmlFor="status-ongoing" className="font-normal cursor-pointer">Devam Ediyor</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="completed" id="status-completed" />
                  <Label htmlFor="status-completed" className="font-normal cursor-pointer">Tamamlandı</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <RadioGroupItem value="hiatus" id="status-hiatus" />
                  <Label htmlFor="status-hiatus" className="font-normal cursor-pointer">Ara Verildi</Label>
                </div>
              </div>
            </RadioGroup>
          </div>
        </div>

        <div className="flex gap-3 pt-4 border-t">
          <Button variant="outline" onClick={handleReset} className="flex-1" data-testid="button-reset-filters">
            Sıfırla
          </Button>
          <Button onClick={handleApply} className="flex-1" data-testid="button-apply-filters">
            Uygula
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

export type { SearchFilters };
