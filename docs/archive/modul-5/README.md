# Modul 5 — Framework Modern UI & Ekosistem React (React 19)

## Implementasi pada Project: Statistics Story AI

---

## 1. Deskripsi Project

**Statistics Story AI** adalah aplikasi web modern yang dirancang untuk membantu mahasiswa dan peneliti memahami analisis data statistik secara intuitif. Alih-alih hanya menyajikan angka-angka mentah yang membingungkan, sistem ini mengubah output uji statistik (Deskriptif, Uji t, Korelasi, dan Regresi) menjadi:
1. **Narasi Ilmiah Kontekstual**: Penjelasan bahasa Indonesia yang mudah dipahami dan siap dikutip.
2. **Visualisasi Dinamis**: Grafik titik sebar (*scatter plot*) dan garis regresi interaktif berbasis SVG native ringan.
3. **Studi Kasus Konkret**: Analogi kehidupan nyata yang mengontekstualisasikan temuan data statistik.

Implementasi Modul 5 berfokus pada penguasaan **React 19**, arsitektur komponen terisolasi (*component isolation & reusability*), validasi form, penanganan state asynchronous, integrasi React Compiler, serta pengukuran performa bundle riil.

---

## 2. Framework & Technology Stack

| Komponen Teknologi | Versi | Peran & Fungsi Teknis |
|---|---|---|
| **React** | 19.2.4 | Library UI modern utama, rendering engine, hooks primitif |
| **React DOM** | 19.2.4 | DOM renderer untuk React 19 dengan integrasi asset preloading |
| **Next.js** | 16.3.3 | Framework full-stack dengan App Router, Turbopack, route handlers |
| **TypeScript** | 5.7.3 | Strict static type checking (`--noEmit`) tanpa penggunaan tipe `any` |
| **Turbopack** | Built-in | Bundler generasi baru untuk dev server dan kompilasi produksi cepat |
| **React Compiler** | 1.0.0 (`babel-plugin-react-compiler`) | Otomatisasi fine-grained memoization pada compile-time |
| **Motion** | 13.2.0 | Animasi antarmuka, transisi list, layout physics |
| **Tailwind CSS** | 4.3.3 | Utility-first styling modern dengan varian dinamis |
| **class-variance-authority** | 0.7.1 | Pola deklaratif untuk varian komponen UI (button, card, badge) |

### Konfigurasi React Compiler

React Compiler diaktifkan secara resmi pada `next.config.mjs`:

```javascript
/** @type {import('next').NextConfig} */
const nextConfig = {
  reactCompiler: true,
  images: {
    unoptimized: true,
  },
}

export default nextConfig
```

Dengan opsi `reactCompiler: true`, Next.js menerapkan `babel-plugin-react-compiler` pada file yang berisi JSX dan hook. Compiler ini secara otomatis mengoptimasi dependency graph dan memoizing hasil komputasi tanpa perlu membungkus komponen secara manual dengan `React.memo` atau `useCallback`.

---

## 3. Tiga Modul UI Utama & Arsitektur Komponen

Mengikuti prinsip *single responsibility* dan hierarki modular:
```text
Page (Route Controller)
  └── Domain-Specific Components (Logika bisnis halaman)
        └── Reusable UI Primitives (Komponen serbaguna)
              └── Services & Domain Store Layer
```

### 1. Modul Dasbor (`app/(app)/dashboard/`)
* **Halaman Induk**: `app/(app)/dashboard/page.tsx` — Berperan sebagai koordinator state lokal filter/pencarian dan dialog modal.
* **Komponen Domain Terisolasi**:
  - `DashboardSummary` (`components/dashboard/dashboard-summary.tsx`): Menampilkan ringkasan metrik Total Analisis, Selesai, dan Diproses.
  - `AnalysisFilters` (`components/dashboard/analysis-filters.tsx`): Menangani pemilihan kategori uji statistik dan input pencarian teks live.
  - `AnalysisList` (`components/dashboard/analysis-list.tsx`): Menangani visualisasi daftar riwayat dengan transisi animasi Framer Motion, status badge, serta tombol Lihat, Ubah, dan Hapus.
  - `AnalysisFormDialog` (`components/app/analysis-form-dialog.tsx`): Dialog modal untuk penambahan atau penyuntingan analisis cepat.
  - `ConfirmDialog` (`components/app/confirm-dialog.tsx`): Dialog konfirmasi sebelum aksi penghapusan permanen.

