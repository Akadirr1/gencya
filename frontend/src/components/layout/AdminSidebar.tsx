'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faKey, faRightFromBracket, faUser } from '@fortawesome/free-solid-svg-icons';
import useAuth, { MIN_PASSWORD_LENGTH } from '@/hooks/useAuth';
import React, { useEffect, useMemo, useState } from 'react';
import {
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarMenuSub,
  SidebarMenuSubItem,
  SidebarMenuSubButton,
} from '@/components/ui/sidebar';
import { GencyaMark } from '@/components/layout/Brand';

type NavItem = {
  label: string;
  href: string;
};

const navItems: NavItem[] = [
  { label: 'Dashboard', href: '/admin/dashboard' },
  { label: 'Duyurular', href: '/admin/dashboard/announcements' },
  { label: 'Genel Üyelik', href: '/admin/dashboard/general-membership' },
  { label: 'Teknik Takım', href: '/admin/dashboard/technical-team' },
  { label: 'Başvuru Dönemleri', href: '/admin/dashboard/application-windows' },
  { label: 'Sponsor Mail', href: '/admin/dashboard/sponsor-mail' },
  { label: 'İletişim', href: '/admin/dashboard/contact' },
  { label: 'Admin Yönetimi', href: '/admin/dashboard/admin-management' },
  { label: 'Veri Yönetimi', href: '/admin/dashboard/data' },
];

