// check:content — public/data/*.json içindeki kişi kayıtlarını ve gerçek görsel
// dosyalarını doğrular. Bu kontroller hiçbir type check'ten ve build'den geçmez:
// JSON veri, Next build'i public/ yollarını doğrulamaz, ve bir dosyanin uzantisi
// icerigi hakkinda hicbir sey soylemez.
//
// Yakaladigi gercek hatalar:
//   - JSON'daki gorsel yolu diskte yok  -> sayfada 404, build sessiz gecer
//   - .jpeg uzantili ama icerigi HEIC    -> tarayici render edemez, build sessiz gecer
//   - leaderMessage.author uyelerde yok  -> ayrilmis bir liderin adi sayfada kalir
//   - skills alani eksik                 -> teamDetail.tsx `member.skills.length` ile patlar
//   - projects[].stores dizi degil       -> teamDetail.tsx `project.stores?.map` ile patlar
//   - forma eklenen alan allowlist'te yok -> her basvuru 400 doner, build ve form sessiz gecer
//   - home.vehicle / hero.position eksik, alt sistem takimi yok -> ana sayfa bolumu bozulur
//   - arac fotografi / arma yolu diskte yok, formati yanlis -> 404, build sessiz gecer
//   - eski kurumdan kalan ad/alan adi metni -> yanlis kurum adi sitede kalir
//
// ÖNEMLİ: bu betik hiçbir zaman sessizce atlamaz. Ölçemedigi her sey FAIL'dir.

import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join, dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const PUBLIC = join(ROOT, 'public');
const DATA = join(PUBLIC, 'data');

const failures = [];
const ok = (t, d) => console.log(`  ok    ${t.padEnd(16)} ${d}`);
const bad = (t, d) => { console.log(`  FAIL  ${t.padEnd(16)} ${d}`); failures.push(`${t}: ${d}`); };

/** Dosyanin gercek formatini magic byte'lardan okur. Uzantiya guvenmez. */
function sniff(buf) {
  if (buf.length >= 3 && buf[0] === 0xff && buf[1] === 0xd8 && buf[2] === 0xff) return 'jpeg';
  if (buf.length >= 8 && buf.toString('latin1', 0, 8) === '\x89PNG\r\n\x1a\n') return 'png';
  if (buf.length >= 12 && buf.toString('latin1', 4, 8) === 'ftyp') {
    const brand = buf.toString('latin1', 8, 12);
    if (/^(heic|heix|hevc|mif1|msf1|avif)$/.test(brand)) return `heif(${brand})`;
    return `iso(${brand})`;
  }
  if (buf.length >= 6 && /^GIF8[79]a$/.test(buf.toString('latin1', 0, 6))) return 'gif';
  if (buf.length >= 12 && buf.toString('latin1', 0, 4) === 'RIFF' && buf.toString('latin1', 8, 12) === 'WEBP') return 'webp';
  if (buf.toString('latin1', 0, 200).includes('<svg')) return 'svg';
  return null;
}

/** JPEG/PNG boyutlarini header'dan okur. Okuyamazsa null doner (= FAIL). */
function dimensions(buf, kind) {
  if (kind === 'png') {
    if (buf.length < 24) return null;
    return { w: buf.readUInt32BE(16), h: buf.readUInt32BE(20) };
  }
  if (kind === 'jpeg') {
    let i = 2;
    while (i + 9 < buf.length) {
      if (buf[i] !== 0xff) { i++; continue; }
      const marker = buf[i + 1];
      if (marker === 0xd8 || marker === 0x01 || (marker >= 0xd0 && marker <= 0xd7)) { i += 2; continue; }
      const len = buf.readUInt16BE(i + 2);
      // SOF0..SOF15, DHT/DAC/SOS haric
      if (marker >= 0xc0 && marker <= 0xcf && marker !== 0xc4 && marker !== 0xc8 && marker !== 0xcc) {
        return { h: buf.readUInt16BE(i + 5), w: buf.readUInt16BE(i + 7) };
      }
      i += 2 + len;
    }
    return null;
  }
  return null;
}

