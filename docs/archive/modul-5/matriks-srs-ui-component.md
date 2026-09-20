# Matriks SRS vs UI Component — Statistics Story AI

## Pemetaan Functional Requirement ke Komponen UI

| SRS ID | Requirement | UI Component | File Terkait | Status | Penjelasan |
|---|---|---|---|---|---|
| **FR 01** | Registrasi & Login | `AuthForm`, `AuthLayout` | `components/auth/auth-form.tsx`, `app/login/page.tsx`, `app/register/page.tsx` | ✅ Implemented | Formulir autentikasi lengkap dengan validasi field (email regex, password min 8 karakter, konfirmasi password, nama lengkap), loading state berputar, error feedback kontekstual, dan mock session via `sessionStorage`. Auth context di `lib/auth.tsx`. |
| **FR 02** | Input Data Manual | `MethodSelector`, `DataSourceSection`, `InputPage` | `components/analysis-input/method-selector.tsx`, `components/analysis-input/data-source-section.tsx`, `app/(app)/input/page.tsx` | ✅ Implemented | Antarmuka pemilihan metode manual ("Input Manual") dengan textarea khusus data tabular CSV/koma, validasi baris minimum, serta feedback error visual jika data belum diisi. |
| **FR 03** | Upload File CSV | `FileDropzone`, `DataSourceSection`, `InputPage` | `components/app/file-dropzone.tsx`, `components/analysis-input/data-source-section.tsx`, `app/(app)/input/page.tsx` | ✅ Implemented | Drag & drop dropzone interaktif dengan validasi format ekstensi (`.csv`) dan ukuran berkas (maksimal 5 MB). Menampilkan nama berkas, ukuran, dan tombol ganti berkas. |
| **FR 04** | Upload File Excel | `FileDropzone`, `DataSourceSection`, `InputPage` | `components/app/file-dropzone.tsx`, `components/analysis-input/data-source-section.tsx`, `app/(app)/input/page.tsx` | ✅ Implemented | Mendukung penuh format lembar sebar Excel (`.xlsx` dan `.xls`) melalui dropzone yang sama dengan validasi ukuran dan penolakan format di luar ketentuan. |
| **FR 05** | Validasi Data | `AnalysisInfoFields`, `DataSourceSection`, `FileDropzone`, `AuthForm` | `components/analysis-input/analysis-info-fields.tsx`, `components/analysis-input/data-source-section.tsx`, `components/app/file-dropzone.tsx`, `components/auth/auth-form.tsx` | ✅ Implemented | Validasi client-side komprehensif: nama analisis minimal 3 karakter, pengecekan format/ukuran berkas, pencegahan submit saat data kosong, format email regex, dan penonaktifan tombol submit saat proses async. |
| **FR 06** | Pemilihan Jenis Analisis | `AnalysisInfoFields`, `AnalysisFormDialog`, `Select` | `components/analysis-input/analysis-info-fields.tsx`, `components/app/analysis-form-dialog.tsx`, `components/ui/select.tsx` | ✅ Implemented | Komponen select dropdown yang mendukung 4 kategori uji statistik: Statistik Deskriptif, Uji t, Korelasi, dan Regresi. Digunakan baik pada halaman pembuatan baru maupun dialog ubah analisis di dasbor. |
| **FR 07** | Analisis Statistik Deskriptif | `ResultSummary`, `StatisticsGrid`, Type `JenisAnalisis` | `components/analysis-result/result-summary.tsx`, `components/analysis-result/statistics-grid.tsx`, `lib/types.ts`, `app/(app)/hasil/page.tsx` | ✅ Implemented | Tipe analisis 'Deskriptif' terintegrasi pada model domain dan UI hasil untuk menyajikan metrik pemusatan data (mean, median, standar deviasi). |
| **FR 08** | Analisis Uji t | `ResultSummary`, `StatisticsGrid`, Type `JenisAnalisis` | `components/analysis-result/result-summary.tsx`, `components/analysis-result/statistics-grid.tsx`, `lib/types.ts`, `app/(app)/hasil/page.tsx` | ✅ Implemented | Tipe analisis 'Uji t' terintegrasi pada model domain untuk menyajikan perbandingan kelompok (t-score, df, p-value, signifikansi). |
| **FR 09** | Analisis Korelasi | `ResultSummary`, `StatisticsGrid`, Type `JenisAnalisis` | `components/analysis-result/result-summary.tsx`, `components/analysis-result/statistics-grid.tsx`, `lib/types.ts`, `app/(app)/hasil/page.tsx` | ✅ Implemented | Tipe analisis 'Korelasi' menyajikan metrik Pearson r, p-value, signifikansi, dan koefisien determinasi R². |
| **FR 10** | Analisis Regresi Sederhana | `ResultSummary`, `VisualizationPanel`, `ScatterChart`, Type `JenisAnalisis` | `components/analysis-result/result-summary.tsx`, `components/analysis-result/visualization-panel.tsx`, `components/app/scatter-chart.tsx`, `lib/types.ts` | ✅ Implemented | Tipe analisis 'Regresi' menyajikan persamaan linear least-squares ($Y = a + bX$), garis tren otomatis pada grafik, dan evaluasi kekuatan model prediktif. |
| **FR 11** | Pemrosesan AI / Interpretasi | Route Handler `/api/hasil`, `lib/mock-data.ts` | `app/api/hasil/route.ts`, `lib/mock-data.ts`, `lib/api.ts` | ✅ Implemented (Mock API) | Endpoint asynchronous yang menyimulasikan pemrosesan interpretasi hasil statistik dengan latensi jaringan realistis, terstruktur rapi untuk siap diganti dengan integrasi AI riil. |
| **FR 12** | Generasi Narasi | `NarrativeCard`, `HasilPage` | `components/analysis-result/narrative-card.tsx`, `app/(app)/hasil/page.tsx` | ✅ Implemented (Mock AI) | Narasi ilmiah ramah mahasiswa dalam bahasa Indonesia yang disajikan dalam card tipografi editorial bernuansa navy, dilengkapi fitur interaktif salin ke papan klip (*copy to clipboard*). |
| **FR 13** | Generasi Visualisasi | `VisualizationPanel`, `ScatterChart` | `components/analysis-result/visualization-panel.tsx`, `components/app/scatter-chart.tsx` | ✅ Implemented | Visualisasi diagram sebar (scatter plot) berbasis SVG native tanpa dependensi charting pihak ketiga yang berat. Dilengkapi garis tren linier otomatis, label sumbu X & Y, grid halus, dan animasi titik data. |
| **FR 14** | Generasi Contoh Kasus | `ExampleCaseCard`, `HasilPage` | `components/analysis-result/example-case-card.tsx`, `app/(app)/hasil/page.tsx` | ✅ Implemented (Mock AI) | Penyajian analogi dan studi kasus konkret dunia nyata yang mengontekstualisasikan angka statistik ke dalam skenario kehidupan akademik/profesional. |
| **FR 15** | Melihat Hasil Analisis | `HasilPage`, `ResultSummary`, `NarrativeCard`, `StatisticsGrid`, `VisualizationPanel`, `ExampleCaseCard` | `app/(app)/hasil/page.tsx`, `components/analysis-result/*`, `lib/api.ts` | ✅ Implemented | Halaman hasil komprehensif dengan 4 kartu metrik utama, tab navigasi interaktif (Narasi, Statistik, Visualisasi, Contoh Kasus), serta status loading dan error dengan opsi reload/retry. |
| **FR 16** | Melihat Riwayat Analisis | `DashboardPage`, `DashboardSummary`, `AnalysisFilters`, `AnalysisList`, `AnalysisFormDialog`, `ConfirmDialog` | `app/(app)/dashboard/page.tsx`, `components/dashboard/*`, `components/app/*`, `lib/analysis-store.tsx` | ✅ Implemented | Dasbor riwayat interaktif: 3 kartu ringkasan data, filter kategori instan, input pencarian live, kartu item dengan status badge, animasi transisi baris, aksi dialog tambah/ubah data, dan dialog konfirmasi hapus permanen. |

