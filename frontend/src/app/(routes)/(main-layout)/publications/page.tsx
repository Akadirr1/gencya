import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Publications from '@/components/pages/publications';
import { RSS_ENABLED } from '@/lib/utils';

export const metadata: Metadata = {
    title: 'Yayınlar',
};

export default function PublicationsRoute() {
    if (!RSS_ENABLED) notFound();
    return <Publications />;
}