// Başarılı değişiklikten sonra onChanged çağrılır (çıkış yapılıp login'e dönülür).
function ChangePasswordDialog({ onChanged }: { onChanged: () => void }) {
  const { changePassword } = useAuth();
  const [open, setOpen] = useState(false);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [repeatPassword, setRepeatPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);

  const handleOpenChange = (value: boolean) => {
    setOpen(value);
    // Kapanınca girilen şifreler bellekte kalmasın
    if (!value) {
      setCurrentPassword('');
      setNewPassword('');
      setRepeatPassword('');
      setError(null);
    }
  };

  // Şifreler trim'lenmez: baştaki/sondaki boşluk da şifrenin parçası.
  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (newPassword.length < MIN_PASSWORD_LENGTH) {
      setError(`Yeni şifre en az ${MIN_PASSWORD_LENGTH} karakter olmalıdır.`);
      return;
    }
    if (newPassword !== repeatPassword) {
      setError('Yeni şifreler eşleşmiyor.');
      return;
    }
    setIsSaving(true);
    const message = await changePassword(currentPassword, newPassword);
    setIsSaving(false);
    if (message) {
      setError(message);
      return;
    }
    alert('Şifreniz değiştirildi. Yeni şifrenizle tekrar giriş yapın.');
    onChanged();
  };

  return (
    <Dialog open={open} onOpenChange={handleOpenChange}>
      <DialogTrigger asChild>
        <Button
          variant="ghost"
          size="icon"
          className="text-muted-foreground hover:text-white cursor-pointer"
          aria-label="Şifre değiştir"
        >
          <FontAwesomeIcon icon={faKey} className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Şifre Değiştir</DialogTitle>
          <DialogDescription>Değişiklikten sonra yeni şifrenizle tekrar giriş yapmanız gerekir.</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="grid gap-4">
          <div className="grid gap-2">
            <Label htmlFor="current-password">Mevcut şifre</Label>
            <Input
              id="current-password"
              type="password"
              autoComplete="current-password"
              value={currentPassword}
              onChange={(e) => setCurrentPassword(e.target.value)}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="new-password">Yeni şifre</Label>
            <Input
              id="new-password"
              type="password"
              autoComplete="new-password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              placeholder={`En az ${MIN_PASSWORD_LENGTH} karakter`}
              required
            />
          </div>
          <div className="grid gap-2">
            <Label htmlFor="repeat-password">Yeni şifre (tekrar)</Label>
            <Input
              id="repeat-password"
              type="password"
              autoComplete="new-password"
              value={repeatPassword}
              onChange={(e) => setRepeatPassword(e.target.value)}
              required
            />
          </div>
          {error && (
            <div className="rounded-md bg-destructive/10 text-destructive px-3 py-2 text-sm" role="alert">
              {error}
            </div>
          )}
          <DialogFooter>
            <Button type="submit" disabled={isSaving} className="cursor-pointer">
              {isSaving ? 'Kaydediliyor...' : 'Şifreyi değiştir'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

export default function AdminSidebar() {
  const { isAuthenticated, getAuthDetail, logout } = useAuth();
  const pathname = usePathname();
  const router = useRouter();
  const [userName, setUserName] = useState<string>('');
  const [userEmail, setUserEmail] = useState<string>('');
  const [userRole, setUserRole] = useState<string>('');
  const [isTechnicalTeamOpen, setIsTechnicalTeamOpen] = useState<boolean>(false);

  useEffect(() => {
    let isMounted = true;
    const load = async () => {
      const detail = await getAuthDetail();
      if (!isMounted) return;
      if ('name' in detail && 'email' in detail) {
        setUserName(detail.name);
        setUserEmail(detail.email);
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const roleValue = (detail as any).role as string | undefined;
        setUserRole(roleValue || '');
      } else {
        setUserName('');
        setUserEmail('');
        setUserRole('');
      }
    };
    if (isAuthenticated) load();
    return () => {
      isMounted = false;
    };
  }, [getAuthDetail, isAuthenticated]);

  const activeHref = useMemo(() => pathname, [pathname]);
  const isTechnicalTeamRoute = useMemo(
    () => activeHref?.startsWith('/admin/dashboard/technical-team') ?? false,
    [activeHref]
  );

  useEffect(() => {
    // Yol teknik takım ile başlıyorsa otomatik açık kalsın
    if (isTechnicalTeamRoute) {
      setIsTechnicalTeamOpen(true);
    }
  }, [isTechnicalTeamRoute]);
  const visibleNavItems = useMemo(() => {
    if (userRole === 'admin') return navItems;
    const limitedRoles = ['navigation', 'vision', 'electronics'];
    if (limitedRoles.includes(userRole)) {
      return navItems.filter((n) => n.label === 'Teknik Takım');
    }
    if (userRole === 'sponsor') {
      return navItems.filter((n) => n.label === 'Sponsor Mail');
    }
    return [];
  }, [userRole]);

  const allowedTechSlug = useMemo(() => {
    const roleToSlug: Record<string, string | undefined> = {
      navigation: 'navigation',
      vision: 'vision',
      electronics: 'electronics',
    };
    return roleToSlug[userRole] ?? undefined;
  }, [userRole]);

  const handleLogoutClick = async () => {
    await logout();
    router.push('/admin/login');
  };

  return (
    <>
      <SidebarHeader className="gap-3">
        {/* Marka: Header'daki yazı düzeni, alt satırda "Yönetim Paneli" */}
        <div className="flex items-center gap-2.5 px-2 pt-2">
          <GencyaMark className="h-7" />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[15px] font-bold tracking-[0.08em]">GENÇYA</span>
            <span className="mt-1 font-mono text-[8.5px] uppercase tracking-[0.24em] text-muted-foreground">Yönetim Paneli</span>
          </span>
        </div>
        <div className="rounded-lg border bg-muted/40 p-2">
          <div className="flex items-center gap-2">
            <div className="flex size-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
              <FontAwesomeIcon icon={faUser} className="h-3.5 w-3.5" />
            </div>
            {/* Uzun ad/e-posta kesilmez, satır kırar; düğmeler alt satırda, metne tam genişlik kalır */}
            <div className="min-w-0 flex-1 [overflow-wrap:anywhere]">
              <p className="text-sm font-medium leading-tight">{userName || 'Kullanıcı'}</p>
              <p className="mt-0.5 text-xs leading-tight text-muted-foreground">{userEmail || '—'}</p>
            </div>
          </div>
          <div className="mt-2 flex justify-end gap-1 border-t pt-1.5">
            <ChangePasswordDialog onChanged={handleLogoutClick} />
            <Button
              variant="ghost"
              size="icon"
              className="text-muted-foreground hover:text-white cursor-pointer"
              aria-label="Çıkış yap"
              onClick={handleLogoutClick}
            >
              <FontAwesomeIcon icon={faRightFromBracket} className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Menü</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {visibleNavItems.map((item) => {
                const isActive = activeHref === item.href;
                if (item.label === 'Teknik Takım') {
                  return (
                    <SidebarMenuItem key={item.href}>
                      <SidebarMenuButton
                        isActive={isTechnicalTeamRoute}
                        className="flex w-full items-center justify-between cursor-pointer"
                        onClick={() => setIsTechnicalTeamOpen((prev) => !prev)}
                        aria-expanded={isTechnicalTeamOpen}
                        aria-controls="technical-team-submenu"
                        data-state={isTechnicalTeamOpen ? 'open' : 'closed'}
                      >
                        <span>{item.label}</span>
                        <FontAwesomeIcon
                          icon={faChevronDown}
                          className={`h-3 w-3 transition-transform ${isTechnicalTeamOpen ? 'rotate-180' : 'rotate-0'
                            }`}
                        />
                      </SidebarMenuButton>
                      {isTechnicalTeamOpen && (
                        <SidebarMenuSub id="technical-team-submenu">
                          {[
                            { label: 'Otonom Navigasyon', slug: 'navigation' },
                            { label: 'Görüntü İşleme', slug: 'vision' },
                            { label: 'Elektronik & Mekanik', slug: 'electronics' },
                          ]
                            .filter((sub) => {
                              // admin tüm altları görür; diğer roller sadece kendi alanını görür
                              if (userRole === 'admin') return true;
                              return allowedTechSlug ? sub.slug === allowedTechSlug : false;
                            })
                            .map((sub) => {
                              const href = `/admin/dashboard/technical-team/${sub.slug}`;
                              const isSubActive = activeHref === href;
                              return (
                                <SidebarMenuSubItem key={href}>
                                  <SidebarMenuSubButton asChild isActive={isSubActive}>
                                    <Link href={href}>
                                      <span>{sub.label}</span>
                                    </Link>
                                  </SidebarMenuSubButton>
                                </SidebarMenuSubItem>
                              );
                            })}
                        </SidebarMenuSub>
                      )}
                    </SidebarMenuItem>
                  );
                }
                return (
                  <SidebarMenuItem key={item.href}>
                    <SidebarMenuButton asChild isActive={isActive}>
                      <Link href={item.href}>
                        <span>{item.label}</span>
                      </Link>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter />
    </>
  );
}
