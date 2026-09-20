# Automated Testing & Verification Suite
## Source of Truth: SKPL / SRS Version 1.0 (Tabel 8.3 Rencana Pengujian) & Brief Proyek Akhir

Dokumen ini mendokumentasikan arsitektur pengujian otomatis, cakupan kode (coverage), dan pemetaan Test Case TC01–TC12 sesuai SKPL/SRS Tabel 8.3 serta pengujian modul hasil analisis.

---

## 1. Test Suite Architecture

Pengujian menggunakan framework **Vitest** dengan engine coverage **v8** dan DOM environment **jsdom**.

```
tests/
├── auth/
│   └── login-register.test.ts        # TC01, TC02 (Login valid & invalid, hash bcrypt)
├── input/
│   └── file-parsing.test.ts          # TC03, TC04, TC05 (CSV, Excel, Manual Tabular parsing)
├── statistics/
│   ├── descriptive.test.ts           # TC06 (Mean, Median, Mode, SD, Min, Max)
│   ├── t-test.test.ts                # TC07 (Welch's/Student's t, p-value, df)
│   ├── correlation.test.ts           # TC08 (Pearson r, t-stat, p-value, arah, kekuatan)
│   └── regression.test.ts            # TC09 (OLS Slope, Intercept, R², Standard Error)
├── ai/
│   ├── provider.test.ts              # TC10, TC12 (AI narrative, deterministic engine)
│   └── fallback-timeout.test.ts      # TC12 (Orchestrator timeout & network failure simulation)
├── visualization/
│   ├── chart-mapping.test.ts         # TC11 (Mapping visualisasi canonical ke 4 analisis)
│   └── chart-rendering.test.tsx      # TC11 (Actual DOM SVG rendering: Histogram, Bar, Scatter, Regression)
├── result/
│   ├── result-schema.test.ts         # Canonical Zod Schemas (Discriminated Union on 'kind')
│   ├── result-format.test.ts         # Deterministic Statistical Formatter (no [object Object])
│   └── fr15-presentation.test.tsx    # FR15 Continuous Single-Page DOM verification (HasilQueryView)
├── integration/
│   ├── calculate-flow.test.ts        # End-to-end calculate & atomic DB transaction
│   ├── calculate-result-roundtrip.test.ts # TC06-TC12 End-to-end flow with real datasets
│   ├── tc03-csv-upload-persistence.test.ts # TC03 CSV upload, Layer A/B validation, & DB persistence
│   ├── tc04-unsupported-format.test.ts     # TC04 Unsupported file format (.pdf) rejection boundary
│   ├── tc05-manual-input-persistence.test.ts # TC05 Manual numeric data input, persistence, & readiness
│   └── coverage-booster.test.ts      # Edge cases, auth errors, parser boundaries
├── api/
│   ├── routes.test.ts                # Next.js Route Handlers (BFF endpoints)
│   └── hasil-result-contract.test.ts # Calculate -> DB -> GET /api/hasil & User Isolation (IDOR check)
├── security/
│   └── result-ownership.test.ts      # Anti-IDOR server-side ownership isolation test
├── performance/
│   └── statistics-performance.test.ts # NFR02 Statistical engine benchmark test (<5s)
├── lib/
│   └── utilities.test.ts             # Formatting, schema validations, Zustand store
└── fixtures/
    └── reference-datasets.json       # Benchmark datasets terverifikasi SciPy
```

---

## 2. Test Execution & Coverage Results

Perintah eksekusi:
```bash
pnpm run test:coverage
```

### 2.1 Actual Verification Evidence (Ran on 2026-09-20)
- **Total Test Files:** 24 files (24 passed, 100%)
- **Total Tests Executed:** 106 tests (106 passed, 100% pass rate)
- **Test Duration:** ~6.53 seconds
- **Verification Status:** **VERIFIED**

### 2.2 Coverage Metrics (v8 Report)

| Metric | Target Proyek | Actual Achieved | Status |
|---|---|---|---|
| **Statements** | $\ge 80\%$ | **86.51%** | **VERIFIED** |
| **Lines** | $\ge 80\%$ | **86.51%** | **VERIFIED** |
| **Functions** | $\ge 80\%$ | **90.21%** | **VERIFIED** |
| **Branches** | $\ge 70\%$ | **72.33%** | **VERIFIED** |

