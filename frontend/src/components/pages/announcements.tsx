'use client';

import * as React from "react";
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faSearch, faBullhorn, faArrowRight, faChevronLeft, faChevronRight, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog';
import useAnnouncements from '@/hooks/useAnnouncements';
import { sanitizeHTML } from '@/lib/sanitizeHTML';
import { SonarLoader } from "@/components/layout/Brand";
import PageHeader from "@/components/layout/PageHeader";

export default function Announcements() {
    const {
        announcements,
        isLoading,
        error,
        currentPage,
        totalPages,
        searchTerm,
        searchInput,
        setSearchInput,
        handleSearch,
        goToPage,
        nextPage,
        prevPage,
        selectedAnnouncement,
        handleAnnouncementClick,
        closeAnnouncementDetail
    } = useAnnouncements(5);

    // Tarih formatını düzenleyen yardımcı fonksiyon
    const formatDate = (dateString: string) => {
        try {
            return format(new Date(dateString), 'd MMMM yyyy', { locale: tr });
        } catch {
            return dateString; // Hatalı tarih formatı durumunda orijinal string'i döndür
        }
    };

    // Liste gösterilemediğinde kutuda ne yazacağı: hata, sonuçsuz arama ya da hiç duyuru yok
    const emptyState = error
        ? { icon: faTriangleExclamation, label: 'Bağlantı kurulamadı', text: 'Duyurular yüklenirken bir hata oluştu.' }
        : searchTerm
            ? { icon: faSearch, label: 'Sonuç yok', text: `“${searchTerm}” için duyuru bulunamadı.` }
            : { icon: faBullhorn, label: 'Henüz duyuru yok', text: 'Şu an gösterilecek duyuru bulunmamaktadır.' };

    // Pagination numaralarını oluşturma
    const paginationItems = [];
    for (let i = 1; i <= totalPages; i++) {
        paginationItems.push(
            <Button
                key={i}
                variant={currentPage === i ? 'default' : 'outline'}
                size="sm"
                onClick={() => goToPage(i)}
                aria-current={currentPage === i ? 'page' : undefined}
                aria-label={`Sayfa ${i}`}
                className="size-9 p-0 font-mono text-xs"
            >
                {String(i).padStart(2, '0')}
            </Button>
        );
    }

    return (
        <main className="flex flex-col pb-16">
            <PageHeader
                eyebrow="Takımdan haberler"
                title="Duyurular"
                description="Gençya Teknoloji'ye ait en güncel duyurular ve etkinlik bilgilerine buradan ulaşabilirsiniz."
            >
                {/* Arama: yalnızca Enter'la tetiklenir (useAnnouncements.handleSearch) */}
                <div className="relative mx-auto w-full max-w-md">
                    <FontAwesomeIcon
                        icon={faSearch}
                        className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-camgobegi"
                    />
                    <Input
                        type="text"
                        placeholder="Duyuru ara..."
                        aria-label="Duyuru ara"
                        enterKeyHint="search"
                        className="h-11 rounded-full border-camgobegi/30 bg-white/5 pr-20 pl-11 pointer-coarse:pr-4 text-white placeholder:text-[#9DB9D6] focus-visible:border-camgobegi focus-visible:ring-camgobegi/30 dark:bg-white/5"
                        value={searchInput}
                        onChange={(e) => setSearchInput(e.target.value)}
                        onKeyDown={handleSearch}
                    />
                    <kbd aria-hidden="true" className="label-mono pointer-events-none absolute right-4 pointer-coarse:hidden top-1/2 -translate-y-1/2 text-[#9DB9D6]">
                        Enter
                    </kbd>
                </div>
            </PageHeader>

            <div className="container relative -mt-6 md:-mt-10">
                <div className="mx-auto max-w-3xl">
                    {isLoading ? (
                        <div className="flex h-64 items-center justify-center">
                            <SonarLoader label="Duyurular yükleniyor" />
                        </div>
                    ) : !error && announcements.length > 0 ? (
                        <div className="space-y-4">
                            {announcements.map((announcement) => (
                                <Card key={announcement._id} className="relative gap-3 transition-shadow hover:shadow-featured">
                                    <CardHeader className="gap-2">
                                        <p className="label-mono flex flex-wrap items-center gap-x-2 text-muted-foreground">
                                            <time dateTime={announcement.createdAt}>{formatDate(announcement.createdAt)}</time>
                                            <span aria-hidden="true" className="text-primary/50">·</span>
                                            <span className="text-primary">{announcement.category}</span>
                                        </p>
                                        <h2 className="font-display text-lg font-semibold leading-snug md:text-xl">{announcement.title}</h2>
                                    </CardHeader>
                                    <CardContent>
                                        <p className="text-muted-foreground">
                                            {announcement.summary}
                                        </p>
                                    </CardContent>
                                    <CardFooter className="justify-end">
                                        {/* after: kartın tamamı tıklanır, odaklanan öğe yine tek düğme */}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleAnnouncementClick(announcement)}
                                            className="cursor-pointer text-primary after:absolute after:inset-0 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/10"
                                        >
                                            Duyuruyu Oku <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
                                        </Button>
                                    </CardFooter>
                                </Card>
                            ))}
                        </div>
                    ) : (
                        <div className="bg-chart flex flex-col items-center rounded-xl border border-dashed bg-background px-6 py-14 text-center">
                            <span aria-hidden="true" className="mb-6 grid size-16 place-items-center rounded-full border border-primary/30 bg-background text-primary ring-8 ring-primary/5">
                                <FontAwesomeIcon icon={emptyState.icon} className="h-6 w-6" />
                            </span>
                            <h2 className="label-mono mb-2 text-foreground">{emptyState.label}</h2>
                            <p className="text-muted-foreground wrap-anywhere">{emptyState.text}</p>
                        </div>
                    )}

                    {/* Pagination */}
                    {totalPages > 1 && (
                        <nav aria-label="Sayfalar" className="mt-8 flex flex-wrap items-center justify-center gap-2">
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={prevPage}
                                disabled={currentPage === 1}
                                className="h-9"
                            >
                                <FontAwesomeIcon icon={faChevronLeft} className="h-3 w-3" /> Önceki
                            </Button>
                            <div className="flex gap-1">
                                {paginationItems}
                            </div>
                            <Button
                                variant="outline"
                                size="sm"
                                onClick={nextPage}
                                disabled={currentPage === totalPages}
                                className="h-9"
                            >
                                Sonraki <FontAwesomeIcon icon={faChevronRight} className="h-3 w-3" />
                            </Button>
                        </nav>
                    )}
                </div>

                {/* Duyuru Detay Dialog */}
                <Dialog open={!!selectedAnnouncement} onOpenChange={closeAnnouncementDetail}>
                    <DialogContent className="sm:max-w-2xl">
                        {selectedAnnouncement && (
                            <>
                                <DialogHeader className="border-b pb-4 pr-6 text-left">
                                    <DialogDescription className="label-mono flex flex-wrap items-center gap-x-2 text-[11px]">
                                        <time dateTime={selectedAnnouncement.createdAt}>{formatDate(selectedAnnouncement.createdAt)}</time>
                                        <span aria-hidden="true" className="text-primary/50">·</span>
                                        <span className="text-primary">{selectedAnnouncement.category}</span>
                                    </DialogDescription>
                                    <DialogTitle className="font-display text-xl leading-snug md:text-2xl">{selectedAnnouncement.title}</DialogTitle>
                                </DialogHeader>
                                {/* HTML içerik izin listesinden geçirilerek render ediliyor (p, br, ul, ol, li, strong, b) */}
                                <div
                                    className="rich-html max-h-[60vh] space-y-3 overflow-y-auto leading-relaxed text-muted-foreground [&_b]:text-foreground [&_ol]:list-decimal [&_ol]:pl-5 [&_strong]:text-foreground"
                                    dangerouslySetInnerHTML={{ __html: sanitizeHTML(selectedAnnouncement.content) }}
                                />
                                <div className="flex justify-end border-t pt-4">
                                    <Button variant="outline" onClick={closeAnnouncementDetail} className="cursor-pointer">Kapat</Button>
                                </div>
                            </>
                        )}
                    </DialogContent>
                </Dialog>
            </div>
        </main>
    );
}
