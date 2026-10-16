// Hero'nun sağındaki sonar/radar ekranı: kerteriz çizgileri, menzil halkaları, dönen tarama ışını
// ve ortada rota noktalarını izleyen İDA (üstten trimaran). Süs; ekran okuyucudan gizli.
// Çizim 400×400 birimlik; HTML öğeleri (tarama, yankılar) aynı koordinatlara yüzde ile oturur.

import { PLAN_HULL, PLAN_SUPERSTRUCTURE } from "./vehicleDrawing";

const C = 200; // merkez
const R = 180; // ölçek halkası

// Rota: geçilen nokta, araç (merkez), sıradaki hedef (turuncu), sonraki nokta
const PASSED: [number, number][] = [[118, 334], [158, 262]];
const NEXT: [number, number][] = [[266, 148], [306, 84]];
const CONTACTS: [number, number][] = [[96, 150], [290, 262], [236, 318], [334, 196]];
// Araç bir sonraki hedefe dönük: kuzeyden saat yönünde açı
const HEADING = (Math.atan2(NEXT[0][0] - C, C - NEXT[0][1]) * 180) / Math.PI;

const pct = (v: number) => `${(v / 400) * 100}%`;

function polar(deg: number, r: number): [number, number] {
  const a = ((deg - 90) * Math.PI) / 180;
  return [C + r * Math.cos(a), C + r * Math.sin(a)];
}

export default function SonarScope() {
  const ticks = Array.from({ length: 72 }, (_, i) => i * 5);
  const route = [...PASSED, [C, C] as [number, number]];

  return (
    <div aria-hidden="true" className="relative aspect-square w-full select-none">
      {/* Tarama ışını: konik gradyan, ölçek halkasının içinde döner */}
      <div
        className="absolute rounded-full motion-safe:animate-sweep"
        style={{
          inset: pct(C - R),
          background:
            "conic-gradient(from 0deg, transparent 0deg 286deg, rgb(76 192 238 / 0.06) 300deg, rgb(76 192 238 / 0.32) 357deg, rgb(143 221 248 / 0.75) 359.5deg, transparent 360deg)",
        }}
      />

      <svg viewBox="0 0 400 400" className="relative size-full overflow-visible font-mono">
        {/* Dış çerçeve ve iç parıltı */}
        <circle cx={C} cy={C} r={R + 12} fill="none" stroke="rgb(220 239 248 / 0.14)" />
        <circle cx={C} cy={C} r={R} fill="rgb(6 22 50 / 0.35)" stroke="rgb(220 239 248 / 0.28)" />

        {/* Menzil halkaları ve artı işareti */}
        {[45, 90, 135].map((r) => (
          <circle key={r} cx={C} cy={C} r={r} fill="none" stroke="rgb(220 239 248 / 0.12)" strokeDasharray={r === 135 ? "2 5" : undefined} />
        ))}
        <path d={`M${C - R} ${C}H${C + R}M${C} ${C - R}V${C + R}`} stroke="rgb(220 239 248 / 0.09)" />

        {/* Kerteriz çizgileri: 5°, 10° ve 30° */}
        {ticks.map((deg) => {
          const len = deg % 30 === 0 ? 12 : deg % 10 === 0 ? 7 : 3.5;
          const [x1, y1] = polar(deg, R);
          const [x2, y2] = polar(deg, R - len);
          return (
            <line key={deg} x1={x1} y1={y1} x2={x2} y2={y2} stroke={deg === 0 ? "var(--camgobegi)" : "rgb(220 239 248 / 0.4)"} strokeWidth={deg % 30 === 0 ? 1.4 : 1} />
          );
        })}
        {ticks.filter((d) => d % 30 === 0).map((deg) => {
          const [x, y] = polar(deg, R - 24);
          return (
            <text key={deg} x={x} y={y} textAnchor="middle" dominantBaseline="central" fontSize={deg === 0 ? 11 : 8.5} fontWeight={deg === 0 ? 600 : 400} fill={deg === 0 ? "var(--camgobegi)" : "rgb(220 239 248 / 0.5)"}>
              {deg === 0 ? "K" : String(deg).padStart(3, "0")}
            </text>
          );
        })}

        {/* Sonar temasları */}
        {CONTACTS.map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={2} fill="rgb(143 221 248 / 0.55)" />
        ))}

        {/* Rota: geçilen kısım düz, kalan kısım kesikli */}
        <polyline points={route.map((p) => p.join(",")).join(" ")} fill="none" stroke="rgb(143 221 248 / 0.55)" strokeWidth={1.5} />
        <polyline points={[[C, C], ...NEXT].map((p) => p.join(",")).join(" ")} fill="none" stroke="var(--camgobegi)" strokeWidth={1.5} strokeDasharray="5 5" />
        {PASSED.slice(1).map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r={4} fill="var(--derin)" stroke="rgb(143 221 248 / 0.7)" strokeWidth={1.5} />
        ))}
        <circle cx={NEXT[0][0]} cy={NEXT[0][1]} r={5} fill="var(--sinyal)" />
        <circle cx={NEXT[1][0]} cy={NEXT[1][1]} r={4} fill="var(--derin)" stroke="var(--camgobegi)" strokeWidth={1.5} />
        <text x={PASSED[1][0] - 12} y={PASSED[1][1] + 4} textAnchor="end" fontSize={8.5} fill="rgb(220 239 248 / 0.55)">WP1</text>
        <text x={NEXT[0][0] + 12} y={NEXT[0][1] + 4} fontSize={8.5} fontWeight={600} fill="var(--sinyal)">WP2</text>
        <text x={NEXT[1][0] + 11} y={NEXT[1][1] + 4} fontSize={8.5} fill="rgb(220 239 248 / 0.7)">WP3</text>

        {/* İDA: teknik çizimdeki üst görünüşün küçültülmüşü (baş +x yönünde, burada rotaya döner) */}
        <g transform={`translate(${C} ${C}) rotate(${HEADING - 90}) scale(0.105) translate(-313.5 -452)`}>
          {/* Dümen suyu: kıçtan geriye açılan iki silik çizgi */}
          <path d="M112 404L-150 330M112 500L-150 574" stroke="rgb(220 239 248 / 0.35)" strokeWidth={11} strokeLinecap="round" />
          <path d={PLAN_HULL} fill="var(--kopuk)" />
          <path d={PLAN_SUPERSTRUCTURE} fill="var(--camgobegi)" />
        </g>
      </svg>

      {/* Sıradaki hedefin sonar yankısı */}
      <span
        className="absolute size-12 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-sinyal/80 motion-safe:animate-sonar motion-reduce:hidden"
        style={{ left: pct(NEXT[0][0]), top: pct(NEXT[0][1]) }}
      />
    </div>
  );
}
