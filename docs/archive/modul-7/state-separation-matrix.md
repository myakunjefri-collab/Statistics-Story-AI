# Matriks Pemisahan State: Client UI State vs Server State
## Modul 7 — Statistics Story AI

Dokumen ini memetakan seluruh variabel dan manajemen state yang digunakan pada aplikasi **Statistics Story AI**. Arsitektur Modul 7 menerapkan pemisahan tanggung jawab yang ketat (*strict separation of concerns*) antara **Client UI State** (dikelola oleh **Zustand**), **Server State** (dikelola oleh **TanStack Query v5**), dan **Form Input State** (lokal React dengan validasi **Zod**).

---

## 1. Matriks Klasifikasi State Aplikasi

| State / Variabel | Jenis State | Library / Mekanisme | File / Komponen Utama | Alasan & Tanggung Jawab Arsitektural |
| :--- | :--- | :--- | :--- | :--- |
| **`isSidebarOpen`** | Client UI State | Zustand | `lib/stores/ui-store.ts`<br>`components/app/app-shell.tsx` | Mengontrol status buka/tutup mobile drawer navigasi secara responsif. Murni state presentasional klien. |
| **`selectedAnalysisFilter`** | Client UI State | Zustand | `lib/stores/ui-store.ts`<br>`components/dashboard/dashboard-client-view.tsx` | Menyimpan filter kategori aktif ('Semua', 'Deskriptif', 'Uji t', 'Korelasi', 'Regresi') untuk menyaring daftar tampilan dasbor. |
| **`analysisSearchQuery`** | Client UI State | Zustand | `lib/stores/ui-store.ts`<br>`components/dashboard/dashboard-client-view.tsx` | Menyimpan kata kunci pencarian teks pada dasbor untuk memfilter analisis berdasarkan nama secara instan. |
| **`isAnalysisFormOpen`** | Client UI State | Zustand | `lib/stores/ui-store.ts`<br>`components/dashboard/dashboard-client-view.tsx` | Mengontrol visibilitas modal dialog pembuatan/pengubahan analisis di dasbor. |
| **`editingAnalysisId`** | Client UI State | Zustand | `lib/stores/ui-store.ts`<br>`components/dashboard/dashboard-client-view.tsx` | Menyimpan identifier analisis yang sedang disunting dalam modal form (atau `null` jika membuat baru). |
| **`analyses` (Riwayat Analisis)** | Server State | TanStack Query v5 | `lib/queries/use-analyses-query.ts`<br>`components/dashboard/dashboard-client-view.tsx` | Data daftar riwayat analisis dari endpoint REST `GET /api/analyses`. Memiliki cache terstruktur dengan `staleTime: 2m` dan `gcTime: 15m`. |
| **`hasil` (Hasil Analisis & Narasi)** | Server State | TanStack Query v5 | `lib/queries/use-hasil-query.ts`<br>`components/analysis-result/hasil-query-view.tsx` | Data komputasi statistik, ringkasan metrik, narasi AI, dan visualisasi dari endpoint `GET /api/hasil`. `staleTime: 10m` dan `gcTime: 30m`. |
| **`createAnalysis` Mutation** | Server Mutation | TanStack Query v5 | `lib/queries/use-analysis-mutations.ts`<br>`components/analysis-input/analysis-input-form.tsx` | Mutasi asinkron `POST /api/analyses` untuk menambah analisis baru, mengotomatisasi `invalidateQueries(['analyses'])`. |
| **`updateAnalysis` Mutation** | Server Mutation | TanStack Query v5 | `lib/queries/use-analysis-mutations.ts`<br>`components/dashboard/dashboard-client-view.tsx` | Mutasi asinkron `PATCH /api/analyses/[id]` untuk memperbarui rekaman analisis dan menyinkronkan ulang cache query. |
| **`deleteAnalysis` Mutation** | Server Mutation | TanStack Query v5 | `lib/queries/use-analysis-mutations.ts`<br>`components/dashboard/dashboard-client-view.tsx` | Mutasi asinkron `DELETE /api/analyses/[id]` untuk menghapus rekaman dan membersihkan cache query. |
| **Input Form Values (`nama`, `jenis`, dll.)** | Form Input State | React `useState` + Zod | `components/analysis-input/analysis-input-form.tsx` | State sementara input formulir sebelum disubmit dan divalidasi dengan `analysisInputSchema.safeParse`. |
| **Delete Modal Transient State (`deleting`)** | Transient UI State | React `useState` | `components/dashboard/dashboard-client-view.tsx` | Menyimpan pointer item yang hendak dihapus untuk mengonfirmasi aksi di `ConfirmDialog`. |

---

## 2. Prinsip Pemisahan Arsitektur

```text
┌─────────────────────────────────────────────────────────────┐
│                      STATISTICS STORY AI                    │
└─────────────────────────────────────────────────────────────┘
                               │
       ┌───────────────────────┴───────────────────────┐
       ▼                                               ▼
┌──────────────────────────────┐        ┌──────────────────────────────┐
│       CLIENT UI STATE        │        │         SERVER STATE         │
│          (Zustand)           │        │     (TanStack Query v5)      │
├──────────────────────────────┤        ├──────────────────────────────┤
│ • isSidebarOpen              │        │ • ['analyses'] Cache         │
│ • selectedAnalysisFilter     │        │ • ['hasil', id] Cache        │
│ • analysisSearchQuery        │        │ • useCreateAnalysisMutation  │
│ • isAnalysisFormOpen         │        │ • useUpdateAnalysisMutation  │
│ • editingAnalysisId          │        │ • useDeleteAnalysisMutation  │
├──────────────────────────────┤        ├──────────────────────────────┤
│ Aturan:                      │        │ Aturan:                      │
│ - Murni interaktivitas UI    │        │ - Terhubung ke REST API      │
│ - Zero data server/API       │        │ - Divalidasi skema Zod       │
│ - Selector individual presisi│        │ - Invalidation otomatis      │
└──────────────────────────────┘        └──────────────────────────────┘
```

1. **Tidak Ada Penyimpanan Server Data di Zustand**:
   Zustand sama sekali tidak menyimpan array riwayat analisis, objek narasi AI, ataupun status loading/error request HTTP.
2. **Tidak Ada Global Context untuk State yang Dimigrasi**:
   `AnalysisProvider` yang sebelumnya memegang data `Analisis[]` telah sepenuhnya dihapus dari pohon komponen aplikasi.
3. **Data Turunan (*Derived State*)**:
   Penyaringan data (`filtered analyses`) dan metrik agregat (`counts`) dihitung secara langsung (*derived*) pada render loop melalui `useMemo` menggunakan data dari TanStack Query dan filter dari Zustand, tanpa menduplikasi data ke state baru.
