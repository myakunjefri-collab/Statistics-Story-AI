# Performance Analysis — Modul 5

Dokumen ini menyajikan hasil analisis performa, audit kode sumber, dan pengukuran ukuran bundle untuk project **Statistics Story AI**. 

Setiap bagian diklasifikasikan secara transparan berdasarkan bukti:
* `[VERIFIED]`: Terbukti secara empiris melalui eksekusi perintah terminal dan pengukuran file fisik riil.
* `[SOURCE AUDIT]`: Terverifikasi melalui peninjauan statis struktur kode sumber (*code inspection*).
* `[NOT VERIFIED]`: Metrik yang tidak dapat diverifikasi secara otomatis pada lingkungan terminal ini dan membutuhkan pengujian manual di peramban pengguna.

---

## 1. Environment `[VERIFIED]`

* **React Version**: 19.2.4 (diverifikasi dari `package.json` dan lockfile)
* **Next.js Version**: 16.3.3
* **Bundler**: Turbopack (mode produksi melalui `next build`)
* **React Compiler**: `babel-plugin-react-compiler` 1.0.0 (`reactCompiler: true` pada `next.config.mjs`)
* **TypeScript**: 5.7.3 (strict mode, diverifikasi via `tsc --noEmit`)
* **Node.js Runtime**: v24.10.4 (x64 Windows)
* **Package Manager**: pnpm v12.3.4 (menggunakan `pnpm-lock.yaml`)
* **Build Mode**: Production build dengan Next.js/Turbopack

---

## 2. Production Build Result `[VERIFIED]`

Eksekusi perintah `pnpm run build` (`next build`) menghasilkan:

```text
▲ Next.js 16.3.3 (Turbopack)
✓ Running next.config.mjs took 32ms

  Creating an optimized production build ...
✓ Compiled successfully in 9.2s
  Running TypeScript ...
  Finished TypeScript in 4.5s ...
  Collecting page data using 11 workers ...
  Generating static pages using 11 workers (0/10) ...
  Generating static pages using 11 workers (2/10) 
  Generating static pages using 11 workers (4/10) 
  Generating static pages using 11 workers (7/10) 
✓ Generating static pages using 11 workers (10/10) in 1053ms
  Finalizing page optimization ...
```

### Status & Rute Terdaftar

| Parameter | Hasil | Keterangan |
|---|---|---|
| Status Kompilasi | **BERHASIL (Code 0)** | 0 Error, 0 Warning |
| Durasi Kompilasi Turbopack | 9.2 detik | Kecepatan kompilasi optimal |
| Validasi TypeScript | 4.5 detik | Strict type checking selesai |
| Prerendering Statis | 1.05 detik | 10 halaman statis selesai |

### Rute yang Dihasilkan
* `/` (○ Static) — Landing page
* `/_not-found` (○ Static) — Halaman 404
* `/api/analyses` (ƒ Dynamic) — API mock riwayat analisis
* `/api/hasil` (ƒ Dynamic) — API mock hasil analisis
* `/dashboard` (○ Static) — Dasbor riwayat analisis
* `/hasil` (○ Static) — Halaman hasil analisis
* `/input` (○ Static) — Formulir input & unggah data
* `/login` (○ Static) — Halaman autentikasi login
* `/register` (○ Static) — Halaman autentikasi register

---

## 3. Bundle Analysis `[VERIFIED]`

Pengukuran aktual dilakukan langsung terhadap file fisik yang dihasilkan di direktori `.next/static/` saat proses build produksi:

> **Catatan Pengukuran**: Angka bundle/build pada laporan merupakan hasil pengukuran saat proses development/verification dan tidak menyertakan folder .next pada source archive.

### Distribusi Ukuran File Berdasarkan Ekstensi

| Kategori | Ekstensi | Jumlah File | Ukuran Fisik Raw | Persentase |
|---|---|---|---|---|
| JavaScript Chunks | `.js` | 20 file | 944.52 KB (967,186 B) | 74.9% |
| Web Fonts (WOFF2) | `.woff2` | 11 file | 259.65 KB (265,884 B) | 20.6% |
| Stylesheet CSS | `.css` | 1 file | 56.37 KB (57,718 B) | 4.5% |
| **Total Static Assets** | — | **32 file** | **1,260.54 KB (~1.23 MB)** | **100.0%** |

