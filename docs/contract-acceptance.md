# Contract Acceptance & Quality Management Status Matrix
## Source of Truth: Rencana & Kontrak Manajemen Proyek TI & Brief Proyek Akhir

Dokumen ini memetakan seluruh kriteria penerimaan kontrak (*contract acceptance*) dan manajemen kualitas proyek akhir secara transparan. Kriteria empiris yang melibatkan responden manusia dipisahkan secara tegas dari pengujian otomatis (*automated testing*).

---

## 1. Matriks Kriteria Penerimaan Kontrak (*Contract Acceptance Criteria*)

| # | Kriteria Penerimaan Kontrak | Dokumen Rujukan | Ambang Batas / Target | Bukti Verifikasi Aktual | Status Evaluasi |
|:---:|---|---|---|---|:---:|
| **1** | Seluruh Test Case fungsional (TC01–TC12) lulus 100% atau kegagalan ditindaklanjuti | SKPL/SRS Tabel 8.3 & Kontrak | 100% lulus (0 gagal) | Vitest Suite: 24 test files, 106 tests passed (100%) | **VERIFIED** |
| **2** | Skor System Usability Scale (SUS) | Kontrak Manajemen Proyek TI | $\ge 68$ (Kategori *Good/Acceptable*) | Membutuhkan deployment live dan kuesioner 10 butir SUS kepada mahasiswa | **PENDING USER EVALUATION** |
| **3** | Jumlah responden mahasiswa uji coba | Kontrak Manajemen Proyek TI & NFR08 | $\ge 20$ responden bergantian selama semester | Membutuhkan pelaksanaan sesi uji coba perkuliahan pasca deployment | **PENDING USER EVALUATION** |
| **4** | Manfaat narasi AI terhadap pemahaman | Kontrak Manajemen Proyek TI | 70% – 80% responden menyatakan narasi membantu pemahaman | Membutuhkan survei evaluasi kegunaan narasi kepada mahasiswa setelah pengujian | **PENDING USER EVALUATION** |
| **5** | Kualitas dan relevansi narasi AI menurut evaluator | Quality Management Plan | $\ge 80\%$ narasi dinilai relevan/koheren oleh tim penilai | Membutuhkan rubrik penilaian kualitatif oleh dosen pembimbing/evaluator | **PENDING EVALUATOR REVIEW** |
| **6** | Kesesuaian visualisasi grafik pada TC11 | SKPL/SRS FR13 & Kontrak | 100% grafik sesuai jenis analisis | `tests/visualization/chart-rendering.test.tsx` (5/5 tests passed: histogram, bar, scatter, trendline) | **VERIFIED** |
| **7** | Kecepatan komputasi statistik dasar (NFR02) | SKPL/SRS Tabel 5 (NFR02) | $\le 5$ detik (AI excluded) | `scripts/benchmark-statistics.ts` & `tests/performance/statistics-performance.test.ts`: Level A Pure Statistical Engine (<0.4ms) dan Level B Application Statistical-Processing Pipeline (<2.0ms, median ~0.71–1.23 ms) pada N=1.000. Application Statistical-Processing Pipeline berada di bawah batas <= 5,000 ms pada benchmark lokal yang reproducible. Benchmark ini bukan pengukuran total HTTP/API latency. Artifact: `docs/benchmark-results.json` | **VERIFIED — ENGINEERING BENCHMARK** |
| **8a** | Keamanan Implementasi (*Security Implementation Controls*) | Kontrak Manajemen Proyek TI & NFR01 | Kontrol keamanan terverifikasi implementasi & pengujian | Password bcrypt salt 10; session HttpOnly HMAC-SHA256; parameterized SQL query; anti-IDOR checks (`result-ownership.test.ts`); Zod schema validation; Next.js early route interception | **VERIFIED — SECURITY IMPLEMENTATION EVIDENCE** |
| **8b** | Pemindaian Kerentanan (*Vulnerability Scan & SAST*) | Kontrak Manajemen Proyek TI & Brief Bab 13 | 0 critical vulnerability pada scanner eksternal | Konfigurasi SonarQube tersedia (`sonar-project.properties`). Eksekusi scanner eksternal dan SAST audit formal belum dijalankan dalam verifikasi lokal | **NOT VERIFIED / PENDING EXTERNAL TOOL EXECUTION** |
| **9** | Kelengkapan dokumentasi teknis dan panduan pengguna | Kontrak Manajemen Proyek TI | Dokumentasi teknis + User Guide lengkap | 16 dokumen arsitektur, panduan deployment, testing, mapping FR/NFR, benchmark, dan user guide tersedia di `docs/` | **VERIFIED** |
| **10** | Ketiadaan error mayor saat demonstrasi | Kontrak Manajemen Proyek TI | Tidak ada fatal crash / blocking bug | Zero unhandled exception, AI fallback orchestrator tahan banting (TC12) | **VERIFIED** (Pre-Deployment) |
| **11** | Kompatibilitas Peramban Desktop (NFR07) | SKPL/SRS NFR07 & Brief Bab 12 | 3 peramban desktop populer (Chrome, Firefox, Edge) | Playwright E2E suite (`scripts/test-cross-browser.ts` sebagai Stage 8 `verify:final`): Chrome (7/7), Edge (7/7), Firefox (7/7) lolos 100%. Artifact: `docs/cross-browser-results.json` | **VERIFIED** |

---

## 2. Penjelasan Pemisahan Kategori Status

1. **VERIFIED:** Kriteria teknis yang telah diuji secara reproducible menggunakan suite otomasi lokal (`pnpm run verify:final`, Vitest, Playwright, benchmark script).
2. **PENDING USER EVALUATION:** Kriteria empiris yang secara mutlak mensyaratkan responden pengguna manusia (mahasiswa) pada sistem yang sudah dideploy. Status ini **bukan defect**, melainkan tahapan evaluasi yang dijadwalkan pasca-deployment produksi.
3. **PENDING EVALUATOR REVIEW:** Penilaian kualitatif narasi statistik oleh dosen evaluator/pembimbing akademik.
