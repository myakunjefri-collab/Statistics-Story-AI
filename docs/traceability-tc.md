# Traceability Matrix: Test Cases (TC01–TC12)
## Source of Truth: SKPL / SRS Statistics Story AI Version 1.0 (Tabel 8.3 Rencana Pengujian)

Dokumen ini memetakan seluruh 12 Test Case fungsional sesuai dengan teks, skenario, input, dan output asli pada dokumen SKPL/SRS resmi (Tabel 8.3) tanpa rekayasa semantik.

Kolom **Derived Relation (Hubungan Turunan)** merupakan relasi turunan rekayasa perangkat lunak untuk kebutuhan penelusuran teknis, bukan mapping resmi yang tertulis langsung pada SRS.

---

| Test Case ID | Skenario Pengujian Asli (SRS Tabel 8.3) | Input Asli (SRS Tabel 8.3) | Output yang Diharapkan Asli (SRS Tabel 8.3) | Derived Relation (Hubungan Turunan) | File Uji Otomatis | Kategori Pengujian | Status Verifikasi |
|:---:|---|---|---|:---:|---|---|:---:|
| **TC-01** | Login dengan data valid | Email & kata sandi benar | Masuk ke dashboard | FR 01 | `tests/auth/login-register.test.ts` | Integration / Unit | **VERIFIED** |
| **TC-02** | Login dengan data tidak valid | Kata sandi salah | Pesan error muncul | FR 01 | `tests/auth/login-register.test.ts` | Integration / Unit | **VERIFIED** |
| **TC-03** | Upload berkas CSV valid | Berkas CSV dengan format sesuai | Data berhasil divalidasi dan disimpan | FR 03, FR 05 | `tests/integration/tc03-csv-upload-persistence.test.ts`, `tests/input/file-parsing.test.ts` | Integration / Validation | **VERIFIED** |
| **TC-04** | Upload berkas tidak valid | Berkas dengan format tidak didukung (mis. .pdf) | Pesan error format tidak didukung | FR 03, FR 04, FR 05 | `tests/integration/tc04-unsupported-format.test.ts`, `tests/input/file-parsing.test.ts` | Integration / Boundary | **VERIFIED** |
| **TC-05** | Input data manual | Data numerik lengkap sesuai form | Data tersimpan dan siap dianalisis | FR 02, FR 05 | `tests/integration/tc05-manual-input-persistence.test.ts`, `tests/input/file-parsing.test.ts` | Integration / Form | **VERIFIED** |
| **TC-06** | Analisis statistik deskriptif | Dataset numerik | Nilai mean, median, modus, std. deviasi tampil benar | FR 07 | `tests/statistics/descriptive.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | Pure Math Engine | **VERIFIED** |
| **TC-07** | Analisis uji-t | Dua kelompok data numerik | Nilai t dan p-value tampil sesuai perhitungan | FR 08 | `tests/statistics/t-test.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | Pure Math Engine | **VERIFIED** |
| **TC-08** | Analisis korelasi | Dua variabel numerik | Koefisien korelasi tampil sesuai perhitungan | FR 09 | `tests/statistics/correlation.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | Pure Math Engine | **VERIFIED** |
| **TC-09** | Analisis regresi sederhana | Variabel bebas & terikat numerik | Koefisien regresi dan R² tampil sesuai perhitungan | FR 10 | `tests/statistics/regression.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | Pure Math Engine | **VERIFIED** |
| **TC-10** | Generasi narasi AI | Hasil statistik valid | Narasi interpretatif relevan dengan hasil ditampilkan | FR 11, FR 12, FR 14 | `tests/ai/provider.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | AI Schema & Provider | **VERIFIED** |
| **TC-11** | Generasi visualisasi | Hasil statistik valid | Grafik sesuai jenis analisis ditampilkan | FR 13 | `tests/visualization/chart-rendering.test.tsx`, `tests/visualization/chart-mapping.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | UI & Chart Rendering | **VERIFIED** |
| **TC-12** | Penanganan error layanan AI | Layanan AI tidak merespons (timeout) | Pesan error informatif, sistem tidak crash | NFR 05, FR 11 | `tests/ai/fallback-timeout.test.ts`, `tests/ai/provider.test.ts`, `tests/integration/calculate-result-roundtrip.test.ts` | Resilience / Fallback Orchestrator | **VERIFIED** |

---

## Bukti Eksekusi Pengujian Otomatis

1. Penomoran dan teks kolom `Skenario Pengujian`, `Input`, dan `Output yang Diharapkan` bersumber langsung dari naskah SKPL/SRS Version 1.0 (Tabel 8.3).
2. Status **`VERIFIED`** telah diverifikasi secara aktual melalui eksekusi command:
   ```bash
   pnpm run test:coverage
   ```
   dengan hasil 24 file uji berhasil dieksekusi (100%), 106 tes lolos (0 gagal), statement coverage 86.32%, branch coverage 71.37%, dan function coverage 90.21%.
