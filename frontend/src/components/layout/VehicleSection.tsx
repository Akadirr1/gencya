'use client';

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowRight } from "@fortawesome/free-solid-svg-icons";
import { Button } from "@/components/ui/button";
import { NodeMark } from "@/components/layout/Brand";
import { cn } from "@/lib/utils";
import type { VehicleAnchor, VehicleData } from "@/lib/homeData";
import { PLAN_HULL, PLAN_SUPERSTRUCTURE, SIDE_HULL, SIDE_OUTRIGGER, SIDE_SUPERSTRUCTURE } from "./vehicleDrawing";

// Çizimdeki numaralı işaretler: at = gösterilen parça, mark = numaranın durduğu yer (640×630).
const ANCHORS: Record<VehicleAnchor, { at: [number, number]; mark: [number, number] }> = {
  hull: { at: [206, 322], mark: [140, 322] },
  mast: { at: [244.9, 88.3], mark: [272, 42] },
  camera: { at: [399.5, 113.3], mark: [456, 80] },
  antenna: { at: [200.8, 40], mark: [150, 24] },
  propulsion: { at: [152.5, 209], mark: [92, 258] },
  power: { at: [278, 114.5], mark: [334, 48] },
};

const LINE = "rgb(143 221 248 / 0.85)";
const FAINT = "rgb(143 221 248 / 0.35)";
const FILL = "rgb(76 192 238 / 0.07)";
const WATER = 190.4; // su hattı (yan görünüş)
const AXIS = 452; // üst görünüşün eksen çizgisi
const STERN = 111.5;
const BOW = 515;

/** Gövde yanındaki itici: kalın nozul halkası, göbek ve üç kanat (nozul çapı modele göre). */
function Thruster({ x, y }: { x: number; y: number }) {
  return (
    <g>
      <circle cx={x} cy={y} r={17} fill="rgb(6 22 50 / 0.75)" stroke={LINE} strokeWidth="1.6" />
      <circle cx={x} cy={y} r={13.5} fill="none" stroke={LINE} strokeWidth="1" />
      {[0, 120, 240].map((a) => (
        <path key={a} d={`M${x} ${y}l-2.6 -11.5q2.6 -1.4 5.2 0z`} transform={`rotate(${a + 20} ${x} ${y})`} fill={LINE} />
      ))}
      <circle cx={x} cy={y} r={3.2} fill="var(--derin)" stroke={LINE} strokeWidth="1.4" />
    </g>
  );
}

