import { useId } from "react";
import { cn } from "@/lib/utils";
import { GENCYA_MARK_PATH } from "./gencyaMarkPath";

// Gençya'nın görsel dili: logodaki GY işareti ve onun "devre düğümü" (halka + çizgi + nokta),
// sonar halkaları. Renkler globals.css'teki --mark-* ve marka değişkenlerinden.

/** Logodaki GY işareti. Gradyan --mark-1..3'ten: açık temada logonun renkleri, koyu tema ve
 *  bg-deep içinde bir ton açık. Genişlik/yükseklik className ile (oran ~2.2:1). */
export function GencyaMark({ className, title }: { className?: string; title?: string }) {
  const id = useId();
  return (
    <svg
      viewBox="8 8 478 217"
      role={title ? "img" : undefined}
      aria-hidden={title ? undefined : true}
      aria-label={title}
      className={cn("h-8 w-auto", className)}
    >
      <defs>
        <linearGradient id={id} x1="0.85" y1="0" x2="0.25" y2="1">
          <stop offset="0" stopColor="var(--mark-1)" />
          <stop offset="0.5" stopColor="var(--mark-2)" />
          <stop offset="1" stopColor="var(--mark-3)" />
        </linearGradient>
      </defs>
      <path fill={`url(#${id})`} fillRule="evenodd" d={GENCYA_MARK_PATH} />
    </svg>
  );
}

/** Bölüm başlığının üstündeki düğüm: logodaki halka ve çizgi, ucunda camgöbeği nokta (○──●).
 *  inline-flex: kabın text-align'ını izler. */
export function NodeMark({ className }: { className?: string }) {
  return (
    <span aria-hidden="true" data-slot="node-mark" className={cn("mb-3 inline-flex text-primary", className)}>
      <svg viewBox="0 0 46 12" className="h-3 w-[46px]">
        <circle cx="6" cy="6" r="3.6" fill="none" stroke="currentColor" strokeWidth="2" />
        <path d="M10 6h24" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        <circle cx="40" cy="6" r="3.4" fill="var(--camgobegi)" />
      </svg>
    </span>
  );
}

/** Sonar yankısı: merkezden üç halka büyüyüp söner; altında mono etiket. Hareket azaltma
 *  açıkken halkalar durur, sabit üç halka görünür. */
export function SonarLoader({ label, className }: { label: string; className?: string }) {
  return (
    <div role="status" data-slot="sonar-loader" className={cn("flex flex-col items-center gap-3", className)}>
      <span aria-hidden="true" className="relative grid size-12 place-items-center">
        {["motion-reduce:scale-40", "motion-reduce:scale-70", "motion-reduce:opacity-40"].map((still, i) => (
          <span
            key={i}
            className={cn("absolute inset-0 rounded-full border-2 border-primary/70 motion-safe:animate-sonar", still)}
            // Negatif gecikme: halkalar açılışta üst üste değil, sırayla dağılmış başlasın.
            style={{ animationDelay: `${(i - 3) * 0.8}s` }}
          />
        ))}
        <span className="size-2 rounded-full bg-sinyal" />
      </span>
      <span className="label-mono text-muted-foreground">{label}</span>
    </div>
  );
}