### Top 10 Asset Terbesar

| Ukuran Raw | Nama File / Chunk | Estimasi Konten & Fungsi |
|---|---|---|
| 223.77 KB | `1ijh2cawer1bs.js` | React 19 core runtime + React DOM 19 |
| 156.17 KB | `0vybfwmqbouge.js` | Next.js 16 App Router runtime & client hydration |
| 135.14 KB | `1iw317lq4tars.js` | Motion (Framer Motion 13) animation library |
| 109.96 KB | `0cz1d0mv5g_q7.js` | Shared vendor modules & `@base-ui/react` primitives |
| 83.27 KB | `1bffadaabf893a1e-s...woff2` | Font web Inter (weight subset utama) |
| 71.93 KB | `1v2z5ep6rxvr1.js` | Shared application components & design tokens |
| 56.37 KB | `052997kacmmg5.css` | Compiled Tailwind CSS v4 stylesheet |
| 47.30 KB | `83afe278b6a6bb3c-s...woff2` | Font web Newsreader serif |
| 34.24 KB | `2olh_ohn6ah02.js` | Landing page scene components |
| 29.65 KB | `06o5pdsnke76p.js` | Form input & file dropzone logic |

---

## 4. React Component Performance Audit `[SOURCE AUDIT]`

Berdasarkan audit statis terhadap kode sumber:

1. **State Placement & Scope**:
   - State formulir (`nama`, `jenis`, `deskripsi`, `metode`, `file`, `pasted`, `errors`, `submitting`) diisolasi secara lokal pada `InputPage`, mencegah re-rendering pada tingkat root layout atau navbar.
   - Domain dataset dikelola terisolasi dalam `AnalysisProvider` yang hanya membungkus grup rute `(app)`, tidak membebani rute publik (`/`, `/login`, `/register`).
   - Notifikasi toast terisolasi di `ToastProvider` dengan timer individual.
2. **Component Isolation**:
   - Struktur komponen telah diisolasi berdasarkan tanggung jawab sehingga logic pencarian, filter, summary, dialog, dan daftar analisis terpisah dan lebih mudah dipelihara serta dianalisis terhadap potensi re-render.
   - `DashboardPage` didelegasikan ke `DashboardSummary`, `AnalysisFilters`, dan `AnalysisList`.
   - `InputPage` didelegasikan ke `AnalysisInfoFields` dan `DataSourceSection` (menaungi `MethodSelector` dan `FileDropzone`).
   - `HasilPage` didelegasikan ke `ResultSummary`, `NarrativeCard`, `StatisticsGrid`, `VisualizationPanel`, dan `ExampleCaseCard`.
3. **List Rendering & Keys**:
   - Riwayat analisis menggunakan `key={a.id}` (stabil dan unik).
   - Nilai statistik menggunakan `key={n.label}`.
   - Filter kategori menggunakan `key={f}`.
   - Tidak ada array index yang dijadikan `key` pada daftar data yang dapat dimutasi.
4. **Optimasi Komputasi Penurunan (*Derived State*)**:
   - Filter pencarian dan kategori di dasbor menggunakan `useMemo` sehingga tidak dihitung ulang apabila state yang tidak relevan berubah.
5. **Kesesuaian dengan React Compiler**:
   - React Compiler digunakan sebagai mekanisme optimasi utama untuk mencegah rendering ulang yang tidak perlu secara otomatis pada build time.
   - Kode sumber mematuhi sepenuhnya kaidah Rules of React (tanpa mutasi state langsung, tanpa hooks bersyarat), sehingga compiler dapat menyematkan memoization AST secara optimal saat kompilasi.

---

## 5. Runtime Performance Measurement `[NOT VERIFIED]`

Runtime browser measurement tidak dapat diverifikasi pada environment otomatis ini; pengukuran manual menggunakan Chrome Lighthouse direkomendasikan.

