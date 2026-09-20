# HISTORICAL DOCUMENT — LEGACY BASELINE
> **STATUS:** HISTORICAL DOCUMENT / LEGACY BASELINE — NOT CURRENT SOURCE OF TRUTH.  
> Current architecture has been fully migrated to Next.js 16 App Router production-grade with PostgreSQL persistence, real mathematical engines, and pluggable AI providers.

---

# SRS vs Front-End Alignment Matrix (Legacy Baseline)

| Requirement | Implementasi front-end (Legacy) |
| --- | --- |
| FR01 Registrasi & Login | `app/login/page.tsx`, `app/register/page.tsx`, `components/auth/auth-form.tsx`, `lib/auth.tsx` |
| FR02 Input Data Manual | `app/(app)/input/page.tsx` |
| FR03 Upload CSV | `components/app/file-dropzone.tsx`, `app/(app)/input/page.tsx` |
| FR04 Upload Excel | `components/app/file-dropzone.tsx`, `app/(app)/input/page.tsx` |
| FR05 Validasi Data | `app/(app)/input/page.tsx`, `components/auth/auth-form.tsx` |
| FR06 Pemilihan Jenis Analisis | `app/(app)/input/page.tsx` |
| FR07 Statistik Deskriptif | `lib/types.ts`, `app/(app)/hasil/page.tsx` |
| FR08 Uji t | `lib/types.ts`, `app/(app)/hasil/page.tsx` |
| FR09 Korelasi | `lib/types.ts`, `app/(app)/hasil/page.tsx` |
| FR10 Regresi Sederhana | `lib/types.ts`, `app/(app)/hasil/page.tsx` |
| FR11 Interpretasi AI (mock) | `app/api/hasil/route.ts`, `app/(app)/hasil/page.tsx` |
| FR12 Generasi Narasi (mock) | `app/api/hasil/route.ts`, `app/(app)/hasil/page.tsx` |
| FR13 Generasi Visualisasi (mock) | `components/app/scatter-chart.tsx`, `app/(app)/hasil/page.tsx` |
| FR14 Generasi Contoh Kasus (mock) | `app/api/hasil/route.ts`, `app/(app)/hasil/page.tsx` |
| FR15 Melihat Hasil Analisis | `app/(app)/hasil/page.tsx`, `lib/api.ts` |
| FR16 Melihat Riwayat Analisis | `app/(app)/dashboard/page.tsx`, `app/api/analyses/route.ts`, `lib/analysis-store.tsx` |

## Catatan scope lama (Arsip Historis)

Implementasi awal sebelum migrasi sengaja berbasis front-end dengan mock authentication, mock API, dan mock result. Arsitektur produksi aktual saat ini menggunakan Next.js 16 App Router dengan route handlers BFF, PostgreSQL database adapter, dan mesin statistik murni teruji.