function checkImage(label, webPath) {
  // Bilesenler (about.tsx, teamDetail.tsx) yolunda "placeholder" gecen kaydi
  // hic yuklemez, ikon fallback render eder. Dosya aranmaz — kasitli.
  if (webPath.includes('placeholder')) { ok(label, `${webPath} (placeholder -> ikon fallback)`); return; }
  if (!webPath.startsWith('/')) { bad(label, `gorsel yolu "/" ile baslamali: ${webPath}`); return; }

  const fp = join(PUBLIC, webPath.slice(1));
  if (!existsSync(fp)) { bad(label, `gorsel diskte yok: ${webPath}`); return; }

  let buf;
  try { buf = readFileSync(fp); } catch (e) { bad(label, `okunamadi ${webPath}: ${e.message}`); return; }

  const kind = sniff(buf);
  if (kind === null) { bad(label, `format taninmadi (olculemedi): ${webPath}`); return; }
  if (!['jpeg', 'png', 'webp', 'gif', 'svg'].includes(kind)) {
    bad(label, `tarayici render edemez: ${webPath} gercek format=${kind}`);
    return;
  }

  if (kind === 'jpeg' || kind === 'png') {
    const dim = dimensions(buf, kind);
    if (!dim) { bad(label, `boyut okunamadi (olculemedi): ${webPath}`); return; }
    const ratio = dim.w / dim.h;
    if (Math.abs(ratio - 1) > 0.02) {
      bad(label, `kare degil: ${webPath} ${dim.w}x${dim.h} — kartlar AspectRatio 1/1 + object-cover, kirpilir`);
      return;
    }
    const kb = Math.round(buf.length / 1024);
    if (kb > 300) { bad(label, `cok buyuk: ${webPath} ${kb}KB (avatar icin <300KB)`); return; }
    ok(label, `${webPath} ${kind} ${dim.w}x${dim.h} ${kb}KB`);
  } else {
    ok(label, `${webPath} ${kind}`);
  }
}

/** Tek gorsel dosyasi: yol prefix ile mi, diskte mi, gercek formati izinli mi, <= maxKB mi, istenirse kare mi. */
function checkFile(label, webPath, { prefix, kinds, square = false, maxKB = 300 }) {
  if (typeof webPath !== 'string' || !webPath.startsWith(prefix)) { bad(label, `yol "${prefix}" ile baslamali: ${webPath}`); return; }
  const fp = join(PUBLIC, webPath.slice(1));
  if (!existsSync(fp)) { bad(label, `diskte yok: ${webPath}`); return; }
  const buf = readFileSync(fp);
  const kind = sniff(buf);
  if (!kinds.includes(kind)) { bad(label, `gercek format ${kind ?? 'taninmadi'}, beklenen ${kinds.join('/')}: ${webPath}`); return; }
  const kb = Math.round(buf.length / 1024);
  if (buf.length > maxKB * 1024) { bad(label, `cok buyuk: ${webPath} ${kb}KB > ${maxKB}KB`); return; }
  if (square) {
    const dim = dimensions(buf, kind);
    if (!dim) { bad(label, `boyut okunamadi (olculemedi): ${webPath}`); return; }
    if (Math.abs(dim.w / dim.h - 1) > 0.02) { bad(label, `kare degil: ${webPath} ${dim.w}x${dim.h}`); return; }
  }
  ok(label, `${webPath} ${kind} ${kb}KB`);
}

const filled = (v) => typeof v === 'string' && v.trim() !== '';

