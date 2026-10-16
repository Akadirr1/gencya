import React from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faAnchor, faArrowRight, faBinoculars, faUser } from '@fortawesome/free-solid-svg-icons';
import { faGithub, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { AboutData } from '@/lib/aboutData';
import { NodeMark } from "@/components/layout/Brand";
import PageHeader from "@/components/layout/PageHeader";
import { cn } from "@/lib/utils";

interface AboutProps {
  data: AboutData;
}

/** Sayfa içi bölüm başlığı: düğüm, başlık, açıklama (ortalı). */
function SectionHeading({ title, description }: { title: string; description?: string }) {
  return (
    <div className="mb-12 mx-auto text-center max-w-3xl">
      <NodeMark />
      <h2 className="mb-3 text-3xl font-bold tracking-tight">{title}</h2>
      {description && <p className="mx-auto max-w-2xl text-muted-foreground">{description}</p>}
    </div>
  );
}

const socialLink = "rounded-md p-2 text-muted-foreground transition-colors outline-none hover:bg-primary/10 hover:text-primary focus-visible:ring-2 focus-visible:ring-ring";

export default function About({ data }: AboutProps) {
  const { pageContent, emblem, boardMembers, timelineEvents, focusAreas } = data;
  const { mission, vision } = pageContent.missionVision;

  return (
    <main className="flex flex-col gap-16 pb-16">
      <PageHeader eyebrow="Hakkımızda" title={pageContent.missionVision.title} />

      {/* Misyon ve Vizyon; geniş ekranda arma ikisinin ortasında. -mt-26 (gap-16 ile): diğer iç sayfalar gibi dalgaya 40px biner */}
      <section className="container relative -mt-26">
        <div className={cn("mx-auto max-w-6xl grid gap-6 md:grid-cols-2", emblem && "lg:grid-cols-[1fr_auto_1fr] lg:gap-8")}>
          {[{ ...mission, icon: faAnchor }, { ...vision, icon: faBinoculars }].map((item, index) => (
            <Card key={index} className="relative transition-shadow hover:shadow-featured">
              <span aria-hidden="true" className="label-mono absolute top-6 right-6 text-muted-foreground/70">
                {String(index + 1).padStart(2, "0")}
              </span>
              <CardHeader>
                <div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FontAwesomeIcon icon={item.icon} className="h-5 w-5" />
                </div>
                <CardTitle role="heading" aria-level={2} className="font-display text-lg">{item.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">{item.description}</p>
              </CardContent>
            </Card>
          ))}

          {emblem && (
            // Küçük ekranda kartların üstünde; lg'de 2. sütuna sabit, kartlar 1. ve 3. sütuna akar.
            <figure className="order-first flex flex-col items-center self-center md:col-span-2 lg:order-none lg:col-span-1 lg:col-start-2 lg:row-start-1">
              <div className="hud-frame p-3">
                <Image
                  src={emblem.image}
                  alt={emblem.alt}
                  width={400}
                  height={400}
                  className="size-44 rounded-full shadow-featured ring-1 ring-border md:size-52"
                />
              </div>
              <figcaption className="label-mono mt-3 text-center text-muted-foreground">{emblem.caption}</figcaption>
            </figure>
          )}
        </div>
      </section>

      {/* Yönetim Kurulu: tek sıra/çok sıra fark etmez, ortalı akar */}
      <section className="container">
        <SectionHeading title={pageContent.boardMembers.title} description={pageContent.boardMembers.description} />

        <div className="mx-auto flex max-w-6xl flex-wrap justify-center gap-6">
          {boardMembers.map((member, index) => (
            <Card key={index} className="w-full max-w-64 gap-0 overflow-hidden p-4 transition-shadow hover:shadow-featured sm:w-64">
              <div className="hud-frame p-2">
                <AspectRatio ratio={1 / 1} className="overflow-hidden rounded-md bg-muted">
                  {member?.image && !member.image.includes("placeholder") ? (
                    <Image
                      src={member.image}
                      alt={`${member.name} fotoğrafı`}
                      fill
                      sizes="256px"
                      className="object-cover"
                    />
                  ) : (
                    <div className="bg-chart flex h-full w-full items-center justify-center">
                      {/* teamDetail.tsx ile aynı; FA'nın kendi height:1em kuralı h-*'ı ezdiği için boyut text-* ile */}
                      <span className="grid size-16 place-items-center rounded-full border border-primary/25 bg-background text-primary/70 ring-8 ring-primary/5">
                        <FontAwesomeIcon icon={faUser} className="text-2xl" />
                      </span>
                    </div>
                  )}
                </AspectRatio>
              </div>

              <CardHeader className="px-0 pt-3 pb-2">
                <CardTitle role="heading" aria-level={3} className="font-display text-lg">{member?.name}</CardTitle>
                <CardDescription className="font-medium text-primary">{member?.role}</CardDescription>
              </CardHeader>

              <CardContent className="px-0">
                <p className="text-sm text-muted-foreground">{member?.department}</p>

                {(member?.github || member?.linkedin) && (
                  <div className="mt-3 -ml-2 flex gap-1">
                    {member?.github && (
                      <a
                        href={member.github}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={socialLink}
                        aria-label={`${member.name} GitHub profili`}
                      >
                        <FontAwesomeIcon icon={faGithub} className="h-5 w-5" />
                      </a>
                    )}
                    {member?.linkedin && (
                      <a
                        href={member.linkedin}
                        target="_blank"
                        rel="noopener noreferrer"
                        className={socialLink}
                        aria-label={`${member.name} LinkedIn profili`}
                      >
                        <FontAwesomeIcon icon={faLinkedin} className="h-5 w-5" />
                      </a>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* Tarihçe: seyir haritasında rota; her olay bir uğrak noktası, ilki şimdiki konum */}
      <section className="bg-muted bg-chart py-16">
        <div className="container">
          <SectionHeading title={pageContent.timeline.title} description={pageContent.timeline.description} />

          <ol className="mx-auto max-w-2xl">
            {timelineEvents.map((event, index) => {
              const last = index === timelineEvents.length - 1;
              return (
                <li key={index} className={cn("relative pl-14", !last && "pb-8")}>
                  {!last && (
                    <span aria-hidden="true" className="absolute top-11 -bottom-3 left-[15px] border-l-2 border-dashed border-primary/35" />
                  )}
                  {/* top-3: düğümün ortası kartın tarih satırıyla aynı hizada */}
                  <span aria-hidden="true" className="absolute top-3 left-0 grid size-8 place-items-center rounded-full border-2 border-primary bg-background">
                    {/* JSON en yeni olayı başta listeliyor: şimdiki konum ilk olay */}
                    <span className={cn("size-2.5 rounded-full", index === 0 ? "bg-sinyal motion-safe:animate-beacon" : "bg-primary")} />
                  </span>

                  <div className="rounded-xl border bg-card p-5 shadow-sm">
                    <p className="label-mono mb-2 text-primary">{event.year}</p>
                    <h3 className="text-xl font-bold tracking-tight">{event.title}</h3>
                    <p className="mt-2 text-muted-foreground">{event.description}</p>
                  </div>
                </li>
              );
            })}
          </ol>
        </div>
      </section>

      {/* Çalışma Alanları */}
      <section className="container">
        <SectionHeading title={pageContent.focusAreas.title} description={pageContent.focusAreas.description} />

        <div className="mx-auto max-w-6xl grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {focusAreas.map((area, index) => {
            const card = (
              <Card className="relative h-full transition-shadow hover:shadow-featured">
                <span aria-hidden="true" className="label-mono absolute top-6 right-6 text-muted-foreground/70">
                  {String(index + 1).padStart(2, "0")}
                </span>
                <CardHeader>
                  <div className="mb-2 flex size-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FontAwesomeIcon icon={area.icon} className="h-5 w-5" />
                  </div>
                  <CardTitle role="heading" aria-level={3} className="font-display text-lg">{area.title}</CardTitle>
                </CardHeader>
                <CardContent className="flex flex-1 flex-col">
                  <p className="text-muted-foreground">{area.description}</p>
                  {area.team && (
                    <span className="mt-auto pt-4 text-sm font-medium text-primary">
                      Takımı incele <FontAwesomeIcon icon={faArrowRight} className="ml-1 h-3 w-3" />
                    </span>
                  )}
                </CardContent>
              </Card>
            );
            return area.team ? (
              <Link key={index} href={`/technical-team/${area.team}`} className="rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring">
                {card}
              </Link>
            ) : (
              <React.Fragment key={index}>{card}</React.Fragment>
            );
          })}
        </div>
      </section>

      {/* Katılım Çağrısı */}
      <section className="container">
        {/* Kenarlık: koyu temada kutu zeminden ayrılsın */}
        <div className="bg-deep mx-auto max-w-6xl overflow-hidden rounded-2xl border border-camgobegi/20 px-6 py-14 text-center text-white md:py-16">
          <NodeMark className="text-camgobegi" />
          <h2 className="mb-4 text-3xl font-bold tracking-tight">{pageContent.cta.title}</h2>
          <p className="mx-auto mb-8 max-w-2xl text-[#B9CDE3]">{pageContent.cta.description}</p>

          <Button asChild size="lg" className="bg-cta text-white shadow-cta hover:brightness-110">
            <Link href={pageContent.cta.href}>
              {pageContent.cta.buttonText} <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </div>
      </section>
    </main>
  );
}
