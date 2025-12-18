import { Search, Menu, Moon, Sun, User, LogOut, Settings, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Progress } from "@/components/ui/progress";
import { useTheme } from "@/lib/theme";
import { useAuth } from "@/lib/auth";
import { Link, useLocation } from "wouter";

interface NavbarProps {
  onLoginClick: () => void;
  onSearchClick: () => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
  readingProgress?: number;
  isReading?: boolean;
}

export function Navbar({
  onLoginClick,
  onSearchClick,
  searchQuery,
  onSearchChange,
  readingProgress = 0,
  isReading = false,
}: NavbarProps) {
  const { theme, toggleTheme } = useTheme();
  const { user, logout } = useAuth();
  const [location] = useLocation();

  const isHomePage = location === "/";

  return (
    <header className="fixed top-0 left-0 right-0 z-50 h-16 border-b border-border/50 bg-background/80 backdrop-blur-md">
      <div className="h-full max-w-7xl mx-auto px-4 flex items-center justify-between gap-4">
        <Link href="/">
          <a className="flex items-center gap-2" data-testid="link-home">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
              <span className="text-sm font-bold text-primary-foreground">N</span>
            </div>
            <span className="text-xl font-bold hidden sm:block">Noctoon</span>
          </a>
        </Link>

        {isHomePage && (
          <div className="flex-1 max-w-md hidden md:block">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                type="search"
                placeholder="Manga ara..."
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onClick={onSearchClick}
                className="pl-10 bg-muted/50 border-transparent focus:border-primary"
                data-testid="input-search"
              />
            </div>
          </div>
        )}

        {isReading && (
          <div className="flex-1 max-w-md hidden md:flex items-center gap-3">
            <BookOpen className="w-4 h-4 text-primary" />
            <Progress value={readingProgress} className="flex-1" />
            <span className="text-sm text-muted-foreground">{Math.round(readingProgress)}%</span>
          </div>
        )}

        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="icon"
            onClick={onSearchClick}
            className="md:hidden"
            data-testid="button-search-mobile"
          >
            <Search className="w-5 h-5" />
          </Button>

          <Button
            variant="ghost"
            size="icon"
            onClick={toggleTheme}
            data-testid="button-theme-toggle"
          >
            {theme === "dark" ? (
              <Sun className="w-5 h-5" />
            ) : (
              <Moon className="w-5 h-5" />
            )}
          </Button>

          {user ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="rounded-full" data-testid="button-user-menu">
                  <Avatar className="w-8 h-8">
                    <AvatarImage src={user.avatar || undefined} />
                    <AvatarFallback className="bg-primary text-primary-foreground">
                      {user.username.charAt(0).toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <div className="px-2 py-1.5">
                  <p className="text-sm font-medium">{user.username}</p>
                  <p className="text-xs text-muted-foreground">{user.email}</p>
                </div>
                <DropdownMenuSeparator />
                <DropdownMenuItem asChild>
                  <Link href="/profile">
                    <a className="flex items-center gap-2 w-full" data-testid="link-profile">
                      <User className="w-4 h-4" />
                      Profil
                    </a>
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/library">
                    <a className="flex items-center gap-2 w-full" data-testid="link-library">
                      <BookOpen className="w-4 h-4" />
                      Kütüphane
                    </a>
                  </Link>
                </DropdownMenuItem>
                {user.isAdmin && (
                  <DropdownMenuItem asChild>
                    <Link href="/admin">
                      <a className="flex items-center gap-2 w-full" data-testid="link-admin">
                        <Settings className="w-4 h-4" />
                        Admin
                      </a>
                    </Link>
                  </DropdownMenuItem>
                )}
                <DropdownMenuSeparator />
                <DropdownMenuItem onClick={logout} className="text-destructive" data-testid="button-logout">
                  <LogOut className="w-4 h-4 mr-2" />
                  Çıkış Yap
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <Button onClick={onLoginClick} size="sm" data-testid="button-login">
              Giriş Yap
            </Button>
          )}
        </div>
      </div>
    </header>
  );
}
