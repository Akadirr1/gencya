import { NodeMark } from "@/components/layout/Brand";
import { cn } from "@/lib/utils";

/** İç sayfaların başı: kısa derin deniz bandı, mono üst etiket, başlık, açıklama ve dalga kenarı.
 *  children başlığın altına gelir (ör. arama kutusu, filtre, takım rozeti). */
export default function PageHeader({
  eyebrow,
  title,
  description,
  children,
  className,
}: {
  eyebrow: string;
  title: string;
  description?: string;
  children?: React.ReactNode;
  className?: string;
}) {
  return (
    <section className={cn("bg-deep overflow-hidden pt-14 pb-20 text-white md:pt-20 md:pb-24", className)}>
      <div className="container px-4 text-center sm:px-6 lg:px-8">
        <NodeMark className="text-camgobegi" />
        <p className="label-mono mb-3 text-camgobegi">{eyebrow}</p>
        <h1 className="mx-auto max-w-3xl text-3xl font-bold tracking-tight text-balance md:text-5xl">{title}</h1>
        {description && <p className="mx-auto mt-4 max-w-2xl text-[#B9CDE3] md:text-lg">{description}</p>}
        {children && <div className="mt-8">{children}</div>}
      </div>
      <div aria-hidden="true" className="wave-edge bottom-0" />
    </section>
  );
}
