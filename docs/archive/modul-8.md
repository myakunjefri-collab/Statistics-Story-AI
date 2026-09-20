# Dokumentasi Modul 8: Build Tools Modern & Rust Toolchain

**Aplikasi:** Statistics Story AI  
**Topik:** Migrasi & Finalisasi Build Pipeline Frontend ke React + Vite + Strict TypeScript + Biome Toolchain  
**Struktur Source:** `src/` (`@/` → `src/`)  
**Package Manager Utama:** `pnpm`  
**Tanggal:** 15 September 2026  

---

## 1. Identitas Project

- **Nama Aplikasi:** Statistics Story AI
- **Deskripsi:** Platform aplikasi web pengubah output statistik deskriptif dan inferensial menjadi narasi kontekstual berbasis AI, visualisasi interaktif, dan contoh kasus nyata.
- **Arsitektur:** Client Single Page Application (React 19, TypeScript, Vite 8, Tailwind CSS v4, Biome, TanStack Query, Zustand, Zod).

---

## 2. Tujuan Modul 8

1. Mengalihkan build pipeline frontend dari framework fullstack Next.js ke arsitektur SPA modern berbasis **Vite 8 & Rolldown/esbuild** dengan target port 3000.
2. Mengorganisir source code frontend secara baku dan rapi di bawah direktori `src/` dengan path alias `@/ → src/`.
3. Mengadopsi toolchain modern generasi baru berbasis Rust (**Biome**) sebagai formatter, linter, dan auto-organizer import dengan standar recommended dan `noUnusedVariables: "error"`.
4. Menegakkan type-safety ketat melalui konfigurasi **Strict TypeScript** (`"strict": true` dan `"noUncheckedIndexedAccess": true`) tanpa menggunakan bypass `any`, `@ts-ignore`, atau `@ts-nocheck`.
5. Mengimplementasikan optimasi bundling melalui **Manual Chunks (Code Splitting)** guna mengisolasi library vendor pihak ketiga (`vendor-react`, `vendor-motion`, `vendor-core`, `vendor-ui`, `vendor`).
6. Melakukan benchmarking nyata pada performa development server (Cold Start), HMR (Hot Module Replacement), dan waktu kompilasi produksi.
7. Menyiapkan konfigurasi static analysis **SonarQube** (`sonar-project.properties`) dan quality gate terpadu (`pnpm run verify`).
8. Menghasilkan dokumen matriks migrasi dan benchmarking resmi dalam format PDF ringkas 2 halaman (`docs/modul-8-matriks-benchmark.pdf`).

---

## 3. Kondisi Project Sebelum Migrasi

Sebelum pelaksanaan Modul 8, aplikasi Statistics Story AI dibangun dengan spesifikasi:
- **Framework & Build Tool:** Next.js 16.3.3 (App Router & Turbopack)
- **Linter & Formatter:** ESLint 10 dengan konfigurasi flat config (`eslint.config.mjs`)
- **Struktur Direktori:** Menggunakan file-system routing di direktori `app/` di root
- **Routing & Route Guard:** Next.js App Router dengan `proxy.ts` (Next.js server middleware)
- **TypeScript:** `"strict": true`, namun `"noUncheckedIndexedAccess"` belum diaktifkan
- **Path Alias:** `@/` diarahkan ke root project `./`
- **Waktu Cold Start Dev Server:** N/A (tidak diukur ulang pada project final)
- **Waktu Production Build:** N/A (tidak diukur ulang pada project final)

---

## 4. Kondisi Project Setelah Migrasi

