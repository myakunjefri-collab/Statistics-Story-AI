# Final Test & Quality Matrix (TC01–TC12, NFR02, NFR07)
## Source of Truth: SKPL / SRS Statistics Story AI Version 1.0 (Tabel 8.3 & Tabel 5)

Dokumen ini mendokumentasikan matriks hasil pengujian akhir seluruh Test Case fungsional (TC01–TC12) dan Non-Functional Requirements yang diuji secara empiris (NFR02, NFR07).

---

## 1. Functional Test Cases (TC-01 – TC-12)

| Test Case | Skenario Resmi (SRS Tabel 8.3) | Input Resmi (SRS Tabel 8.3) | Output Diharapkan Resmi (SRS Tabel 8.3) | File Uji Otomatis Aktual | Bukti Eksekusi | Status |
|:---:|---|---|---|---|---|:---:|
| **TC-01** | Login dengan data valid | Email & kata sandi benar | Masuk ke dashboard | `tests/auth/login-register.test.ts` | 4 tests passed, HTTP 200, session cookie set | **VERIFIED** |
| **TC-02** | Login dengan data tidak valid | Kata sandi salah | Pesan error muncul | `tests/auth/login-register.test.ts` | 4 tests passed, HTTP 401, error message rendered | **VERIFIED** |
| **TC-03** | Upload berkas CSV valid | Berkas CSV dengan format sesuai | Data berhasil divalidasi dan disimpan | `tests/integration/tc03-csv-upload-persistence.test.ts`, `tests/input/file-parsing.test.ts` | HTTP 201, dataset tersimpan di DB, hasil terbaca via `/api/hasil` | **VERIFIED** |
| **TC-04** | Upload berkas tidak valid | Berkas dengan format tidak didukung (mis. .pdf) | Pesan error format tidak didukung | `tests/integration/tc04-unsupported-format.test.ts` | Form boundary & API reject dengan HTTP 400 'Format berkas hanya mendukung .csv, .xlsx, atau .xls' | **VERIFIED** |
| **TC-05** | Input data manual | Data numerik lengkap sesuai form | Data tersimpan dan siap dianalisis | `tests/integration/tc05-manual-input-persistence.test.ts` | HTTP 201, dataset tabular tersimpan di DB dengan status 'Selesai' | **VERIFIED** |
| **TC-06** | Analisis statistik deskriptif | Dataset numerik | Nilai mean, median, modus, std. deviasi tampil benar | `tests/statistics/descriptive.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | Mean, median, modus, SD, min, max terverifikasi benchmark SciPy | **VERIFIED** |
| **TC-07** | Analisis uji-t | Dua kelompok data numerik | Nilai t dan p-value tampil sesuai perhitungan | `tests/statistics/t-test.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | Welch's t-statistic, df, p-value terverifikasi SciPy | **VERIFIED** |
| **TC-08** | Analisis korelasi | Dua variabel numerik | Koefisien korelasi tampil sesuai perhitungan | `tests/statistics/correlation.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | Pearson r, t-stat, p-value terverifikasi SciPy | **VERIFIED** |
| **TC-09** | Analisis regresi sederhana | Variabel bebas & terikat numerik | Koefisien regresi dan R² tampil sesuai perhitungan | `tests/statistics/regression.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | Slope, intercept, R², Std Error terverifikasi SciPy | **VERIFIED** |
| **TC-10** | Generasi narasi AI | Hasil statistik valid | Narasi interpretatif relevan dengan hasil ditampilkan | `tests/ai/provider.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | Output narasi & contoh kasus tervalidasi skema Zod | **VERIFIED** |
| **TC-11** | Generasi visualisasi | Hasil statistik valid | Grafik sesuai jenis analisis ditampilkan | `tests/visualization/chart-rendering.test.tsx`, `tests/visualization/chart-mapping.test.ts` | Histogram, Bar, Scatter, dan Trendline dirender secara nyata dalam SVG DOM | **VERIFIED** |
| **TC-12** | Penanganan error layanan AI | Layanan AI tidak merespons (timeout) | Pesan error informatif, sistem tidak crash | `tests/ai/fallback-timeout.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | Simulasi HTTP 504, ECONNREFUSED, AbortError -> Fallback Rule-Based mulus tanpa crash (NFR05) | **VERIFIED** |

---

## 2. Non-Functional Requirements Verification (NFR02 & NFR07)

| Requirement ID | Definisi Kebutuhan Sumber | Target Ambang Batas | Metode & Skrip Verifikasi | Bukti Hasil Eksekusi | Status Evaluasi |
|:---:|---|---|---|---|:---:|
| **NFR 02** | Kecepatan komputasi statistik dasar (AI excluded) | $\le 5.000$ ms per analisis pada kondisi normal | `scripts/benchmark-statistics.ts` & `tests/performance/statistics-performance.test.ts` | $N=1.000$ baris data: Level A Pure Statistical Engine (<0.4 ms), Level B Application Statistical-Processing Pipeline (<2.0 ms, median ~0.71–1.23 ms). Application Statistical-Processing Pipeline berada di bawah batas <= 5,000 ms pada benchmark lokal yang reproducible. Benchmark ini bukan pengukuran total HTTP/API latency. Artifact: `docs/benchmark-results.json` | **VERIFIED — ENGINEERING BENCHMARK** |
| **NFR 07** | Kompatibilitas browser desktop populer (Chrome, Edge, Firefox) | Berfungsi baik tanpa error pada browser modern desktop | `scripts/test-cross-browser.ts` (Playwright launcher against production build, Stage 8 `verify:final`) | **Chrome:** VERIFIED (7/7 skenario lolos)<br>**Edge:** VERIFIED (7/7 skenario lolos)<br>**Firefox:** VERIFIED (7/7 skenario lolos). Artifact: `docs/cross-browser-results.json` | **VERIFIED** |

---

## 3. Ringkasan Eksekusi Test Suite & Quality Gate

- **Total Test Files:** 24 file uji (100% lulus)
- **Total Tests:** 106 tes unit, integrasi, rendering, keamanan, dan performa (100% lulus, 0 gagal)
- **Code Coverage (v8):** Statements **86.51%**, Lines **86.51%**, Functions **90.21%**, Branches **72.33%**
- **Quality Gate Pipeline:** `pnpm run verify:final` (8-stage automated verification: Lint $\rightarrow$ Typecheck $\rightarrow$ Unit/Integration Tests $\rightarrow$ Coverage $\rightarrow$ RSC Audit $\rightarrow$ Benchmark $\rightarrow$ Build $\rightarrow$ E2E Cross-Browser Audit)
