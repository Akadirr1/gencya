import type { Metadata } from "next";
import Link from "next/link";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faArrowLeft } from "@fortawesome/free-solid-svg-icons";
import MainLayout from "@/layouts/MainLayout";
import PageHeader from "@/components/layout/PageHeader";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sayfa bulunamadı",
};

export default function NotFound() {
  return (
    <MainLayout>
      <main className="flex flex-1 flex-col">
        {/* Bant header ile footer arasını doldurur */}
        <PageHeader
          className="flex flex-1 items-center"
          eyebrow="Hata 404"
          title="Rota bulunamadı"
          description="Aradığınız sayfa haritada yok: taşınmış, adı değişmiş ya da hiç var olmamış olabilir. Ana sayfaya dönüp rotanızı yeniden çizebilirsiniz."
        >
          <Button asChild size="lg" className="bg-cta text-white shadow-cta hover:brightness-110">
            <Link href="/">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-2 h-4 w-4" /> Ana sayfaya dön
            </Link>
          </Button>
        </PageHeader>
      </main>
    </MainLayout>
  );
}
