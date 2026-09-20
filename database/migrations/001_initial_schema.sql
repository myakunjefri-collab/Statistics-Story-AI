-- Migration 001: Initial Schema for Statistics Story AI
-- Conforming to PDM SKPL Version 1.0 (7 Entities)

-- 1. Tabel Pengguna (Sesuai PDM SKPL)
CREATE TABLE IF NOT EXISTS pengguna (
  id_pengguna SERIAL PRIMARY KEY,
  nama VARCHAR(100) NOT NULL,
  email VARCHAR(150) UNIQUE NOT NULL,
  password_hash VARCHAR(255) NOT NULL,
  peran VARCHAR(20) DEFAULT 'mahasiswa' CHECK (peran IN ('mahasiswa', 'dosen')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 2. Tabel Analisis (Sesuai PDM SKPL + Koreksi Timestamp)
CREATE TABLE IF NOT EXISTS analisis (
  id_analisis SERIAL PRIMARY KEY,
  id_pengguna INT NOT NULL REFERENCES pengguna(id_pengguna) ON DELETE CASCADE,
  jenis_analisis VARCHAR(20) NOT NULL CHECK (jenis_analisis IN ('Deskriptif', 'Uji t', 'Korelasi', 'Regresi')),
  nama_analisis VARCHAR(150) NOT NULL,
  tanggal TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP, -- [KOREKSI: TIMESTAMP WITH TIME ZONE]
  status VARCHAR(20) DEFAULT 'Selesai' CHECK (status IN ('Selesai', 'Diproses', 'Draf')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 3. Tabel Dataset Input (PDM SKPL + [IMPLEMENTATION EXTENSION])
CREATE TABLE IF NOT EXISTS dataset_input (
  id_dataset SERIAL PRIMARY KEY,
  id_analisis INT NOT NULL REFERENCES analisis(id_analisis) ON DELETE CASCADE,
  nama_file VARCHAR(255),
  format_data VARCHAR(20) NOT NULL CHECK (format_data IN ('csv', 'xlsx', 'manual')),
  data_konten JSONB NOT NULL, -- [IMPLEMENTATION EXTENSION: Menyimpan data numerik mentah terurai]
  sumber_input VARCHAR(50) DEFAULT 'web_form',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 4. Tabel Hasil Statistik (Sesuai PDM SKPL)
CREATE TABLE IF NOT EXISTS hasil_statistik (
  id_hasil SERIAL PRIMARY KEY,
  id_analisis INT NOT NULL REFERENCES analisis(id_analisis) ON DELETE CASCADE,
  jenis_uji VARCHAR(50) NOT NULL,
  nilai_statistik JSONB NOT NULL,
  p_value DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 5. Tabel Narasi Interpretasi (PDM SKPL + [IMPLEMENTATION EXTENSION])
CREATE TABLE IF NOT EXISTS narasi_interpretasi (
  id_narasi SERIAL PRIMARY KEY,
  id_hasil INT NOT NULL REFERENCES hasil_statistik(id_hasil) ON DELETE CASCADE,
  bahasa VARCHAR(10) DEFAULT 'id',
  isi_narasi TEXT NOT NULL,
  sumber_narasi VARCHAR(20) DEFAULT 'ai' CHECK (sumber_narasi IN ('ai', 'fallback')), -- [IMPLEMENTATION EXTENSION: pelabelan transparan AI vs Fallback]
  tanggal_generate TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 6. Tabel Visualisasi (PDM SKPL + [IMPLEMENTATION EXTENSION])
CREATE TABLE IF NOT EXISTS visualisasi (
  id_visual SERIAL PRIMARY KEY,
  id_hasil INT NOT NULL REFERENCES hasil_statistik(id_hasil) ON DELETE CASCADE,
  jenis_grafik VARCHAR(20) NOT NULL CHECK (jenis_grafik IN ('bar', 'histogram', 'scatter', 'regression')), -- [IMPLEMENTATION EXTENSION: 'regression']
  data_grafik JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- 7. Tabel Contoh Kasus (Sesuai PDM SKPL)
CREATE TABLE IF NOT EXISTS contoh_kasus (
  id_kasus SERIAL PRIMARY KEY,
  id_hasil INT NOT NULL REFERENCES hasil_statistik(id_hasil) ON DELETE CASCADE,
  deskripsi_kasus TEXT NOT NULL,
  bahasa VARCHAR(10) DEFAULT 'id',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indeks Performa Kueri
CREATE INDEX IF NOT EXISTS idx_analisis_pengguna ON analisis(id_pengguna);
CREATE INDEX IF NOT EXISTS idx_analisis_tanggal ON analisis(tanggal DESC);
CREATE INDEX IF NOT EXISTS idx_hasil_analisis ON hasil_statistik(id_analisis);
CREATE INDEX IF NOT EXISTS idx_dataset_analisis ON dataset_input(id_analisis);
