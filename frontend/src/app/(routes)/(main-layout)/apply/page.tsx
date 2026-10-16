import type { Metadata } from 'next';
import Apply from '@/components/pages/apply';

export const metadata: Metadata = {
    title: 'Başvurular',
};

export default function ApplyRoute() {
    return <Apply />;
}