### 2. Modul Input & Unggah Data (`app/(app)/input/`)
* **Halaman Induk**: `app/(app)/input/page.tsx` — Menangani alur validasi form, simulasi submit async, dan navigasi redirect.
* **Komponen Domain Terisolasi**:
  - `AnalysisInfoFields` (`components/analysis-input/analysis-info-fields.tsx`): Mengisolasi field Nama Analisis (dengan pesan error visual), Jenis Analisis (Select dropdown), dan Deskripsi/Pertanyaan (Textarea).
  - `DataSourceSection` (`components/analysis-input/data-source-section.tsx`): Mengelola kartu sumber data dan pesan validasi data.
  - `MethodSelector` (`components/analysis-input/method-selector.tsx`): Tombol dwifungsi (*pill toggle*) antara mode "Unggah Berkas" dan "Input Manual".
  - `FileDropzone` (`components/app/file-dropzone.tsx`): Area seret & lepas berkas dengan validasi ekstensi (`.csv`, `.xlsx`, `.xls`) dan batas ukuran berkas (maksimal 5 MB).

### 3. Modul Hasil Analisis (`app/(app)/hasil/`)
* **Halaman Induk**: `app/(app)/hasil/page.tsx` — Menangani pemanggilan fetch async ke API, indikator loading, penanganan kegagalan dengan tombol retry, dan navigasi tab.
* **Komponen Domain Terisolasi**:
  - `ResultSummary` (`components/analysis-result/result-summary.tsx`): 4 kartu ringkasan metrik statistik utama (p-value, koefisien r, koefisien determinasi R², dan nilai d).
  - `NarrativeCard` (`components/analysis-result/narrative-card.tsx`): Kartu narasi ilmiah bernuansa navy dengan tipografi editorial dan fitur salin narasi ke papan klip (*copy to clipboard*).
  - `StatisticsGrid` (`components/analysis-result/statistics-grid.tsx`): Grid kartu nilai statistik terperinci beserta keterangan signifikansi.
  - `VisualizationPanel` (`components/analysis-result/visualization-panel.tsx`): Panel visualisasi yang mengemas komponen `ScatterChart`.
  - `ScatterChart` (`components/app/scatter-chart.tsx`): Visualisasi diagram sebar native SVG dengan garis regresi linier (*least-squares fit*), grid otomatis, dan label sumbu data.
  - `ExampleCaseCard` (`components/analysis-result/example-case-card.tsx`): Kartu representasi analogi dan skenario kasus riil.

---

## 4. State & Reactivity

Pengelolaan state menggunakan primitif murni React 19 tanpa library eksternal (seperti Zustand atau Redux) sesuai batasan Modul 5:

| Primitif / Hook | Penerapan dalam Project |
|---|---|
| `useState` | Local UI state: form values, query pencarian, active tab, active filter, dialog open/close, submitting state |
| `useContext` | Shared domain state: `AnalysisProvider` (CRUD data riwayat), `AuthProvider` (mock session auth), `ToastProvider` (antrean notifikasi) |
| `useMemo` | Deklarasi komputasi penurunan data yang terisolasi: `filtered` riwayat dan agregasi `counts` di dasbor |
| `useCallback` | Stabilitas referensi fungsi: pemanggil API `load()`, dismiss toast, helper mutasi store |
| `useEffect` | Sinkronisasi efek samping: fetch initial dataset dari API, timer auto-dismiss toast, sinkronisasi form editing |
| `useId` | Pembuatan ID elemen form yang unik dan ramah aksesibilitas WAI-ARIA (`aria-describedby`, `aria-invalid`, `htmlFor`) |
| `useRef` | Referensi elemen DOM untuk file input picker dan drag-and-drop boundary |

---

## 5. Validasi Form

Seluruh formulir interaktif mengimplementasikan validasi sisi klien yang ketat:

1. **Autentikasi (Masuk & Daftar)**:
   - Nama lengkap wajib diisi (mode register).
   - Format email diverifikasi dengan pola regex standar (`/\S+@\S+\.\S+/`).
   - Kata sandi wajib minimal 8 karakter.
   - Konfirmasi kata sandi harus cocok persis dengan kata sandi utama.
   - Pesan kesalahan kontekstual dengan atribut `role="alert"`, `aria-invalid`, dan `aria-describedby`.