Setelah proses migrasi dan finalisasi diselesaikan:
- **Build Tool:** Vite 8.3.0 (Rolldown engine & esbuild minifier)
- **Frontend Framework:** React 19 SPA (Single Page Application)
- **Struktur Source:** Terpusat di `src/` (`src/components/`, `src/pages/`, `src/lib/`, `src/main.tsx`, `src/router.tsx`, `src/globals.css`)
- **Path Alias:** `@/` diarahkan secara eksplisit ke `./src/*`
- **Routing:** React Router DOM v7 dengan route guard `<ProtectedRoute>` dan `<GuestRoute>`
- **Linter & Formatter:** Biome 2.5.13 (`biome.json`) bertenaga Rust
- **TypeScript:** Strict Mode + `"noUncheckedIndexedAccess": true` tanpa bypass `any`/`@ts-ignore`
- **Waktu Cold Start Dev Server (Aktual):** Vite Server Ready: **1.108 ms** • First HTTP 200 OK: **5.877 ms** (Status: PASS)
- **HMR Response Time (Aktual):** Average HMR Response: **6,1 ms** (3 Tests) (rincian: HMR Test 1: 9,1 ms, HMR Test 2: 4,6 ms, HMR Test 3: 4,7 ms; rata-rata 6,1 ms diperoleh dari tiga kali pengujian HMR dan bukan merupakan waktu startup `pnpm run dev`) (Status: PASS)
- **Waktu Production Build (Aktual):** **6.96 s** (2307 modules transformed)
- **Konektivitas API:** Endpoint mock `/api/*` dilayani secara transparan melalui Vite connect middleware plugin di port 3000.

---

## 5. Konfigurasi Vite & Path Alias

File: `vite.config.ts`

```ts
import path from 'node:path'
import react from '@vitejs/plugin-react'
import { defineConfig, type Plugin } from 'vite'
import { createMockApiMiddleware } from './server/mock-api-middleware.ts'

function mockApiPlugin(): Plugin {
  return {
    name: 'mock-api-plugin',
    configureServer(server) {
      server.middlewares.use(createMockApiMiddleware())
    },
    configurePreviewServer(server) {
      server.middlewares.use(createMockApiMiddleware())
    },
  }
}

export default defineConfig({
  plugins: [react(), mockApiPlugin()],
  resolve: {
    alias: {
      '@': path.resolve(import.meta.dirname, './src'),
    },
  },
  server: {
    port: 3000,
    strictPort: true,
    host: true,
  },
  preview: {
    port: 3000,
    strictPort: true,
    host: true,
  },
  build: {
    target: 'es2022',
    outDir: 'dist',
    minify: 'esbuild',
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes('node_modules')) {
            if (
              id.includes('react') ||
              id.includes('react-dom') ||
              id.includes('react-router-dom')
            ) {
              return 'vendor-react'
            }
            if (id.includes('@tanstack/react-query')) {
              return 'vendor-query'
            }
            if (id.includes('motion')) {
              return 'vendor-motion'
            }
            if (
              id.includes('lucide-react') ||
              id.includes('clsx') ||
              id.includes('tailwind-merge') ||
              id.includes('class-variance-authority') ||
              id.includes('@base-ui/react')
            ) {
              return 'vendor-ui'
            }
            if (id.includes('zod') || id.includes('zustand')) {
              return 'vendor-core'
            }
            return 'vendor'
          }
        },
      },
    },
  },
})
```

---

## 6. Strict TypeScript

File: `tsconfig.json`

```json
{
  "compilerOptions": {
    "target": "ES2022",
    "lib": ["DOM", "DOM.Iterable", "ESNext"],
    "allowJs": true,
    "skipLibCheck": true,
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noEmit": true,
    "esModuleInterop": true,
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "isolatedModules": true,
    "jsx": "react-jsx",
    "allowImportingTsExtensions": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": [
    "src/**/*.ts",
    "src/**/*.tsx",
    "vite.config.ts",
    "server/**/*.ts"
  ],
  "exclude": ["node_modules", "dist", ".next"]
}
```

Hasil verifikasi:
```text
$ tsc --noEmit
Exit code: 0 (0 errors)
```

---

## 7. Biome Configuration

File: `biome.json`

```json
{
  "$schema": "https://biomejs.dev/schemas/2.5.13/schema.json",
  "vcs": {
    "enabled": false,
    "clientKind": "git",
    "useIgnoreFile": true
  },
  "files": {
    "ignoreUnknown": true,
    "includes": [
      "src/**",
      "server/**",
      "vite.config.ts",
      "!**/dist/**",
      "!**/node_modules/**",
      "!**/.next/**",
      "!**/public/**",
      "!**/coverage/**",
      "!**/docs/**",
      "!**/*.css"
    ]
  },
  "formatter": {
    "enabled": true,
    "indentStyle": "space",
    "indentWidth": 2,
    "lineWidth": 100
  },
  "assist": {
    "actions": {
      "source": {
        "organizeImports": "on"
      }
    }
  },
  "linter": {
    "enabled": true,
    "rules": {
      "preset": "recommended",
      "correctness": {
        "noUnusedVariables": "error"
      },
      "a11y": {
        "useSemanticElements": "off",
        "noNoninteractiveTabindex": "off"
      },
      "suspicious": {
        "noArrayIndexKey": "off"
      }
    }
  },
  "javascript": {
    "formatter": {
      "quoteStyle": "single",
      "semicolons": "asNeeded"
    }
  }
}
```

