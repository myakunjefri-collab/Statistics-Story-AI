# Statistics Story AI — Final Front-End Project

Sistem pembelajaran berbasis AI untuk mentransformasi hasil statistik mentah menjadi narasi kontekstual, visualisasi otomatis, dan contoh kasus analogi dunia nyata.

Dikembangkan sebagai Proyek Akhir Praktik Pemrograman Front-End — Program Studi D3 Teknik Informatika Sekolah Vokasi Universitas Sebelas Maret.

---

## 1. Fitur Utama

- **Otentikasi & Keamanan Pengguna (FR01, NFR01):** Registrasi dan login berbasis email & password dengan hashing `bcrypt` dan session berbasis cookie `HttpOnly` HMAC-SHA256.
- **Multiformat Data Ingestion (FR02–FR05):** Dukungan upload berkas CSV, berkas Excel `.xlsx`/`.xls`, dan input data manual tabular dengan validasi generic (Layer A) dan domain-spesifik (Layer B).
- **Mesin Statistik Deterministik Murni (FR06–FR10):**
  - **Statistik Deskriptif:** Mean, median, modus, standar deviasi sampel & populasi, rentang min/max, kuartil IQR.
  - **Uji t Dua Kelompok:** Welch's t-test (unequal variance default) & Student's t-test dengan perhitungan p-value via regularized incomplete beta function.
  - **Korelasi Pearson:** Koefisien $r$, signifikansi p-value, klasifikasi arah dan kekuatan hubungan.
  - **Regresi Sederhana:** Ordinary Least Squares (OLS) slope, intercept, koefisien determinasi $R^2$, standar error estimasi.
- **AI Narrative & Analogi Kasus (FR11, FR12, FR14):** Integrasi pluggable penyedia model bahasa eksternal (Google Gemini / OpenAI) dan Fallback Provider berbasis aturan deterministik yang tahan banting (NFR05).
- **Visualisasi Otomatis Bebas Layout Shift (FR13):** Histogram, perbandingan bar chart, scatter plot, dan regression trendline berbasis SVG responsif.
- **Hasil Terpadu & Riwayat Terisolasi (FR15, FR16):** Halaman hasil satu tampilan 4-pilar dan riwayat analisis yang terisolasi ketat per akun mahasiswa/dosen.

---

## 2. Arsitektur & Teknologi

- **Framework:** Next.js 16.3.5 (App Router, React Server Components $\ge 70\%$ [74.63% aktual], Route Handlers BFF, `proxy.ts` early guard).
- **UI Library & Styling:** React 19, Tailwind CSS v4, Radix UI Primitives, Class Variance Authority (CVA).
- **State Management:** Zustand (Client UI State) & TanStack Query v5 (Server Data Cache/Mutation).
- **Persistence:** PostgreSQL dengan pool transaksi atomik pasca-pemrosesan AI (`pg`).
- **Tooling & Quality:** Biome (linting/formatting), Vitest (automated test suite), v8 (test coverage $\ge 80\%$), SonarQube (Quality Gate configured in CI).

---

## 3. Instalasi & Menjalankan Lokal

### 3.1 Prasyarat
- Node.js 20+
- pnpm 9+
- PostgreSQL (opsional untuk lokal; otomatis menggunakan memory fallback adapter saat pengembangan/test jika `DATABASE_URL` belum diset)

### 3.2 Langkah Menjalankan

```bash
# 1. Pasang dependensi
pnpm install

# 2. Setup environment variables (salin .env.example)
cp .env.example .env.local

# 3. Jalankan migrasi database (jika menggunakan PostgreSQL)
pnpm run db:migrate

# 4. Jalankan server pengembangan Next.js
pnpm run dev
```

Aplikasi dapat diakses di: `http://localhost:3000`.

---

## 4. Variabel Lingkungan (.env)

```env
# Server Secrets (Server-Only, JANGAN gunakan prefix NEXT_PUBLIC_)
DATABASE_URL="postgresql://user:password@localhost:5432/statistics_story_db"
SESSION_SECRET="your-super-secure-32-character-secret-key-here"
AI_PROVIDER="fallback" # opsi: "fallback", "gemini", "openai"
AI_API_KEY="your-gemini-or-openai-api-key"

# Client Public
NEXT_PUBLIC_APP_URL="http://localhost:3000"
```

---

## 5. Pengujian & Verifikasi Kualitas
 
```bash
# Menjalankan seluruh test suite otomatis (24 file, 106 tes: TC01-TC12)
pnpm run test

# Menjalankan test coverage (Target >= 80%, Aktual: 86.32% stmts, 71.37% branch)
pnpm run test:coverage

# Menjalankan audit React Server Components (RSC: 74.63% Server)
pnpm run audit:rsc

# Menjalankan benchmark komputasi statistik murni (NFR02 < 5s)
pnpm run benchmark:statistics

# Menjalankan pengujian cross-browser otomatis (NFR07 Chrome, Edge, Firefox)
pnpm run test:e2e

# Menjalankan Biome linter
pnpm run lint

# Menjalankan TypeScript typecheck
pnpm run typecheck

# Menjalankan build produksi Next.js
pnpm run build

# Menjalankan verifikasi lokal terpadu (lint -> typecheck -> test -> coverage -> audit:rsc -> benchmark -> build)
pnpm run verify:final
```

---

## 6. Deployment & Status Produksi

- **Status Repository:** **PRE-DEPLOYMENT COMPLETE**
- **Verifikasi Lokal:** Seluruh pemeriksaan teknis otomatis lokal (linting, typecheck, unit/integration test, coverage, RSC audit, benchmark statistik, dan build) telah selesai diverifikasi (100% lulus).
- **Platform Target:** Vercel (Runtime: Node.js)
- **Status Deployment Produksi:** `PENDING DEPLOYMENT` (deployment produksi dan verifikasi live environment belum dikerjakan pada tahap ini, siap masuk tahap deployment berikutnya).
- **Status SonarQube:** `CONFIGURED` pada `.github/workflows/ci.yml` dan `sonar-project.properties`; scan dan Quality Gate live menunggu kredensial/token remote.

---

## 7. Dokumentasi Lengkap

- [Matriks Penelusuran Test Case Final (TC01–TC12)](docs/final-test-matrix.md)
- [Matriks Kriteria Penerimaan Kontrak (Contract Acceptance)](docs/contract-acceptance.md)
- [Laporan Audit Baseline & Hardening](docs/final-audit.md)
- [Arsitektur Sistem Final](docs/final-architecture.md)
- [Keputusan Teknis Implementasi](docs/technical-decisions.md)
- [Matriks Penelusuran Test Case (TC01–TC12)](docs/traceability-tc.md)
- [Matriks Functional Requirements (FR01–FR16)](docs/fr-mapping.md)
- [Matriks Non-Functional Requirements (NFR01–NFR08)](docs/nfr-mapping.md)
- [Arsitektur Keamanan & CSP](docs/security.md)
- [Dokumentasi Pengujian & Cakupan](docs/testing.md)
- [Dokumentasi Performa & Core Web Vitals](docs/performance.md)
- [Panduan Deployment](docs/deployment.md)
- [Arsitektur AI & Fallback](docs/ai-architecture.md)
- [Arsitektur Data & PDM Database](docs/data-architecture.md)
- [Panduan Pengguna (User Guide)](docs/user-guide.md)
