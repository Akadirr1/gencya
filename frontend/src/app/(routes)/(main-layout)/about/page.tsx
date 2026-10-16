import type { Metadata } from 'next';
import About from '@/components/pages/about';
import { getAboutData } from '@/lib/aboutData';

export const metadata: Metadata = {
    title: 'Hakkımızda',
};

export default async function AboutRoute() {
    const data = await getAboutData();

    return <About data={data} />;
}