/** Trimaran İDA'nın yan ve üst görünüşü (genel yerleşim düzeni, ölçeksiz). Numaralar listeyle eşleşir. */
function VehicleBlueprint({ subsystems, active, onActive }: {
  subsystems: VehicleData["subsystems"];
  active: number | null;
  onActive: (i: number | null) => void;
}) {
  return (
    <svg viewBox="0 0 640 630" className="h-auto w-full font-mono" role="img" aria-label="Trimaran İDA'nın yan ve üst görünüş çizimi">
      <defs>
        <pattern id="bp-minor" width="20" height="20" patternUnits="userSpaceOnUse">
          <path d="M20 0H0V20" fill="none" stroke="rgb(143 221 248 / 0.07)" />
        </pattern>
        <pattern id="bp-major" width="100" height="100" patternUnits="userSpaceOnUse">
          <rect width="100" height="100" fill="url(#bp-minor)" />
          <path d="M100 0H0V100" fill="none" stroke="rgb(143 221 248 / 0.13)" />
        </pattern>
        <linearGradient id="bp-water" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="rgb(76 192 238 / 0.22)" />
          <stop offset="1" stopColor="rgb(76 192 238 / 0)" />
        </linearGradient>
      </defs>
      <rect width="640" height="630" fill="url(#bp-major)" />

      {/* İki görünüşü bağlayan izdüşüm çizgileri (kıç ve baş) */}
      <path d={`M${STERN} 240V292M${BOW} 240V292`} stroke={FAINT} strokeDasharray="2 4" />

      {/* ── Yan görünüş ── */}
      <text x="20" y="22" fontSize="9" letterSpacing="1.5" fill={FAINT}>YAN GÖRÜNÜŞ</text>
      <path d={`M0 ${WATER}c40-5 80-5 120 0s80 5 120 0 80-5 120 0 80 5 120 0 80-5 120 0 40 3 40 3V262H0z`} fill="url(#bp-water)" />
      <path d={SIDE_HULL} fill={FILL} stroke={LINE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d={SIDE_OUTRIGGER} fill="none" stroke={LINE} strokeWidth="1.2" strokeLinejoin="round" />
      {/* Üst yapı: güverte flanşı ve eğimli kutu (keskin köşe) */}
      <rect x="138.7" y="126.4" width="261.4" height="3.8" fill="rgb(6 22 50 / 0.7)" stroke={LINE} strokeWidth="1.2" />
      <path d={SIDE_SUPERSTRUCTURE} fill="rgb(6 22 50 / 0.6)" stroke={LINE} strokeWidth="1.6" strokeLinejoin="miter" />
      <path d={`M0 ${WATER}c40-5 80-5 120 0s80 5 120 0 80-5 120 0 80 5 120 0 80-5 120 0 40 3 40 3`} fill="none" stroke={FAINT} strokeWidth="1.2" />
      <path d={`M96 ${WATER}H560`} stroke={FAINT} strokeDasharray="8 6" />
      <text x="628" y={WATER - 5} textAnchor="end" fontSize="9" fill={FAINT}>SU HATTI</text>

      {/* Üst yapı içinde kesikli (görünmeyen) batarya bloğu */}
      <rect x="236" y="106" width="84" height="17" rx="2" fill="none" stroke={LINE} strokeDasharray="4 3" />
      <path d="M244 114.5h20M270 114.5h20" stroke={FAINT} strokeWidth="1.4" strokeLinecap="round" />

      {/* Üst yapının üstündekiler (kıçtan başa): kubbe, telemetri anteni, yivli GNSS anteni, silindir, kubbe */}
      <path d="M152.8 99.8A8 5.7 0 0 1 168.8 99.8Z" fill="rgb(6 22 50 / 0.7)" stroke={LINE} strokeWidth="1.3" />
      <rect x="199.3" y="64.6" width="3" height="35.2" fill={LINE} />
      <path d="M200.8 64.6V33.5" stroke={LINE} strokeWidth="1.4" />
      <circle cx="200.8" cy="31.7" r="2" fill={LINE} />
      <path d="M190.5 30a14 14 0 0 0 0 20M211.1 30a14 14 0 0 1 0 20" fill="none" stroke={FAINT} strokeWidth="1.2" />
      <rect x="238.5" y="88.3" width="12.8" height="11.5" rx="1.5" fill="rgb(6 22 50 / 0.7)" stroke={LINE} strokeWidth="1.3" />
      <path d="M241.7 90v8.2M244.9 90v8.2M248.1 90v8.2" stroke={LINE} strokeWidth="0.9" />
      <rect x="293.9" y="85.4" width="17.9" height="14.4" rx="2" fill="rgb(6 22 50 / 0.7)" stroke={LINE} strokeWidth="1.3" />
      <path d="M293.9 89.6h17.9" stroke={FAINT} />
      <path d="M325.6 99.8A9.6 5.7 0 0 1 344.8 99.8Z" fill="rgb(6 22 50 / 0.7)" stroke={LINE} strokeWidth="1.3" />

      {/* Ön eğimdeki kamera: ayak, gövde, objektif ve görüş konisi */}
      <path d="M390.5 119.4V123" stroke={LINE} strokeWidth="1.3" />
      <rect x="384.1" y="107.2" width="12.8" height="12.2" rx="2" fill="rgb(6 22 50 / 0.8)" stroke={LINE} strokeWidth="1.3" />
      <circle cx="399.5" cy="113.3" r="3" fill="rgb(6 22 50 / 0.8)" stroke={LINE} strokeWidth="1.4" />
      <path d="M403 110.6L636 74M403 116L636 152" stroke={FAINT} strokeDasharray="5 5" />

      <Thruster x={152.5} y={209} />
      <Thruster x={392.5} y={209} />

      {/* ── Üst görünüş ── */}
      <text x="20" y="300" fontSize="9" letterSpacing="1.5" fill={FAINT}>ÜST GÖRÜNÜŞ</text>
      <path d={PLAN_HULL} fill={FILL} stroke={LINE} strokeWidth="1.5" strokeLinejoin="round" />
      <path d={PLAN_SUPERSTRUCTURE} fill="rgb(6 22 50 / 0.6)" stroke={LINE} strokeWidth="1.4" strokeLinejoin="miter" />
      {/* Eksen çizgisi (çizgi-nokta) ve üst yapının üstündekiler, yan görünüşle aynı hizada */}
      <path d={`M96 ${AXIS}H540`} stroke={FAINT} strokeDasharray="14 4 2 4" />
      <circle cx="160.8" cy={AXIS} r="8" fill="rgb(6 22 50 / 0.7)" stroke={LINE} strokeWidth="1.2" />
      <circle cx="200.8" cy={AXIS} r="2.6" fill={LINE} />
      <circle cx="244.9" cy={AXIS} r="6.4" fill="rgb(6 22 50 / 0.7)" stroke={LINE} strokeWidth="1.2" />
      <circle cx="302.9" cy={AXIS} r="9" fill="rgb(6 22 50 / 0.7)" stroke={LINE} strokeWidth="1.2" />
      <circle cx="335.2" cy={AXIS} r="9.6" fill="rgb(6 22 50 / 0.7)" stroke={LINE} strokeWidth="1.2" />
      <rect x="384.1" y={AXIS - 6.4} width="12.8" height="12.8" rx="2" fill="rgb(6 22 50 / 0.8)" stroke={LINE} strokeWidth="1.2" />

      {/* Antet */}
      <text x="628" y="622" textAnchor="end" fontSize="9" fill={FAINT}>GENÇYA İDA · TRİMARAN · ÖLÇEKSİZ</text>

      {/* Numaralı işaretler */}
      {subsystems.map((s, i) => {
        const a = ANCHORS[s.anchor];
        if (!a) return null;
        const on = active === i;
        return (
          <g
            key={s.anchor}
            className="cursor-pointer"
            onMouseEnter={() => onActive(i)}
            onMouseLeave={() => onActive(null)}
          >
            <path d={`M${a.mark[0]} ${a.mark[1]}L${a.at[0]} ${a.at[1]}`} stroke={on ? "var(--sinyal)" : LINE} strokeWidth="1.2" />
            <circle cx={a.at[0]} cy={a.at[1]} r="2.8" fill={on ? "var(--sinyal)" : LINE} />
            {on && <circle cx={a.mark[0]} cy={a.mark[1]} r="19" fill="none" stroke="var(--sinyal)" strokeOpacity="0.45" strokeWidth="1.5" />}
            <circle cx={a.mark[0]} cy={a.mark[1]} r="13" fill={on ? "var(--sinyal)" : "var(--derin)"} stroke={on ? "var(--sinyal)" : LINE} strokeWidth="1.6" />
            <text x={a.mark[0]} y={a.mark[1]} textAnchor="middle" dominantBaseline="central" fontSize="11" fontWeight="600" fill={on ? "var(--derin)" : "white"}>
              {String(i + 1).padStart(2, "0")}
            </text>
          </g>
        );
      })}
    </svg>
  );
}

export default function VehicleSection({ vehicle }: { vehicle: VehicleData }) {
  const [active, setActive] = useState<number | null>(null);

  return (
    <section className="bg-deep overflow-hidden py-24 text-white md:py-28">
      <div aria-hidden="true" className="wave-edge top-0 rotate-180" />
      <div className="container px-4 sm:px-6 lg:px-8">
        <div className="grid items-center gap-12 lg:grid-cols-[0.85fr_1.15fr]">
          <div className="text-center lg:text-left">
            <NodeMark className="text-camgobegi" />
            <p className="label-mono mb-3 text-camgobegi">{vehicle.eyebrow}</p>
            <h2 className="mb-4 text-3xl font-bold tracking-tight md:text-4xl">{vehicle.title}</h2>
            <p className="mx-auto mb-8 max-w-xl text-[#B9CDE3] lg:mx-0">{vehicle.description}</p>

            <ol className="mx-auto max-w-xl space-y-1 text-left lg:mx-0">
              {vehicle.subsystems.map((s, i) => (
                <li key={s.anchor}>
                  <div
                    tabIndex={0}
                    onMouseEnter={() => setActive(i)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(i)}
                    onBlur={() => setActive(null)}
                    className={cn(
                      "flex gap-4 rounded-lg border border-transparent px-3 py-2.5 transition-colors outline-none focus-visible:ring-2 focus-visible:ring-camgobegi",
                      active === i && "border-camgobegi/25 bg-white/5",
                    )}
                  >
                    <span
                      className={cn(
                        "label-mono mt-0.5 grid size-7 shrink-0 place-items-center rounded-full border text-[10px] tracking-normal transition-colors",
                        active === i ? "border-sinyal bg-sinyal text-derin" : "border-camgobegi/50 text-white",
                      )}
                    >
                      {String(i + 1).padStart(2, "0")}
                    </span>
                    <span>
                      <span className="block font-display font-semibold">{s.title}</span>
                      <span className="block text-sm text-[#9DB9D6]">{s.description}</span>
                    </span>
                  </div>
                </li>
              ))}
            </ol>

            <Button
              asChild
              variant="outline"
              className="mt-8 border-camgobegi/35 bg-white/5 text-white hover:bg-white/10 hover:text-white dark:border-camgobegi/35 dark:bg-white/5 dark:hover:bg-white/10"
            >
              <Link href={vehicle.cta.href}>
                {vehicle.cta.text} <FontAwesomeIcon icon={faArrowRight} className="ml-1 h-3.5 w-3.5" />
              </Link>
            </Button>
          </div>

          {/* Vizör köşeli çizim çerçevesi; gerçek fotoğraf eklenince (vehicle.image) o gösterilir */}
          <div className="hud-frame p-3 [--hud:rgb(143_221_248/0.6)]">
            <div className="overflow-hidden rounded-lg border border-camgobegi/20 bg-derin/60">
              {vehicle.image ? (
                <Image src={vehicle.image} alt={vehicle.title} width={1280} height={720} className="h-auto w-full object-cover" />
              ) : (
                <VehicleBlueprint subsystems={vehicle.subsystems} active={active} onActive={setActive} />
              )}
            </div>
          </div>
        </div>
      </div>
      <div aria-hidden="true" className="wave-edge bottom-0" />
    </section>
  );
}
