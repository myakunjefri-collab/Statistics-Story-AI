# Data Processing & Storage Architecture

Dokumen ini mendokumentasikan model data ternormalisasi (Normalized Dataset Model), mesin parsing berkas (CSV, Excel xlsx/xls, Manual), validasi data bertingkat (Layer A & Layer B), serta skema 7 entitas PDM PostgreSQL.

---

## 1. Normalized Dataset Model

Untuk menyatukan berbagai format sumber data masukan (CSV, berkas Excel, atau formulir manual), sistem menggunakan model data ternormalisasi (`NormalizedDataset`):

```typescript
export interface NormalizedColumn {
  name: string
  isNumeric: boolean
  values: (number | null)[]
  rawValues: string[]
  missingCount: number
}

export interface NormalizedDataset {
  name: string
  headers: string[]
  columns: NormalizedColumn[]
  rowCount: number
  columnCount: number
  rawRows: string[][]
}
```

---

## 2. Ingestion Engines

1. **CSV Parser (`src/lib/data-processing/csv-parser.ts`):**
   - Mendeteksi delimiter otomatis (koma `,`, titik koma `;`, tab `\t`).
   - Menangani quoted values dengan spasi atau tanda koma di dalam teks.
   - Menghilangkan baris kosong dan membersihkan whitespace.
2. **Excel Parser (`src/lib/data-processing/excel-parser.ts`):**
   - Mendukung format `.xlsx` (OpenXML) dan `.xls` (Legacy BIFF) via library `xlsx`.
   - Mengambil sheet data pertama secara otomatis.
   - Memvalidasi konsistensi baris dan header kolom.
3. **Manual Tabular Parser (`src/lib/data-processing/manual-parser.ts`):**
   - Mendukung format data tabular sederhana berpembatas koma atau tab:
     ```
     jam_belajar,nilai
     2,60
     4,75
     6,85
     ```
   - Mendukung format single-column list (satu angka per baris).

---

## 3. Two-Layer Validation Engine

- **Layer A (Generic Tabular Validation):**
  - Pemeriksaan kelengkapan baris dan kolom.
  - Batas maksimum baris (maksimal 10.000 baris untuk prototipe akademik).
  - Pengecekan adanya minimal 1 kolom numerik yang valid.
  - Peringatan untuk nilai kosong (*missing values*).
- **Layer B (Analysis-Specific Validation):**
  - **Deskriptif:** Membutuhkan minimal 1 kolom numerik, ukuran sampel $N \ge 1$.
  - **Uji t:** Membutuhkan tepat 2 kelompok kategorikal independen dan masing-masing kelompok memiliki minimal 2 observasi numerik.
  - **Korelasi:** Membutuhkan 2 variabel numerik berpasangan dengan panjang sama, minimal 3 pasangan data, dan menolak data dengan varians nol (*degenerate variance*).
  - **Regresi:** Membutuhkan 1 variabel independen (X) dan 1 variabel dependen (Y), minimal 3 observasi berpasangan, dan menolak jika varians variabel X bernilai nol.

---

## 4. PostgreSQL Relational Schema (7 Entities)

Struktur tabel sesuai Physical Data Model (PDM) SKPL/SRS:

1. **`pengguna`:** ID Pengguna (PK), Nama, Email (UNIQUE), Password Hash (bcrypt), Peran (`mahasiswa` / `dosen`), Created At.
2. **`analisis`:** ID Analisis (PK), ID Pengguna (FK $\to$ `pengguna`), Jenis Analisis (`Deskriptif`, `Uji t`, `Korelasi`, `Regresi`), Nama Analisis, Tanggal, Status (`Selesai`, `Diproses`, `Draf`), Created At.
3. **`dataset_input`:** ID Dataset (PK), ID Analisis (FK $\to$ `analisis`), Nama File, Format Data (`csv`, `xlsx`, `manual`), Data Konten [JSONB], Sumber Input, Created At.
4. **`hasil_statistik`:** ID Hasil (PK), ID Analisis (FK $\to$ `analisis`), Jenis Uji, Nilai Statistik [JSONB], P-Value, Created At.
5. **`narasi_interpretasi`:** ID Narasi (PK), ID Hasil (FK $\to$ `hasil_statistik`), Bahasa, Isi Narasi, Sumber Narasi (`ai` / `fallback`), Tanggal Generate.
6. **`visualisasi`:** ID Visual (PK), ID Hasil (FK $\to$ `hasil_statistik`), Jenis Grafik (`bar`, `histogram`, `scatter`, `regression`), Data Grafik [JSONB], Created At.
7. **`contoh_kasus`:** ID Kasus (PK), ID Hasil (FK $\to$ `hasil_statistik`), Deskripsi Kasus, Bahasa, Created At.

---

## 5. Canonical Result Contract & Visualization Normalization

Untuk mengatasi inkonsistensi lama di mana database menyimpan objek majemuk sementara client mengharapkan array, kontrak hasil analisis telah dibakukan menggunakan Zod Discriminated Union:

### 5.1 Canonical Visualization Schema (`src/lib/validation.ts`)
```typescript
export const visualizationDataSchema = z.discriminatedUnion('kind', [
  // Deskriptif: Histogram
  z.object({
    kind: z.literal('histogram'),
    values: z.array(z.number()),
    bins: z.array(histogramBinSchema).optional(),
  }),
  // Uji t: Bar Comparison
  z.object({
    kind: z.literal('bar'),
    groups: z.array(z.object({
      groupName: z.string(),
      mean: z.number(),
      sd: z.number().optional(),
      n: z.number().optional(),
    })),
  }),
  // Korelasi & Regresi: Scatter (+ Trendline)
  z.object({
    kind: z.literal('scatter'),
    points: z.array(z.object({ x: z.number(), y: z.number() })),
    trendline: z.object({
      slope: z.number(),
      intercept: z.number(),
      rSquared: z.number().optional(),
    }).optional(),
  }),
])
```

### 5.2 Aliran Data End-to-End
```
Dataset Input (CSV / Excel / Manual)
    ↓
Layer A & Layer B Validation
    ↓
Pure Mathematical Engine (Deskriptif / Uji t / Korelasi / Regresi)
    ↓
AI Orchestration (External LLM Provider / Transparent Fallback)
    ↓
Atomic PostgreSQL Transaction (7 Entities)
    ↓
GET /api/hasil (Session & User-Scoped Ownership Check)
    ↓
Domain Normalizers (normalizeVisualization, normalizeStatisticalValues)
    ↓
Strict Zod Validation (hasilResponseSchema.parse)
    ↓
HasilQueryView (Single continuous page, FR15)
    ↓
Chart Rendering (HistogramChart / BarComparisonChart / RegressionChart / ScatterChart)
```
- **Ketepatan Data:** Komponen grafik tidak lagi memiliki mock fallback data, semata-mata merender data aktual atau menampilkan accessible `EmptyState`.
- **Ketepatan Statistik:** Nilai statistik diformat secara deterministik tanpa kebocoran `[object Object]`, `NaN`, atau `undefined`.

