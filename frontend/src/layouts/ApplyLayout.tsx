import { Button } from "@/components/ui/button";
import Link from "next/link";
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faArrowLeft } from '@fortawesome/free-solid-svg-icons';
import { GencyaMark } from "@/components/layout/Brand";

interface ApplyLayoutProps {
    children: React.ReactNode;
}

export default function ApplyLayout({ children }: ApplyLayoutProps) {
    return (
        <div className="flex min-h-screen flex-col">
            {/* İnce üst şerit: geri dönüş solda, işaret sağda */}
            <header className="border-b border-border/60 bg-background/95 px-4 backdrop-blur-sm sm:px-6 md:px-8">
                {/* Form kartıyla aynı genişlik (max-w-3xl): uçlar kartın kenarlarıyla hizalı */}
                <div className="mx-auto flex h-14 max-w-3xl items-center justify-between">
                    <Button
                        variant="ghost"
                        size="sm"
                        asChild
                        className="-ml-2 text-muted-foreground hover:bg-primary/10 hover:text-primary dark:hover:bg-primary/10"
                    >
                        <Link href="/apply">
                            <FontAwesomeIcon icon={faArrowLeft} className="h-3.5 w-3.5" />
                            Geri Dön
                        </Link>
                    </Button>
                    <div className="flex items-center gap-3">
                        <span className="label-mono hidden text-muted-foreground sm:inline">Başvuru formu</span>
                        <Link href="/" aria-label="Gençya Teknoloji ana sayfa">
                            <GencyaMark className="h-6" />
                        </Link>
                    </div>
                </div>
            </header>
            
            {/* Seyir haritası ızgarası formun arkasında, aşağı doğru silinir */}
            <main className="relative isolate flex-1 px-4 sm:px-6 md:px-8">
                <div aria-hidden="true" className="bg-chart absolute inset-x-0 top-0 -z-10 h-[480px] [mask-image:linear-gradient(to_bottom,#000,transparent)]" />
                {children}
            </main>
        </div>
    );
}