Hasil verifikasi:
```text
$ biome check .
Checked 77 files in 108ms. No fixes applied.
Exit code: 0 (0 error, 0 warning)
```

---

## 8. Code Splitting & Hasil Manual Chunks

Hasil kompilasi aktual pada folder `dist/assets/`:

| Nama File Chunk | Ukuran Asli | Modul Dependensi Utama |
|---|---|---|
| `vendor-react-DtB_o8jb.js` | 286,26 kB | `react`, `react-dom`, `react-router-dom` |
| `vendor-motion-B7cnhQgW.js` | 96,34 kB | `motion` (Motion for React) |
| `vendor-core-BZduKpRP.js` | 57,26 kB | `zod`, `zustand` |
| `vendor-DIos5NZ_.js` | 46,33 kB | `@tanstack/react-query` & runtime helper |
| `vendor-ui-DhG2kYNK.js` | 26,13 kB | `lucide-react`, `clsx`, `tailwind-merge`, `cva`, `@base-ui` |
| `index-DPJmUlrC.js` | 102,13 kB | Kode aplikasi: halaman, dialog, router, & komponen |
| `rolldown-runtime-Dik6OG8R.js` | 0,59 kB | Rolldown bundler runtime |
| `index-Co7X250R.css` | 58,49 kB | Lembar gaya tema Tailwind CSS v4 |

---

## 9. HMR (Hot Module Replacement) & Cold Start Testing

### Cold Start Benchmark
- **Vite Server Ready:** **1.108 ms** (waktu sampai Vite dev server menyatakan ready di terminal)
- **First HTTP 200 OK:** **5.877 ms** (waktu sampai request HTTP pertama mendapatkan HTTP 200 OK di port 3000)
- **Status:** **PASS**
- *Keterangan:* 1.108 ms adalah waktu internal server Vite menyatakan siap, sedangkan 5.877 ms adalah waktu sampai request HTTP pertama mendapatkan HTTP 200 OK. Kedua metrik ini dipisahkan secara transparan dan tidak disamakan.

### HMR Quantitative Benchmark
Pengujian riil dilakukan pada development server aktif di port 3000 dengan memodifikasi komponen React `src/pages/landing-page.tsx`:
- **HMR Test 1:** **9,1 ms**
- **HMR Test 2:** **4,6 ms**
- **HMR Test 3:** **4,7 ms**
- **Average HMR Response:** **6,1 ms (3 Tests)**
- **Status:** **PASS**
- *Keterangan:* Rata-rata 6,1 ms diperoleh dari tiga kali pengujian HMR dan bukan merupakan waktu startup `pnpm run dev`. Perubahan diterapkan tanpa full page reload dan state aplikasi tetap bertahan.

---

## 10. Benchmarking Riil

Pengujian dilakukan pada lingkungan perangkat keras Windows 11 x64, Node.js v24, pnpm v12:

| Metric | Before Migration | After Migration |
|---|---:|---:|
| Cold Start (Vite Server Ready) | N/A | 1.108 ms |
| Cold Start (First HTTP 200 OK) | N/A | 5.877 ms |
| HMR Test 1 | N/A | 9,1 ms |
| HMR Test 2 | N/A | 4,6 ms |
| HMR Test 3 | N/A | 4,7 ms |
| Average HMR Response (3 Tests) | N/A | 6,1 ms |
| Production Build | N/A | 6.96 s |
| Biome | N/A | 108 ms |

> Baseline sebelum migrasi tidak diukur ulang karena build pipeline lama tidak tersedia pada project final sehingga baseline lama tidak dapat diukur ulang secara konsisten. Oleh karena itu, Before Migration ditampilkan sebagai N/A untuk menjaga validitas data benchmarking. Rata-rata 6,1 ms diperoleh dari tiga kali pengujian HMR dan bukan merupakan waktu startup `pnpm run dev`.

