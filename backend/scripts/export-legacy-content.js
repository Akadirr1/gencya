// Eski Gençya sitesinin veritabanında kalan içeriği dosyaya çıkarır: yönetim kurulu
// (boardmembers), takımlar (teams) ve onların fotoğrafları (images). Eski site bunları
// admin panelinden yönetiyordu; yeni sitede içerik public/data JSON'larında, fotoğraflar
// public/profile altında. Betik veritabanına YAZMAZ, yalnızca okur.
//
// Kullanım (backend/ dizininden):
//   node scripts/export-legacy-content.js            # backups/legacy-content-<tarih>/
//   node scripts/export-legacy-content.js --out <klasör>
//
// Çıktı: boardmembers.json, teams.json ve images/<id>.<uzantı>. Fotoğraflar gerçek kişilere
// ait; klasör backups/ altında (.gitignore'da), repoya girmez.

import mongoose from "mongoose";
import dotenv from "dotenv";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BACKEND_ROOT = path.join(__dirname, "..");
dotenv.config({ path: path.join(BACKEND_ROOT, ".env") });

const args = process.argv.slice(2);
const i = args.indexOf("--out");
const stamp = new Date().toISOString().slice(0, 10);
const outDir = path.resolve(i !== -1 && args[i + 1] ? args[i + 1] : path.join(BACKEND_ROOT, "backups", `legacy-content-${stamp}`));
const EXT = { "image/jpeg": "jpg", "image/png": "png", "image/webp": "webp", "image/gif": "gif" };

const uri = process.env.MONGODB_URI;
if (!uri) {
  console.error("MONGODB_URI tanımlı değil (backend/.env).");
  process.exit(2);
}

await mongoose.connect(uri);
const db = mongoose.connection.db;
try {
  fs.mkdirSync(path.join(outDir, "images"), { recursive: true });
  for (const name of ["boardmembers", "teams"]) {
    const docs = await db.collection(name).find().toArray();
    fs.writeFileSync(path.join(outDir, `${name}.json`), JSON.stringify(docs, null, 2));
    console.log(`${name}: ${docs.length} kayıt`);
  }
  let n = 0;
  for await (const img of db.collection("images").find()) {
    // Binary (sürücünün döndürdüğü) → Buffer; .buffer yoksa zaten Buffer'dır.
    const buf = Buffer.from(img.data?.buffer ?? img.data);
    fs.writeFileSync(path.join(outDir, "images", `${img._id}.${EXT[img.contentType] || "bin"}`), buf);
    n++;
  }
  console.log(`images: ${n} dosya`);
  console.log(`Çıktı: ${outDir}`);
} finally {
  await mongoose.disconnect();
}
