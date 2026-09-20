# User Guide — Statistics Story AI

Panduan penggunaan aplikasi Statistics Story AI untuk Mahasiswa dan Dosen.

---

## 1. Registrasi & Masuk Akun (FR01)

1. **Mendaftar Akun:**
   - Kunjungi halaman `/register`.
   - Masukkan Nama Lengkap, Email institusi (misal: `@student.uns.ac.id`), Kata Sandi minimal 8 karakter, dan pilih Peran (`Mahasiswa` atau `Dosen`).
   - Klik tombol **Daftar Akun**.
2. **Masuk (Login):**
   - Kunjungi halaman `/login`.
   - Masukkan Email dan Kata Sandi terdaftar.
   - Klik **Masuk ke Dashboard**.

---

## 2. Memulai Analisis Data (FR02–FR06)

1. Pada Dashboard, klik tombol **Analisis Baru** di pojok kanan atas untuk menuju `/input`.
2. **Langkah 1: Identitas Analisis:**
   - Masukkan Judul / Nama Analisis (contoh: *Pengaruh Jam Belajar Terhadap Nilai Ujian*).
   - Pilih **Jenis Analisis**:
     - **Statistik Deskriptif** (mean, median, modus, standar deviasi, min, max)
     - **Uji t** (perbandingan rata-rata dua kelompok independen)
     - **Korelasi** (derajat hubungan linear dua variabel)
     - **Regresi Sederhana** (prediksi nilai Y berdasarkan variabel bebas X)
3. **Langkah 2: Memasukkan Data:**
   - **Unggah Berkas (CSV / Excel):** Drag and drop berkas `.csv`, `.xlsx`, atau `.xls` ke dropzone.
   - **Input Manual:** Ketik atau tempel data numerik berformat tabular:
     ```
     jam_belajar,nilai
     2,58
     4,63
     6,70
     8,85
     ```
4. Klik tombol **Validasi & Mulai Analisis**.

---

## 3. Memahami Halaman Hasil (FR15)

Halaman Hasil (`/hasil/[id]`) menyatukan 4 pilar edukatif dalam satu tampilan terpadu:

1. **Ringkasan & Angka Statistik (FR07–FR10):**
   - Kartu metrik menampilkan angka perhitungan matematis murni yang presisi (Mean, SD, Nilai t, Koefisien Korelasi $r$, Persamaan Regresi).
2. **Narasi Interpretatif (FR11, FR12):**
   - Penjelasan dalam bahasa Indonesia yang mengontekstualisasikan angka ke dalam makna konseptual yang mudah dicerna mahasiswa.
   - Terdapat tombol **Salin Narasi** untuk memudahkan penyusunan tugas akademik.
3. **Visualisasi Grafik Otomatis (FR13):**
   - Grafik interaktif yang secara otomatis disesuaikan dengan jenis analisis:
     - Deskriptif $\to$ **Histogram**
     - Uji t $\to$ **Bar Comparison Chart**
     - Korelasi $\to$ **Scatter Plot**
     - Regresi Sederhana $\to$ **Scatter Plot + Regression Trendline**
4. **Contoh Kasus & Analogi Nyata (FR14):**
   - Perumpamaan kontekstual kehidupan sehari-hari (seperti analogi nilai ujian atau pengeluaran rumah tangga) untuk memperkuat intuisi statistik.

---

## 4. Melihat Riwayat Analisis (FR16)

- Klik menu **Riwayat** pada navigasi atas atau tombol di dashboard.
- Seluruh analisis Anda tersimpan secara personal dan terisolasi. Anda dapat membuka kembali detail hasil analisis kapan saja atau menghapus riwayat yang sudah tidak diperlukan.
