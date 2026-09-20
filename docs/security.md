# Security Hardening & Authorization Architecture

Dokumen ini mendokumentasikan implementasi keamanan, enkripsi kata sandi, proteksi sesi, Content Security Policy (CSP), dan mitigasi kerentanan pada Statistics Story AI.

---

## 1. Authentication & Credential Storage (NFR01)

- **Password Hashing:**
  - Password di-hash menggunakan algoritma **bcrypt** (`bcryptjs`) dengan cost factor `10`.
  - Password mentah (plaintext) **tidak pernah disimpan** di database, in-memory store, log, ataupun dikembalikan ke client browser.
- **Session Protection:**
  - Stateless cryptographic token berbasis HMAC-SHA256 (`src/lib/auth/session.ts`).
  - Cookie atribut:
    - `HttpOnly: true` (mencegah akses melalui JavaScript/XSS).
    - `Secure: process.env.NODE_ENV === 'production'` (hanya ditransmisikan lewat HTTPS di produksi).
    - `SameSite: 'lax'` (mitigasi Cross-Site Request Forgery / CSRF).
    - `Path: '/'`.
    - `Max-Age: 604800` (7 hari, bounded expiration).
- **User Identity Extraction:**
  - Server route handlers **menolak secara mutlak** parameter `id_pengguna` atau `userId` yang dikirimkan oleh payload client body atau query params.
  - Identitas user selalu diekstrak dari session terverifikasi: `session.userId`.

---

## 2. Content Security Policy (CSP) & Security Headers

Dikonfigurasikan di `next.config.ts`:

```typescript
const cspDirectives = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-eval' 'unsafe-inline'",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "font-src 'self' https://fonts.gstatic.com data:",
  "img-src 'self' data: blob: https:",
  "connect-src 'self' https://generativelanguage.googleapis.com https://api.openai.com",
  "frame-ancestors 'none'",
  "form-action 'self'",
  "base-uri 'self'",
  "object-src 'none'",
]
```

Header keamanan tambahan yang diterapkan:
- `X-Frame-Options: DENY` (Anti-Clickjacking).
- `X-Content-Type-Options: nosniff` (Mencegah MIME-type sniffing).
- `Referrer-Policy: strict-origin-when-cross-origin`.
- `Permissions-Policy: camera=(), microphone=(), geolocation=()`.

---

## 3. SQL Injection & Database Transaction Protection

- **Parameterized Queries:** Seluruh interaksi PostgreSQL di `PostgresAdapter` menggunakan query parameterized standar `$1, $2, ...`, meniadakan risiko SQL Injection.
- **Atomicity:** Operasi penyimpanan data analisis, dataset, hasil statistik, narasi, visualisasi, dan contoh kasus dibungkus dalam `BEGIN ... COMMIT` dengan rollback otomatis jika terjadi kegagalan.

---

## 4. Input Sanitization & File Upload Guard

- **Generic Layer A Validation:**
  - File size limit: maksimal 10.000 baris dataset untuk prototipe akademik.
  - Validasi tipe MIME file (`.csv`, `.xlsx`, `.xls`).
  - Penolakan karakter berbahaya, nilai NaN, dan Infinity.
- **Analysis-Specific Layer B Validation:**
  - Menolak input regresi atau korelasi dengan varians nol (degenerate variance).
  - Menolak uji-t jika jumlah kelompok kategorikal tidak tepat 2.

---

## 5. Security Status & Vulnerability Scanning Separation

Secara arsitektural dan metodologis, repositori membedakan secara tegas antara bukti implementasi kontrol keamanan (*Security Implementation Evidence*) dan hasil pemindaian kerentanan (*Vulnerability Scan Status*):

### 5.1 Security Implementation Evidence — VERIFIED
Kontrol keamanan internal terbukti aktif dan teruji melalui implementasi kode dan automated tests:
1. **Password Hashing:** Bcrypt cost factor 10 ([session.ts](file:///d:/statistics-story-final-legit/src/lib/auth/session.ts), diuji di [login-register.test.ts](file:///d:/statistics-story-final-legit/tests/auth/login-register.test.ts)).
2. **Session Integrity:** HMAC-SHA256 signed stateless cookie dengan flag `HttpOnly`, `SameSite=lax`.
3. **Anti-IDOR Authorization:** Ownership check server-side menolak akses ke data analisis pengguna lain ([result-ownership.test.ts](file:///d:/statistics-story-final-legit/tests/security/result-ownership.test.ts)).
4. **SQL Injection Immunity:** Seluruh query PostgreSQL menggunakan parameterized statements (`$1, $2, ...`).
5. **Request Schema Validation:** Seluruh payload masuk divalidasi ketat menggunakan Zod schemas di batas API route handler.

*Wording Status:* **Security controls verified by implementation and automated tests**.

### 5.2 Vulnerability Scan Status — NOT VERIFIED / PENDING EXTERNAL TOOL EXECUTION
1. **SonarQube Scanner & Quality Gate:**
   - Konfigurasi `sonar-project.properties` tersedia (**CONFIGURED**).
   - Eksekusi scan aktual dan evaluasi Quality Gate berstatus **NOT VERIFIED / PENDING EXTERNAL TOOL EXECUTION** karena membutuhkan server SonarQube aktif dan `SONAR_TOKEN`.
2. **Dependency SAST Audit:**
   - Repositori tidak mengklaim "0 critical vulnerabilities" secara sepihak tanpa bukti scanner formal. Pemindaian dependensi penuh merupakan bagian dari pipeline CI/CD pasca-koneksi remote.