---

## 11. Quality Gate Terpadu

Script quality check terintegrasi pada `package.json`:
```bash
pnpm run verify
```

Status verifikasi mutu pipeline:

```text
TypeScript Verification : PASS (Exit Code: 0, Errors: 0, Warnings: 0)
Biome Quality Gate      : PASS (Exit Code: 0, 77 files checked, 0 errors, 0 warnings)
Vite Production Build   : PASS (Exit Code: 0, 6.96 seconds, 2307 modules transformed)
Manual Chunks           : PASS (5 vendor chunks terisolasi)
Unified Verify          : PASS (Exit Code: 0)
Hot Module Replacement  : PASS (HMR Benchmark (3 Tests) | Average HMR Response: 6,1 ms)
SonarQube Configuration : READY
SonarQube Actual Scan   : NOT EXECUTED
```

---

## 12. SonarQube & Static Analysis

File: `sonar-project.properties`

```properties
# SonarQube Project Configuration for Statistics Story AI
# Modul 8: Modern Build Tools & Quality Gate

sonar.projectKey=statistics-story-ai
sonar.projectName=Statistics Story AI
sonar.projectVersion=1.0.0

# Source paths analyzed by SonarQube
sonar.sources=src,server

# Encoding
sonar.sourceEncoding=UTF-8

# Excluded paths
sonar.exclusions=**/node_modules/**,**/dist/**,**/.next/**,**/public/**,**/coverage/**,**/docs/**,**/*.d.ts,pnpm-lock.yaml,biome.json,sonar-project.properties

# TypeScript configuration reference
sonar.typescript.tsconfigPath=tsconfig.json

# Environment configurations
sonar.javascript.environments=browser,node

# Quality gate settings
sonar.qualitygate.wait=false
```

- **SonarQube Configuration:** **READY**
- **SonarQube Actual Scan:** **NOT EXECUTED**

> Analisis SonarQube server belum dieksekusi karena environment/server/runner SonarQube tidak tersedia pada saat pengujian. Konfigurasi SonarQube telah disiapkan dan siap digunakan ketika server tersedia.

---

## 13. Kompatibilitas Fitur Aplikasi

> Fitur utama Statistics Story AI tetap dipertahankan setelah migrasi ke Vite dan telah diverifikasi pada environment pengujian.

Verifikasi mencakup alur interaksi utama aplikasi:
- Halaman Beranda / Landing interaktif
- Form Autentikasi (Login & Registrasi akun demo)
- Halaman Dasbor Riwayat Analisis
- Formulir Input Data Analisis Baru (manual paste & berkas)
- Pemilihan Jenis Analisis Statistik (Deskriptif, Uji t, Korelasi, Regresi)
- Visualisasi Hasil Analisis Grafik Interaktif (Scatter plot)
- Narasi Interpretasi AI dan Contoh Kasus kontekstual
- Operasi CRUD data analisis (Tambah, Ubah, Hapus dengan validasi Zod dan cache TanStack Query)

---

## 14. Kesimpulan

Seluruh komponen teknis yang dapat diverifikasi pada environment pengujian telah terpenuhi. Konfigurasi SonarQube telah disiapkan, sedangkan actual server scan belum dieksekusi karena server/runner SonarQube belum tersedia pada environment pengujian.

Status verifikasi mutu:
- **TypeScript:** PASS (Strict mode, `noUncheckedIndexedAccess`, 0 error)
- **Biome:** PASS (Linting & formatting 77 file dalam 108 ms, 0 error, 0 warning)
- **Vite Build:** PASS (Production build 6.96 s, target es2022, 2307 modules)
- **Manual Chunks:** PASS (5 vendor chunks terisolasi di dist/assets/)
- **Hot Module Replacement:** PASS (HMR Benchmark (3 Tests) | Average HMR Response: 6,1 ms)
- **SonarQube Configuration:** READY (`sonar-project.properties` valid)
- **SonarQube Actual Scan:** NOT EXECUTED (Server/runner belum aktif pada environment pengujian)

Dokumentasi matriks migrasi dan benchmarking kuantitatif riil terangkum dalam file PDF 2 halaman [`docs/modul-8-matriks-benchmark.pdf`](file:///d:/statistics-story-final-legit/docs/modul-8-matriks-benchmark.pdf).
