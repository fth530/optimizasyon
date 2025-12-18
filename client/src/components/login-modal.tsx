import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useAuth } from "@/lib/auth";
import { useToast } from "@/hooks/use-toast";
import { Eye, EyeOff, Loader2 } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(3, "Kullanıcı adı en az 3 karakter olmalı"),
  password: z.string().min(6, "Şifre en az 6 karakter olmalı"),
});

const registerSchema = loginSchema.extend({
  email: z.string().email("Geçerli bir e-posta adresi girin").optional().or(z.literal("")),
  confirmPassword: z.string().min(6, "Şifre en az 6 karakter olmalı"),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Şifreler eşleşmiyor",
  path: ["confirmPassword"],
});

type LoginFormData = z.infer<typeof loginSchema>;
type RegisterFormData = z.infer<typeof registerSchema>;

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function LoginModal({ isOpen, onClose }: LoginModalProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const { login, register } = useAuth();
  const { toast } = useToast();

  const loginForm = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: { username: "", password: "" },
  });

  const registerForm = useForm<RegisterFormData>({
    resolver: zodResolver(registerSchema),
    defaultValues: { username: "", password: "", email: "", confirmPassword: "" },
  });

  const handleLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    try {
      const success = await login(data.username, data.password);
      if (success) {
        toast({ title: "Hoş geldiniz!", description: "Başarıyla giriş yaptınız." });
        onClose();
        loginForm.reset();
      } else {
        toast({ 
          title: "Giriş başarısız", 
          description: "Kullanıcı adı veya şifre hatalı.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async (data: RegisterFormData) => {
    setIsLoading(true);
    try {
      const success = await register(data.username, data.password, data.email || undefined);
      if (success) {
        toast({ title: "Kayıt başarılı!", description: "Hesabınız oluşturuldu." });
        onClose();
        registerForm.reset();
      } else {
        toast({ 
          title: "Kayıt başarısız", 
          description: "Bu kullanıcı adı zaten kullanılıyor.",
          variant: "destructive"
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="text-center text-2xl font-bold">
            <span className="bg-gradient-to-r from-primary to-purple-400 bg-clip-text text-transparent">
              Noctoon
            </span>
          </DialogTitle>
        </DialogHeader>

        <Tabs defaultValue="login" className="w-full">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="login" data-testid="tab-login">Giriş Yap</TabsTrigger>
            <TabsTrigger value="register" data-testid="tab-register">Kayıt Ol</TabsTrigger>
          </TabsList>

          <TabsContent value="login" className="space-y-4 mt-4">
            <form onSubmit={loginForm.handleSubmit(handleLogin)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="login-username">Kullanıcı Adı</Label>
                <Input
                  id="login-username"
                  {...loginForm.register("username")}
                  placeholder="kullaniciadi"
                  data-testid="input-login-username"
                />
                {loginForm.formState.errors.username && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="login-password">Şifre</Label>
                <div className="relative">
                  <Input
                    id="login-password"
                    type={showPassword ? "text" : "password"}
                    {...loginForm.register("password")}
                    placeholder="••••••••"
                    data-testid="input-login-password"
                  />
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="absolute right-0 top-0 h-full px-3"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </Button>
                </div>
                {loginForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{loginForm.formState.errors.password.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit-login">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Giriş Yap
              </Button>
            </form>
          </TabsContent>

          <TabsContent value="register" className="space-y-4 mt-4">
            <form onSubmit={registerForm.handleSubmit(handleRegister)} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="register-username">Kullanıcı Adı</Label>
                <Input
                  id="register-username"
                  {...registerForm.register("username")}
                  placeholder="kullaniciadi"
                  data-testid="input-register-username"
                />
                {registerForm.formState.errors.username && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.username.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-email">E-posta (Opsiyonel)</Label>
                <Input
                  id="register-email"
                  type="email"
                  {...registerForm.register("email")}
                  placeholder="ornek@email.com"
                  data-testid="input-register-email"
                />
                {registerForm.formState.errors.email && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.email.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-password">Şifre</Label>
                <Input
                  id="register-password"
                  type="password"
                  {...registerForm.register("password")}
                  placeholder="••••••••"
                  data-testid="input-register-password"
                />
                {registerForm.formState.errors.password && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.password.message}</p>
                )}
              </div>

              <div className="space-y-2">
                <Label htmlFor="register-confirm">Şifre Tekrar</Label>
                <Input
                  id="register-confirm"
                  type="password"
                  {...registerForm.register("confirmPassword")}
                  placeholder="••••••••"
                  data-testid="input-register-confirm"
                />
                {registerForm.formState.errors.confirmPassword && (
                  <p className="text-sm text-destructive">{registerForm.formState.errors.confirmPassword.message}</p>
                )}
              </div>

              <Button type="submit" className="w-full" disabled={isLoading} data-testid="button-submit-register">
                {isLoading ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                Kayıt Ol
              </Button>
            </form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}
