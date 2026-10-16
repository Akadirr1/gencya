'use client';

import { useState } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faMagnifyingGlass, faTriangleExclamation, faXmark } from '@fortawesome/free-solid-svg-icons';
import { Input } from '@/components/ui/input';
import { useRssFeed } from '@/hooks/useRssFeed';
import { SonarLoader } from "@/components/layout/Brand";
import PageHeader from "@/components/layout/PageHeader";
import { ArticleCard, FeedState } from "@/components/layout/RssSection";
import { cn } from '@/lib/utils';

const chip = "shrink-0 cursor-pointer whitespace-nowrap rounded-full border px-3 py-1 text-xs transition-colors";

export default function Publications() {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const { items, isLoading, error, isEmpty } = useRssFeed();

  // Kategorileri dinamik olarak çıkartma
  const allCategories = Array.from(
    new Set(
      items.flatMap(article => article.categories)
    )
  );

  // Makaleleri filtrele
  const articles = items.filter(article => {
    const matchesSearch =
      searchTerm === '' ||
      article.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      article.author.toLowerCase().includes(searchTerm.toLowerCase());

    const matchesCategories =
      selectedCategories.length === 0 ||
      article.categories.some(category => selectedCategories.includes(category));

    return matchesSearch && matchesCategories;
  });

  // Kategori seçimi işleyicisi
  const handleCategoryToggle = (category: string) => {
    setSelectedCategories(prev =>
      prev.includes(category)
        ? prev.filter(c => c !== category)
        : [...prev, category]
    );
  };

  return (
    <main className="flex flex-col pb-16">
      <PageHeader
        eyebrow="Teknik yazılar"
        title="Yayınlar"
        description="Takım üyelerimizin insansız deniz araçları ve deniz teknolojilerine dair bilgi ve deneyimlerini paylaştıkları makaleler. Medium üzerinden paylaşılan bu içerikler, çeşitli konularda derinlemesine bilgiler sunar."
      >
        {/* Arama Kutusu */}
        <div className="relative mx-auto w-full max-w-md">
          <FontAwesomeIcon
            icon={faMagnifyingGlass}
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-camgobegi"
          />
          <Input
            placeholder="Makale ara..."
            aria-label="Makale ara"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="h-11 rounded-full border-camgobegi/30 bg-white/5 pr-4 pl-11 text-white placeholder:text-[#9DB9D6] focus-visible:border-camgobegi focus-visible:ring-camgobegi/30 dark:bg-white/5"
          />
        </div>
      </PageHeader>

      <section className="container pt-6">
        {/* Kategori Filtreleme */}
        {allCategories.length > 0 && (
          <div className="mx-auto mb-8 flex max-w-6xl flex-col gap-3">
            {/* Kaydırılabilir çip satırı; kaydırma çubuğu gizli, sağda silinme göstergesi */}
            <div className="relative">
              <div className="-mx-1 flex gap-2 overflow-x-auto px-1 pb-1 [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
                {allCategories.map(category => {
                  const selected = selectedCategories.includes(category);
                  return (
                    <button
                      key={category}
                      type="button"
                      aria-pressed={selected}
                      onClick={() => handleCategoryToggle(category)}
                      className={cn(
                        chip,
                        selected
                          ? "border-primary/40 bg-primary/10 text-primary"
                          : "bg-card text-muted-foreground hover:border-primary/40 hover:text-foreground",
                      )}
                    >
                      {category}
                    </button>
                  );
                })}
              </div>
              <div aria-hidden="true" className="pointer-events-none absolute inset-y-0 right-0 w-12 bg-gradient-to-l from-background to-transparent" />
            </div>

            {/* Seçili Filtreler */}
            {selectedCategories.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="label-mono text-muted-foreground">Seçili</span>
                {selectedCategories.map(category => (
                  <button
                    key={`selected-${category}`}
                    type="button"
                    onClick={() => handleCategoryToggle(category)}
                    aria-label={`${category} filtresini kaldır`}
                    className={cn(chip, "inline-flex items-center gap-1.5 border-primary/40 bg-primary/10 text-primary hover:bg-primary/15")}
                  >
                    {category}
                    <FontAwesomeIcon icon={faXmark} className="h-3 w-3" />
                  </button>
                ))}
                <button
                  type="button"
                  onClick={() => setSelectedCategories([])}
                  className="cursor-pointer px-2 text-xs text-muted-foreground underline-offset-4 hover:text-primary hover:underline"
                >
                  Tümünü Temizle
                </button>
              </div>
            )}
          </div>
        )}

        {/* Makaleler Listesi */}
        {isLoading ? (
          <div className="flex justify-center items-center h-64">
            <SonarLoader label="Yayınlar yükleniyor" />
          </div>
        ) : error ? (
          <FeedState icon={faTriangleExclamation} label="Hata oluştu" text={error} />
        ) : isEmpty ? (
          <FeedState label="Henüz yayın yok" text="Henüz hiç yayın paylaşılmamış. Yakında burada yayınlar görünecek." />
        ) : articles.length === 0 ? (
          <FeedState
            icon={faMagnifyingGlass}
            label="Sonuç bulunamadı"
            text="Arama kriterlerinize uygun makale bulunamadı. Lütfen farklı anahtar kelimeler deneyin veya filtreleri temizleyin."
          />
        ) : (
          <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {articles.map((article, index) => (
              <ArticleCard key={index} article={article} />
            ))}
          </div>
        )}
      </section>
    </main>
  );
}