function checkPerson(label, m, { requireSkills }) {
  for (const k of ['name', 'role', 'image', 'department', 'github', 'linkedin']) {
    if (!(k in m)) { bad(label, `"${k}" alani eksik`); return; }
    if (typeof m[k] !== 'string') { bad(label, `"${k}" string olmali`); return; }
  }
  if (!m.name.trim()) { bad(label, 'name bos'); return; }
  if (!m.role.trim()) { bad(label, 'role bos'); return; }
  // teamDetail.tsx `member.skills.length` diyor — optional chaining yok.
  // skills eksikse sayfa runtime'da patlar, build gecer.
  if (requireSkills && !Array.isArray(m.skills)) {
    bad(label, 'skills dizi degil — teamDetail.tsx member.skills.length ile patlar');
    return;
  }
  for (const k of ['github', 'linkedin', 'kaggle']) {
    const v = m[k];
    if (v && !/^https?:\/\//.test(v)) { bad(label, `${k} mutlak URL degil: ${v}`); return; }
  }
  checkImage(label, m.image);
}

console.log('about/data.json — yonetim kurulu');
{
  const p = join(DATA, 'about', 'data.json');
  if (!existsSync(p)) bad('about', `dosya yok: ${p}`);
  else {
    const d = JSON.parse(readFileSync(p, 'utf8'));
    if (!Array.isArray(d.boardMembers) || d.boardMembers.length === 0) bad('about', 'boardMembers bos veya dizi degil');
    else {
      for (const m of d.boardMembers) checkPerson(m.name || '(isimsiz)', m, { requireSkills: false });
    }
    // Takimin yuvarlak armasi: about.tsx kare cerceve icinde gosterir.
    if (!d.emblem) bad('about/emblem', 'emblem yok');
    else {
      if (!filled(d.emblem.alt) || !filled(d.emblem.caption)) bad('about/emblem', 'alt ve caption dolu string olmali');
      checkFile('about/emblem', d.emblem.image, { prefix: '/', kinds: ['jpeg', 'png'], square: true });
    }
  }
}

/** stores dizisi: takim sayfasi map'liyor, ikonu name'e gore seciyor. url null = "Yakinda". */
function checkStores(label, stores) {
  if (!Array.isArray(stores)) { bad(label, 'stores dizi degil — sayfa stores.map ile patlar'); return; }
  const names = stores.map((s) => s?.name);
  if (new Set(names).size !== names.length) bad(label, `stores name tekrar ediyor: ${names.join(', ')}`);
  for (const s of stores) {
    if (!['App Store', 'Google Play'].includes(s?.name)) bad(label, `stores name "${s?.name}" — "App Store" ya da "Google Play" olmali`);
    else if (s.url !== null && !/^https:\/\//.test(s.url)) bad(label, `${s.name} url https ile baslamali ya da null olmali: ${s.url}`);
    else ok(label, `${s.name} ${s.url ?? '(yakinda)'}`);
  }
}

// Takim slug'lari teams/ dosya adlarindan: slug = dosya adi = User.role = technicalCategory.
let teamSlugs = [];
console.log('\nteams/*.json — takimlar');
{
  const dir = join(DATA, 'teams');
  if (!existsSync(dir)) bad('teams', `klasor yok: ${dir}`);
  else {
    const files = readdirSync(dir).filter((f) => f.endsWith('.json'));
    if (files.length === 0) bad('teams', 'hic takim dosyasi yok');
    teamSlugs = files.map((f) => f.slice(0, -'.json'.length));
    for (const f of files) {
      const d = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      const slug = f.slice(0, -'.json'.length);
      // getTeamDetail dosyayi URL slug'indan okur; slug alani ayrisirsa linkler 404 olur.
      if (d.slug !== slug) bad(slug, `slug alani "${d.slug}" dosya adiyla ayni degil`);
      if (!Array.isArray(d.members)) { bad(slug, 'members dizi degil'); continue; }
      const names = d.members.map((m) => m.name);
      const author = d?.leaderMessage?.author;
      if (!author) bad(slug, 'leaderMessage.author yok');
      else if (!names.includes(author)) {
        // Lider ismi members[] disinda ikinci bir yerde daha duruyor; biri
        // guncellenip digeri unutulursa ayrilmis kisinin adi sayfada kalir.
        bad(slug, `leaderMessage.author "${author}" members[] icinde yok (${names.join(', ') || 'bos'})`);
      } else ok(slug, `leaderMessage.author = ${author}`);
      for (const m of d.members) checkPerson(`${slug}/${m.name || '(isimsiz)'}`, m, { requireSkills: true });
      // teamDetail.tsx stores'u map'liyor ve ikonu name'e gore seciyor. JSON tip
      // kontrolunden gecmez: nesne yazilirsa sayfa runtime'da patlar, yanlis name
      // sessizce yanlis ikon gosterir. url null = "Yakinda" pasif buton.
      for (const p of d.projects ?? []) {
        if (p.stores !== undefined) checkStores(`${slug}/${p.title || '(basliksiz)'}`, p.stores);
      }
    }
  }
}

console.log('\nhome/data.json — hero ve arac bolumu');
{
  const ANCHORS = ['mast', 'camera', 'antenna', 'hull', 'propulsion', 'power'];
  const hp = join(DATA, 'home', 'data.json');
  const home = existsSync(hp) ? JSON.parse(readFileSync(hp, 'utf8')) : undefined;
  if (!home) bad('home', `dosya yok: ${hp}`);
  else {
    const pos = home.hero?.position;
    if (!filled(pos?.label) || !filled(pos?.coordinates)) bad('home/hero', 'hero.position.label ve .coordinates dolu string olmali');
    else ok('home/hero', `position ${pos.label} ${pos.coordinates}`);

    const v = home.vehicle;
    if (!v) bad('home/vehicle', 'vehicle yok');
    else {
      for (const k of ['eyebrow', 'title', 'description']) if (!filled(v[k])) bad('home/vehicle', `${k} dolu string olmali`);
      if (!filled(v.cta?.text) || !filled(v.cta?.href)) bad('home/vehicle', 'cta.text ve cta.href dolu string olmali');
      // null = site SVG teknik cizim ciziyor; anahtarin hic olmamasi da hata (bilincli secim olmali).
      if (v.image === null) ok('home/vehicle', 'image null -> SVG teknik cizim');
      else checkFile('home/vehicle', v.image, { prefix: '/vehicle/', kinds: ['jpeg', 'png', 'webp'] });
      const subs = v.subsystems;
      if (!Array.isArray(subs) || subs.length < 4 || subs.length > 6) {
        bad('home/vehicle', `subsystems 4-6 elemanli dizi olmali (${Array.isArray(subs) ? subs.length : typeof subs})`);
      } else {
        const before = failures.length;
        const seen = new Set();
        for (const sub of subs) {
          const l = `vehicle/${sub?.anchor}`;
          if (!ANCHORS.includes(sub?.anchor)) bad(l, `anchor ${ANCHORS.join('|')} olmali`);
          else if (seen.has(sub.anchor)) bad(l, 'anchor tekrar ediyor');
          seen.add(sub?.anchor);
          if (!filled(sub?.title) || !filled(sub?.description)) bad(l, 'title ve description dolu string olmali');
          if (!teamSlugs.includes(sub?.team)) bad(l, `team "${sub?.team}" teams/ altinda yok (${teamSlugs.join(', ') || 'takim yok'})`);
        }
        if (failures.length === before) ok('home/vehicle', `${subs.length} alt sistem: ${subs.map((x) => x.anchor).join(', ')}`);
      }
    }
  }
}

// about.focusAreas[].team: kart /technical-team/<team>'e bagli; yanlis slug sessiz 404 olur.
{
  const p = join(DATA, 'about', 'data.json');
  const areas = existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')).focusAreas : null;
  if (!Array.isArray(areas)) bad('about/focusAreas', 'dizi degil');
  else {
    const wrong = areas.filter((a) => a.team !== undefined && !teamSlugs.includes(a.team));
    if (wrong.length) bad('about/focusAreas', `team teams/ altinda yok: ${wrong.map((a) => a.team).join(', ')}`);
    else ok('about/focusAreas', `${areas.filter((a) => a.team).length} kart takim sayfasina bagli`);
  }
}

console.log('\napplications/*.json — basvuru formlari ↔ backend');
{
  // applyDetail.tsx kisisel alanlar disindaki her alani `question_<id>` olarak
  // gonderir. Backend yalnizca allowedCustomFields'i kabul eder: eksik anahtar her
  // gonderimde 400 doner, ama build ve form ekranda normal gorunur.
  const PERSONAL = ['name', 'surname', 'university', 'email', 'phone', 'faculty', 'department', 'grade'];
  const read = (p) => (existsSync(p) ? readFileSync(p, 'utf8') : '');
  const allowed = read(join(ROOT, '..', 'backend', 'controllers', 'submissionsController.js'))
    .match(/allowedCustomFields\s*=\s*\[([^\]]*)\]/)?.[1].match(/question_[a-z0-9_]+/g);
  const labelSwitch = (f) => read(join(ROOT, 'src', 'components', 'pages', 'admin', f)).match(/const formatCustomFields[\s\S]*?\n {2}};/)?.[0];
  const labels = labelSwitch('technical-team.tsx');
  if (!allowed) bad('applications', 'backend allowedCustomFields okunamadi (olculemedi)');
  else if (!labels) bad('applications', 'technical-team.tsx formatCustomFields okunamadi (olculemedi)');
  else {
    if (labels !== labelSwitch('general-membership.tsx')) bad('applications', 'formatCustomFields: general-membership.tsx kopyasi technical-team.tsx ile ayni degil');
    const dir = join(DATA, 'applications');
    for (const f of readdirSync(dir).filter((x) => x.endsWith('.json') && x !== 'index.json')) {
      const d = JSON.parse(readFileSync(join(dir, f), 'utf8'));
      const extra = d.fields.filter((x) => !PERSONAL.includes(x.id));
      const before = failures.length;
      for (const x of extra) {
        const key = `question_${x.id}`;
        // createGeneralSubmission customFields okumuyor: 201 doner, alan sessizce atilir
        if (d.submissionType !== 'technical') bad(f, `"${x.id}" genel formda kaydedilmez (customFields kabul etmiyor)`);
        else if (!allowed.includes(key)) bad(f, `${key} backend allowedCustomFields'te yok — her gonderim 400 doner`);
        else if (x.type === 'number') bad(f, `${key} type number — backend yalniz string kabul eder, 400 doner`);
        else if (!labels.includes(`case '${key}'`)) bad(f, `${key} formatCustomFields'te yok — panelde ham anahtar gorunur`);
      }
      if (failures.length === before) ok(f, extra.length ? `${extra.length} alan: allowlist + admin etiketi tamam` : 'yalniz kisisel alanlar');
    }
  }
}

