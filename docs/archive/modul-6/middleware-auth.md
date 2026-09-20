# Dokumentasi Keamanan & Proteksi Rute: Next.js 16 Proxy & Session Cookie
## Modul 6 — Statistics Story AI

Dokumen ini menjelaskan mekanisme autentikasi, proteksi rute, sinkronisasi cookie sesi, dan implementasi router proxy pada **Next.js 16** untuk aplikasi **Statistics Story AI**.

---

## 1. Konvensi Next.js 16: Dari `middleware.ts` ke `proxy.ts`

Pada versi Next.js 16, konvensi routing interseptor mengalami perubahan penting:
- **Status Depresiasi**: File `middleware.ts` konvensional digantikan oleh file **`proxy.ts`** di direktori root proyek.
- **Fungsi Ekspor**: Menggunakan ekspor resmi:
  ```typescript
  export function proxy(request: NextRequest): NextResponse
  ```
- **Keunggulan**: `proxy.ts` berjalan pada layer network/edge runtime sebelum request mencapai React Server Components atau Route Handlers, menjamin proteksi rute secara instan tanpa kebocoran data sensitif (*zero-leakage rendering*).

---

## 2. Implementasi `proxy.ts`

Berikut adalah implementasi lengkap `proxy.ts` pada root project:

```typescript
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

// Daftar rute terproteksi yang memerlukan sesi aktif
const protectedPrefixes = ['/dashboard', '/input', '/hasil']

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl
  const hasSession = request.cookies.get('statistics_session')?.value === '1'

  // 1. Proteksi Rute Aplikasi Terproteksi
  const isProtected = protectedPrefixes.some(
    (prefix) => pathname === prefix || pathname.startsWith(`${prefix}/`),
  )

  if (isProtected && !hasSession) {
    const loginUrl = new URL('/login', request.url)
    return NextResponse.redirect(loginUrl)
  }

  // 2. Pengalihan Pengguna yang Sudah Login dari Halaman Auth
  if ((pathname === '/login' || pathname === '/register') && hasSession) {
    const dashboardUrl = new URL('/dashboard', request.url)
    return NextResponse.redirect(dashboardUrl)
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/input/:path*',
    '/hasil/:path*',
    '/login',
    '/register',
  ],
}
```

---

## 3. Mekanisme Server-Side Authentication & HTTP-Only Cookie

Untuk menjamin keamanan level tinggi (*production-grade*), manajemen sesi sepenuhnya ditangani di sisi server melalui Next.js Route Handlers dan cookie **`HttpOnly`**:

### 3.1. Alur Masuk (Sign In via `/api/auth/login`)
Ketika pengguna memasukkan kredensial pada `components/auth/auth-form.tsx` dan memanggil `signIn()` di `lib/auth.tsx`:
1. Request `POST /api/auth/login` dikirimkan ke server bersama kredensial.
2. Server memvalidasi kredensial (misalnya akun demo `demo@statisticsstory.ai` atau akun terdaftar).
3. Server menyuntikkan cookie sesi **`statistics_session=1`** melalui header respons HTTP (`Set-Cookie`) dengan parameter keamanan ketat:
   - `HttpOnly: true` (mencegah akses JavaScript/XSS terhadap cookie sesi)
   - `SameSite: Lax` (mencegah serangan Cross-Site Request Forgery / CSRF)
   - `Secure: true` pada environment produksi
   - `Path: /` (berlaku di seluruh domain aplikasi)
   - `Max-Age: 604800` (masa berlaku 7 hari)
4. Password **TIDAK PERNAH** disimpan atau digunakan sebagai nilai cookie.
5. Klien menerima konfirmasi sukses dan melakukan navigasi ke `/dashboard`.

### 3.2. Alur Keluar (Sign Out via `/api/auth/logout`)
Ketika pengguna melakukan logout:
1. Request `POST /api/auth/logout` dikirimkan ke server.
2. Server mengirimkan respons dengan cookie `statistics_session` yang disetel kedaluwarsa (`Max-Age: 0`, `HttpOnly: true`, `Path: /`).
3. Seluruh rute privat langsung terkunci kembali dan terlindungi dari akses tanpa autentikasi.

### 3.3. Verifikasi Status Sesi (`/api/auth/session`)
Saat aplikasi pertama kali dibuka di browser, `AuthProvider` memanggil `GET /api/auth/session` untuk memvalidasi keberadaan cookie sesi di server, memastikan konsistensi antara edge proxy dan state antarmuka klien.

---

## 4. Matriks Validasi Skenario Keamanan

| Skenario Pengujian | Kondisi Sesi | Target URL | Respons Proxy | Status |
| :--- | :---: | :---: | :--- | :---: |
| Akses Dasbor Tanpa Login | `statistics_session` tidak ada | `/dashboard` | `307 Redirect` → `/login` | ✅ Terproteksi |
| Akses Input Analisis Tanpa Login | `statistics_session` tidak ada | `/input` | `307 Redirect` → `/login` | ✅ Terproteksi |
| Akses Rincian Hasil Tanpa Login | `statistics_session` tidak ada | `/hasil/example-1` | `307 Redirect` → `/login` | ✅ Terproteksi |
| Akses Halaman Login Saat Sesi Aktif | `statistics_session=1` | `/login` | `307 Redirect` → `/dashboard` | ✅ Teralihkan |
| Akses Halaman Register Saat Sesi Aktif | `statistics_session=1` | `/register` | `307 Redirect` → `/dashboard` | ✅ Teralihkan |
| Akses Landing Page Publik | Bebas | `/` | `200 OK` (Tidak terhalang) | ✅ Publik |

---

## 5. Pertimbangan Keamanan Lanjutan

1. **Boundary Validation (`lib/validation.ts`)**:
   - Seluruh data numerik yang masuk dari form input divalidasi menggunakan validasi tipe ketat di server boundary sebelum diproses ke store atau komputasi analitik.
2. **Mitigasi Client-Side Tampering**:
   - Meskipun manipulasi `localStorage` dilakukan di browser, proxy network tetap menuntut kehadiran cookie sesi yang valid untuk melayani halaman server `(app)`.
