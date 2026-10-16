import type { Metadata } from 'next';
import TeamDetail from '@/components/pages/teamDetail';
import { getTeamDetail } from '@/lib/teamData';
import { notFound } from 'next/navigation';

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const team = await getTeamDetail((await params).slug);
    return team ? { title: team.name, description: team.description } : { title: 'Takım Bulunamadı' };
}

export default async function TeamDetailRoute({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const team = await getTeamDetail(slug);

    if (!team) {
        notFound();
    }

    return <TeamDetail team={team} />;
}