console.log('\npublic/data — eski kurum adlari');
{
  const FORBIDDEN = /KOU SENG|Kocaeli Üniversitesi|Yazılım Kulübü|kouseng|KOÜ|İstanbul Teknik Üniversitesi/i;
  const walkData = (d) => readdirSync(d).flatMap((e) => {
    const p = join(d, e);
    return statSync(p).isDirectory() ? walkData(p) : [p];
  });
  const before = failures.length;
  for (const p of walkData(DATA)) {
    // NFD yazilmis "Ü" de yakalansin
    const lines = readFileSync(p, 'utf8').normalize('NFC').split('\n');
    lines.forEach((line, i) => {
      const m = line.match(FORBIDDEN);
      if (m) bad('marka', `${p.slice(DATA.length + 1)}:${i + 1} "${m[0]}"`);
    });
  }
  if (failures.length === before) ok('marka', 'eski kurum adi yok');
}

console.log('\nsahipsiz gorseller (bilgi — hata degil)');
{
  const referenced = new Set();
  const collect = (p, key) => {
    if (!existsSync(p)) return;
    const d = JSON.parse(readFileSync(p, 'utf8'));
    for (const m of d[key] ?? []) if (m.image) referenced.add(m.image);
  };
  collect(join(DATA, 'about', 'data.json'), 'boardMembers');
  const tdir = join(DATA, 'teams');
  if (existsSync(tdir)) for (const f of readdirSync(tdir)) collect(join(tdir, f), 'members');

  const walk = (d) => existsSync(d) ? readdirSync(d).flatMap((e) => {
    const p = join(d, e);
    return statSync(p).isDirectory() ? walk(p) : [p];
  }) : [];
  const orphans = walk(join(PUBLIC, 'profile'))
    .map((p) => '/' + p.slice(PUBLIC.length + 1).split('/').join('/'))
    .filter((w) => !referenced.has(w));
  if (orphans.length === 0) console.log('  yok');
  else for (const o of orphans) console.log(`  --    ${o}`);
}

if (failures.length) {
  console.error(`\n${failures.length} hata:`);
  for (const f of failures) console.error(`  - ${f}`);
  process.exit(1);
}
console.log('\nHepsi gecti.');