2. **Form Analisis Baru**:
   - Nama analisis wajib minimal 3 karakter; jika kurang, submit dicegah dan field menampilkan outline merah serta pesan error.
   - Pesan kesalahan otomatis dibersihkan saat pengguna mulai mengetik kembali (*on-input clearing*).
   - Pada mode **Unggah Berkas**, sistem memverifikasi keberadaan berkas sebelum submit diizinkan.
   - Pada mode **Input Manual**, sistem memvalidasi teks data minimal memiliki beberapa baris nilai.
   - Tombol submit beralih menjadi status `disabled` dan menampilkan ikon animasi spinner (`Loader2`) selama proses pengiriman data.
3. **Dropzone Berkas**:
   - Menolak berkas di luar format `.csv`, `.xlsx`, `.xls` secara instan sebelum pemrosesan.
   - Membatasi ukuran berkas maksimal 5 MB dengan pesan error deskriptif jika batas terlampaui.

---

## 6. Asynchronous API & Error Resilience

### Arsitektur Aliran Data

```text
React Client Component
       │
       ▼
lib/api.ts (fetchJson wrapper dengan penanganan HTTP status)
       │
       ▼
Next.js Route Handlers (app/api/analyses/route.ts & app/api/hasil/route.ts)
       │
       ▼
lib/mock-data.ts (Simulasi latency jaringan 300–800ms)
```

### Pola Penanganan Asynchronous

Setiap modul yang memanfaatkan data remote mengikuti pola siklus hidup:
1. **Inisialisasi**: Mengatur `fase` ke `'loading'`.
2. **Eksekusi Async**: Memanggil fungsi via `async/await` di dalam blok `try...catch`.
3. **Kondisi Berhasil**: Menyimpan data dan mengalihkan status ke `'ready'`.
4. **Kondisi Gagal**: Menangkap exception, mengalihkan status ke `'error'`, dan menampilkan `ErrorState` yang dilengkapi tombol "Coba Lagi" (*retry handler*).

Untuk tujuan pengujian ketahanan UI, endpoint API dapat disimulasikan gagal menggunakan query param `?fail=1` (contoh: `/api/analyses?fail=1`).

---

## 7. Loading, Error, dan Empty States

Komponen terstandar pada `components/ui/states.tsx`:

* **`LoadingState`**:
  - Menggunakan animasi pemutar SVG konsisten.
  - Memiliki atribut aksesibilitas `role="status"` dan `aria-live="polite"` agar pembaca layar menginformasikan proses muat data.
* **`ErrorState`**:
  - Menampilkan ikon peringatan visual, pesan kesalahan yang mudah dipahami, serta tombol aksi "Coba Lagi" yang langsung memanggil ulang request async yang gagal.
  - Menggunakan atribut `role="alert"`.
* **`EmptyState`**:
  - Menampilkan ilustrasi kotak kosong dengan judul dan deskripsi.
  - Pada dasbor riwayat, empty state membedakan kondisi "Belum ada analisis" (dengan tombol aksi membuat analisis baru) vs kondisi "Tidak ada hasil yang cocok" (menyarankan penyesuaian filter).

---

## 8. Analisis Performa & Pengukuran Bundle Riil

Pengukuran aktual dilakukan langsung pada build produksi Next.js Turbopack (`next build`):

* **Waktu Kompilasi**: 14.3 detik kompilasi + 4.2 detik validasi TypeScript.
* **Prerender Halaman**: 10 halaman statis dihasilkan dalam 1033ms.
* **Total Ukuran Aset Statis** (`.next/static/`): 32 berkas, **1,260.54 KB (~1.23 MB raw)**.
  - JavaScript (`.js`): 20 berkas, 944.52 KB.
  - Web Fonts (`.woff2`): 11 berkas, 259.65 KB.
  - CSS Stylesheet (`.css`): 1 berkas, 56.37 KB.
* **Optimasi Khusus**:
  - Visualisasi menggunakan SVG native sehingga project tidak memerlukan dependency charting eksternal seperti Chart.js atau Recharts.
  - Delay animasi stagger dibatasi maksimal 150ms untuk menjamin fluiditas antarmuka.
  - React Compiler secara otomatis menyematkan memoization pada build time.

*Laporan analisis performa lengkap dapat dibaca pada [Performance Analysis](./performance-analysis.md).*

