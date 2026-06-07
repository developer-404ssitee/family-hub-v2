# 🏠 Family Hub

> Zamonaviy oilaviy ijtimoiy tarmoq — Real-time chat, online holat, push notifications.

---

## 📁 Papkalar Strukturasi

```
family-hub/
├── public/
│   ├── firebase-messaging-sw.js   ← Firebase Service Worker
│   ├── manifest.json              ← PWA manifest
│   ├── icon-192.png               ← App icon (qo'shing)
│   └── icon-512.png               ← App icon (qo'shing)
├── src/
│   ├── components/
│   │   ├── layout/
│   │   │   ├── AppLayout.tsx      ← Sidebar + mobile nav
│   │   │   └── Loader.tsx
│   │   └── shared/
│   │       └── Avatar.tsx
│   ├── hooks/
│   │   ├── useAuth.ts             ← Auth hook
│   │   └── usePresence.ts         ← Online/offline tracker
│   ├── lib/
│   │   ├── supabase.ts            ← Supabase client
│   │   └── firebase.ts            ← Firebase + FCM
│   ├── pages/
│   │   ├── LoginPage.tsx
│   │   ├── RegisterPage.tsx
│   │   ├── ChatPage.tsx           ← Real-time chat
│   │   ├── FamilyPage.tsx         ← Oila a'zolari
│   │   └── ProfilePage.tsx        ← Profil tahrirlash
│   ├── types/index.ts
│   ├── App.tsx
│   ├── main.tsx
│   └── index.css
├── SUPABASE_SCHEMA.sql            ← SQL jadvallar
├── .env.example                   ← Env namuna
└── README.md
```

---

## ⚡ Ishga Tushirish

### 1. O'rnatish

```bash
npm install
```

### 2. .env fayl

```bash
cp .env.example .env
```

`.env` faylini to'ldiring (quyidagi bo'limlardan oling).

---

## 🗄️ Supabase Sozlash

### 1. Loyiha yaratish
- [supabase.com](https://supabase.com) → New project

### 2. SQL sxema
- Dashboard → SQL Editor → New Query
- `SUPABASE_SCHEMA.sql` mazmunini joylashtiring → Run

### 3. Storage (Avatar)
- Dashboard → Storage → New bucket
- Nom: `avatars`, Public: ✅

### 4. Realtime
- Dashboard → Database → Replication
- `messages` va `profiles` jadvallarini yoqing

### 5. .env ga qo'shing
```env
VITE_SUPABASE_URL=https://xxxx.supabase.co
VITE_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
```

---

## 🔔 Firebase (Push Notifications)

### 1. Loyiha yaratish
- [console.firebase.google.com](https://console.firebase.google.com)
- New project → Add web app

### 2. Cloud Messaging
- Project Settings → Cloud Messaging
- Web Push certificates → Generate key pair → VAPID key nusxalang

### 3. Service Worker
`public/firebase-messaging-sw.js` faylida Firebase config ni o'zgartiring:
```js
firebase.initializeApp({
  apiKey: "...",
  // ... o'z configingizni kiriting
});
```

### 4. .env ga qo'shing
```env
VITE_FIREBASE_API_KEY=...
VITE_FIREBASE_AUTH_DOMAIN=...
VITE_FIREBASE_PROJECT_ID=...
VITE_FIREBASE_STORAGE_BUCKET=...
VITE_FIREBASE_MESSAGING_SENDER_ID=...
VITE_FIREBASE_APP_ID=...
VITE_FIREBASE_VAPID_KEY=...
```

---

## 🚀 Ishga tushirish

```bash
# Development
npm run dev

# Build
npm run build

# Preview build
npm run preview
```

---

## 🌐 Deploy (Vercel)

```bash
npm install -g vercel
vercel --prod
```

Vercel dashboard → Environment Variables ga .env ni qo'shing.

---

## ✨ Imkoniyatlar

| Xususiyat | Holat |
|-----------|-------|
| Register / Login | ✅ |
| Sessiya saqlanishi | ✅ |
| Profil rasmi (Supabase Storage) | ✅ |
| Oila a'zolari ro'yxati | ✅ |
| Online/Offline holat | ✅ |
| Real-time chat | ✅ |
| Emoji qo'llab-quvvatlash | ✅ |
| Push Notifications (FCM) | ✅ |
| Profil tahrirlash | ✅ |
| Row Level Security | ✅ |
| Responsive dizayn | ✅ |
| Dark mode glassmorphism | ✅ |

---

## 📱 PWA

App telefonga o'rnatilishi uchun `public/` papkasiga qo'shing:
- `icon-192.png` (192×192)
- `icon-512.png` (512×512)

---

## 🔒 Xavfsizlik

- Supabase RLS — faqat login qilganlar ko'ra oladi
- FCM tokens encrypted
- Avatar upload — faqat o'z papkasiga

---

**Muallif:** Family Hub | Built with React + Supabase + Firebase
