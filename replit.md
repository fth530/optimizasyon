# Noctoon - Manga/Webtoon Okuyucu Platformu

## Proje Özeti
Noctoon, manga ve webtoon okumak için tasarlanmış modern bir web platformudur. React, TypeScript, Express.js ve Tailwind CSS kullanılarak geliştirilmiştir.

## Teknoloji Yığını
- **Frontend**: React 18, TypeScript, Tailwind CSS, Shadcn UI, Framer Motion
- **Backend**: Express.js, TypeScript
- **State Management**: TanStack Query
- **Routing**: Wouter
- **Styling**: Tailwind CSS + Shadcn UI components

## Proje Yapısı
```
├── client/                 # Frontend uygulaması
│   ├── src/
│   │   ├── components/     # React bileşenleri
│   │   ├── pages/          # Sayfa bileşenleri
│   │   ├── lib/            # Yardımcı fonksiyonlar
│   │   └── hooks/          # Custom hooks
│   └── index.html
├── server/                 # Backend API
│   ├── index.ts           # Ana giriş noktası
│   ├── routes.ts          # API rotaları
│   └── storage.ts         # Veri depolama
├── shared/                 # Paylaşılan tipler
│   └── schema.ts          # Veri modelleri
└── vercel.json            # Vercel deployment config
```

## Özellikler
- Ana Sayfa: Hero carousel, trend mangalar, son eklenenler
- Seri Detay: Manga bilgileri, bölüm listesi
- Okuyucu: Sayfa navigasyonu, zoom, tam ekran
- Profil: Favoriler, okuma geçmişi
- Kütüphane: Tüm mangaları görüntüleme ve filtreleme
- Admin Panel: Manga ekleme/düzenleme/silme
- Karanlık/Aydınlık tema desteği
- Mobil uyumlu tasarım

## Çalıştırma
```bash
npm install
npm run dev
```

## Vercel Deployment
1. GitHub'a push yapın
2. Vercel'de import edin
3. Otomatik olarak deploy edilir

## Demo Hesap
- Kullanıcı adı: `admin`
- Şifre: `admin123`

## Son Güncellemeler
- Tüm frontend bileşenleri oluşturuldu
- Backend API endpoints implement edildi
- Vercel deployment konfigürasyonu eklendi
- Demo veriler ile başlatılıyor
