import type { Metadata } from 'next';
import Announcements from '@/components/pages/announcements';

export const metadata: Metadata = {
    title: 'Duyurular',
};

export default function AnnouncementsRoute() {
    return <Announcements />;
}
