# Modul 6: Arsitektur Next.js App Router & React Server Components
## Statistics Story AI

Dokumen ini menyajikan arsitektur dan implementasi teknis **Modul 6** pada aplikasi web **Statistics Story AI**. Implementasi ini mentransformasikan aplikasi dari basis Client-Side Rendering (Modul 5) menjadi arsitektur modern **Next.js App Router** dengan pemanfaatan **React Server Components (RSC)** hingga mencapai **75,36%** dari seluruh komponen antarmuka proyek (dan **71,43%** pada folder `components/`).

---

## 1. Spesifikasi Teknologi

- **Framework**: Next.js 16.3.3 (App Router)
- **Library Inti**: React 19.2.4 (React Compiler aktif)
- **Bahasa**: TypeScript 5 (Strict mode, zero `any`)
- **Skema Validasi**: Zod (`zod@^3.24.2`) terintegrasi pada boundary input form dan API response
- **Bundler & Compiler**: Turbopack & React Compiler
- **Styling**: Tailwind CSS & CSS Variables kustom
- **State & Storage**: React Context + Cookie Session Synchronization (`statistics_session`)
- **Animasi & Interaktivitas**: Motion (`motion/react`) terisolasi pada client leaf components

---

## 2. Ringkasan Arsitektur Modul 6

### 2.1. Komposisi React Server Components (RSC) vs Client Components
Arsitektur komponen mengikuti prinsip pemisahan tanggung jawab (*separation of concerns*):
- **Full UI TSX (app/ + components/ + lib/)**: 52 Server Components dari 69 file (**75,36%** RSC).
- **Folder `components/` Saja**: 35 Server Components dari 49 file (**71,43%** RSC).
- **Client Components ('use client')**: 17 file (**24,64%**) pada total UI (14 pada folder `components/`).
  - Dibatasi secara ketat hanya pada *interactive leaf components* dan Context Provider yang membutuhkan browser API (DOM events, clipboard, drag-and-drop, interactive tabs, form input state, framer-motion runtime).

### 2.2. Nested Layouts (3 Tingkat)
Aplikasi mengimplementasikan struktur hierarki layout bertingkat:
1. **Root Layout (`app/layout.tsx`)** [Level 1]:
   - Mengatur elemen global HTML `<html>`, `<body>`, font Inter/Newsreader, dan metadata global.
2. **Authenticated App Shell Layout (`app/(app)/layout.tsx`)** [Level 2]:
   - Membungkus seluruh rute aplikasi (`/dashboard`, `/input`, `/hasil`) dengan `ToastProvider`, `AnalysisProvider`, dan sidebar/header navigasi `AppShell`.
3. **Dashboard Dedicated Layout (`app/(app)/dashboard/layout.tsx`)** [Level 3]:
   - Mengatur layout khusus area dasbor dengan header kontekstual dan container terstruktur.

### 2.3. Streaming SSR & Suspense
- Halaman `/dashboard` memanfaatkan pola **Streaming Server-Side Rendering**.
- Server Component (`app/(app)/dashboard/page.tsx`) membungkus pemanggilan data server `DashboardStreamedContent` di dalam `<Suspense fallback={<DashboardSkeleton />}>`.
- Pengguna langsung menerima UI shell dan skeleton secara instan, disusul oleh data terhidrasi tanpa blocking rendering thread.

### 2.4. Route Protection via Next.js 16 `proxy.ts`
- Sesuai panduan resmi Next.js 16 yang mendepresiasi `middleware.ts` untuk routing proxy, project menggunakan **`proxy.ts`** pada root directory.
- Sesi autentikasi disinkronkan ke cookie HTTP-only `statistics_session=1` pada saat login dan dihapus saat logout.
- Rute terproteksi (`/dashboard`, `/input`, `/hasil/*`) secara otomatis dialihkan ke `/login` jika cookie sesi tidak valid.
- Pengguna yang sudah login yang mengunjungi `/login` atau `/register` secara otomatis dialihkan ke `/dashboard`.

### 2.5. Metadata API (Statis & Dinamis)
- **Metadata Global**: Didefinisikan pada `app/layout.tsx`.
- **Metadata Statis**: Didefinisikan pada `/`, `/login`, `/register`, `/dashboard`, `/input`, `/hasil`.
- **Metadata Dinamis (`generateMetadata`)**: Didefinisikan pada rute dinamis `app/(app)/hasil/[id]/page.tsx` untuk menghasilkan judul dan deskripsi spesifik sesuai data analisis (`getAnalysisByIdServer(id)`).

