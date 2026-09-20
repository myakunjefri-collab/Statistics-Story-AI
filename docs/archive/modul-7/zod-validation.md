# Validasi Skema Zod & Boundary Integrity
## Modul 7 — Statistics Story AI

Dokumen ini menjelaskan implementasi **Zod** (`zod@^3.24.2`) sebagai lapisan validasi tipe runtime (*runtime type boundary*) pada aplikasi **Statistics Story AI**, mencakup skema formulir masukan, skema response REST API, integrasi TypeScript (`z.infer`), dan penanganan error.

---

## 1. Arsitektur Validasi Boundary

Zod memastikan bahwa data yang melewati batas sistem (*system boundaries*) teruji validitasnya secara ketat sebelum diteruskan ke state management maupun layer rendering:

```text
[Form Input / User Action] ──> [Zod Input Validation] ──> [useMutation / POST/PATCH]
                                                                  │
                                                                  ▼
[TanStack Query Cache / UI] <── [Zod Response Validation] <── [REST API Response]
```

---

## 2. Definisi Skema Validasi (di `lib/validation.ts`)

### 2.1. Skema Formulir Masukan Pengguna
- **`analysisInputSchema`**:
  Memvalidasi masukan komprehensif pada formulir `components/analysis-input/analysis-input-form.tsx`:
  - `nama`: `z.string().trim().min(3)`
  - `jenisAnalisis`: `z.enum(['Deskriptif', 'Uji t', 'Korelasi', 'Regresi'])`
  - `metode`: `z.enum(['unggah', 'tempel'])`
  - `.superRefine`: Memeriksa ekstensi file (`.csv`, `.xlsx`, `.xls`) dan ukuran file ($\le 5\text{ MB}$) untuk metode unggah, atau panjang teks minimal 10 karakter untuk metode tempel.
  - Tipe inferred: `export type AnalysisInputPayload = z.infer<typeof analysisInputSchema>`

- **`quickAnalysisSchema`**:
  Memvalidasi masukan ringkas pada modal dialog penambahan/pengubahan di dasbor:
  - `nama`: `z.string().trim().min(3)`
  - `jenisAnalisis`: `jenisAnalisisSchema`
  - `status`: `statusAnalisisSchema`
  - Tipe inferred: `export type QuickAnalysisInput = z.infer<typeof quickAnalysisSchema>`

### 2.2. Skema Response REST API
- **`analysesResponseSchema`**:
  Memvalidasi format payload `GET /api/analyses` (`{ data: Analisis[], message: string }`).
- **`singleAnalysisResponseSchema`**:
  Memvalidasi format payload `POST /api/analyses` dan `PATCH /api/analyses/[id]` (`{ data: Analisis, message: string }`).
- **`deleteAnalysisResponseSchema`**:
  Memvalidasi format payload `DELETE /api/analyses/[id]` (`{ data: { id: string }, message: string }`).
- **`hasilResponseSchema`**:
  Memvalidasi struktur rekursif hasil analisis statistik dari `GET /api/hasil`:
  - `nilai`: Array `nilaiStatistikSchema` (label, nilai, keterangan)
  - `narasi`: Objek narasi bahasa dan isi teks
  - `visualisasi`: Objek tipe grafik (`scatter`, `bar`, `line`), data koordinat `[{ x, y }]`, serta label sumbu X dan Y.
  - `contohKasus`: Objek deskripsi kasus kehidupan nyata
  - Tipe inferred: `export type HasilResponse = z.infer<typeof hasilResponseSchema>`

---

## 3. Implementasi Runtime Validation di `lib/api.ts`

Alih-alih mengandalkan *unsafe type assertion* (`as T`), seluruh fetcher mengeksekusi metode `.safeParse()`:

```typescript
export async function fetchAnalyses(options?: { fail?: boolean }): Promise<Analisis[]> {
  const query = options?.fail ? '?fail=1' : ''
  const res = await fetch(`/api/analyses${query}`, { cache: 'no-store' })

  if (!res.ok) {
    const errorBody = await res.json().catch(() => null)
    throw new Error(errorBody?.message ?? 'Gagal mengambil riwayat analisis.')
  }

  const rawJson: unknown = await res.json()
  const validation = analysesResponseSchema.safeParse(rawJson)

  if (!validation.success) {
    throw new Error('Validasi skema REST response untuk riwayat analisis gagal.')
  }

  return validation.data.data
}
```

---

## 4. Penanganan Error Validasi pada Antarmuka

- **Form Boundary**: Error dipetakan ke field-field spesifik (`errors.nama`, `errors.data`) sehingga pengguna mendapatkan feedback inline instan tanpa kehilangan teks yang sudah diinput.
- **Dialog Boundary**: Pesan error pertama dari `result.error.issues[0]?.message` ditampilkan langsung di alert banner dialog modal.
- **Network / API Boundary**: Jika response server tidak memenuhi skema, error ditangkap oleh TanStack Query dan menampilkan `ErrorState` yang informatif dengan opsi `refetch`.
