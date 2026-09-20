# Modul 7: State Management Modern (Zustand + TanStack Query v5 + Zod)
## Statistics Story AI

Dokumen ini menyajikan panduan arsitektur dan dokumentasi komprehensif implementasi **Modul 7** pada proyek web **Statistics Story AI**. Fokus Modul 7 adalah modernisasi arsitektur state management melalui pemisahan tanggung jawab tegas (*strict separation of concerns*) antara **Client UI State** dan **Server State**.

---

## 1. Tujuan & Filosofi Arsitektur Modul 7

Sebelum Modul 7, data domain riwayat analisis dan interaktivitas UI dikelola menggunakan React Context global (`AnalysisProvider`). Pola tersebut memiliki kelemahan:
1. Menyebabkan *unnecessary re-renders* di seluruh sub-komponen saat state diperbarui.
2. Tidak memiliki *caching layer*, *stale-while-revalidate*, atau manajemen deduping request HTTP.
3. Mencampurkan data server dengan preferensi UI lokal.

Modul 7 menyelesaikan masalah ini dengan mengadopsi tatanan arsitektur modern:
- **Client UI State** ➔ **Zustand** (`lib/stores/ui-store.ts`)
- **Server State & Caching** ➔ **TanStack Query v5** (`@tanstack/react-query`)
- **Runtime Schema Validation** ➔ **Zod** (`zod@^3.24.2`)

---

## 2. Struktur Modul & File yang Terlibat

```text
lib/
├── stores/
│   └── ui-store.ts                     # [ZUSTAND] Store khusus 5 atribut Client UI State
├── queries/
│   ├── use-analyses-query.ts           # [QUERY] Hook entitas riwayat analisis (stale: 2m, gc: 15m)
│   ├── use-hasil-query.ts              # [QUERY] Hook entitas hasil interpretasi AI (stale: 10m, gc: 30m)
│   └── use-analysis-mutations.ts       # [MUTATION] Create, Update, Delete dengan query invalidation
├── api.ts                              # Fetcher REST API dengan runtime safeParse Zod
├── validation.ts                       # Skema Zod untuk form boundary dan response API
└── mock-data.ts                        # In-memory mock server state untuk simulasi mutasi

components/
├── providers/
│   └── query-provider.tsx              # [CLIENT] QueryClientProvider untuk subtree aplikasi
├── dashboard/
│   └── dashboard-client-view.tsx       # Terhubung ke Zustand (filter/search) & TanStack (data/mutasi)
├── analysis-input/
│   └── analysis-input-form.tsx         # Terhubung ke useCreateAnalysisMutation & Zod validation
└── analysis-result/
    └── hasil-query-view.tsx            # Client Component leaf pemanggil useAnalysisResultQuery

app/
├── (app)/
│   └── layout.tsx                      # Membungkus subtree terproteksi dengan QueryProvider
└── api/
    ├── analyses/
    │   ├── route.ts                    # GET & POST handler REST API
    │   └── [id]/route.ts               # PATCH & DELETE handler REST API
    └── hasil/
        └── route.ts                    # GET handler hasil analisis dengan query id dinamis
```

---

## 3. Fitur Utama yang Diimplementasikan

### 3.1. Zustand Client UI Store (`lib/stores/ui-store.ts`)
Mengelola 5 atribut UI murni:
1. `isSidebarOpen`: Visibilitas drawer navigasi mobile (di `AppShell`).
2. `selectedAnalysisFilter`: Filter kategori aktif pada dasbor.
3. `analysisSearchQuery`: Query string pencarian analisis pada dasbor.
4. `isAnalysisFormOpen`: Status buka/tutup modal form analisis.
5. `editingAnalysisId`: Pointer ID analisis yang sedang diedit.
*Aturan: Menggunakan precise selectors individual (`useUIStore(s => s.prop)`) dan zero server data.*

### 3.2. TanStack Query v5 Server State
- **Entity 1 (Analyses)**: `['analyses']`, `staleTime: 2m`, `gcTime: 15m`.
- **Entity 2 (Hasil Analisis)**: `['hasil', id]`, `staleTime: 10m`, `gcTime: 30m`.
- **Mutations & Invalidation**: `useCreateAnalysisMutation`, `useUpdateAnalysisMutation`, dan `useDeleteAnalysisMutation` yang secara otomatis menjalankan `queryClient.invalidateQueries({ queryKey: ['analyses'] })`.

### 3.3. Zod Runtime Response Validation
Setiap data dari REST API diparsing dengan `.safeParse()` sebelum masuk ke cache TanStack Query, menjamin integritas tipe pada waktu kompilasi maupun waktu runtime.

### 3.4. Async UX & Status States
- **Pending/Loading**: Menampilkan indikator loading dan mematikan tombol (`disabled`) saat mutasi berlangsung.
- **Error**: Menampilkan banner error interaktif dengan tombol coba lagi (*retry*).
- **Feedback**: Menggunakan `Toast` untuk notifikasi sukses/gagal mutasi tanpa memuat ulang (*reload*) halaman browser.

---

## 4. Indeks Dokumentasi Modul 7

1. [`state-separation-matrix.md`](./state-separation-matrix.md) — Matriks perbandingan Client UI State vs Server State.
2. [`zustand-audit.md`](./zustand-audit.md) — Audit store Zustand, 5 atribut UI, dan selector presisi.
3. [`tanstack-query-audit.md`](./tanstack-query-audit.md) — Audit query key, stale/gc times, dan mutasi data.
4. [`zod-validation.md`](./zod-validation.md) — Dokumentasi skema form dan REST response runtime validation.
5. [`verification-report.md`](./verification-report.md) — Laporan pengujian aktual dan verifikasi kepatuhan seluruh aspek.

---

## 5. Instruksi Verifikasi

Jalankan perintah berikut di terminal:

```bash
# 1. Linting ESLint
npm run lint

# 2. Strict Typecheck TypeScript
npm run typecheck

# 3. Production Build Next.js 16 (Turbopack)
npm run build
```
