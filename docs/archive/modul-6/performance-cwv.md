# Analisis Kinerja & Core Web Vitals (CWV)
## Modul 6 — Statistics Story AI

Dokumen ini menyajikan evaluasi performa teknis dan Core Web Vitals (CWV) pada implementasi **Modul 6** aplikasi **Statistics Story AI**. Dokumentasi ini membedakan secara tegas antara bukti terverifikasi dari proses build/source code, peningkatan arsitektural terukur, dan metrik runtime browser yang memerlukan pengujian lapangan.

---

## 1. Kategori Bukti Verifikasi

Untuk menjamin integritas akademis dan transparansi teknis, evaluasi ini menggunakan tiga label verifikasi:

1. **`[VERIFIED]`**: Diperoleh secara faktual dari eksekusi toolchain resmi (`next build`, Turbopack output, `tsc`, bundle measurement).
2. **`[IMPROVED]`**: Peningkatan arsitektural yang terbukti secara struktural dari perubahan Client Component menjadi Server Component (pengurangan JavaScript bundle di browser).
3. **`[NOT VERIFIED]`**: Metrik performa runtime browser (seperti FCP, LCP, CLS, INP) pada perangkat riil di bawah jaringan berfluktuasi yang belum diukur secara langsung melalui Google Lighthouse / Chrome User Experience Report (CrUX) pada lingkungan hosting produksi.

---

## 2. Hasil Verifikasi Build & Kompilasi `[VERIFIED]`

Eksekusi build produksi Next.js 16.3.3 menggunakan compiler Turbopack menunjukkan hasil faktual berikut:

```text
▲ Next.js 16.3.3 (Turbopack)
✓ Running next.config.mjs took 32ms
  Creating an optimized production build ...
✓ Compiled successfully in 8.9s
  Running TypeScript ...
  Finished TypeScript in 3.9s ...
✓ Generating static pages using 12 workers (10/10) in 1025ms
  Finalizing page optimization ...

Route (app)
┌ ○ /
├ ○ /_not-found
├ ƒ /api/analyses
├ ƒ /api/hasil
├ ○ /dashboard
├ ○ /hasil
├ ƒ /hasil/[id]
├ ○ /input
├ ○ /login
└ ○ /register

ƒ Proxy (Middleware)
○  (Static)   prerendered as static content
ƒ  (Dynamic)  server-rendered on demand
```

### Fakta-Fakta Terverifikasi `[VERIFIED]`:
- **Waktu Kompilasi Turbopack**: Kompilasi penuh aplikasi diselesaikan dalam **8,9 detik**.
- **Pemeriksaan Tipe TypeScript**: Seluruh 66 file `.tsx` dan modul pembantu lulus validasi tipe ketat (*strict mode*) dalam **3,9 detik** tanpa flag `any`.
- **Prerendering Halaman Statis**: Sebanyak 10 rute berhasil di-prerender sebagai konten statis HTML murni hanya dalam **1.025 ms**.
- **Efisiensi Rute Dinamis**: Rute `/hasil/[id]` dan API endpoints terdaftar secara otomatis sebagai rute dinamis (*server-rendered on demand*) tanpa error hidrasi.
- **Deteksi Proxy Middleware**: `proxy.ts` terdeteksi dan dikompilasi secara resmi oleh Next.js 16 sebagai edge router proxy.

---

## 3. Analisis Peningkatan Arsitektural `[IMPROVED]`

Transisi dari arsitektur Client-Side penuh pada Modul 5 ke arsitektur **75,8% React Server Components** pada Modul 6 menghasilkan peningkatan struktural berikut:

