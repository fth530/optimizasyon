import { Home, Search, BookOpen, User, Heart } from "lucide-react";
import { Link, useLocation } from "wouter";
import { cn } from "@/lib/utils";
import { useAuth } from "@/lib/auth";

interface MobileNavProps {
  onSearchClick: () => void;
}

export function MobileNav({ onSearchClick }: MobileNavProps) {
  const [location] = useLocation();
  const { user } = useAuth();

  const navItems = [
    { href: "/", icon: Home, label: "Ana Sayfa" },
    { href: "#search", icon: Search, label: "Ara", onClick: onSearchClick },
    { href: "/library", icon: BookOpen, label: "Kütüphane" },
    { href: "/favorites", icon: Heart, label: "Favoriler" },
    { href: "/profile", icon: User, label: "Profil" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 h-16 border-t border-border/50 bg-background/95 backdrop-blur-md md:hidden">
      <div className="h-full flex items-center justify-around px-2">
        {navItems.map((item) => {
          const isActive = item.href === location;
          const Icon = item.icon;

          if (item.onClick) {
            return (
              <button
                key={item.label}
                onClick={item.onClick}
                className="flex flex-col items-center gap-1 px-3 py-2"
                data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-xs", isActive ? "text-primary font-medium" : "text-muted-foreground")}>
                  {item.label}
                </span>
              </button>
            );
          }

          return (
            <Link key={item.label} href={item.href}>
              <a
                className="flex flex-col items-center gap-1 px-3 py-2"
                data-testid={`nav-${item.label.toLowerCase().replace(" ", "-")}`}
              >
                <Icon className={cn("w-5 h-5", isActive ? "text-primary" : "text-muted-foreground")} />
                <span className={cn("text-xs", isActive ? "text-primary font-medium" : "text-muted-foreground")}>
                  {item.label}
                </span>
              </a>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
