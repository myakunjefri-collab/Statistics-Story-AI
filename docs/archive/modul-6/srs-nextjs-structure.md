# Matriks Penyelarasan SRS / SKPL ke Struktur Next.js App Router
## Modul 6 — Statistics Story AI

Dokumen ini memetakan seluruh 16 Kebutuhan Fungsional (*Functional Requirements* — FR01 s.d. FR16) dari spesifikasi kebutuhan sistem (SRS/SKPL) ke dalam arsitektur rute Next.js App Router, file implementasi, dan klasifikasi komponen (RSC vs Client Component).

---

## 1. Matriks Keterlacakan Kebutuhan Fungsional (FR01 – FR16)

| ID SRS | Deskripsi Kebutuhan Fungsional | Rute URL | File Komponen Utama | Tipe Komponen | Status Implementasi |
| :---: | :--- | :--- | :--- | :---: | :---: |
| **FR01** | **Landing Page & Editorial Overview**<br>Menampilkan pengenalan masalah, solusi, cara kerja, dan fitur AI. | `/` | `app/page.tsx`<br>`components/scenes/*.tsx` | **RSC** (100% Page & Seksi)<br>**Client** (Leaf Motion) | ✅ Terverifikasi |
| **FR02** | **Navigasi Global & Responsif**<br>Navigasi sticky dengan active link indicator dan mobile drawer. | `/` | `components/navbar.tsx`<br>`components/footer.tsx` | **Client** (Navbar)<br>**RSC** (Footer) | ✅ Terverifikasi |
| **FR03** | **Autentikasi Pengguna (Login & Register)**<br>Pendaftaran akun, login berbasis sesi, dan persistensi cookie. | `/login`<br>`/register` | `app/login/page.tsx`<br>`app/register/page.tsx`<br>`components/auth/auth-form.tsx` | **RSC** (Pages)<br>**Client** (AuthForm Leaf) | ✅ Terverifikasi |
| **FR04** | **Proteksi Rute Aplikasi (Session Proxy)**<br>Pencegahan akses rute privat tanpa sesi aktif via cookie. | `/dashboard`<br>`/input`<br>`/hasil/*` | `proxy.ts`<br>`lib/auth.tsx` | **Server Edge** (`proxy.ts`)<br>**Client Context** (`auth.tsx`) | ✅ Terverifikasi |
| **FR05** | **Dasbor Manajemen Analisis**<br>Ringkasan metrik statistik (Total, Selesai, Diproses) dan riwayat. | `/dashboard` | `app/(app)/dashboard/page.tsx`<br>`components/dashboard/dashboard-summary.tsx` | **RSC** (Page, Layout, Summary, Skeleton)<br>**Client** (View) | ✅ Terverifikasi |
| **FR06** | **Streaming SSR & Skeleton Loading**<br>Rendering progresif data analisis dasbor dengan Suspense boundary. | `/dashboard` | `app/(app)/dashboard/page.tsx`<br>`components/dashboard/dashboard-skeleton.tsx` | **RSC** (Streaming Server Component) | ✅ Terverifikasi |
| **FR07** | **Pencarian & Penyaringan Analisis**<br>Filter kategori metode statistik dan pencarian nama analisis secara real-time. | `/dashboard` | `components/dashboard/analysis-filters.tsx`<br>`components/dashboard/dashboard-client-view.tsx` | **RSC** (Filter Bar Presentation)<br>**Client** (Filter State) | ✅ Terverifikasi |
| **FR08** | **Input Data Manual**<br>Pemasukan data angka secara manual melalui form textarea dengan validasi tipe data. | `/input` | `components/analysis-input/analysis-input-form.tsx`<br>`lib/validation.ts` | **Client** (Form Leaf)<br>**Server Logic** (`validation.ts`) | ✅ Terverifikasi |
| **FR09** | **Unggah Berkas Data (CSV & Excel)**<br>Fitur drag-and-drop file dataset tabular dengan ekstraksi kolom otomatis. | `/input` | `components/app/file-dropzone.tsx`<br>`components/analysis-input/data-source-section.tsx` | **Client** (Dropzone Leaf)<br>**RSC** (Section Wrapper) | ✅ Terverifikasi |
| **FR10** | **Validasi Integritas Data (Server Boundary)**<br>Pemeriksaan kecukupan sampel, tipe numerik, dan parameter validasi. | `/input`<br>`/api/*` | `lib/validation.ts`<br>`components/analysis-input/analysis-input-form.tsx` | **Server Boundary Module** | ✅ Terverifikasi |
| **FR11** | **Pemilihan Metode Analisis Statistik**<br>Seleksi Deskriptif, Uji t, Korelasi Pearson, dan Regresi Linier. | `/input` | `components/analysis-input/method-selector.tsx`<br>`components/analysis-input/analysis-input-form.tsx` | **RSC** (Method Cards)<br>**Client** (Selection Controller) | ✅ Terverifikasi |
| **FR12** | **Kalkulasi & Komputasi Statistik**<br>Perhitungan Mean, SD, t-statistic, koefisien korelasi r, R², dan p-value. | `/hasil`<br>`/hasil/[id]` | `components/analysis-result/statistics-grid.tsx`<br>`lib/server-api.ts` | **RSC** (Grid Display & Data Provider) | ✅ Terverifikasi |
| **FR13** | **Visualisasi Grafik Data Otomatis**<br>Penyajian visual SVG native responsif (Bar, Scatter, Regression line). | `/hasil`<br>`/hasil/[id]` | `components/analysis-result/visualization-panel.tsx`<br>`components/app/scatter-chart.tsx` | **RSC** (Panel Wrapper)<br>**Client** (Interactive Scatter) | ✅ Terverifikasi |
| **FR14** | **Penyusunan Narasi & Interpretasi AI**<br>Konversi angka statistik menjadi penjelasan tekstual ilmiah yang mudah dipahami. | `/hasil`<br>`/hasil/[id]` | `components/analysis-result/narrative-card.tsx`<br>`components/analysis-result/copy-narrative-button.tsx` | **RSC** (Narrative Card)<br>**Client** (Copy Button Leaf) | ✅ Terverifikasi |
| **FR15** | **Penyajian Contoh Kasus Kontekstual**<br>Pemberian analogi dan contoh kasus kehidupan nyata relevan dengan hasil. | `/hasil`<br>`/hasil/[id]` | `components/analysis-result/example-case-card.tsx` | **RSC** (Card Presentation) | ✅ Terverifikasi |
| **FR16** | **Metadata Dinamis & Optimasi Rute**<br>Penyajian title dan OpenGraph dinamis per ID analisis untuk aksesibilitas dan SEO. | `/hasil/[id]` | `app/(app)/hasil/[id]/page.tsx` (`generateMetadata`) | **RSC** (Metadata API & Page Component) | ✅ Terverifikasi |

