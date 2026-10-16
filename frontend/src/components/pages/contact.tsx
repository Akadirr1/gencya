import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faMapLocationDot, faEnvelope, faShareNodes } from "@fortawesome/free-solid-svg-icons";
import { faGithub, faLinkedin, faTiktok, faInstagram } from "@fortawesome/free-brands-svg-icons";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import ContactForm from "@/components/layout/ContactForm";
import PageHeader from "@/components/layout/PageHeader";
import { getContactData } from "@/lib/contactData";

const iconMap = {
  'GitHub': faGithub,
  'LinkedIn': faLinkedin,
  'Tiktok': faTiktok,
  'Instagram': faInstagram,
};

const ICON_TILE = "flex size-11 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary";

export default async function Contact() {
  const contactData = await getContactData();
  const { address, email, socialMedia } = contactData.contactInfo;

  return (
    <main className="flex flex-col pb-16">
      <PageHeader
        eyebrow="Soru, öneri, iş birliği"
        title={contactData.pageContent.title}
        description={contactData.pageContent.description}
      />

      {/* İletişim Bilgileri ve Form: dalganın üstüne hafifçe biner */}
      <section className="container relative -mt-10">
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Sol Taraf - İletişim Bilgileri: son kart uzar, alt kenar formla hizalı */}
          <div className="flex flex-col gap-6">
            {/* Adres Kartı */}
            <Card className="flex-row gap-4 px-6">
              <div className={ICON_TILE}>
                <FontAwesomeIcon icon={faMapLocationDot} className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1.5">
                <CardTitle className="font-display text-base">{address.title}</CardTitle>
                <address className="not-italic text-sm text-muted-foreground">
                  {address.content.split('\n').map((line, index, lines) => (
                    <span key={index}>
                      {line}
                      {index < lines.length - 1 && <br />}
                    </span>
                  ))}
                </address>
              </div>
            </Card>

            {/* E-posta Kartı */}
            <Card className="flex-row gap-4 px-6">
              <div className={ICON_TILE}>
                <FontAwesomeIcon icon={faEnvelope} className="h-5 w-5" />
              </div>
              <div className="min-w-0 space-y-1.5">
                <CardTitle className="font-display text-base">{email.title}</CardTitle>
                <p className="text-sm text-muted-foreground">
                  <a href={`mailto:${email.content}`} className="break-all hover:text-primary">
                    {email.content}
                  </a>
                </p>
              </div>
            </Card>

            {/* Sosyal Medya */}
            <Card className="flex-1 gap-4 px-6">
              <div className="flex gap-4">
                <div className={ICON_TILE}>
                  <FontAwesomeIcon icon={faShareNodes} className="h-5 w-5" />
                </div>
                <div className="min-w-0 space-y-1.5">
                  <CardTitle className="font-display text-base">{socialMedia.title}</CardTitle>
                  <CardDescription>{socialMedia.description}</CardDescription>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 sm:pl-15">
                {socialMedia.links.map((link, index) => (
                  <a
                    key={index}
                    href={link.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex size-11 items-center justify-center rounded-lg border text-muted-foreground transition-colors hover:border-primary/40 hover:bg-primary/10 hover:text-primary"
                    aria-label={link.ariaLabel}
                  >
                    <FontAwesomeIcon
                      icon={iconMap[link.platform as keyof typeof iconMap] || faGithub}
                      className="h-5 w-5"
                    />
                  </a>
                ))}
              </div>
            </Card>
          </div>

          {/* Sağ Taraf - Form */}
          <div className="lg:col-span-2">
            <ContactForm />
          </div>

          {/* Konum Haritası: tam genişlik, vizör köşeli çerçeve */}
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle className="font-display text-lg">{contactData.map.title}</CardTitle>
              <CardDescription>
                {contactData.map.description}
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="hud-frame p-2">
                <div className="aspect-[4/3] w-full overflow-hidden rounded-lg border bg-muted sm:aspect-[16/9] lg:aspect-[21/8]">
                  <iframe
                    src={contactData.map.embedUrl}
                    className="h-full w-full border-0"
                    allowFullScreen
                    loading="lazy"
                    title={contactData.map.title}
                    referrerPolicy="no-referrer-when-downgrade"
                  />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>
    </main>
  );
}