### 2.6. Zod Schema Validation & Boundary Integrity
- Modul validasi `lib/validation.ts` memanfaatkan **Zod** untuk validasi skema runtime:
  - `analysisInputSchema.safeParse()`: Memvalidasi data masukan analisis (nama, metode input, integritas file CSV/Excel atau teks manual).
  - `quickAnalysisSchema.safeParse()`: Memvalidasi modal dialog penambahan analisis baru.
  - `analysesResponseSchema.safeParse()`: Memvalidasi integritas response data pada endpoint `/api/analyses`.
  - Type inference penuh menggunakan `z.infer<typeof schema>`.

---

## 3. Struktur Direktori Modul 6

```text
statistics-story-final-legit/
├── app/
│   ├── (app)/
│   │   ├── dashboard/
│   │   │   ├── layout.tsx         # [RSC] Nested Layout Level 3
│   │   │   ├── loading.tsx        # [RSC] Dashboard Suspense Loading
│   │   │   └── page.tsx           # [RSC] Streaming SSR Dashboard Page
│   │   ├── hasil/
│   │   │   ├── [id]/
│   │   │   │   ├── loading.tsx    # [RSC] Dynamic Result Loading
│   │   │   │   ├── not-found.tsx  # [RSC] Dynamic Result 404
│   │   │   │   └── page.tsx       # [RSC] Dynamic Metadata + Async Fetch
│   │   │   ├── loading.tsx        # [RSC] Result List Loading
│   │   │   └── page.tsx           # [RSC] Static Result Overview
│   │   ├── input/
│   │   │   ├── loading.tsx        # [RSC] Input Form Loading
│   │   │   └── page.tsx           # [RSC] Analysis Input Page
│   │   ├── error.tsx              # [CLIENT] Route Error Boundary
│   │   ├── layout.tsx             # [RSC] Nested Layout Level 2
│   │   └── loading.tsx            # [RSC] App Route Loading Fallback
│   ├── login/
│   │   └── page.tsx               # [RSC] Login Page with Metadata
│   ├── register/
│   │   └── page.tsx               # [RSC] Register Page with Metadata
│   ├── layout.tsx                 # [RSC] Root Layout Level 1
│   ├── not-found.tsx              # [RSC] Global 404 Page
│   └── page.tsx                   # [RSC] Editorial Landing Page
├── components/
│   ├── analysis-input/            # Subkomponen input (RSC + 1 Client Form Leaf)
│   ├── analysis-result/           # Subkomponen hasil (RSC + 1 Client Leaf Button)
│   ├── app/                       # Shell, dialog, badge (RSC + Client Leaf)
│   ├── auth/                      # Form autentikasi interaktif & Layout RSC
│   ├── dashboard/                 # Filter, list, summary, skeleton (RSC + Client Leaf)
│   ├── scenes/                    # 11 Editorial Landing Sections (100% RSC)
│   ├── ui/                        # Reusable primitives (Buttons, Cards, Inputs, dsb.)
│   └── primitives.tsx             # [CLIENT] Isolated motion leaf primitives
├── lib/
│   ├── auth.tsx                   # Auth provider + server session sync
│   ├── analysis-store.tsx         # In-memory store + SSR hydration support
│   ├── server-api.ts              # Server-side data fetching API
│   ├── validation.ts              # Zod validation schema & boundary logic
│   └── types.ts                   # Unified TypeScript definitions
├── proxy.ts                       # Next.js 16 Route Protection Proxy
└── docs/
    └── modul-6/                   # Dokumentasi lengkap Modul 6
```

---

## 4. Indeks Dokumentasi Modul 6

1. [`rsc-audit.md`](./rsc-audit.md) — Audit komprehensif seluruh 69 file `.tsx` (75,36% RSC total, 71,43% components folder).
2. [`srs-nextjs-structure.md`](./srs-nextjs-structure.md) — Matriks pemetaan FR01–FR16 ke struktur Next.js App Router.
3. [`performance-cwv.md`](./performance-cwv.md) — Analisis performa & Core Web Vitals (CWV) berbasis bukti faktual.
4. [`middleware-auth.md`](./middleware-auth.md) — Arsitektur route protection Next.js 16 (`proxy.ts`) & manajemen cookie HTTP-only.
5. [`verification-report.md`](./verification-report.md) — Laporan verifikasi 22 aspek teknis kepatuhan Modul 6.

---

## 5. Instruksi Verifikasi

Jalankan perintah berikut pada terminal proyek:

```bash
# 1. Typecheck TypeScript
npm run typecheck

# 2. Linter ESLint
npm run lint

# 3. Production Build Turbopack
npm run build
```
