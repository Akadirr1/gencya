'use client';

import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { useEffect, useState } from 'react';
import { getFooterData, iconMap, type FooterData } from '@/lib/footerData';
import { RSS_ENABLED } from '@/lib/utils';
import { GencyaMark, SonarLoader } from "@/components/layout/Brand";

export default function Footer() {
  const [footerData, setFooterData] = useState<FooterData | null>(null);

  useEffect(() => {
    const loadFooterData = async () => {
      const data = await getFooterData();
      setFooterData(data);
    };
    loadFooterData();
  }, []);

  if (!footerData) {
    return (
      <footer className="border-t border-border/50 bg-background py-8">
        <div className="container mx-auto max-w-6xl px-4">
          <div className="flex justify-center items-center h-32">
            <SonarLoader label="Yükleniyor" />
          </div>
        </div>
      </footer>
    );
  }

  return (
    <footer className="relative isolate overflow-hidden border-t border-border/60 bg-background pt-12 pb-8">
      {/* Seyir haritası ızgarası, yukarı doğru silinir */}
      <div aria-hidden="true" className="bg-chart absolute inset-0 -z-10 [mask-image:linear-gradient(to_top,#000,transparent_85%)]" />
      <div className="container mx-auto max-w-6xl px-4">
        <div className="grid gap-8 md:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr_1fr]">
          {/* Logo ve Hakkında - Mobilde gizli */}
          <div className="hidden md:flex flex-col gap-4 items-start">
            <Link href="/" className="flex items-center gap-2.5" aria-label={`${footerData.clubInfo.name} ana sayfa`}>
              <GencyaMark className="h-8" />
              <span className="flex flex-col leading-none">
                <span className="font-display text-base font-bold tracking-[0.08em]">GENÇYA</span>
                <span className="mt-1 font-mono text-[9px] uppercase tracking-[0.24em] text-muted-foreground">Teknoloji Takımı</span>
              </span>
            </Link>
            <p className="max-w-xs text-sm text-muted-foreground">
              {footerData.clubInfo.description}
            </p>
          </div>

          {/* Hızlı Bağlantılar - Mobilde gizli */}
          <div className="hidden md:flex flex-col gap-3 items-start">
            <h3 className="label-mono text-foreground">Sayfalar</h3>
            <ul className="grid grid-cols-2 gap-x-6 gap-y-2">
              {footerData.quickLinks.filter((link) => RSS_ENABLED || link.href !== '/publications').map((link, index) => (
                <li key={index}>
                  <Link
                    href={link.href}
                    className="text-sm text-muted-foreground hover:text-primary"
                  >
                    {link.title}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* İletişim - Mobilde gizli */}
          <div className="hidden md:flex flex-col gap-3 items-start">
            <h3 className="label-mono text-foreground">İletişim</h3>
            <address className="not-italic">
              <p className="text-sm text-muted-foreground">
                {footerData.contactInfo.address.university}
                <br />
                {footerData.contactInfo.address.faculty}
                <br />
                {footerData.contactInfo.address.location}
              </p>
              <p className="mt-2 text-sm text-muted-foreground">
                <a
                  href={`mailto:${footerData.contactInfo.email}`}
                  className="hover:text-primary"
                >
                  {footerData.contactInfo.email}
                </a>
              </p>
            </address>
          </div>

          {/* Sosyal Medya - Her zaman görünür */}
          <div className="flex flex-col gap-4 items-center md:items-start md:col-span-1 col-span-full">
            <h3 className="label-mono text-foreground">Bizi Takip Edin</h3>
            <div className="flex gap-6 md:gap-4">
              {footerData.socialMedia.map((social, index) => {
                const IconComponent = iconMap[social.icon as keyof typeof iconMap];
                return (
                  <a
                    key={index}
                    href={social.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground transition-all duration-300 hover:text-primary hover:scale-110 transform"
                    aria-label={social.ariaLabel}
                  >
                    <FontAwesomeIcon icon={IconComponent} className="h-6 w-6 md:h-5 md:w-5" />
                  </a>
                );
              })}
            </div>
          </div>
        </div>

        {/* Telif Hakkı */}
        <div className="mt-10 border-t border-border/60 pt-5">
          <p className="text-center text-xs text-muted-foreground">
            &copy; {new Date().getFullYear()} {footerData.copyright.text}
          </p>
        </div>
      </div>
    </footer>
  );
}