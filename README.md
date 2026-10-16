# Gençya Teknoloji Web Sitesi

Gençya Teknoloji Takımı'nın web sitesi. Takım insansız deniz aracı (İDA) geliştiriyor; site takımı, aracı ve teknik ekipleri tanıtıyor, üyelik ve takım başvurularını topluyor.

## Özellikler

- **İDA bölümü**: Aracın alt sistemleri ve trimaran gövdenin yan/üst görünüş çizimi
- **Teknik takım sayfaları**: Otonom Navigasyon, Görüntü İşleme & Yapay Zeka, Elektronik & Mekanik
- **Başvuru sistemi**: Genel üyelik ve teknik takım formları; başvuru dönemleri panelden açılıp kapanır
- **Duyurular**: Panelden yazılan duyuruların listesi ve araması
- **İletişim formu** ve harita
- **Admin paneli**: Başvurular, duyurular, mesajlar, kullanıcılar, başvuru dönemleri, veri silme, sponsorluk maili
- **Yayınlar (isteğe bağlı)**: Medium RSS; `NEXT_PUBLIC_ENABLE_RSS=1` ile açılır
- **Koyu/Açık tema**

## Proje yapısı

Kökte `package.json` yok; iki ayrı paket var:

- `backend/`: Node.js, Express, MongoDB (Mongoose), JWT. Ayrıntılar: [`backend/README.md`](backend/README.md), [`backend/ENDPOINTS.md`](backend/ENDPOINTS.md)
- `frontend/`: Next.js 16, React, TypeScript, Tailwind CSS v4, shadcn/ui, FontAwesome. Ayrıntılar: [`frontend/README.md`](frontend/README.md)

Site içeriği (ana sayfa, hakkımızda, takımlar, formlar, KVKK) `frontend/public/data/` altındaki JSON dosyalarında.

## Gereksinimler

- Node.js 22.11 veya üstü
- MongoDB
- npm

## Kurulum

```bash
cd backend
cp .env.example .env   # değerleri doldur
npm ci
npm run dev            # http://localhost:3001

cd ../frontend
cp .env.example .env.local
npm ci
npm run dev            # http://localhost:3000
```

Push'tan önce:

```bash
cd frontend && npm run check:content && npm run lint && npm run build
cd ../backend && node --test
```

## Sayfalar

- `/` Ana sayfa
- `/about` Hakkımızda
- `/technical-team/navigation`, `/technical-team/vision`, `/technical-team/electronics` Teknik takımlar
- `/announcements` Duyurular
- `/apply` Başvuru, `/apply/<form>` başvuru formu
- `/contact` İletişim
- `/kvkk` KVKK aydınlatma metni
- `/admin/login` Yönetim paneli

## İletişim

- **E-posta**: gencyateknolojitakimi@gmail.com
- **Web**: [gencya.org.tr](https://gencya.org.tr)
