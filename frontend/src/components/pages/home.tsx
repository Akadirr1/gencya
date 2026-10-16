import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faLocationCrosshairs } from '@fortawesome/free-solid-svg-icons';
import { type IconProp } from '@fortawesome/fontawesome-svg-core';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { HomeData } from '@/lib/homeData';
import AnnouncementsSection from '@/components/layout/AnnouncementsSection';
import RssSection from '@/components/layout/RssSection';
import VehicleSection from '@/components/layout/VehicleSection';
import SonarScope from '@/components/layout/SonarScope';
import { RSS_ENABLED } from '@/lib/utils';
import { NodeMark } from "@/components/layout/Brand";

type HomeProps = {
  homeData: HomeData;
};

export default function Home({ homeData }: HomeProps) {
  const { hero } = homeData;
  const [before, after] = hero.title.split(hero.titleHighlight);

  return (
    <main className="flex flex-col gap-16">
      {/* 1. Hero: derin deniz bandı, sağda sonar ekranı */}
      <section className="bg-deep overflow-hidden pt-14 pb-24 text-white md:pt-24 md:pb-32 lg:pt-28">
        <div className="container px-4 sm:px-6 lg:px-8">
          <div className="grid items-center gap-14 lg:grid-cols-[1.05fr_0.95fr]">
            <div className="flex flex-col items-center text-center lg:items-start lg:text-left">
              <div className="mb-6 inline-flex items-center gap-2.5 rounded-full border border-camgobegi/30 bg-white/5 px-4 py-1.5 text-camgobegi">
                <span aria-hidden="true" className="size-2 rounded-full bg-sinyal motion-safe:animate-beacon" />
                <span className="label-mono">{hero.badge}</span>
              </div>

              <h1 className="mb-6 text-4xl font-bold tracking-tight text-balance md:text-5xl lg:text-6xl lg:leading-[1.05]">
                {before}
                {/* Vurgulu kelimenin altında ufuk çizgisi, ucunda logodaki nokta */}
                <span className="relative inline-block bg-gradient-to-br from-[#A8E6FB] to-camgobegi bg-clip-text pb-1 text-transparent">
                  {hero.titleHighlight}
                  <span aria-hidden="true" className="absolute bottom-0 left-0 h-[3px] w-[calc(100%-0.6em)] rounded-full bg-gradient-to-r from-camgobegi/0 via-camgobegi/70 to-camgobegi" />
                  <span aria-hidden="true" className="absolute -bottom-[3px] right-[0.15em] size-[9px] rounded-full bg-camgobegi" />
                </span>
                {after}
              </h1>

              <p className="mb-8 max-w-xl text-lg text-[#B9CDE3]">
                {hero.description}
              </p>

              <div className="flex flex-col gap-4 sm:flex-row sm:gap-5">
                <Button asChild size="lg" className="bg-cta text-white shadow-cta hover:brightness-110">
                  <Link href={hero.primaryButton.href}>
                    {hero.primaryButton.text} <FontAwesomeIcon icon={faArrowRight} className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
                <Button
                  variant="outline"
                  size="lg"
                  asChild
                  className="border-camgobegi/35 bg-white/5 text-white hover:bg-white/10 hover:text-white dark:border-camgobegi/35 dark:bg-white/5 dark:hover:bg-white/10"
                >
                  <Link href={hero.secondaryButton.href}>
                    {hero.secondaryButton.text}
                  </Link>
                </Button>
              </div>

              {/* Konum satırı: seyir ekranındaki koordinat okuması */}
              <p className="mt-10 flex items-center gap-2.5 text-[#9DB9D6]">
                <FontAwesomeIcon icon={faLocationCrosshairs} className="h-3.5 w-3.5 text-camgobegi" />
                <span className="label-mono">
                  <span className="text-white">{hero.position.coordinates}</span>
                  <span className="mx-2 text-camgobegi/60">·</span>
                  {hero.position.label}
                </span>
              </p>
            </div>

            <div className="relative mx-auto w-full max-w-[340px] sm:max-w-[400px] lg:max-w-[460px] lg:justify-self-end">
              <SonarScope />
            </div>
          </div>
        </div>
        <div aria-hidden="true" className="wave-edge bottom-0" />
      </section>

      {/* 2. Kulüp Tanıtımı */}
      <section className="container">
        <div className="mb-12 mx-auto text-center max-w-3xl">
          <NodeMark />
          <h2 className="mb-3 text-3xl font-bold tracking-tight">{homeData.clubIntroduction.title}</h2>
          <p className="mx-auto max-w-2xl text-muted-foreground">
            {homeData.clubIntroduction.description}
          </p>
        </div>

        <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {homeData.clubIntroduction.features.map((feature, index) => (
            <Card key={index} className="group relative transition-shadow hover:shadow-featured">
              <span aria-hidden="true" className="label-mono absolute top-6 right-6 text-muted-foreground/70">
                {String(index + 1).padStart(2, "0")}
              </span>
              <CardHeader>
                <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <FontAwesomeIcon icon={feature.icon as IconProp} className="h-5 w-5" />
                </div>
                <CardTitle className="font-display text-lg">{feature.title}</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-muted-foreground">
                  {feature.description}
                </p>
              </CardContent>
            </Card>
          ))}
        </div>
      </section>

      {/* İDA: aracın alt sistemleri ve teknik çizimi */}
      <VehicleSection vehicle={homeData.vehicle} />

      {/* 3. Duyurular */}
      <AnnouncementsSection
        title={homeData.announcements.title}
        description={homeData.announcements.description}
        viewAllHref={homeData.announcements.viewAllHref}
        viewAllText={homeData.announcements.viewAllText}
        maxItems={2}
      />

      {/* 4. Medium Makaleleri */}
      {RSS_ENABLED && (
        <RssSection
          title={homeData.publications.title}
          description={homeData.publications.description}
          viewAllHref={homeData.publications.viewAllHref}
          viewAllText={homeData.publications.viewAllText}
          maxItems={3}
        />
      )}
    </main>
  );
}
