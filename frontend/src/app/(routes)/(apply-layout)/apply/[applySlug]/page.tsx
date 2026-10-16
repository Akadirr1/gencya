import type { Metadata } from 'next';
import ApplyDetail from '@/components/pages/applyDetail';
import { APPLICATION_LABELS } from '@/lib/applicationWindow';

export async function generateMetadata({ params }: { params: Promise<{ applySlug: string }> }): Promise<Metadata> {
    const { applySlug } = await params;
    // Etiketler JSON başlıklarıyla aynı ("Genel Üyelik" + " Başvurusu"); bilinmeyen slug için genel ad
    return { title: Object.hasOwn(APPLICATION_LABELS, applySlug) ? `${APPLICATION_LABELS[applySlug]} Başvurusu` : 'Başvuru' };
}

export default async function ApplyRoute({ params }: { params: { applySlug: string } }) {
    const resolvedParams = await Promise.resolve(params);
    const applySlug = resolvedParams.applySlug;
    return <ApplyDetail slug={applySlug} />;
}
