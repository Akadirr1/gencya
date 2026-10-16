'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faCheck, faLock, faClock, faTriangleExclamation, faUsers, faCode, faLaptopCode, faRobot, faCompass, faEye, faMicrochip, faShip, faAnchor, faFlask, faTrophy, faWater } from '@fortawesome/free-solid-svg-icons';
import { IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { useApplicationWindows } from '@/hooks/useApplicationWindows';
import { windowSummary } from '@/lib/applicationWindow';
import { SonarLoader } from "@/components/layout/Brand";
import PageHeader from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

// İkon eşleştirme fonksiyonu
const ICONS: Record<string, IconDefinition> = { faUsers, faCode, faLaptopCode, faRobot, faCompass, faEye, faMicrochip, faShip, faAnchor, faFlask, faTrophy, faWater };
const getIconByName = (iconName: string) => ICONS[iconName] ?? faShip;

type Filter = 'all' | 'open' | 'closed';
const FILTERS: { value: Filter; label: string; icon?: IconDefinition }[] = [
    { value: 'all', label: 'Tümü' },
    { value: 'open', label: 'Açık', icon: faCheck },
    { value: 'closed', label: 'Kapalı', icon: faLock },
];

// Uygulama tipi için arayüz
interface Application {
    id: number;
    slug: string;
    title: string;
    description: string;
    type: string;
    icon: string;
}

export default function Apply() {
    const [applications, setApplications] = useState<(Application & {icon: IconDefinition})[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [filter, setFilter] = useState<Filter>('all');
    // Açık/kapalı kararı backend'de; alınamazsa hepsi kapalı görünür
    const { windows, isLoading: windowsLoading, error: windowsError } = useApplicationWindows();
    const isOpen = (slug: string) => windows?.[slug]?.isOpen === true;
    
    // JSON dosyasından başvuru verilerini yükleme
    useEffect(() => {
        const fetchApplications = async () => {
            try {
                const response = await fetch('/data/applications/index.json');
                if (!response.ok) {
                    throw new Error('Başvuru verileri yüklenemedi');
                }
                
                const data = await response.json();
                
                const applicationsWithIcons = data.map((app: Application) => ({
                    ...app,
                    icon: getIconByName(app.icon)
                }));
                
                setApplications(applicationsWithIcons);
            } catch (error) {
                console.error('Başvuru verileri alınırken hata:', error);
            } finally {
                setIsLoading(false);
            }
        };
        
        fetchApplications();
    }, []);
    
    const filteredApplications = applications.filter(app => {
        if (filter === 'open') return isOpen(app.slug);
        if (filter === 'closed') return !isOpen(app.slug);
        return true; // 'all' durumunda tüm başvuruları göster
    });

    return (
        <main className="flex flex-col pb-16">
            <PageHeader
                eyebrow="Başvuru"
                title="Başvurular"
                description="Gençya Teknoloji'ye üyelik ve teknik takımlar için açık başvurularımızı inceleyebilirsiniz. Üye olmak veya teknik takımlarımızda yer almak için aşağıdaki formlardan size uygun olanı doldurabilirsiniz."
            >
                {/* Filtre: bandın üstünde bölümlü düğme grubu */}
                <div role="group" aria-label="Başvuruları filtrele" className="inline-flex gap-1 rounded-full border border-camgobegi/30 bg-white/5 p-1">
                    {FILTERS.map(({ value, label, icon }) => (
                        <Button
                            key={value}
                            variant="ghost"
                            size="sm"
                            aria-pressed={filter === value}
                            onClick={() => setFilter(value)}
                            className={cn(
                                "min-w-20 cursor-pointer rounded-full px-4 focus-visible:ring-camgobegi/70",
                                filter === value
                                    ? "bg-white text-derin hover:bg-white hover:text-derin dark:hover:bg-white"
                                    : "text-[#B9CDE3] hover:bg-white/10 hover:text-white dark:hover:bg-white/10",
                            )}
                        >
                            {icon && <FontAwesomeIcon icon={icon} className="h-3 w-3" />}
                            {label}
                        </Button>
                    ))}
                </div>
            </PageHeader>

            {/* Başvuru Kartları: dalganın üstüne hafifçe biner */}
            <section className="container relative -mt-10">
                {windowsError && (
                    <p className="mx-auto mb-6 flex max-w-6xl items-center gap-3 rounded-lg border border-destructive/40 bg-card px-4 py-3 text-sm text-foreground shadow-sm" role="alert">
                        <FontAwesomeIcon icon={faTriangleExclamation} className="h-4 w-4 shrink-0 text-destructive" />
                        {windowsError}
                    </p>
                )}
                <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2">
                    {isLoading || windowsLoading ? (
                        <div className="col-span-full pt-20 pb-12">
                            <SonarLoader label="Başvurular yükleniyor" />
                        </div>
                    ) : filteredApplications.length > 0 ? (
                        filteredApplications.map((application) => {
                            const open = isOpen(application.slug);
                            const w = windows?.[application.slug];
                            // Kapalıyken meta satırı yok, çip söylüyor; durum alınamadıysa çip yok (bilinmiyor)
                            const meta = w && w.state !== 'closed' ? windowSummary(w) : windowsError ? 'Durum alınamadı' : null;
                            return (
                                <Card key={application.id} className="relative transition-shadow hover:shadow-featured">
                                    <span aria-hidden="true" className="label-mono absolute top-6 right-6 text-muted-foreground/70">
                                        {String(application.id).padStart(2, "0")}
                                    </span>
                                    <CardHeader>
                                        <div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                                            <FontAwesomeIcon icon={application.icon} className="h-5 w-5" />
                                        </div>
                                        <CardTitle className="font-display text-lg leading-snug">{application.title}</CardTitle>
                                        <CardDescription className="text-[15px]">
                                            {application.description}
                                        </CardDescription>
                                    </CardHeader>
                                    <CardContent className="mt-auto flex flex-col gap-4 border-t pt-5 sm:flex-row sm:items-center sm:justify-between">
                                        {meta && (
                                            <p className="label-mono flex items-start gap-2 text-muted-foreground">
                                                <FontAwesomeIcon icon={faClock} className={cn("mt-px h-3.5 w-3.5 shrink-0", open && "text-primary")} />
                                                {meta}
                                            </p>
                                        )}
                                        {open ? (
                                            <Button
                                                asChild
                                                variant="outline"
                                                className="shrink-0 self-start border-primary/30 text-primary hover:bg-primary/10 hover:text-primary sm:self-auto dark:border-primary/30 dark:hover:bg-primary/10"
                                            >
                                                <Link href={`/apply/${application.slug}`}>
                                                    Başvur <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
                                                </Link>
                                            </Button>
                                        ) : (w || !windowsError) && (
                                            <span className="inline-flex shrink-0 items-center gap-1.5 self-start rounded-full border px-2.5 py-0.5 text-xs text-muted-foreground sm:self-auto">
                                                {w?.state === 'scheduled' ? 'Yakında' : <><FontAwesomeIcon icon={faLock} className="h-3 w-3" />Kapalı</>}
                                            </span>
                                        )}
                                    </CardContent>
                                </Card>
                            );
                        })
                    ) : (
                        <div className="col-span-full rounded-xl border border-dashed bg-card bg-chart px-6 py-14 text-center">
                            <span aria-hidden="true" className="mx-auto mb-4 grid size-12 place-items-center rounded-full border-2 border-primary/25">
                                <span className="grid size-6 place-items-center rounded-full border-2 border-primary/40">
                                    <span className="size-1.5 rounded-full bg-primary" />
                                </span>
                            </span>
                            <p className="label-mono text-muted-foreground">Sonuç yok</p>
                            <p className="mt-2 text-muted-foreground">Seçtiğiniz filtreye uygun başvuru bulunamadı.</p>
                        </div>
                    )}
                </div>
            </section>
            
            {/* Bilgilendirme: seyir haritası ızgaralı kutu */}
            <section className="container mt-16">
                <div className="mx-auto max-w-6xl rounded-xl border bg-muted/50 bg-chart p-6 md:p-8">
                    <p className="label-mono mb-2 text-primary">Bilgi</p>
                    <h2 className="mb-6 text-xl font-semibold tracking-tight">Başvuru Süreci Hakkında</h2>
                    <ol className="grid gap-6 md:grid-cols-3">
                        {[
                            <>Başvurunuz değerlendirildikten sonra sizinle e-posta veya telefonla iletişime geçilecektir.</>,
                            <>Teknik takım başvurularında mülakat süreci olabilir. Bu başvurular takım yönetimi tarafından değerlendirilecek ve sonuçlar kayıtlı e-posta adresiniz veya telefon numaranız üzerinden size bildirilecektir.</>,
                            <>Her öğrenci yalnızca tek bir başvuru yapabilir. Hata veya sorun yaşamanız durumunda, lütfen <Link href="/contact" className="text-primary underline underline-offset-4">iletişim</Link> kısmından bizimle iletişime geçiniz.</>,
                        ].map((text, i) => (
                            <li key={i} className="flex gap-4 md:flex-col md:gap-3">
                                <span aria-hidden="true" className="grid size-8 shrink-0 place-items-center rounded-full border border-primary/30 bg-card font-mono text-[10px] font-medium text-primary">
                                    {String(i + 1).padStart(2, "0")}
                                </span>
                                <p className="text-muted-foreground">{text}</p>
                            </li>
                        ))}
                    </ol>
                </div>
            </section>
        </main>
    );
}
