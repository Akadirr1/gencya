import React from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faExclamationTriangle, faUser, faTrophy, faCode, faExternalLinkAlt, faArrowLeft, faArrowRight, faQuoteLeft } from '@fortawesome/free-solid-svg-icons';
import { faApple, faGithub, faGooglePlay, faKaggle, faLinkedin } from '@fortawesome/free-brands-svg-icons';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { AspectRatio } from '@/components/ui/aspect-ratio';
import { Button } from '@/components/ui/button';
import { TeamDetail as TeamDetailType } from '@/lib/teamData';
import { NodeMark } from "@/components/layout/Brand";
import PageHeader from '@/components/layout/PageHeader';
import { cn } from '@/lib/utils';

interface TeamDetailProps {
  team: TeamDetailType | null;
  error?: string;
}

function SectionHeading({ title, description }: { title: string; description: string }) {
  return (
    <div className="mb-12 mx-auto text-center max-w-3xl">
      <NodeMark />
      <h2 className="mb-3 text-3xl font-bold tracking-tight">{title}</h2>
      <p className="mx-auto max-w-2xl text-muted-foreground">{description}</p>
    </div>
  );
}

const chip = "rounded-full border px-2.5 py-0.5 text-xs";

export default function TeamDetail({ team, error }: TeamDetailProps) {
  if (error || !team) {
    return (
      <main className="container py-16 md:py-24">
        <div className="bg-chart mx-auto flex max-w-xl flex-col items-center rounded-xl border border-dashed px-6 py-14 text-center">
          <span aria-hidden="true" className="mb-6 grid size-16 place-items-center rounded-full border border-primary/30 bg-background text-primary ring-8 ring-primary/5">
            <FontAwesomeIcon icon={faExclamationTriangle} className="h-6 w-6" />
          </span>
          <p className="label-mono mb-2 text-muted-foreground">Teknik Takım</p>
          <h1 className="text-2xl font-bold tracking-tight">Takım Bulunamadı</h1>
          <p className="mt-2 text-muted-foreground">
            {error || 'Belirtilen takım bilgileri bulunamadı.'}
          </p>
          <Button asChild variant="outline" className="mt-8">
            <Link href="/">
              <FontAwesomeIcon icon={faArrowLeft} className="mr-1 h-3.5 w-3.5" />
              Ana Sayfaya Dön
            </Link>
          </Button>
        </div>
      </main>
    );
  }

  const getStatusColor = (status: string) => {
    const s = status.toLocaleLowerCase('tr-TR');
    // "Geliştirme Aşamasında" gibi uzun durumlar da eşleşsin diye includes
    if (['aktif', 'yayınlandı', 'tamamlandı'].some((k) => s.includes(k))) {
      return { chip: 'border-green-600/25 bg-green-50 text-green-800 dark:border-green-400/25 dark:bg-green-950 dark:text-green-200', dot: 'bg-green-600 dark:bg-green-400' };
    }
    if (['geliştirme', 'araştırma'].some((k) => s.includes(k))) {
      return { chip: 'border-primary/25 bg-primary/10 text-primary', dot: 'bg-sinyal' };
    }
    return { chip: 'bg-muted text-muted-foreground', dot: 'bg-muted-foreground/60' };
  };

  const getResultColor = (result: string) => {
    if (result.includes('1.')) return 'text-yellow-700 dark:text-yellow-300';
    if (result.includes('2.')) return 'text-gray-600 dark:text-gray-300';
    if (result.includes('3.')) return 'text-amber-700 dark:text-amber-300';
    return 'text-muted-foreground';
  };

  return (
    <main className="flex flex-col pb-4">
      <PageHeader eyebrow="Teknik Takım" title={team.name} description={team.description}>
        <Button asChild className="bg-cta text-white shadow-cta hover:brightness-110">
          <Link href={`/apply/${team.slug}`}>
            Başvur <FontAwesomeIcon icon={faArrowRight} className="ml-1 h-3.5 w-3.5" />
          </Link>
        </Button>
      </PageHeader>

      {/* Leader Message: dalganın üstüne hafifçe binen alıntı kartı */}
      <section className="container relative -mt-10 pb-16">
        <Card className="relative mx-auto max-w-4xl overflow-hidden">
          <CardContent>
            <figure className="flex flex-col gap-5 sm:flex-row sm:gap-6">
              <span aria-hidden="true" className="hidden size-11 shrink-0 place-items-center rounded-lg bg-primary/10 text-primary sm:grid">
                <FontAwesomeIcon icon={faQuoteLeft} className="h-5 w-5" />
              </span>
              <div>
                <p className="label-mono mb-3 text-primary">{team.leaderMessage.title}</p>
                <blockquote className="leading-relaxed md:text-lg text-foreground/90">
                  {team.leaderMessage.content}
                </blockquote>
                <figcaption className="mt-6 flex items-center gap-3 border-t pt-4">
                  <span aria-hidden="true" className="h-px w-6 bg-primary/60" />
                  <span>
                    <span className="block font-display font-semibold">{team.leaderMessage.author}</span>
                    <span className="block text-sm text-muted-foreground">{team.leaderMessage.role}</span>
                  </span>
                </figcaption>
              </div>
            </figure>
          </CardContent>
        </Card>
      </section>

      {/* Team Members */}
      <section className="container pb-16">
        <SectionHeading
          title="Takım Sorumluları"
          description="Takımımızın yönetiminden ve koordinasyonundan sorumlu üyelerimiz."
        />

        <div className="mx-auto max-w-4xl flex flex-wrap justify-center gap-6">
          {team.members.map((member, index) => (
            <Card key={index} className="w-full max-w-xl gap-0 py-0 transition-shadow hover:shadow-featured md:w-[calc(50%-0.75rem)]">
              <div className="grid gap-5 p-5 sm:grid-cols-[168px_1fr] sm:items-center">
                <div className="hud-frame mx-auto w-full max-w-[160px] p-2 sm:max-w-none">
                  <AspectRatio ratio={1 / 1} className="overflow-hidden rounded-md bg-muted">
                    {member.image && !member.image.includes("placeholder") ? (
                      <Image
                        src={member.image}
                        alt={`${member.name} fotoğrafı`}
                        fill
                        className="object-cover"
                      />
                    ) : (
                      <div className="bg-chart flex h-full w-full items-center justify-center">
                        <span className="grid size-16 place-items-center rounded-full border border-primary/25 bg-background text-primary/70 ring-8 ring-primary/5">
                          <FontAwesomeIcon icon={faUser} className="h-6 w-6" />
                        </span>
                      </div>
                    )}
                  </AspectRatio>
                </div>

                <div className="min-w-0 text-center sm:text-left">
                  <p className="label-mono mb-1.5 text-muted-foreground">{member.department}</p>
                  <h3 className="text-lg font-semibold">{member.name}</h3>
                  <p className="text-sm text-muted-foreground">{member.role}</p>

                  {member.skills.length > 0 && (
                    <div className="mt-4 flex flex-wrap justify-center gap-1.5 sm:justify-start">
                      {member.skills.map((skill, skillIndex) => (
                        <span key={skillIndex} className={cn(chip, "border-primary/20 bg-primary/5 text-primary")}>
                          {skill}
                        </span>
                      ))}
                    </div>
                  )}

                  {(member.github || member.kaggle || member.linkedin) && (
                    <div className="mt-4 flex justify-center gap-2 sm:justify-start">
                      {member.github && (
                        <Button asChild variant="outline" size="icon">
                          <Link href={member.github} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} GitHub`}>
                            <FontAwesomeIcon icon={faGithub} className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      {member.kaggle && (
                        <Button asChild variant="outline" size="icon">
                          <Link href={member.kaggle} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} Kaggle`}>
                            <FontAwesomeIcon icon={faKaggle} className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                      {member.linkedin && (
                        <Button asChild variant="outline" size="icon">
                          <Link href={member.linkedin} target="_blank" rel="noopener noreferrer" aria-label={`${member.name} LinkedIn`}>
                            <FontAwesomeIcon icon={faLinkedin} className="h-4 w-4" />
                          </Link>
                        </Button>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Achievements */}
      {team.achievements && team.achievements.length > 0 && (
        <section className="container pb-16">
          <SectionHeading title="Başarılarımız" description="Takımımızın kazandığı ödüller ve başarılar." />

          <div className="mx-auto max-w-6xl grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {team.achievements.map((achievement, index) => (
              <Card key={index} className="transition-shadow hover:shadow-featured">
                <CardHeader>
                  <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                    <FontAwesomeIcon icon={faTrophy} className="h-5 w-5" />
                  </div>
                  <p className="label-mono text-muted-foreground">
                    {new Date(achievement.date).toLocaleDateString('tr-TR')}
                  </p>
                  <CardTitle className="font-display text-lg">{achievement.title}</CardTitle>
                  <p className="text-sm text-muted-foreground">{achievement.event}</p>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">
                    {achievement.description}
                  </p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Competitions */}
      {team.competitions && team.competitions.length > 0 && (
        <section className="container pb-16">
          <SectionHeading title="Katıldığımız Yarışmalar" description="Takımımızın katıldığı yarışmalar ve elde ettiği dereceler." />

          <div className="mx-auto max-w-4xl space-y-4">
            {team.competitions.map((competition, index) => (
              <Card key={index} className="py-5">
                <CardContent className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between sm:gap-6">
                  <div className="flex-1">
                    <p className="label-mono mb-1.5 text-muted-foreground">
                      {new Date(competition.date).toLocaleDateString('tr-TR')}
                    </p>
                    <h3 className="mb-1 text-lg font-semibold">{competition.name}</h3>
                    <p className="text-sm text-muted-foreground">
                      {competition.description}
                    </p>
                  </div>
                  <span className={cn("self-start rounded-full border px-3 py-1 text-sm font-semibold", getResultColor(competition.result))}>
                    {competition.result}
                  </span>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      )}

      {/* Projects */}
      {team.projects && team.projects.length > 0 && (
        <section className="container pb-16">
          <SectionHeading title="Projelerimiz" description="Takımımızın geliştirdiği projeler ve çalışmaları." />

          <div className="mx-auto max-w-4xl flex flex-wrap justify-center gap-6">
            {team.projects.map((project, index) => {
              const status = getStatusColor(project.status);
              return (
                <Card key={index} className="relative w-full transition-shadow hover:shadow-featured md:w-[calc(50%-0.75rem)]">
                  <span aria-hidden="true" className="label-mono absolute top-6 right-6 text-muted-foreground/70">
                    {String(index + 1).padStart(2, "0")}
                  </span>
                  <CardHeader>
                    <div className="mb-2 flex h-11 w-11 items-center justify-center rounded-lg bg-primary/10 text-primary">
                      <FontAwesomeIcon icon={faCode} className="h-5 w-5" />
                    </div>
                    <CardTitle className="font-display text-lg">{project.title}</CardTitle>
                    <span className={cn("mt-1 inline-flex w-fit items-center gap-1.5", chip, status.chip)}>
                      <span aria-hidden="true" className={cn("size-1.5 rounded-full", status.dot)} />
                      {project.status}
                    </span>
                  </CardHeader>
                  <CardContent className="flex flex-1 flex-col">
                    <p className="mb-5 text-muted-foreground">
                      {project.description}
                    </p>

                    <p className="label-mono mb-2 text-muted-foreground">Teknolojiler</p>
                    <div className="mb-auto flex flex-wrap gap-1.5">
                      {project.technologies.map((tech, techIndex) => (
                        <span key={techIndex} className={cn(chip, "text-muted-foreground")}>
                          {tech}
                        </span>
                      ))}
                    </div>

                    {(project.github || project.demo || !!project.stores?.length) && (
                      <div className="mt-6 flex flex-wrap gap-2 border-t pt-5">
                        {project.github && (
                          <Button asChild variant="outline" size="sm">
                            <Link href={project.github} target="_blank" rel="noopener noreferrer">
                              <FontAwesomeIcon icon={faGithub} className="h-3.5 w-3.5" />
                              GitHub
                            </Link>
                          </Button>
                        )}
                        {project.demo && (
                          <Button asChild variant="outline" size="sm">
                            <Link href={project.demo} target="_blank" rel="noopener noreferrer">
                              <FontAwesomeIcon icon={faExternalLinkAlt} className="h-3 w-3" />
                              Demo
                            </Link>
                          </Button>
                        )}
                        {project.stores?.map((store) => {
                          const icon = store.name === 'App Store' ? faApple : faGooglePlay;
                          return store.url ? (
                            <Button key={store.name} asChild variant="outline" size="sm">
                              <Link href={store.url} target="_blank" rel="noopener noreferrer">
                                <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />
                                {store.name}
                              </Link>
                            </Button>
                          ) : (
                            <Button key={store.name} variant="outline" size="sm" disabled>
                              <FontAwesomeIcon icon={icon} className="h-3.5 w-3.5" />
                              {store.name} · Yakında
                            </Button>
                          );
                        })}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>
      )}
    </main>
  );
}
