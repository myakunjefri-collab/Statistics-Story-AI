# Performance & Core Web Vitals Optimization

Dokumen ini mendokumentasikan optimasi performa komputasi statistik (NFR02) dan standar Core Web Vitals front-end produksi.

---

## 1. NFR02 — Kecepatan Komputasi Statistik

### 1.1 Persyaratan Sumber (SKPL/SRS)
- **Kebutuhan Asli:** Waktu proses analisis statistik dasar $\le 5$ detik pada kondisi normal.
- **Batasan Eksplisit:** Waktu tunggu/latensi pemanggilan layanan AI **TIDAK termasuk** dalam metrik komputasi statistik dasar.

### 1.2 Hasil Pengukuran Benchmark Mesin Statistik Dua Tingkat (Two-Level Benchmark)
Pengujian dilakukan menggunakan script benchmark reproduksibel (`scripts/benchmark-statistics.ts`) dan automated test (`tests/performance/statistics-performance.test.ts`) dengan dataset deterministik berukuran $N = 1.000$ baris data (30 iterasi setelah 5 warm-up):

```bash
pnpm run benchmark:statistics
```

#### Level A: Pure Statistical Engine
| Jenis Analisis | Ukuran Sampel ($N$) | Waktu Eksekusi Terukur (Median) | Ambang Batas SRS | Status |
|---|---|---|---|---|
| **Statistik Deskriptif (FR07)** | 1.000 angka | ~0.27 ms | $\le 5.000$ ms | **VERIFIED** |
| **Uji t Dua Sampel Welch (FR08)** | $500 \times 2$ grup | ~0.06 ms | $\le 5.000$ ms | **VERIFIED** |
| **Korelasi Pearson (FR09)** | 1.000 pasang | ~0.07 ms | $\le 5.000$ ms | **VERIFIED** |
| **Regresi Linier Sederhana OLS (FR10)** | 1.000 pasang | ~0.04 ms | $\le 5.000$ ms | **VERIFIED** |

#### Level B: Application Statistical-Processing Pipeline
| Analisis Pipeline | Ukuran Sampel ($N$) | Waktu Eksekusi Terukur (Median) | Ambang Batas SRS | Status |
|---|---|---|---|---|
| **Deskriptif Application Pipeline** | 1.000 baris CSV | ~1.23 ms | $\le 5.000$ ms | **VERIFIED** |
| **Uji t Application Pipeline** | 1.000 baris CSV | ~0.72 ms | $\le 5.000$ ms | **VERIFIED** |
| **Korelasi Application Pipeline** | 1.000 baris CSV | ~0.74 ms | $\le 5.000$ ms | **VERIFIED** |
| **Regresi Application Pipeline** | 1.000 baris CSV | ~0.71 ms | $\le 5.000$ ms | **VERIFIED** |

Hasil terperinci tersimpan dalam artefak audit: [`docs/benchmark-results.json`](file:///d:/statistics-story-final-legit/docs/benchmark-results.json).

### 1.3 Penegasan Cakupan & Batasan Lingkup (*Scope & Exclusions*)

Level B hanya meliputi pipeline yang benar-benar diukur. Untuk mencegah interpretasi keliru yang menyamakan waktu pemrosesan data dengan total latensi API produksi, berikut batasan lingkup pengukuran:

1. **Cakupan Pengukuran (INCLUDED):**
   - CSV parsing
   - data selection
   - numeric filtering/grouping
   - statistical calculation
   - statistical formatting
   - visualization normalization

2. **Pengecualian Mutlak (EXCLUDED):**
   - HTTP request overhead
   - HTTP server overhead
   - authentication/session overhead
   - network latency
   - PostgreSQL I/O
   - PostgreSQL network latency
   - external AI latency
   - browser DOM rendering
   - browser paint/render cycle

> **NFR02 VERIFIED — ENGINEERING BENCHMARK**  
> Application Statistical-Processing Pipeline berada di bawah batas <= 5,000 ms pada benchmark lokal yang reproducible ($N = 1.000$ baris data).  
> Benchmark ini bukan pengukuran total HTTP/API latency.

---

## 2. Core Web Vitals Optimization

### 2.1 Ambang Batas Target
- **Largest Contentful Paint (LCP):** $\le 2.5$ detik
- **Interaction to Next Paint (INP):** $\le 200$ ms
- **Cumulative Layout Shift (CLS):** $\le 0.10$

### 2.2 Strategi Front-End yang Diterapkan
1. **Next.js Font Optimization (`next/font`):**
   - Font `Inter` dan `Instrument Serif` dimuat secara otomatis oleh framework tanpa font flash (FOIT/FOUT).
2. **React Server Components (~74.63%):**
   - Mengurangi ukuran bundel JavaScript client secara drastis dengan merender seluruh teks editorial, narasi, dan markup layout di server.
3. **Pencegahan Layout Shift (CLS):**
   - Seluruh kontainer SVG visualisasi (`HistogramChart`, `BarComparisonChart`, `RegressionChart`, `ScatterChart`) memiliki aspect-ratio eksplisit (`viewBox="0 0 600 320"` dan `min-h-[300px]`), mencegah lonjakan posisi konten saat data grafik dimuat.
4. **Code Splitting & Dynamic Imports:**
   - Halaman `hasil/[id]` menggunakan streaming SSR dengan Suspense boundary dan `loading.tsx` skeleton.

### 2.3 Status Verifikasi Lapangan (Production Audit)
- **Lighthouse Lab Audit (Production Build):** `TARGET` (memerlukan pengukuran lingkungan browser aktif).
- **CrUX Field Data:** `NOT VERIFIED` (belum ada data pengguna real-world jangka panjang).
