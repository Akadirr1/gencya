import type { Metadata } from 'next';
import Contact from '@/components/pages/contact';

export const metadata: Metadata = {
    title: 'İletişim',
};

export default function ContactRoute() {
    return <Contact />;
}
