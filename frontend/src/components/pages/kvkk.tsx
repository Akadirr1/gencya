import type { KvkkData } from '@/lib/kvkkData';
import PageHeader from "@/components/layout/PageHeader";

export default function Kvkk({ data }: { data: KvkkData }) {
  return (
    <main className="flex flex-col pb-16">
      <PageHeader eyebrow="KVKK" title={data.title}>
        <p className="label-mono text-[#9DB9D6]">
          Son güncelleme<span className="mx-2 text-camgobegi/60">·</span>
          <span className="text-white">{data.lastUpdated}</span>
        </p>
      </PageHeader>

      {/* Metin: dalganın üstüne binen tek sayfalık belge */}
      <section className="container relative -mt-10">
        <article className="mx-auto max-w-2xl rounded-xl border bg-card px-5 py-8 shadow-sm sm:px-10 md:py-12">
          <div className="space-y-4 leading-7 text-foreground/90 md:text-[17px]">
            {data.intro.map((text, index) => (
              <p key={index}>{text}</p>
            ))}
          </div>

          {data.sections.map((section) => {
            // "1. Veri Sorumlusu" → numara mono etikette, başlık ayrı
            const [, num, title] = section.title.match(/^(\d+)\.\s*(.+)$/) ?? [null, null, section.title];
            return (
              <section key={section.title} className="mt-10 border-t pt-8">
                <h2 className="mb-4 flex items-baseline gap-3 text-xl font-semibold tracking-tight">
                  {num && <span className="label-mono shrink-0 text-primary">{num.padStart(2, "0")}</span>}
                  <span>{title}</span>
                </h2>
                <div className="space-y-3 leading-7 text-muted-foreground md:text-[17px]">
                  {section.paragraphs?.map((text, index) => (
                    <p key={index}>{text}</p>
                  ))}
                  {section.items && (
                    <ul className="list-disc space-y-2 pl-5 marker:text-primary">
                      {section.items.map((item, index) => (
                        <li key={index} className="pl-1">{item}</li>
                      ))}
                    </ul>
                  )}
                  {section.after?.map((text, index) => (
                    <p key={index}>{text}</p>
                  ))}
                </div>
              </section>
            );
          })}
        </article>
      </section>
    </main>
  );
}
