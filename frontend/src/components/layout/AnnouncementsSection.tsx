'use client';

import Link from "next/link";
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faBullhorn, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter } from "@/components/ui/card";
import useAnnouncements from '@/hooks/useAnnouncements';
import { NodeMark, SonarLoader } from "@/components/layout/Brand";

type AnnouncementsSectionProps = {
  title: string;
  description: string;
  viewAllHref: string;
  viewAllText: string;
  maxItems?: number;
};

function EmptyState({ icon, label, text }: { icon: IconDefinition; label: string; text: string }) {
  return (
    <div className="bg-chart flex flex-col items-center rounded-xl border border-dashed px-6 py-10 text-center">
      <span aria-hidden="true" className="mb-4 grid size-12 place-items-center rounded-full border border-primary/30 bg-background text-primary ring-8 ring-primary/5">
        <FontAwesomeIcon icon={icon} className="h-5 w-5" />
      </span>
      <p className="label-mono mb-1 text-foreground">{label}</p>
      <p className="text-sm text-muted-foreground">{text}</p>
    </div>
  );
}

export default function AnnouncementsSection({
  title,
  description,
  viewAllHref,
  viewAllText,
  maxItems = 2
}: AnnouncementsSectionProps) {
  const { announcements, isLoading, error } = useAnnouncements(maxItems);

  // Tarih formatını düzenleyen yardımcı fonksiyon
  const formatDate = (dateString: string) => {
    try {
      return format(new Date(dateString), 'd MMMM yyyy', { locale: tr });
    } catch {
      return dateString; // Hatalı tarih formatı durumunda orijinal string'i döndür
    }
  };

  return (
    <section className="container last:pb-16">
      <div className="mb-12 mx-auto text-center max-w-3xl">
        <NodeMark />
        <h2 className="mb-3 text-3xl font-bold tracking-tight">{title}</h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          {description}
        </p>
      </div>

      <div className="mx-auto max-w-3xl">
        {/* Duyurular */}
        <Card className="gap-0 py-0">
          <CardContent className="py-2">
            {isLoading ? (
              <div className="flex justify-center items-center h-40">
                <SonarLoader label="Duyurular yükleniyor" />
              </div>
            ) : error ? (
              <div className="py-4">
                <EmptyState icon={faTriangleExclamation} label="Bağlantı kurulamadı" text="Duyurular yüklenirken bir hata oluştu." />
              </div>
            ) : announcements.length === 0 ? (
              <div className="py-4">
                <EmptyState icon={faBullhorn} label="Henüz duyuru yok" text="Şu an gösterilecek duyuru bulunmamaktadır." />
              </div>
            ) : (
              <ul className="divide-y">
                {announcements.map((announcement) => (
                  <li key={announcement._id} className="py-5">
                    <p className="label-mono mb-2 flex flex-wrap items-center gap-x-2 text-muted-foreground">
                      <time dateTime={announcement.createdAt}>{formatDate(announcement.createdAt)}</time>
                      <span aria-hidden="true" className="text-primary/50">·</span>
                      <span className="text-primary">{announcement.category}</span>
                    </p>
                    <h3 className="mb-1 text-base font-semibold leading-snug">{announcement.title}</h3>
                    <p className="text-sm text-muted-foreground">
                      {announcement.summary}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </CardContent>
          <CardFooter className="justify-center border-t py-4 [.border-t]:pt-4">
            <Button asChild variant="outline" size="sm" className="cursor-pointer">
              <Link href={viewAllHref}>
                {viewAllText} <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
              </Link>
            </Button>
          </CardFooter>
        </Card>
      </div>
    </section>
  );
}
