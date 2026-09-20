# Production Deployment & Environment Guide

Dokumen ini mendokumentasikan panduan deployment produksi (target: Vercel / Cloudflare), variabel lingkungan (environment variables), migrasi database, dan prosedur smoke test.

---

## 1. Production Target & Runtime Environment

- **Deployment Platform:** Vercel
- **Server Runtime:** Node.js (untuk kompatibilitas penuh driver `pg`, `bcryptjs`, dan parsing Excel `xlsx`)
- **Static Asset Delivery:** Vercel Global Edge CDN
- **Public URL Status:** `NOT YET DEPLOYED` (dijalankan saat kredensial production disediakan).

---

## 2. Environment Variables Configuration

| Variable | Scope | Requirement | Description |
|---|---|---|---|
| `DATABASE_URL` | Server Only | Required (Production) | PostgreSQL connection URI (e.g. Neon, Supabase, AWS RDS) |
| `SESSION_SECRET` | Server Only | Required | Secret key 32+ bytes untuk tanda tangan HMAC-SHA256 cookie auth |
| `AI_PROVIDER` | Server Only | Optional (default: `fallback`) | Nilai: `fallback`, `gemini`, atau `openai` |
| `AI_API_KEY` | Server Only | Required if AI external | Secret API key dari Google AI Studio atau OpenAI |
| `NEXT_PUBLIC_APP_URL` | Client & Server | Optional | Public canonical domain URL |

> [!CAUTION]
> **Aturan Keamanan Variabel Lingkungan:**
> JANGAN PERNAH menambahkan prefix `NEXT_PUBLIC_` ke `DATABASE_URL`, `SESSION_SECRET`, atau `AI_API_KEY`. Variabel tersebut WAJIB berstatus Server-Only untuk mencegah kebocoran kredensial ke client browser.

---

## 3. Database Migration Runbook

Migrasi database dikelola secara terpisah dan **TIDAK** dijalankan secara implisit pada setiap incoming request:

```bash
# Menjalankan migrasi DDL pada target PostgreSQL
pnpm run db:migrate
```

File migrasi:
- `database/migrations/001_initial_schema.sql` (7 PDM entities: `pengguna`, `analisis`, `dataset_input`, `hasil_statistik`, `narasi_interpretasi`, `visualisasi`, `contoh_kasus`).

---

## 4. Production Smoke Test Procedure

Setelah deployment Vercel selesai, lakukan pengujian 10 langkah berikut:

1. **GET `/`** $\to$ HTTP 200 (Landing page merender seluruh 11 adegan editorial).
2. **GET `/api/health`** $\to$ HTTP 200 (`{"status":"ok","database":"ok"}`).
3. **Register Akun Baru:** Buat akun mahasiswa disposable via `/register`.
4. **Login:** Masuk dengan email & kata sandi yang baru dibuat via `/login`.
5. **Session Verification:** Pastikan cookie `auth_session` bertipe `HttpOnly`, `Secure`, dan `SameSite=Lax`.
6. **Eksekusi Analisis Nyata:** Unggah berkas CSV/Excel atau input manual pada `/input`, pilih jenis analisis, klik Mulai Analisis.
7. **Halaman Hasil (`/hasil/[id]`):** Pastikan satu halaman memuat 4 pilar lengkap: angka statistik, narasi interpretatif, visualisasi grafik, dan contoh kasus analogi.
8. **Visualisasi Responsif:** Verifikasi grafik SVG tampil tanpa layout shift.
9. **Isolasi Riwayat:** Buka `/riwayat`, pastikan hanya riwayat milik user aktif yang muncul.
10. **Akses Tidak Terautentikasi:** Coba akses `/api/analyses` tanpa cookie auth $\to$ verifikasi respons HTTP 401.