---

## Struktur Hirarki Komponen Hasil Refactor

```text
Page Level (Route Handlers)
├── app/(app)/dashboard/page.tsx
│   ├── components/dashboard/dashboard-summary.tsx
│   ├── components/dashboard/analysis-filters.tsx
│   ├── components/dashboard/analysis-list.tsx
│   ├── components/app/analysis-form-dialog.tsx
│   └── components/app/confirm-dialog.tsx
│
├── app/(app)/input/page.tsx
│   ├── components/analysis-input/analysis-info-fields.tsx
│   ├── components/analysis-input/data-source-section.tsx
│   │   ├── components/analysis-input/method-selector.tsx
│   │   └── components/app/file-dropzone.tsx
│   └── components/ui/button.tsx
│
└── app/(app)/hasil/page.tsx
    ├── components/analysis-result/result-summary.tsx
    ├── components/analysis-result/narrative-card.tsx
    ├── components/analysis-result/statistics-grid.tsx
    ├── components/analysis-result/visualization-panel.tsx
    │   └── components/app/scatter-chart.tsx
    ├── components/analysis-result/example-case-card.tsx
    └── components/ui/tabs.tsx
```

---

## Komponen Primitif & Shared yang Mendukung Seluruh Modul

| Komponen Shared | Lokasi File | Peran & Penggunaan di FR |
|---|---|---|
| `LoadingState` | `components/ui/states.tsx` | Indikator tunggu fetch async (FR 01, FR 15, FR 16) |
| `ErrorState` | `components/ui/states.tsx` | Tampilan alert kegagalan & tombol retry (FR 01, FR 15, FR 16) |
| `EmptyState` | `components/ui/states.tsx` | Tampilan kondisi riwayat/hasil kosong (FR 16) |
| `StatusBadge` | `components/app/status-badge.tsx` | Indikator status analisis: Selesai, Diproses, Draf (FR 16) |
| `FileDropzone` | `components/app/file-dropzone.tsx` | Komponen seret & lepas berkas data CSV/Excel (FR 03, FR 04) |
| `ScatterChart` | `components/app/scatter-chart.tsx` | Grafik SVG native titik sebar & regresi linier (FR 10, FR 13) |
| `Button` | `components/ui/button.tsx` | Primitif tombol varian primer, outline, ghost, icon (Semua FR) |
| `Card` | `components/ui/card.tsx` | Kontainer visual dengan varian default, interactive, navy (FR 07–FR 16) |
| `Badge` | `components/ui/badge.tsx` | Label aksen kategori dan metadata (FR 06, FR 07–FR 10, FR 16) |
| `Dialog` | `components/ui/dialog.tsx` | Modal popup untuk formulir cepat dan konfirmasi hapus (FR 06, FR 16) |
| `Input`, `Textarea`, `Label` | `components/ui/input.tsx` | Kontrol form dengan dukungan atribut aksesibilitas WAI-ARIA (FR 01–FR 06) |
| `Select` | `components/ui/select.tsx` | Dropdown pemilihan opsi kategori (FR 06) |
| `Toast` | `components/ui/toast.tsx` | Notifikasi umpan balik sukses/gagal di pojok layar (FR 01, FR 02–FR 06, FR 16) |
| `Tabs` | `components/ui/tabs.tsx` | Pengalih tampilan tab Narasi, Statistik, Visualisasi, Kasus (FR 12–FR 15) |