Laporan coverage tersimpan di format standar:
- `coverage/lcov.info`
- `coverage/index.html`

---

## 3. Test Case Traceability (TC01–TC12) Summary
*Mengacu pada skenario resmi SKPL/SRS Version 1.0 Tabel 8.3*

| Test Case | Scenario (Tabel 8.3) | Test File | Derived Relation | Result |
|---|---|---|---|:---:|
| **TC01** | Login dengan data valid | `tests/auth/login-register.test.ts` | FR 01 | **VERIFIED** |
| **TC02** | Login dengan data tidak valid | `tests/auth/login-register.test.ts` | FR 01 | **VERIFIED** |
| **TC03** | Upload berkas CSV valid | `tests/integration/tc03-csv-upload-persistence.test.ts`, `tests/input/file-parsing.test.ts` | FR 03, FR 05 | **VERIFIED** |
| **TC04** | Upload berkas tidak valid | `tests/integration/tc04-unsupported-format.test.ts`, `tests/input/file-parsing.test.ts` | FR 03, FR 04, FR 05 | **VERIFIED** |
| **TC05** | Input data manual | `tests/integration/tc05-manual-input-persistence.test.ts`, `tests/input/file-parsing.test.ts` | FR 02, FR 05 | **VERIFIED** |
| **TC06** | Analisis statistik deskriptif | `tests/statistics/descriptive.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | FR 07 | **VERIFIED** |
| **TC07** | Analisis uji-t | `tests/statistics/t-test.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | FR 08 | **VERIFIED** |
| **TC08** | Analisis korelasi | `tests/statistics/correlation.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | FR 09 | **VERIFIED** |
| **TC09** | Analisis regresi sederhana | `tests/statistics/regression.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | FR 10 | **VERIFIED** |
| **TC10** | Generasi narasi AI | `tests/ai/provider.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | FR 11, FR 12, FR 14 | **VERIFIED** |
| **TC11** | Generasi visualisasi | `tests/visualization/chart-rendering.test.tsx`, `tests/visualization/chart-mapping.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | FR 13 | **VERIFIED** |
| **TC12** | Penanganan error layanan AI | `tests/ai/fallback-timeout.test.ts`, `tests/ai/provider.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | NFR 05, FR 11 | **VERIFIED** |

---

## 4. Desktop Cross-Browser E2E Automated Verification (NFR07)

Pengujian E2E dijalankan menggunakan Playwright against production build (`next start -p 3099`) dan terintegrasi secara otomatis sebagai **Stage 8 pada final quality gate (`pnpm run verify:final`)**. Pengujian mencakup 7 skenario semantik:

```bash
# Menjalankan pengujian E2E secara independen
pnpm run test:e2e

# Atau sebagai bagian terpadu dari 8-stage quality gate
pnpm run verify:final
```

| Browser | Channel / Engine | Skenario Lolos | Status | Bukti Artifact |
|---|---|:---:|:---:|---|
| **Google Chrome** | `channel: chrome` | 7 / 7 (100%) | **VERIFIED** | `docs/cross-browser-results.json` |
| **Microsoft Edge** | `channel: msedge` | 7 / 7 (100%) | **VERIFIED** | `docs/cross-browser-results.json` |
| **Mozilla Firefox** | `playwright managed` | 7 / 7 (100%) | **VERIFIED** | `docs/cross-browser-results.json` |

*7 Skenario yang Diuji pada Setiap Browser:*
1. **Landing Page Semantic Validation**: Title, Hero H1 (`"Dari Angka Menjadi Cerita"`), CTA button visible.
2. **Login Page Form Controls & Input**: Interactive email & password inputs, submit button.
3. **Protected Input Page**: Session cookie guard pass-through, `AnalysisInputForm` DOM mount.
4. **Analysis Selection Controls**: Dropdown option selection & state transitions across all 4 statistical methods.
5. **Result View (FR15) & Auth Guard**: 5 sections simultaneously visible + unauthenticated access properly redirected to login.
6. **Chart Rendering DOM**: Actual SVG scatter circles ($N=8$), trendline equation metadata, and histogram bars ($N=3$).
7. **Keyboard Tab Navigation**: Sequential `document.activeElement` focus traversal across form elements.