Metrik runtime browser yang belum diukur secara langsung:
* **First Contentful Paint (FCP)**: `[NOT VERIFIED]`
* **Largest Contentful Paint (LCP)**: `[NOT VERIFIED]`
* **Total Blocking Time (TBT)**: `[NOT VERIFIED]`
* **Cumulative Layout Shift (CLS)**: `[NOT VERIFIED]`
* **Speed Index**: `[NOT VERIFIED]`

> **Catatan Kejujuran Metrik**: Metrik Web Vitals sintetis seperti FCP, LCP, TBT, CLS, dan Speed Index tidak direkayasa dalam dokumen ini karena memerlukan eksekusi nyata pada lingkungan peramban Google Chrome dengan tampilan grafis (GUI) dan interaksi pengguna aktual.

---

## 6. Optimization Applied `[SOURCE AUDIT]` & `[VERIFIED]`

Perubahan nyata yang telah diterapkan pada source code:
1. **Pemisahan Tanggung Jawab Komponen**: Memecah 3 halaman monolitik menjadi 11 komponen terisolasi pada `components/dashboard/`, `components/analysis-input/`, dan `components/analysis-result/`.
2. **Visualisasi Native SVG**: Visualisasi menggunakan SVG native sehingga project tidak memerlukan dependency charting eksternal seperti Chart.js atau Recharts. Komponen `ScatterChart` dibangun murni menggunakan elemen `<svg>` dengan perhitungan garis tren linier least-squares sendiri.
3. **Pencegahan Double-Submission**: Seluruh tombol aksi async (login, register, create analysis) otomatis beralih ke status `disabled` dan menampilkan ikon animasi `Loader2` saat proses asinkron berlangsung.
4. **Pembersihan Error Reaktif**: Pesan validasi error pada input form otomatis dibersihkan saat pengguna mulai mengetik ulang (*on-input clear*).
5. **Capping Stagger Animation**: Waktu tunda transisi Framer Motion dibatasi maksimal 150 ms (`Math.min(i * 0.03, 0.15)`) agar tidak terjadi lagging visual pada data yang banyak.
6. **Strict TypeScript Mode**: Menghilangkan pengabaian error build (`ignoreBuildErrors`) sehingga seluruh kode terverifikasi tanpa tipe `any` melalui `tsc --noEmit`.

---

## 7. Limitations `[NOT VERIFIED]`

1. **Ketiadaan Browser Display Server**: Lingkungan CLI headless ini tidak memiliki browser display server untuk menjalankan audit performa visual Lighthouse secara otomatis.
2. **Ukuran Raw vs Transfer Size**: Total ukuran JavaScript sebesar 944.52 KB adalah ukuran uncompressed di disk. Pada server hosting produksi (Vercel, Cloudflare, Nginx) dengan kompresi gzip/Brotli aktif, ukuran transfer jaringan aktual diperkirakan berkurang menjadi sekitar 280–320 KB.

---

## 8. Conclusion

Berdasarkan audit source code dan hasil build/tooling yang tersedia, implementasi utama Modul 5 telah memenuhi persyaratan teknis dan dokumentasi yang ditetapkan. Pengukuran runtime browser seperti FCP, LCP, TBT, CLS, dan Speed Index belum diverifikasi secara otomatis dan dapat dilakukan menggunakan Chrome Lighthouse.

Ringkasan status verifikasi:
* **ESLint `[VERIFIED]`**: Lolos tanpa peringatan maupun error (`0 errors, 0 warnings`).
* **TypeScript `[VERIFIED]`**: Lolos pengecekan ketat tanpa tipe `any` (`0 errors`).
* **Production Build & Bundle `[VERIFIED]`**: Sukses mengompilasi seluruh rute dalam 9.2 detik dengan ukuran bundle wajar untuk aplikasi Next.js 16 + React 19 + Framer Motion (~1.23 MB uncompressed static assets saat build).
* **Arsitektur Komponen & Reusability `[SOURCE AUDIT]`**: Memenuhi standar keterpisahan tanggung jawab (*separation of concerns*) Modul 5 melalui pemecahan 11 komponen domain terisolasi.
* **Runtime Browser Performance `[NOT VERIFIED]`**: Metrik Core Web Vitals tidak diverifikasi secara otomatis pada headless environment ini dan direkomendasikan pengujian manual via Chrome Lighthouse.
