import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { Home, ArrowLeft } from "lucide-react";

export default function NotFound() {
  return (
    <div className="pt-16 pb-20 md:pb-8 min-h-screen flex items-center justify-center" data-testid="page-not-found">
      <div className="text-center px-4">
        <div className="w-32 h-32 mx-auto mb-8 rounded-2xl bg-gradient-to-br from-primary/20 to-purple-600/20 flex items-center justify-center">
          <span className="text-6xl font-bold text-primary">404</span>
        </div>
        
        <h1 className="text-3xl font-bold mb-4">Sayfa Bulunamadı</h1>
        <p className="text-muted-foreground mb-8 max-w-md mx-auto">
          Aradığınız sayfa mevcut değil veya taşınmış olabilir. 
          Ana sayfaya dönerek manga okumaya devam edebilirsiniz.
        </p>
        
        <div className="flex flex-col sm:flex-row gap-3 justify-center">
          <Link href="/">
            <Button className="gap-2" data-testid="button-go-home">
              <Home className="w-4 h-4" />
              Ana Sayfa
            </Button>
          </Link>
          <Button variant="outline" onClick={() => window.history.back()} className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Geri Dön
          </Button>
        </div>
      </div>
    </div>
  );
}
