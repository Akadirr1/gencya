# CLAUDE.md

## Proje

Gençya Teknoloji Takımı web sitesi. Takım (Gençya Derneği, Başiskele/Kocaeli) bir İDA
(insansız deniz aracı, trimaran gövde) geliştiriyor. Site: tanıtım ve takım sayfaları, İDA
bölümü, duyurular, isteğe bağlı Medium yayınları (RSS), üyelik ve teknik takım başvuruları,
iletişim formu, admin paneli, sponsorluk maili.

Altyapı KOU SENG web sitesinden (KOU-Software-Community/kou-seng-website, main@2bca6d4) alındı;
backend ve frontend mimarisi onunla aynı, içerik ve tasarım dili Gençya'ya ait. KOU SENG'de
düzeltilen bir altyapı hatası buraya da taşınmalı (ve tersi).

Monorepo, kökte `package.json` yok: `frontend/` (Next.js 16) + `backend/` (Express.js +
MongoDB). Deploy repo dışında; repoda yalnızca CI (`.github/workflows/ci.yml`) var. Adresler
`https://gencya.org.tr` ve `https://api.gencya.org.tr`. Ayrıca `dernek/`: derneğin statik
sitesi (`https://gencya.org`), bkz. "Dernek sitesi".

## Komutlar

```bash
# frontend/
npm run dev             # Turbopack, port 3000
npm run build           # production build (Turbopack)
npm run start           # production sunucusu; port PORT ortam değişkeninden (yoksa 3000)
npm run lint            # ESLint
npm run check:content   # public/data JSON'ları + görseller

# backend/
npm run dev             # nodemon, port 3001 (PORT)
npm start               # production komutu: node --experimental-require-module index.js
node --test             # birim testleri (node:test): **/*.test.js
node scripts/loadtest.js --n 150           # GET /health, rate limit duvarını bulur
node scripts/loadtest.js --submit --n 40   # gerçek kayıt yazar — production DB'ye ASLA
```

İki pakette de `pm2:start` / `pm2:stop` / `pm2:restart` script'leri var.

Backend'de birim testleri `node:test` ile (`backend/**/*.test.js`, yeni bağımlılık yok);
frontend'de unit test yok. Push'tan önce:

```bash
cd frontend && npm run check:content && npm run lint && npm run build
cd ../backend && node --test
```

