'use client';

import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader } from "@/components/ui/card";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";
import { useAuth } from "@/hooks/useAuth";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft, faTriangleExclamation } from "@fortawesome/free-solid-svg-icons";
import { GencyaMark, SonarLoader } from "@/components/layout/Brand";

// Form şema tanımı
const loginFormSchema = z.object({
  email: z.email({
    message: "Geçerli bir e-posta adresi giriniz.",
  }),
  password: z.string().min(6, {
    message: "Şifre en az 6 karakter olmalıdır.",
  }),
});

type LoginFormValues = z.infer<typeof loginFormSchema>;

export default function AdminLogin() {
  // Admin dashboard yönlendirmesi için
  const router = useRouter();
  const searchParams = useSearchParams();
  // Yalnızca panel içi yollar kabul edilir. Dış adrese ya da tarayıcının başka
  // bir adrese çözebileceği biçimlere (//, /\, görünmez karakter) yönlendirilmez.
  const requestedRedirect = searchParams.get('redirect') ?? '';
  const redirectTo = /^\/admin(\/[\w-]+)*\/?$/.test(requestedRedirect) ? requestedRedirect : '/admin/dashboard';
  const { login, isAuthenticating, errorMessage, token, getAuthDetail, logout } = useAuth();
  const [error, setError] = useState<string | null>(
    searchParams.get('yetkisiz') === '1' ? 'Bu hesabın yönetim paneline erişimi yok.' : null,
  );
  const [isCheckingAuth, setIsCheckingAuth] = useState(false);

  const form = useForm<LoginFormValues>({
    resolver: zodResolver(loginFormSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleSubmit = async (data: LoginFormValues) => {
    setError(null);
    const ok = await login(data.email, data.password);
    // Hata metnini useAuth her başarısız denemede errorMessage'a yazıyor; sayfa onu gösteriyor.
    if (!ok) return;
    router.push(redirectTo);
  };

  // Eğer token varsa, sayfa açılışında doğrula
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    setIsCheckingAuth(true);
    (async () => {
      const result = await getAuthDetail();
      if (cancelled) return;
      if ('name' in result && result?.email) {
        router.push(redirectTo);
        return;
      }
      // Token geçersiz ise temizle ve normal akışa devam et
      logout();
      setIsCheckingAuth(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [token, getAuthDetail, logout, router]);

  // Panelin girişi: derin deniz zemininde ortalı kart, üstünde marka
  const brand = (
    <div className="mb-8 flex flex-col items-center gap-4 text-center text-white">
      <GencyaMark className="h-14" />
      {/* Header/sidebar'daki yazı düzeni: GENÇYA, altında mono "Yönetim Paneli" */}
      <div className="flex flex-col items-center leading-none">
        <span className="font-display text-xl font-bold tracking-[0.08em]">GENÇYA</span>
        <span className="mt-1.5 font-mono text-[10px] uppercase tracking-[0.24em] text-camgobegi">Yönetim Paneli</span>
      </div>
    </div>
  );

  if (isCheckingAuth) {
    return (
      <div className="bg-deep flex min-h-screen flex-col items-center justify-center p-4">
        {brand}
        {/* Koyu zeminde halkalar camgöbeği, etiket açık */}
        <SonarLoader
          label="Doğrulama yapılıyor"
          className="[--primary:var(--camgobegi)] [&_.label-mono]:text-[#9DB9D6]"
        />
      </div>
    );
  }

  return (
    <div className="bg-deep flex min-h-screen flex-col items-center justify-center px-4 py-12">
      {brand}
      <Card className="w-full max-w-md shadow-featured dark:border-camgobegi/15">
        <CardHeader className="text-center">
          <h1 className="font-display text-2xl font-bold leading-none">Yönetici Girişi</h1>
          <CardDescription>Yönetim paneline erişmek için hesabınızla giriş yapın</CardDescription>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>E-posta</FormLabel>
                    <FormControl>
                      <Input
                        type="email"
                        placeholder="E-posta adresiniz"
                        autoComplete="email"
                        disabled={isAuthenticating}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="password"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Şifre</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Şifreniz"
                        autoComplete="current-password"
                        disabled={isAuthenticating}
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {(error || errorMessage) && (
                <div role="alert" className="flex items-start gap-2.5 rounded-lg border border-red-600/25 bg-red-50 p-3 text-sm text-red-800 dark:border-red-400/25 dark:bg-red-950 dark:text-red-200">
                  <FontAwesomeIcon icon={faTriangleExclamation} className="mt-0.5 h-4 w-4 shrink-0" />
                  {error || errorMessage}
                </div>
              )}

              <Button
                type="submit"
                size="lg"
                className="w-full cursor-pointer bg-cta text-white shadow-cta hover:brightness-110"
                disabled={isAuthenticating}
              >
                {isAuthenticating ? "Giriş yapılıyor..." : "Giriş Yap"}
              </Button>
            </form>
          </Form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Link href="/" className="text-sm text-muted-foreground hover:text-primary">
            <FontAwesomeIcon icon={faArrowLeft} className="mr-1.5 h-3 w-3" />
            Siteye dön
          </Link>
        </CardFooter>
      </Card>
    </div>
  );
}