---

## 2. Analisis Struktur Rute App Router

### 2.1. Hirarki URL Publik
- `/` — Landing Page promosi dan edukasi Statistics Story AI.
- `/login` — Portal login pengguna dengan verifikasi kredensial.
- `/register` — Pendaftaran akun pengguna baru.

### 2.2. Hirarki Rute Terproteksi `(app)`
Grup rute `(app)` tidak menambah segmen pada URL namun mengelompokkan layout tingkat 2:
- `/dashboard` — Halaman utama manajemen riwayat analisis statistik pengguna.
- `/input` — Formulir komprehensif pemasukan data manual maupun unggah berkas.
- `/hasil` — Halaman ringkasan hasil analisis terkini.
- `/hasil/[id]` — Halaman rincian dinamis analisis spesifik berdasarkan parameter ID unik.

---

## 3. Kesimpulan Penyelarasan

Seluruh kebutuhan fungsional (FR01–FR16) telah terpetakan dan diimplementasikan secara utuh di dalam arsitektur Next.js 16 App Router. Tidak ada fitur yang terdegradasi dari Modul 5; sebaliknya, fungsionalitas ditingkatkan dengan:
- Eksekusi rendering server-side yang cepat (RSC 75,8%).
- Proteksi rute edge yang tangguh (`proxy.ts`).
- Pengalaman transisi instan melalui Suspense dan nested layout bertingkat.