CI her PR'da ve `main`'e push'ta frontend'de bu üçünü koşturur; backend'de `node --test`
koşar, backend'i geçici bir MongoDB ile `npm start` üzerinden gerçekten ayağa kaldırıp önce
`scripts/windows-smoke.js`'i, sonra `scripts/loadtest.js`'i (`--submit --n 40`, ardından
`/health`'e `--n 100`) smoke test olarak çalıştırır; iki pakette `npm audit --omit=dev
--audit-level=high` koşar.

## Klasör yapısı

### Frontend (`frontend/`)

Next.js App Router. Route'lar `src/app/(routes)/` altında layout gruplarında:

- `(main-layout)/` — ana site sayfaları (Header + Footer)
- `(admin-layout)/admin/` — admin paneli (AdminSidebar)
- `(apply-layout)/apply/[applySlug]/` — başvuru formları

`page.tsx` dosyaları çoğunlukla yalnızca `src/components/pages/` altındaki bileşeni render
eder; business logic orada.

- `src/hooks/` — tüm API çağrıları ve state yönetimi
- `src/components/pages/` — sayfa düzeyi bileşenler (hook'ları kullanır)
- `src/components/layout/` — Header, Footer, AdminSidebar, PageHeader, marka bileşenleri
- `src/components/ui/` — Shadcn/UI primitive'leri, doğrudan düzenlenmez; yenisi Shadcn ile
  eklenir (`new-york` stili, CSS değişkenleri açık)
- `src/lib/api.ts` — tiplendirilmiş fetch'ler (RSS 5 dk, duyurular 1 dk önbellek)
- `src/lib/*Data.ts` — `public/data/` JSON'larını okuyup tiplendirir
- `scripts/check-content.mjs` — `check:content`

Path alias: `@/*` → `src/*`.

### Tasarım dili

Seyir/sonar/teknik çizim: derin deniz bantları, batimetri (derinlik eğrisi) haritası, sonar
halkaları, logodaki "devre düğümü" (○──●). Kurallar `src/app/globals.css` (`:root`, `.dark`,
`@theme`, `@utility`) ve `src/app/layout.tsx`'te (next/font). Tailwind CSS v4 + CSS
değişkenleri; Dark/Light `next-themes` ile. Sınıf çakışmaları için `src/lib/utils.ts` → `cn()`.

- Marka renkleri logodaki GY işaretinin gradyanından; Tailwind rengi olarak da tanımlı
  (`bg-derin`, `text-camgobegi` …): `--derin #061632`, `--gece #0C2250`, `--lacivert #1B3F8F`
  (açık temada birincil), `--mavi #2A6CB0`, `--camgobegi #4CC0EE` (koyu temada birincil),
  `--kopuk #DCEFF8`, `--sinyal #FF6B35`.
- `--camgobegi` açık zeminde metin olarak okunmuyor: yalnızca derin bantlarda ve koyu temada
  metne verilir. `--sinyal` (şamandıra turuncusu) yalnızca küçük nokta/işaret/aktif durum
  içindir; metin, büyük yüzey ya da düğme zemini olmaz.
- Yazı tipleri: başlıklar Sora (`font-display`; h1–h3'e base layer'da verili), gövde IBM Plex
  Sans (`font-sans`), kısa teknik etiketler IBM Plex Mono (`label-mono`). Üçü de `latin-ext`
  alt kümesiyle yükleniyor, yoksa ş/ğ/ı/İ yedek fonta düşer.
- `label-mono` yalnızca kısa etiketlerde: rozet, bölüm üst etiketi, sıra numarası, tarih/kategori
  satırı, yükleniyor ve boş durum, koordinat. Gövde metni, başlık, form ve düğmede kullanılmaz.
  Büyük harfe CSS çeviriyor (`<html lang="tr">` sayesinde i→İ doğru); metin JSON'da normal
  yazılır. Font boyutunu kendisi veriyor, yanına `text-xs` gibi boyut sınıfı ekleme.
- Özel sınıflar:
  - `bg-deep`: derin deniz bandı (ana sayfa hero'su, İDA bölümü, iç sayfaların `PageHeader`'ı).
    Gradyan zemin ve `::before` ile `public/pattern/bathymetry.svg`; iki temada aynı. Bandın
    içinde `--mark-*` koyu temanın açık gradyanına döner.
  - `wave-edge`: bandın dalgalı kenarı; `bottom-0` ya da `top-0 rotate-180` ile.
  - `bg-chart` (silik seyir haritası ızgarası), `hud-frame` (vizör köşeleri, renk `--hud`).
  - `bg-cta` + `shadow-cta` (birincil düğme), `shadow-featured`. Birincil düğme
    `bg-cta text-white shadow-cta`: `text-white` şart, koyu temada `primary-foreground` koyu
    lacivert ve gradyan üstünde okunmuyor.
  - `animate-sweep`, `animate-sonar`, `animate-beacon`: yalnızca `motion-safe:` ile.
- `src/components/layout/Brand.tsx`: `GencyaMark` (logo işareti, gradyanı `--mark-1..3`'ten),
  `NodeMark` (bölüm başlığının üstündeki ○──●), `SonarLoader` (yükleniyor). İşaretin yolu
  `gencyaMarkPath.ts`'te; logodan potrace ile izlendi, elle düzenlenmez.
- `PageHeader` (iç sayfa başlık bandı), `SonarScope` (hero'daki sonar ekranı),
  `VehicleSection` (İDA bölümü ve teknik çizim).
- Yeni bir `--shadow-*` eklenirse `cn()` içindeki `extendTailwindMerge` listesine de eklenmeli.
  Eklenmezse tailwind-merge onu gölge rengi sanar, shadcn bileşeninin kendi `shadow-xs`'i kalır
  ve gölge sessizce görünmez.
- İkonlar: `src/app/icon.svg`, `favicon.ico`, `apple-icon.png`, `opengraph-image.jpg` aynı GY
  işaretinden üretildi; logo değişirse dördü birlikte yenilenir.

### Backend (`backend/`)

Express.js, routes → controllers → models; ayrıca `middlewares/`, `helpers/`, `config/`,
`scripts/`. Endpoint ayrıntıları: `backend/ENDPOINTS.md`.

Route prefix'leri: `/health`, `/auth`, `/users`, `/announcements`, `/contact`, `/rss`,
`/submissions`, `/mail`, `/mail/queue`.

Kimlik doğrulama: `POST /auth/login` JWT döndürür, frontend token'ı localStorage'da saklar,
korunan istekler `Authorization: Bearer <token>` gönderir. `middlewares/authMiddleware.js`:
`protect`, `adminOnly`, `roleOnlyForCategory`, `roleOnlyForSubmission`, `sponsorOrAdmin`.
Şifre değişince `User.passwordChangedAt` yazılır; ondan önce verilmiş token'lar `protect`'te
401 alır (panel çıkış yaptırıp yeniden giriş ister).

Roller (`User.role`): `admin`, `navigation`, `vision`, `electronics`, `sponsor`, `user`.
Takım rolleri yalnızca kendi kategorilerinin başvurularını yönetir; `sponsor` yalnızca sponsor
mailine (`/mail`, `/mail/queue`) erişir. Sponsor maili kuralları `helpers/mailInput.js`'te: tek
adres, görev başına ≤500 tekil alıcı, kullanıcı başına ≤5 aktif görev, ≤100 blok (ham JSON
≤100 KB). Kuyruk ortak ve sıralı işlenir (alıcılar arası 15–30 sn). Mail şablonu
`helpers/mailTemplateBuilder.js`, logo `backend/assets/logo.png` (`cid:logo`).

Logging: `helpers/logger.js` — `logger.debug()`, `logger.info()`, `logger.error()`;
`LOG_LEVEL=debug` olmadıkça debug logları gösterilmez.

Modeller (`models/`, Mongoose):

- **User:** `name`, `email`, `password` (bcrypt), `role`, `passwordChangedAt`
- **Announcement:** `title`, `content`, `summary`, `category`, `author`
- **Contact:** `name`, `email`, `subject`, `message`, `isRead`
- **Submission:** `submissionType` (general/technical), öğrenci alanları, `technicalCategory`,
  `customFields` (dinamik alanlar), `status` (pending/reviewed/accepted/rejected)
- **ApplicationWindow:** form başına başvuru dönemi
- **MailJob:** sponsor mail kuyruğu

### İçerik (`frontend/public/data/`)

Statik site içeriği koda gömülü değil, JSON dosyalarında; `src/lib/*Data.ts` bunları okuyup
tiplendirir. Takımlar ve yönetim kurulu veritabanında değil, burada (eski sitedeki admin'den
takım/form yönetimi kaldırıldı).

- Ana sayfa: `home/data.json` → `hero` (`position`: koordinat satırı), `clubIntroduction`,
  `vehicle` (İDA bölümü), `announcements`, `publications`
- Yönetim kurulu: `about/data.json` → `boardMembers[]`, görseller `public/profile/boardMembers/`;
  takım arması `about.emblem` → `public/brand/`
- Takım üyeleri: `teams/{navigation,vision,electronics}.json` → `members[]` ve
  `leaderMessage.author`, görseller `public/profile/teams/<takım>/`
- Başvuru formları: `applications/<slug>.json`
- KVKK aydınlatma metni (`/kvkk`): `kvkk/data.json`

### Dernek sitesi (`dernek/`)

`https://gencya.org`: Genç Yarınlar Derneği'nin tek sayfalık sitesi. Teknoloji takımının
sitesiyle ortak kodu yok. Statik: `index.html` + `styles.css` + `script.js` + `fonts/` ve
ikonlar; build, npm paketi ve backend yok, sunucu klasörü olduğu gibi kökten servis eder.
Form yok (e-posta ve Instagram bağlantısı), kişisel veri toplanmadığı için KVKK sayfası da
yok; forma alan eklenirse aydınlatma metni gerekir.

- Tasarım: fildişi kâğıt, lacivert, altın; Cinzel (büyük harf etiketler), Cormorant Garamond
  (başlıklar), Source Sans 3 (gövde), üçü de `fonts/` altında latin + latin-ext. Renkler
  `styles.css` başındaki belirteçlerde; altın `#B4904A` açık zeminde yalnızca süs, altın metin
  `--gold-ink`.
- Logo yolları `index.html` başındaki `<svg class="defs">` sembollerinde (`s-amblem`,
  `s-logo`, `s-yazi`, `s-dugum`); sayfa onları `<use>` ile çağırır. Yeni kimlik bölümü
  amblemin parçalarına `#p-<parça>` kimlikleriyle tek tek ulaşır, rengi `.lacivert`/`.altin`
  ve CSS değişkenleri verir. Logo yeniden çizilmez. Yeni logo dosyası gelirse önce
  `<metadata>` bloğunu at: gelen SVG/PNG'lerde gömülü C2PA üretim verisi vardı.
- Kaydırmaya bağlı animasyonlar `@supports (animation-timeline: view())` içinde; destek yoksa
  (Firefox, eski Safari) ve hareket azaltılmışsa son hâl görünür. JS kapalıyken içerik eksiksiz.
- İçerik HTML'de elle yazılı. Faaliyet eklemek: `#faaliyetler` → `.silsile`'nin başına yeni
  `<li class="halka">` (en yeni üstte; yılın ilk kaydı `has-yil` + `.yil` alır).
- `favicon.svg`, `favicon.ico`, `apple-touch-icon.png` ve `og.png` (1200×630, sosyal medya
  önizlemesi) amblemden üretildi; logo değişirse dördü birlikte yenilenir. `og:image` mutlak
  adres ister (`https://gencya.org/og.png`).

## Ortam değişkenleri

Şablonlar: `frontend/.env.example`, `backend/.env.example` (sponsor maili için `MAIL_USER`,
`MAIL_APP_PASSWORD`, `MAIL_SENDER_NAME` da orada, yorum satırı olarak).

- `NEXT_PUBLIC_ENABLE_RSS=0` (varsayılan): Yayınlar (Medium RSS) bölümü, menü/footer bağlantısı
  ve `/publications` kalkar. Takımın Medium'u olunca `1` yap ve backend'de `MEDIUM_RSS_URLS`'i
  doldur.
- `NEXT_PUBLIC_*` değerleri build sırasında koda gömülür: build ortamında da tanımlı olmalı ve
  değiştirince yeniden build/deploy gerekir. `NEXT_PUBLIC_APP_URL` sitemap'in ve sosyal medya
  önizlemesinin (`metadataBase`) kök adresi.
- `KEY` en az 32 karakter olmalı (bkz. İlk admin oluşturma).

## Projeye özel kurallar

### Branch'ler

Branch adı yaptığı işi anlatır: `<tür>/<kısa-açıklama>`. Tür `feature`, `fix`, `security`,
`chore`, `ci`, `deps` ya da `docs`; açıklama küçük harf, ASCII (Türkçe karakter yok),
kelimeler tireyle: `feature/basvuru-donemi-yonetimi`, `fix/tunnel-client-ip`. `claude/` gibi bir
araç adıyla ya da rastgele adla başlamaz; oturum böyle bir branch atamışsa işe başlamadan uygun
adlı yeni bir branch aç.

Bir branch tek bir iş taşır; araya giren ilgisiz değişiklik kendi branch'ine gider.

### Commit, PR ve dokümanlarda yapay zekâ izi yok

Commit mesajlarına, PR açıklamalarına, PR yorumlarına ve `docs/` altındaki plan/spec'lere yapay
zekâ aracından iz yazılmaz: `Co-Authored-By` satırı, oturum linki, "Generated with …" notu, araç
ya da ajan adı yok. Commit'lerin yazarı ekipten biridir; araç kendi adıyla commit atmaz ve repoda
katkıda bulunan olarak görünmez. Yazar e-postası GitHub hesabına bağlı bir adres olmalı
(`akadirr41@outlook.com` → Akadirr1); bağlı olmayan adresle atılan commit GitHub'da hesaba
bağlanmaz.

### Paket yöneticisi: npm

Her pakette tek lockfile `package-lock.json`, CI `npm ci` kullanıyor. `pnpm-lock.yaml` ve
`yarn.lock` `.gitignore`'da: iki lockfile bir arada kurulumların ayrışmasına yol açıyordu.

**Turbopack workspace kökü sabitlendi.** Next, kökü ağaçta yukarı doğru lockfile arayarak
tahmin ediyor; geliştiricinin ev dizininde başıboş bir `package-lock.json` varsa kökü oraya
çözüp her build'de uyarı basıyordu. `next.config.ts` içindeki `turbopack.root` bunu makineden
bağımsız hâle getirdi. Uyarıyı depodaki lockfile'ları silerek kovalama — sebep repo dışında
olabilir.

### İçerik ve kişi kartları

- Bir kişinin adı değişince `leaderMessage.author` alanı da kontrol edilmeli — lider ismi
  `members[]` dışında ikinci bir yerde daha tekrar ediyor.
- Görsel yolları JSON'da elle yazılı ve `next/image` `<Image>` ile `public/` altından servis
  edilir (`about.tsx`, `teamDetail.tsx`). Next bu yolların varlığını **build sırasında
  doğrulamaz** — yanlış yol build'i geçer ve çalışma zamanında 404 olur. Dosya adı
  değişikliğinde JSON yolu ile dosya adını birlikte değiştir ve sayfayı gerçekten aç.
- Dosya adlarında ASCII kullan: Türkçe karakterli adlar (`ı`, `ü` …) Unicode normalizasyon
  (NFC/NFD) farkı yüzünden macOS'ta çalışıp Linux sunucuda 404 verebilir.
- `teamDetail.tsx` `member.skills.length` yazıyor — optional chaining **yok**. Bir üyeden
  `skills` eksikse takım sayfası çalışma zamanında patlar, build sorunsuz geçer. `skills` en
  azından `[]` olmalı.
- `github`, `linkedin`, `kaggle`, `skills` alanlarının hepsi bileşende truthy kontrolüyle sarılı
  — bilinmeyen değerler için `""` / `[]` yaz, alanı **silme**.
- Görseli olmayan üye için yolda **`placeholder`** kelimesi geçen bir değer kullan (ör.
  `/profile/boardMembers/placeholder.jpeg`). `about.tsx` ve `teamDetail.tsx`
  `!member.image.includes("placeholder")` kontrolüyle o kaydı hiç yüklemeyip ikon fallback'i
  render eder — dosyanın var olması gerekmez.
- KVKK metni sitenin gerçekte topladığı veriyi anlatmalı: başvuru veya iletişim formuna yeni
  bir alan eklenirse, verinin paylaşıldığı ya da saklandığı yer değişirse `kvkk/data.json`'daki
  ilgili bölüm ve `lastUpdated` da güncellenmeli.

### Sosyal medya linkleri

Üyeler linklerini telefondan paylaşıyor; gelen hâli işlenmeden yazılmamalı:

- `?utm_source=…` kuyruğunu at.
- Yol segmentindeki Türkçe karakterleri percent-encode et (`bengüsu` → `beng%C3%BCsu`).
- GitHub çoğu zaman çıplak kullanıcı adı olarak geliyor; `https://github.com/<kullanıcı>`
  hâline getir. `check:content` mutlak URL olmayan değeri reddeder.

### Görsel hazırlama

Gelen fotoğraflar telefon çıktısı: HEIC, 2–4MB, dikey, EXIF'inde GPS var. Yayımlamadan önce:
kareye kırp (yüz merkezli, yüz karenin ~%42 yüksekliğinde), 400×400 JPEG'e indir, **EXIF'i
düşür** (GPS konumu gerçek kişilerin fotoğrafında yayımlanmamalı). HEIC okumak için macOS'ta
`sips`, Python'da `pillow_heif` + Pillow.

Uzantıya güvenme: `.jpeg` uzantılı ama içeriği HEIC olan dosya tarayıcıda açılmaz, build geçer.
`check:content` bu yüzden magic byte'a bakıyor.

### İDA bölümü (`home.vehicle`)

Ana sayfadaki İDA bölümü (`layout/VehicleSection.tsx`) aracın alt sistemlerini numaralı bir
listeyle ve trimaranın genel yerleşim düzeninde iki görünüşüyle (üstte yan, altta üst görünüş;
SVG) gösterir. Her alt sistemin `anchor`'u çizimdeki parçadır: `hull` (üst görünüşte yan gövde),
`mast` (GNSS anteni), `camera`, `antenna` (telemetri), `propulsion` (gövdedeki itici), `power`
(üst yapıdaki batarya). Liste sırası numarayı verir; işaretin yeri `VehicleSection.tsx` →
`ANCHORS`. Yeni bir anchor eklemek çizime parça ve `ANCHORS`'a koordinat eklemek demek;
`check:content` izinli anchor listesini denetler. Hero'daki sonar ekranının ortasındaki araç da
aynı üst görünüş silüetinin küçültülmüşü.

**Aracın 3B modeli (STL/STEP/SolidWorks) repoya da siteye de konmaz.** Repo açık kaynak ve
başka bir takımın tasarımı böyle çalındı; `.gitignore` bu uzantıları dışarıda tutuyor.
Siluetler (`layout/vehicleDrawing.ts`) modelden 4 mm/piksel çözünürlükte izlenip yumuşatıldı:
çizim araca benzer ama ölçü çıkarılacak hassasiyette değil. Ön görünüş ve gövde kesiti (asıl
tasarım bilgisi) ve güverte altındaki itici yerleşimi bilerek çizilmedi; gerçek ölçü yazılmaz.
Gövde değişirse siluetler aynı yöntemle yeniden üretilir, model yine yalnızca geliştiricinin
makinesinde kalır.

`vehicle.image` `null` ise çizim gösterilir; aracın fotoğrafı hazır olunca `public/vehicle/`
altına (≤300 KB, EXIF'siz) koyup yolunu yaz: çizim yerine fotoğraf görünür, numaralı liste kalır.
Fotoğraf da gövdeyi yakın plandan, ölçek verecek şekilde göstermemeli.

### `check:content`

`npm run build` `public/data/` JSON'larını doğrulamaz; bunu `frontend/scripts/check-content.mjs`
yapar:

| Kontrol | Neden var |
|---|---|
| Görsel yolu diskte var mı | Next `public/` yollarını build'de doğrulamıyor → sessiz 404 |
| Dosyanın **gerçek** formatı (magic byte) | `.jpeg` uzantılı HEIC tarayıcıda render edilmez, build geçer |
| Görsel kare mi | Kartlar `AspectRatio 1/1` + `object-cover`; kare olmayan görsel sessizce kırpılır |
| Dosya boyutu < 300KB | Telefon fotoğrafları 2MB+ geliyor |
| `leaderMessage.author` ∈ `members[]` | Lider adı iki yerde duruyor; biri unutulursa ayrılmış kişi sayfada kalır |
| `skills` dizi mi | `member.skills.length` runtime tuzağı |
| `projects[].stores` dizi mi, `name` `App Store`/`Google Play` mı, `url` https ya da `null` mı | `stores.map` runtime tuzağı; yanlış `name` sessizce yanlış ikon verir. `url: null` → "Yakında" pasif buton |
| Teknik formdaki her alan `question_<id>` olarak backend `allowedCustomFields`'te mi, `type: number` değil mi, `formatCustomFields`'te etiketi var mı (iki kopya aynı mı); genel formda kişisel olmayan alan var mı | Eksik anahtar her gönderimde 400 döner, build ve form sessiz geçer; etiketsiz alan panelde ham `question_<id>` görünür; genel form özel alanı sessizce atar |
| `github` / `linkedin` / `kaggle` mutlak URL mi | Çıplak kullanıcı adı kırık link olur |
| `home.vehicle`: 4–6 alt sistem, anchor'lar izinli ve tekil, `team` geçerli slug, `image` `null` ya da diskte gerçek görsel; `hero.position` var | Bilinmeyen anchor çizimde işaretsiz kalır; yanlış yol sessiz 404 |
| `about.emblem` görseli diskte, gerçek format, kare, ≤300 KB | Aynı sessiz 404 / kırpma tuzağı |
| `public/data`'da KOU SENG'den kalma ifade yok | Altyapı KOU SENG'den kopyalandı |

Betik hiçbir zaman sessizce atlamaz: ölçemediği her durum FAIL, çıkış kodu 1. Kontrol yeşilken
bile içerik değiştirdikten sonra ilgili sayfayı `npm run dev` ile aç — kırpma/çerçeveleme
kalitesini betik ölçmez.

### Takım slug'ı üç kimliği birden taşıyor

`navigation` / `vision` / `electronics` değeri aynı anda **URL slug'ı**, **`User.role`** ve
**`Submission.technicalCategory`**. `roleOnlyForCategory` doğrudan `req.user.role ===
req.query.category` karşılaştırması yapıyor (`backend/middlewares/authMiddleware.js`), yani üçü
ayrışırsa yetkilendirme sessizce 403'e döner. Slug'lar eski Gençya sitesinin veritabanındaki
rollerle aynı; değiştirilmeleri eski hesapları kırar.

Dosya adı da slug'ın kendisi: `getTeamDetail` `teams/${slug}.json`, `useApplyDetail`
`/data/applications/${slug}.json` okuyor. Slug değişimi = dosya adı değişimi. Takım slug'ları
`teams/` dizin listesinden türetildiği için sitemap kendiliğinden güncelleniyor.

**Slug değiştirirken sırayla:** JSON dosya adları → `slug` alanları → görsel klasörü + JSON
yolları → `User.js` role enum → `submissionsController` `validCategories` + `PURGE_SCOPES` →
`helpers/applicationWindow.js` `APPLICATION_SLUGS` (`ApplicationWindow` enum'u buradan) →
`statusController` sorgusu ve yanıt anahtarları (`useStatus.ts`, admin `dashboard.tsx` okuyor) →
frontend tip birleşimleri (`useUser.ts`, `useSubmissions.ts`, `admin-management.tsx`) →
`lib/applicationWindow.ts` `APPLICATION_LABELS` → `AdminSidebar` `limitedRoles`/`roleToSlug`/alt
menü → dashboard `layout.tsx` rol listesi → `data-management.tsx` kapsamları → `Header.tsx` →
`home.vehicle.subsystems[].team` → **veritabanı migration'ı** (`User.role`,
`Submission.technicalCategory`, `ApplicationWindow.slug`). Kod deploy edilip migration
çalıştırılmazsa rolü eski slug'da kalan hesaplar teknik takım sayfasına erişemez ve
`User.save()` enum doğrulamasında patlar; ikisi aynı bakım penceresinde yapılmalı.

### Eski Gençya sitesinden geçiş

Eski site (`upfrontend` branch'i) takımları, yönetim kurulunu ve teknik formları veritabanında
tutuyordu (`teams`, `boardmembers`, `images` koleksiyonları, admin'de takım/form oluşturucu).
Yeni altyapıda bunlar JSON'da; o koleksiyonlar okunmuyor, silinmedi. Aynı veritabanıyla
çalıştırırken:

- Kullanıcılar (`users`) ve roller aynen çalışır; eski `refresh_token` akışı yok, herkes bir kez
  yeniden giriş yapar.
- Admin'den eklenmiş takım üyesi/yönetim kurulu bilgisi ve yüklenmiş fotoğraflar siteye
  kendiliğinden gelmez: `teams`/`boardmembers` belgelerinden JSON'a, `images`'tan
  `public/profile/` altına (400×400, EXIF'siz) elle taşınmalı. Ekim 2026'daki kadro ve
  fotoğrafları taşındı. Eski kayıtlardaki `https://api.gencya.org.tr/images/<id>` adresi
  yeni backend'de yok; gerekirse `backend/scripts/export-legacy-content.js` (salt okur) üç
  koleksiyonu `backend/backups/` altına dosya olarak çıkarır.
- `ApplicationWindow` kaydı yokken genel üyelik açık, teknik formlar kapalı başlar; panelden
  **Başvuru Dönemleri** ile açılır.

### İlk admin oluşturma (deploy edilmiş sunucuda)

Sistemde hiç kullanıcı yokken `POST /users`, `KEY` ortam değişkeniyle çağrılabilir. Mantık
`firstUserCreation()`'da değil, `protect` içinde (`authMiddleware.js`, `isFirstUserRequest` +
`matchesSystemKey`). `POST /users` isteğinde **dört koşul birden** aranır: `req.originalUrl ===
'/users'` (birebir), `req.method === 'POST'`, token'ın `KEY` ile eşleşmesi ve
`User.countDocuments() === 0`. Biri tutmazsa istek `jwt.verify` yoluna düşer ve **401** döner —
hata hangi koşulun tutmadığını söylemez. Eski veritabanında kullanıcı varsa bu yol zaten kapalı.

**`KEY` en az 32 karakter olmalı** (`openssl rand -hex 32`). Tanımsız veya daha kısa bir `KEY`
bu yolu tamamen kapatır; kısaysa backend logunda "KEY 32 karakterden kısa" hatası görünür.
Karşılaştırma sabit sürede yapılır.

İsteği public adrese değil, backend sunucusunun içinden `localhost`'a gönder (KEY internete
çıkmaz, CORS'a takılmaz, ters proxy yolu değiştiremez).

**Tek atış hakkı var.** `createUser` `role: role || 'user'` diyor; gövdeye `"role": "admin"`
koymazsan sıradan bir `user` oluşur, `usersCount` artık 0 olmadığı için KEY yolu **kalıcı olarak
kapanır** ve geriye yalnızca veritabanına elle müdahale kalır. Şifre en az 10 karakter olmalı;
daha kısası 400 döner ve kullanıcı oluşmadığı için KEY yolunu tüketmez.

Diğer iki tuzak: sonda slash veya sorgu dizesi (`/users/`, `/users?x=1`) eşleşmeyi bozar; nginx
`/api/` gibi bir önek ile proxy'liyorsa `originalUrl` `/api/users` olur ve koşul tutmaz.

### Backend ESM — `node --check` yalan söylüyor

`backend/package.json` içinde `"type": "module"` var; tüm backend ESM. `require()` ile yazılmış
bir `.js` dosyası **çalışma anında** patlar: `ReferenceError: require is not defined in ES
module scope`.

`node --check dosya.js` bunu **yakalamaz** — dosyayı CommonJS varsayarak denetler ve yeşil
verir. Yeni bir backend betiği yazdıktan sonra doğrulama yöntemi onu gerçekten çalıştırmaktır.
DB'ye dokunmadan denemek için gerekli ortam değişkenini boşalt, betik guard'ında dursun:

```bash
cd backend && MONGODB_URI="" node scripts/<betik>.js --dry-run   # exit 2 beklenir
```

`dotenv` mevcut ortam değişkenlerini ezmediği için bu güvenli bir kuru deneme. Betikler
`scripts/` altından çalıştığından `dotenv.config()` çıplak çağrılmamalı — `.env` backend
kökünde, yol açıkça verilmeli.

**Node 22.11 ve `require(esm)`.** `sanitize-html` 2.17.6+ `htmlparser2` 12'yi CommonJS'ten
`require()` ile yüklüyor; Node < 22.12'de bu bayraksız kapalı. Bu yüzden `npm start` `node
--experimental-require-module index.js` çalıştırıyor. Sunucuyu `node index.js` ile doğrudan
başlatırsan Node < 22.12'de açılışta `ERR_REQUIRE_ESM` ile çöker. CI en eski desteklenen sürümle
(`ci.yml` `NODE_VERSION` 22.11.0) ve `npm start` ile koşuyor. Production 22.12+ ise bayrak
zararsız; kaldırılacaksa `NODE_VERSION` da güncellenmeli.

### Mongoose `sanitizeFilter` açık — operatörlü sorgu `trusted()` ister

`config/dbConnection.js` global `sanitizeFilter`'ı açıyor: filtre içinde `$` anahtarlı her
nesne `$eq` ile sarılır, istek gövdesinden gelen değer operatör olarak çalışamaz. Bedeli:
**bilerek** operatör kullanan yeni bir filtre (`$regex`, `$gte`, `$in` …)
`mongoose.trusted({...})` ile sarılmazsa hata vermez, sessizce eşitlik aramasına döner ve **boş
sonuç** gelir. Örnek: `announcementsController` / `submissionsController` arama kodu.
`$or`/`$and` dokunulmadan geçer; update nesneleri (`$set`, `$push`) etkilenmez. `scripts/` ayrı
süreç olduğu için bu ayardan etkilenmez. `trusted()` filtrenin tamamını değil operatör nesnesini
sarar: `{ _id: mongoose.trusted({ $in: ids }) }`. Tüm filtre sarılırsa koruma yine devreye
girer: ObjectId alanında CastError, string alanında boş sonuç.

### Başvuru dönemleri

Formların (`general`, `navigation`, `vision`, `electronics`) açık/kapalı durumu backend'de, form
başına bir `ApplicationWindow` kaydında durur. Kural `helpers/applicationWindow.js`'te (birim
testi yanında): form `[opensAt, closesAt)` aralığında açık; `opensAt` yoksa kapalı, `closesAt`
yoksa süresiz açık. Kayıt yoksa genel üyelik açık, teknik formlar kapalı. Karar sunucu saatiyle
verilir; kapalı forma gelen başvuru, gövdeye bakılmadan 403 alır ("Bu başvuru şu anda
kapalı."). Tarihleri `PATCH /submissions/windows/:slug` değiştirir, yalnızca admin.

Panelde: **Başvuru Dönemleri** (`/admin/dashboard/application-windows`, yalnızca admin).
Alanlar tarayıcının saatiyle girilir, sitede Türkiye saatiyle gösterilir; "Kapat" iki tarihi de
siler. `/apply` ve form sayfası durumu `GET /submissions/windows`'tan okur; alınamazsa ya da 10
sn'de cevap gelmezse formlar kapalı görünür ve "Başvuru durumu alınamadı" uyarısı çıkar. Bu
isteğin kendi limiti var (bkz. "Rate limit ve proxy"). Deploy sırası: önce backend, sonra
frontend; frontend önce giderse backend gelene kadar formlar kapalı görünür.

`scripts/windows-smoke.js` bunları çalışan backend'e karşı sınar. İlk admini `KEY` ile
oluşturduğu için kullanıcısı olmayan boş bir veritabanı ister ve yalnızca
`localhost`/`127.0.0.1`'e koşar (başka adreste exit 2). Tarih değiştirip başvuru yazar, form
isteği harcar ve genel formu açık bırakır; CI'da bu yüzden `loadtest`'ten önce koşar, sonrasında
form limiti dolmuş olurdu.

### Başvuru formuna alan ekleme

Form `applications/<slug>.json` → `fields[]`'ten render ediliyor; `applyDetail.tsx` öğrenci
alanları dışındaki her alanı `question_<id>` anahtarıyla gönderiyor. Teknik forma yeni alan için:

- `applications/<slug>.json` → `fields[]`
- `submissionsController` → `allowedCustomFields`'e `question_<id>`
- `formatCustomFields` etiket switch'i: `admin/technical-team.tsx` ve kopyası
  `general-membership.tsx`; eklenmezse panelde ham `question_<id>` görünür
- `kvkk/data.json` → "İşlenen Kişisel Veriler" ve `lastUpdated`

İlk üçünün birbirini tutmasını `check:content` denetler (allowlist, etiket, `number` tipi, genel
formda özel alan); KVKK metnini denetlemez.

Tuzaklar:

- **Allowlist:** JSON'a eklenip `allowedCustomFields`'e eklenmeyen alan 400 döner ("Geçersiz
  alanlar tespit edildi"): zorunluysa her gönderimde, opsiyonelse doldurulunca. Boş alan hiç
  gönderilmediği için boş bırakarak yapılan deneme hatayı göstermez; form ekranda normal görünür.
- **Genel üyelik formu `customFields` kabul etmiyor:** `createGeneralSubmission` yalnızca öğrenci
  alanlarını okuyor; `general.json`'a eklenen alan 201 dönse de sessizce atılır.
- `customFields` değerleri yalnızca string (≤5000 karakter): dizi dönen alan (çoklu seçim) 400
  alır, `type: "number"` alan da (zod değeri sayıya çeviriyor).
- Formun açık/kapalı durumu ve tarihleri JSON'da değil, backend'de: admin paneli → **Başvuru
  Dönemleri**. JSON'a `isOpen` ya da `deadline` eklemek bir şey değiştirmez.
- Mongo'da migration gerekmez (`customFields` `Mixed`); CSV dışa aktarımı yeni anahtarı
  kendiliğinden sütun yapar.

### Başvuruları silme (saklama süresi)

Başvurular kişisel veri içeriyor; değerlendirme dönemi bitince silinmeli. Yol panelde: **Veri
Yönetimi** (`/admin/dashboard/data`, yalnızca admin). Kapsam seçilir, CSV yedek indirilir; silme
ancak ondan sonra açılır ve kayıt sayısının yazılmasını ister. `POST /submissions/purge` sayı
tutmazsa 409 döner ve yalnızca o an saydığı kayıtları siler. JSON yedek gerekirse CLI betiği
`scripts/purge-submissions.js` (`--dry-run`, `--expect`) aynen duruyor.

### Duyuru HTML'i ve CSP

Duyuru içeriği HTML olarak gösteriliyor ve iki yerde aynı izin listesinden geçiyor: kaydederken
`announcementsController` (`sanitize-html`), gösterirken `frontend/src/lib/sanitizeHTML.ts`
(public sayfa, admin önizleme, editör). Listeyi değiştirirsen ikisini birlikte değiştir.

`next.config.ts` bir Content-Security-Policy gönderiyor. Yeni bir dış kaynak (script, iframe,
API adresi) eklenirse oraya da eklenmeli; yoksa tarayıcı onu engeller ve yalnızca konsola
"Refused to …" yazar. Görseller `next/image` üzerinden geldiği için `img-src 'self'` yeterli.
İletişim sayfasındaki Google Maps için `frame-src https://www.google.com` var.
`static.cloudflareinsights.com` / `cloudflareinsights.com` Cloudflare Web Analytics içindir;
site Cloudflare arkasında değilse zararsız.

### Rate limit ve proxy

`backend/index.js`: genel limit IP başına 15 dk'da 100 istek (geçerli token'lı istekler
sayılmaz, mail kuyruğu sık yokluyor). Ek olarak, muafiyetsiz: `POST /auth/login` ve `PATCH
/auth/password` birlikte 15 dk'da 10 **hatalı** deneme. `POST /mail/send` ve `POST /mail/queue`
birlikte 15 dk'da 30 (token'lı istekler de sayılır). Başvuru akışının kendi limitleri var ve
genel limite **sayılmaz**: `GET /submissions/windows` 15 dk'da 600, başvuru ve iletişim formları
birlikte 15 dk'da 100. Sebep ortak ağlar (okul/yurt Wi-Fi'ı, gençlik merkezi): çok kişi aynı dış
IP'yi paylaşıyor; başvuru akışı genel limite sayılsaydı ~30 başvurandan sonra o ağdaki herkes
formları kapalı görürdü.

Ziyaretçi adresi `helpers/clientIp.js` ile okunur: `trust proxy 1` ile `req.ip` bir Cloudflare
adresi ya da iç ağ adresiyse (10/8, 172.16/12, 192.168/16, 127/8, ::1, fc00::/7)
`CF-Connecting-IP`, değilse `req.ip`. Bu, KOU SENG'in `ziyaretçi → Cloudflare → Docker geçidi →
proxy` düzenine göre yazıldı. Sunucu Cloudflare'siz, aynı makinedeki bir nginx arkasındaysa
nginx `X-Forwarded-For`'u eklemeli (`proxy_set_header X-Forwarded-For
$proxy_add_x_forwarded_for;`): eklemezse `req.ip` 127.0.0.1 olur, bütün site tek kovayı paylaşır
ve istemci `CF-Connecting-IP` başlığını kendisi yazarak limiti atlatabilir.

Kontrol: `LOG_LEVEL=debug` ile her istek `[ziyaretçi] (req.ip: hop)` biçiminde loglanır; köşeli
parantezde iç ağ adresi görünüyorsa ziyaretçi adresi okunamıyor. Dışarıdan: `curl -sI
https://api.gencya.org.tr/health` yeni bir istemcide `ratelimit-remaining: 99` civarı vermeli;
düşükse herkes aynı kovada.

### Lint

`eslint.config.mjs`, `eslint-config-next`'in flat config export'larını doğrudan kullanıyor. Eski
`FlatCompat.extends("next/...")` hâli `eslint-config-next` 16'dan sonra dairesel JSON hatasıyla
çöküyordu; o yola geri dönme. `react-hooks/set-state-in-effect` ve `react-hooks/purity` React
Compiler kuralları; proje compiler kullanmadığı için uyarı seviyesinde. CI hata (error) çıkarsa
kırmızı verir, uyarılar geçer.
