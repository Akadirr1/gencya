import type { Metadata, Viewport } from "next";
import { IBM_Plex_Mono, IBM_Plex_Sans, Sora } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/providers/ThemeProvider";

// Başlıklar Sora (logodaki geniş geometrik yazıya yakın), gövde IBM Plex Sans, kısa teknik
// etiketler IBM Plex Mono. latin-ext olmadan ş/ğ/ı/İ yedek fonta düşer.
const sora = Sora({
  variable: "--font-sora",
  subsets: ["latin", "latin-ext"],
});

const plexSans = IBM_Plex_Sans({
  variable: "--font-plex-sans",
  weight: ["400", "500", "600", "700"],
  subsets: ["latin", "latin-ext"],
});

const plexMono = IBM_Plex_Mono({
  variable: "--font-plex-mono",
  weight: ["400", "500"],
  subsets: ["latin", "latin-ext"],
});

const SITE_URL = process.env.NEXT_PUBLIC_APP_URL || "https://gencya.org.tr";
const DESCRIPTION =
  "Gençya Teknoloji Takımı: insansız deniz aracı (İDA) geliştiren, otonom navigasyon, görüntü işleme ve elektronik üzerine çalışan genç bir ekip.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: { default: "Gençya Teknoloji", template: "%s - Gençya Teknoloji" },
  description: DESCRIPTION,
  openGraph: {
    type: "website",
    locale: "tr_TR",
    siteName: "Gençya Teknoloji",
    title: "Gençya Teknoloji",
    description: DESCRIPTION,
  },
  twitter: { card: "summary_large_image", title: "Gençya Teknoloji", description: DESCRIPTION },
};

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#F4F8FC" },
    { media: "(prefers-color-scheme: dark)", color: "#061632" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="tr" suppressHydrationWarning>
      <body className={`${sora.variable} ${plexSans.variable} ${plexMono.variable} antialiased`}>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
