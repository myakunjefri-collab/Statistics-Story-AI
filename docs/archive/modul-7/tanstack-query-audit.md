# Audit Implementasi TanStack Query v5: Server State & Cache Management
## Modul 7 — Statistics Story AI

Dokumen ini mendokumentasikan implementasi **TanStack Query v5** (`@tanstack/react-query`) pada proyek **Statistics Story AI** untuk mengelola data server, strategi caching, siklus hidup asinkron, dan mutasi data terotomatisasi.

---

## 1. Provider & Konfigurasi Klien

- **Komponen Provider**: `QueryProvider` (`components/providers/query-provider.tsx`)
- **Penempatan**: Dibungkus pada `app/(app)/layout.tsx` (hanya subtree rute privat yang membutuhkan query, menjaga root layout tetap Server Component).
- **Default Options**:
  ```typescript
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  }
  ```

---

## 2. Entitas Query #1: Analyses (Riwayat Analisis)

- **Custom Hook**: `useAnalysesQuery({ initialData, enabled })` (`lib/queries/use-analyses-query.ts`)
- **Query Key**: `['analyses']` (`ANALYSES_QUERY_KEY`)
- **Endpoint REST**: `GET /api/analyses`
- **Fungsi Fetcher**: `fetchAnalyses()` di `lib/api.ts` (divalidasi dengan Zod `analysesResponseSchema`)
- **Cache Strategy**:
  - **`staleTime`**: `2 menit` (120.000 ms) — Riwayat analisis cukup stabil namun pengguna membutuhkan kesegaran data ketika terjadi mutasi atau navigasi lintas dasbor.
  - **`gcTime`**: `15 menit` (900.000 ms) — Menyimpan riwayat analisis di memori saat pengguna berpindah ke halaman input atau hasil.
- **Penanganan Status UI**:
  - **Loading**: Mengaktifkan `fase: 'loading'` yang merender animasi skeleton placeholder (`DashboardSkeleton`).
  - **Error**: Mengaktifkan `fase: 'error'` dengan tombol retry yang memanggil `refetch()`.
  - **Empty**: Merender `EmptyState` jika `analyses.length === 0`.
  - **Data Ready**: Merender `AnalysisList` dengan filter dan search real-time.

---

## 3. Entitas Query #2: Hasil Analisis (Interpretasi Statistik & Narasi AI)

- **Custom Hook**: `useAnalysisResultQuery({ id, initialData, enabled })` (`lib/queries/use-hasil-query.ts`)
- **Query Key**: `id ? ['hasil', id] : ['hasil']`
- **Endpoint REST**: `GET /api/hasil` atau `GET /api/hasil?id=[id]`
- **Fungsi Fetcher**: `fetchHasil(id)` di `lib/api.ts` (divalidasi dengan Zod `hasilResponseSchema`)
- **Cache Strategy**:
  - **`staleTime`**: `10 menit` (600.000 ms) — Hasil perhitungan statistik dan narasi AI bersifat deterministik dan sangat stabil untuk dataset yang sama.
  - **`gcTime`**: `30 menit` (1.800.000 ms) — Hasil analisis disimpan lama di cache agar pengguna dapat berpindah antar-tab tanpa proses re-fetch ulang.
- **Penanganan Status UI** (di `components/analysis-result/hasil-query-view.tsx`):
  - **Loading**: Merender `LoadingState` dengan label *"Memuat interpretasi statistik dan narasi AI..."*.
  - **Error**: Merender `ErrorState` dengan tombol coba lagi yang mengeksekusi `refetch()`.
  - **Success / Hydrated**: Menampilkan `ResultSummary` dan `HasilDetailTabs` secara instan.

---

## 4. Mutasi Data: REST Endpoints & Otomatisasi Invalidation

Seluruh mutasi didefinisikan pada `lib/queries/use-analysis-mutations.ts` menggunakan `useMutation` dan secara otomatis menginvalidasi query `['analyses']`:

### 4.1. Create Analysis (`useCreateAnalysisMutation`)
- **Fungsi Eksekusi**: `createAnalysis(values)` (`POST /api/analyses`)
- **Validasi Input**: Zod `quickAnalysisSchema.safeParse(body)` di sisi server.
- **Validasi Output**: Zod `singleAnalysisResponseSchema.safeParse(response)` di fetcher.
- **Efek Pasca-Sukses**:
  ```typescript
  onSuccess: () => {
    queryClient.invalidateQueries({ queryKey: ANALYSES_QUERY_KEY })
  }
  ```
- **Komponen Pengguna**: `components/analysis-input/analysis-input-form.tsx` dan modal dialog dasbor.

### 4.2. Update Analysis (`useUpdateAnalysisMutation`)
- **Fungsi Eksekusi**: `updateAnalysis(id, values)` (`PATCH /api/analyses/[id]`)
- **Validasi Input**: Zod `quickAnalysisSchema.safeParse(body)` di sisi server.
- **Efek Pasca-Sukses**: Otomatis `queryClient.invalidateQueries({ queryKey: ANALYSES_QUERY_KEY })`.
- **Komponen Pengguna**: `components/dashboard/dashboard-client-view.tsx` saat mengedit rekaman analisis.

### 4.3. Delete Analysis (`useDeleteAnalysisMutation`)
- **Fungsi Eksekusi**: `deleteAnalysis(id)` (`DELETE /api/analyses/[id]`)
- **Efek Pasca-Sukses**: Otomatis `queryClient.invalidateQueries({ queryKey: ANALYSES_QUERY_KEY })`.
- **Komponen Pengguna**: `components/dashboard/dashboard-client-view.tsx` saat mengonfirmasi penghapusan rekaman.
