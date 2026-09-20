# Technical Implementation Decisions: Statistics Story AI

Dokumen ini mencatat seluruh keputusan rekayasa (*Technical Implementation Decisions*) yang diambil ketika dokumen sumber (SKPL/SRS Version 1.0, Brief 14 Bab, atau Rencana & Kontrak) tidak menentukan detail teknis secara spesifik.

Sesuai aturan hierarki otoritas: Keputusan ini **bukan kebutuhan SRS eksplisit**, melainkan keputusan arsitektur dan rekayasa perangkat lunak untuk memastikan sistem stabil, aman, dan dapat diuji.

---

## 1. Spesifikasi Mesin Komputasi Statistik

### 1.1 Varian Uji t (t-Test)
- **Sumber SKPL**: FR 08 hanya menyatakan *"Sistem menghitung nilai uji t beserta p-value untuk membandingkan dua kelompok data"*. SRS tidak menentukan apakah uji t adalah Student's t-test (varians sama) atau Welch's t-test (varians berbeda), maupun arah uji (*one-tailed* vs *two-tailed*).
- **Keputusan Teknis**:
  - Ditetapkan **Two-tailed Independent Welch's t-test (unequal variance)** sebagai metode default sistem.
  - Alasan: Welch's t-test adalah standar statistik komputasi modern yang lebih tangguh (*robust*) terhadap pelanggaran asumsi homogenitas varians ($s_1^2 \ne s_2^2$).
  - Derajat kebebasan (*degrees of freedom*) dihitung via persamaan Welch–Satterthwaite.
  - Perhitungan $p$-value dihitung dua arah (*two-tailed*) berbasis Regularized Incomplete Beta Function $I_x(a, b)$.
  - Opsi *Student's pooled t-test* didukung jika parameter `equal_variance: true` diberikan.

### 1.2 Standar Deviasi (Descriptive Statistics)
- **Sumber SKPL**: FR 07 mencantumkan *"standar deviasi"*.
- **Keputusan Teknis**:
  - Default: **Sample Standard Deviation** dengan koreksi Bessel (penyebut $n - 1$):
    $$s = \sqrt{\frac{1}{n-1}\sum (x_i - \bar{x})^2}$$
  - Standar deviasi populasi ($\sigma$, penyebut $n$) juga disediakan dalam model hasil sebagai data pelengkap.

### 1.3 Penanganan Kasus Khusus (Zero Variance & Degenerasi)
- **Korelasi**: Jika salah satu variabel konstan ($\sum (x - \bar{x})^2 = 0$), $r$ tidak terdefinisi secara matematis. Sistem menolak dengan pesan error informatif dan status HTTP 422: `"Varians data bernilai nol; korelasi tidak dapat dihitung"`.
- **Regresi**: Jika seluruh $X$ identik, kemiringan (*slope*) garis vertikal tidak terdefinisi. Sistem menolak dengan error informatif HTTP 422: `"Varians variabel independen (X) bernilai nol; garis regresi linier vertikal tidak dapat dimodelkan"`.

### 1.4 Toleransi Uji Komparasi Floating-Point
- **Sumber Kontrak**: Kontrak menyebut target *"deviasi 0% / hasil identik terhadap acuan"*.
- **Keputusan Teknis**:
  - Untuk perbandingan biner IEEE-754 lintas runtime (JavaScript V8 vs Python SciPy 1.11+), komparasi menggunakan ambang batas toleransi error relatif $\le 10^{-6}$ dan pembulatan tampilan 4 angka desimal.
  - Toleransi teknis internal ini digunakan untuk pengujian otomatis agar tidak gagal akibat presisi biner mikro floating-point.

---

## 2. Arsitektur & Deployment

### 2.1 Pilihan Runtime Produksi: Vercel (Node.js Serverless)
- **Sumber Brief**: Brief menyebutkan platform Edge Cloud *"Vercel / Cloudflare Workers"*.
- **Keputusan Teknis**:
  - Dikunci pada **Vercel** dengan **Node.js Serverless Runtime**.
  - Alasan: Driver PostgreSQL `pg.Pool` memerlukan koneksi TCP socket murni dan pustaka `bcryptjs` bekerja optimal di runtime Node.js. Vercel menyediakan Global Edge CDN untuk pengiriman aset statis dan early route interception `proxy.ts`, sementara Server Components dan Route Handlers dieksekusi pada Node.js Serverless Functions.

### 2.2 Pilihan API Boundary: BFF Route Handlers
- **Sumber Brief**: Bab 12 menyebut *"arsitektur RESTful API terparameter atau End-to-End Type-Safe Data Layer (tRPC/oRPC) dengan pola Backend for Frontend (BFF)"*.
- **Keputusan Teknis**:
  - Menggunakan **Next.js App Router Route Handlers (`app/api/*`)** sebagai layer BFF resmi.
  - Server Actions diposisikan sebagai fitur sekunder/opsional, sedangkan seluruh operasi inti (Auth, Calculate, AI, History, Health) menggunakan Route Handlers agar mempermudah pengujian otomatis Vitest, isolasi status HTTP, dan kepatuhan terhadap standar REST.

### 2.3 Desain Autentikasi Sesi Kriptografis
- **Sumber SKPL**: NFR 01 menyatakan *"Sistem menerapkan autentikasi login dan enkripsi kata sandi (hashing, mis. bcrypt)"*.
- **Keputusan Teknis**:
  - Menggunakan token sesi bertanda tangan kriptografis HMAC-SHA256 yang disimpan dalam cookie `HttpOnly; SameSite=Lax; Secure; Path=/; Max-Age=604800`.
  - Server memvalidasi tanda tangan token dan mengekstrak `userId`. Server tidak mempercayai `user_id` yang dikirim dari payload client untuk mencegah eskalasi hak akses / IDOR.