> **Catatan Pengukuran**: Angka bundle/build pada laporan merupakan hasil pengukuran saat proses development/verification dan tidak menyertakan folder `.next` pada source archive. Pengukuran runtime browser seperti FCP, LCP, TBT, CLS, dan Speed Index belum diverifikasi secara otomatis dan dapat dilakukan menggunakan Chrome Lighthouse.

---

## 9. Pemetaan SRS ke Komponen UI

Seluruh 16 Kebutuhan Fungsional (FR 01 hingga FR 16) dari dokumen spesifikasi kebutuhan sistem telah dipetakan secara akurat ke komponen UI nyata pada project ini.

*Tabel matriks pemetaan lengkap dan terperinci dapat dilihat pada [Matrix SRS vs UI Component](./matriks-srs-ui-component.md).*

---

## 10. Panduan Menjalankan Project

### Prasyarat
* **Node.js**: Versi 18.17.0+ atau 20+ (direkomendasikan Node.js v24 LTS).
* **Package Manager**: `pnpm` (disarankan sesuai lockfile `pnpm-lock.yaml`) atau `npm`.

### Langkah Instalasi & Menjalankan

1. **Instal Dependensi**:
   ```bash
   pnpm install
   # atau jika menggunakan npm:
   npm install
   ```

2. **Menjalankan Server Pengembangan (Dev Mode)**:
   ```bash
   pnpm run dev
   # atau:
   npm run dev
   ```
   Aplikasi akan berjalan secara lokal di [http://localhost:3000](http://localhost:3000).

3. **Menjalankan Pengecekan Tipe TypeScript**:
   ```bash
   pnpm run typecheck
   # atau:
   npm run typecheck
   ```
   *(Menjalankan `tsc --noEmit` dalam strict mode, memastikan 0 type error).*

4. **Menjalankan Pemeriksaan Kode (ESLint)**:
   ```bash
   pnpm run lint
   # atau:
   npm run lint
   ```
   *(Menjalankan ESLint 10 dengan konfigurasi Next.js, memastikan 0 lint error).*

5. **Membangun Bundle Produksi**:
   ```bash
   pnpm run build
   # atau:
   npm run build
   ```

6. **Menjalankan Server Produksi**:
   ```bash
   pnpm run start
   # atau:
   npm run start
   ```

---

## 11. Status Verifikasi Akhir Modul 5

Berdasarkan audit kode sumber dan hasil build/tooling yang tersedia, implementasi utama Modul 5 telah memenuhi persyaratan teknis dan dokumentasi yang ditetapkan:

| Kebutuhan Modul 5 | Hasil | Bukti Verifikasi |
|---|---|---|
| **React 19** | **PASS** | `react: 19.2.4` pada `package.json` |
| **React Compiler** | **PASS** | `reactCompiler: true` pada `next.config.mjs` & `babel-plugin-react-compiler` |
| **3 UI Modules** | **PASS** | `app/(app)/dashboard/`, `app/(app)/input/`, `app/(app)/hasil/` |
| **State/Reactivity** | **PASS** | Primitif React 19 (`useState`, `useContext`, `useMemo`, `useCallback`) tanpa library eksternal |
| **Form Validation** | **PASS** | Validasi client-side di auth, input analisis, dropzone format/size |
| **Async API** | **PASS** | `lib/api.ts`, route handlers `/api/analyses` & `/api/hasil` dengan error retry |
| **Loading/Error/Empty** | **PASS** | Komponen `LoadingState`, `ErrorState`, `EmptyState` pada `components/ui/states.tsx` |
| **Reusable Components** | **PASS** | Primitif UI pada `components/ui/` dan komponen terisolasi pada `components/app/` |
| **SRS Matrix** | **PASS** | Pemetaan FR 01–FR 16 pada [Matrix SRS vs UI Component](./matriks-srs-ui-component.md) |
| **Performance Analysis** | **PASS** | Pengukuran aset produksi fisik dan audit kode pada [Performance Analysis](./performance-analysis.md) (metrik runtime browser `[NOT VERIFIED]` direkomendasikan via Chrome Lighthouse) |
| **ESLint** | **PASS** | `pnpm run lint` menghasilkan 0 error dan 0 warning |
| **TypeScript** | **PASS** | `pnpm run typecheck` (`tsc --noEmit`) menghasilkan 0 error tanpa tipe `any` |
| **Production Build** | **PASS** | `pnpm run build` berhasil dalam 9.2s dengan 10 rute statis |