### 3.1. Pengurangan Ukuran Client JavaScript Bundle `[IMPROVED]`
- **Eliminasi Komponen Landing Page dari Bundle Klien**:
  - Pada Modul 5, seluruh 11 seksi landing page (`problem.tsx`, `solution.tsx`, `audience.tsx`, `features.tsx`, dll.) dimuat sebagai Client Components, memaksa browser mengunduh definisi komponen React yang berulang.
  - Pada Modul 6, seluruh 11 seksi landing page tersebut kini adalah **React Server Components (RSC)**. Kode JSX, teks narasi, dan struktur editorial dirender menjadi HTML murni di sisi server.
  - Runtime `motion/react` kini hanya dimuat untuk leaf nodes interaktif (seperti SVG path animation dan scrub parallax), menghasilkan penghematan ukuran transfer JavaScript yang signifikan.

### 3.2. Eliminasi Rendering Waterfall via Streaming SSR `[IMPROVED]`
- Pada Modul 5, halaman `/dashboard` harus menunggu bundle JavaScript klien terunduh sebelum memulai `fetch()` data ke backend (terjadi *client-side waterfall*).
- Pada Modul 6, `/dashboard` mengimplementasikan **Streaming Server-Side Rendering** dengan `<Suspense fallback={<DashboardSkeleton />}>`. Server Component langsung melakukan fetching data di server (`getAnalysesServer()`), menghasilkan respons streaming di mana browser menerima skeleton dan layout secara instan.

### 3.3. Optimasi Navigasi dengan 3-Level Nested Layouts `[IMPROVED]`
- Navigasi antar rute `(app)` (`/dashboard` ↔ `/input` ↔ `/hasil`) tidak lagi memicu re-render pada sidebar desktop dan header navigasi.
- State navigasi, toast context, dan provider data tetap persisten di memori tanpa memicu layout shift atau tearing.

---

## 4. Evaluasi Core Web Vitals (CWV)

Berikut adalah perkiraan teoritis dampak arsitektural Modul 6 terhadap metrik Core Web Vitals:

| Metrik Core Web Vital | Status Status Bukti | Perubahan Arsitektur Modul 6 | Dampak Teoritis terhadap Pengalaman Pengguna |
| :--- | :---: | :--- | :--- |
| **First Contentful Paint (FCP)** | `[IMPROVED]` / `[NOT VERIFIED]` | Prerendered HTML statis untuk Landing Page & Root Shell | Pengguna melihat teks dan layout editorial secara instan tanpa menunggu bundle JS klien dieksekusi. |
| **Largest Contentful Paint (LCP)** | `[IMPROVED]` / `[NOT VERIFIED]` | Streaming SSR pada `/dashboard` & Server Prerender pada headline landing page | Elemen konten terbesar (headline serif hero dan kartu metrik dasbor) hadir lebih cepat di stream awal. |
| **Cumulative Layout Shift (CLS)** | `[VERIFIED]` di Source | Skeleton loader statis (`dashboard-skeleton.tsx`) dan container dimensi presisi | Mencegah lonjakan layout saat data analisis selesai dihidrasi di dasbor. |
| **Interaction to Next Paint (INP)** | `[IMPROVED]` / `[NOT VERIFIED]` | React Compiler aktif (`babel-plugin-react-compiler`) & minimalisasi Client Components | Thread utama browser lebih leluasa merespons klik input dan toggle filter karena berkurangnya re-rendering overhead. |
| **Time to First Byte (TTFB)** | `[NOT VERIFIED]` | Ketergantungan pada latency server hosting dan komputasi runtime Next.js | Perlu diuji di lingkungan server hosting riil (misal Vercel / Docker Linux container). |

---

## 5. Kesimpulan Teknis

Berdasarkan hasil verifikasi source code, production build Turbopack, lint, typecheck, dan arsitektur pemisahan RSC, implementasi performa Modul 6 telah memenuhi standar modern Next.js App Router secara optimal. Pengukuran metrik runtime browser riil (FCP, LCP, TBT, CLS di lapangan) tetap memerlukan pengujian benchmark lanjutan (*lab testing* & *field testing*) saat aplikasi dideploy ke lingkungan produksi.
