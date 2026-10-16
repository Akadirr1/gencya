'use client';

import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowRight, faFileLines, faTriangleExclamation } from '@fortawesome/free-solid-svg-icons';
import { type IconDefinition } from '@fortawesome/fontawesome-svg-core';
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { AspectRatio } from "@/components/ui/aspect-ratio";
import { useRssFeed } from '@/hooks/useRssFeed';
import { GencyaMark, NodeMark, SonarLoader } from "@/components/layout/Brand";
import { cn } from "@/lib/utils";

type Article = ReturnType<typeof useRssFeed>['items'][number];

type RssSectionProps = {
  title: string;
  description: string;
  viewAllHref: string;
  viewAllText: string;
  maxItems?: number;
};

/** Boş/hata durumu: kesikli kenarlı harita ızgarası, ortada ikon halkası. Yayınlar sayfası da kullanır. */
export function FeedState({ label, text, icon = faFileLines }: { label: string; text: string; icon?: IconDefinition }) {
  return (
    <div className="bg-chart mx-auto flex max-w-3xl flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center">
      <span aria-hidden="true" className="mb-6 grid size-16 place-items-center rounded-full border border-primary/30 bg-background text-primary ring-8 ring-primary/5">
        <FontAwesomeIcon icon={icon} className="h-6 w-6" />
      </span>
      <p className="label-mono mb-2 text-foreground">{label}</p>
      <p className="max-w-md text-muted-foreground">{text}</p>
    </div>
  );
}

/** Medium makale kartı: 16:9 kapak (yoksa batimetrili derin deniz zemini), meta satırı, özet. */
export function ArticleCard({ article, className }: { article: Article; className?: string }) {
  return (
    <Card className={cn("relative h-full gap-0 overflow-hidden py-0 transition-shadow hover:shadow-featured", className)}>
      <AspectRatio ratio={16 / 9}>
        {article.coverImage ? (
          <Image
            src={article.coverImage}
            alt=""
            fill
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            className="object-cover"
          />
        ) : (
          <div className="bg-deep grid h-full w-full place-items-center">
            <GencyaMark className="h-9 opacity-80" />
          </div>
        )}
      </AspectRatio>
      <CardHeader className="gap-2 pt-5">
        <p className="label-mono flex flex-wrap items-center gap-x-2 text-muted-foreground">
          <span>{article.date}</span>
          <span aria-hidden="true" className="text-primary/50">·</span>
          <span className="text-primary">{article.author}</span>
        </p>
        <CardTitle className="font-display text-lg leading-snug line-clamp-2">
          {article.title}
        </CardTitle>
      </CardHeader>
      <CardContent className="pt-2">
        <p className="line-clamp-3 text-sm text-muted-foreground">
          {article.excerpt}
        </p>
      </CardContent>
      <CardFooter className="mt-auto justify-end pt-3 pb-4">
        {/* after: kartın tamamı bağlantı, odaklanan öğe yine tek bağlantı */}
        <Button
          variant="ghost"
          size="sm"
          className="text-primary after:absolute after:inset-0 hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/10"
          asChild
        >
          <a href={article.link} target="_blank" rel="noopener noreferrer">
            Medium&apos;da Oku <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
          </a>
        </Button>
      </CardFooter>
    </Card>
  );
}

export default function RssSection({
  title,
  description,
  viewAllHref,
  viewAllText,
  maxItems = 3
}: RssSectionProps) {
  const { items: articles, isLoading, error } = useRssFeed();

  return (
    <section className="container pb-16">
      <div className="mb-12 mx-auto text-center max-w-3xl">
        <NodeMark />
        <h2 className="mb-3 text-3xl font-bold tracking-tight">{title}</h2>
        <p className="mx-auto max-w-2xl text-muted-foreground">
          {description}
        </p>
      </div>

      {isLoading ? (
        <div className="flex justify-center items-center h-64">
          <SonarLoader label="Yayınlar yükleniyor" />
        </div>
      ) : error ? (
        <FeedState icon={faTriangleExclamation} label="Hata oluştu" text={error} />
      ) : articles.length === 0 ? (
        <FeedState label="Henüz yayın yok" text="Yakında takım üyelerimizin deniz teknolojilerine dair makaleleri burada yer alacak." />
      ) : (
        <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {articles.slice(0, maxItems).map((article, index) => (
            <ArticleCard key={index} article={article} className={index === 1 ? 'hidden md:flex' : index > 1 ? 'hidden lg:flex' : undefined} />
          ))}
        </div>
      )}

      {articles.length > 0 && (
        <div className="mt-8 flex justify-center">
          <Button asChild variant="outline">
            <Link href={viewAllHref}>
              {viewAllText} <FontAwesomeIcon icon={faArrowRight} className="h-3.5 w-3.5" />
            </Link>
          </Button>
        </div>
      )}
    </section>
  );
}
