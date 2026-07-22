# PRD: AI Medication Assistant

> Single Source of Truth (SSOT) - Sprint 0  
> Version: 1.0 (MVP)

---

# 1. Vision

Membangun aplikasi berbasis AI yang membantu keluarga mengelola konsumsi obat, memvalidasi obat menggunakan data BPOM, mencatat jurnal kesehatan, dan memberikan ringkasan kondisi kesehatan secara sederhana, cepat, dan gratis menggunakan React, Supabase, dan Google Gemini.

---

# 2. Problem Statement

Masalah yang ingin diselesaikan:

- Jadwal konsumsi obat sering terlupakan.
- Informasi pada kemasan obat sulit dibaca terutama oleh lansia.
- Riwayat obat dan keluhan kesehatan masih dicatat secara manual.
- Sulit memastikan apakah obat telah terdaftar di BPOM.
- Tidak ada satu tempat untuk melihat perkembangan kondisi kesehatan.

---

# 3. Goals

MVP bertujuan untuk:

- Memindai kemasan obat menggunakan AI Vision.
- Mengekstrak informasi obat secara otomatis.
- Memvalidasi obat menggunakan dataset BPOM.
- Menyimpan riwayat obat.
- Menyimpan jurnal kesehatan.
- Menampilkan dashboard kesehatan.
- Membuat ringkasan kondisi kesehatan menggunakan AI.

---

# 4. Non Goals

Versi pertama tidak mencakup:

- Diagnosis penyakit.
- Konsultasi dokter.
- Resep digital.
- Integrasi BPJS.
- Integrasi Rumah Sakit.
- WhatsApp Notification.
- Mobile App.
- Multi User Enterprise.

---

# 5. Target User

## Primary User

Anggota keluarga yang bertugas mengelola obat orang tua atau lansia.

## Secondary User

Pasien atau lansia yang hanya ingin melihat jadwal konsumsi obat.

---

# 6. Tech Stack

## Frontend

- React
- Vite
- TailwindCSS

## Backend (BaaS)

- Supabase
- PostgreSQL
- Supabase Storage

## AI

- Google Gemini 2.5 Flash

## Deployment

- Vercel

## Library

- React Router
- React Hook Form
- Zod
- Papa Parse
- Supabase JS
- Google Generative AI SDK
- Lucide React
- React Hot Toast

---

# 7. Architecture

```
React
      │
      ▼
Supabase Client
      │
      ├─────────────► PostgreSQL
      │
      ├─────────────► Storage
      │
      ▼
Gemini API
```

Arsitektur menggunakan Backend as a Service (BaaS), sehingga tidak memerlukan Express, FastAPI, maupun server backend tambahan.

---

# 8. Database Design

## Table: medications

| Field | Type |
|--------|------|
| id | UUID |
| created_at | Timestamp |
| nama_obat | Text |
| dosis | Text |
| frekuensi | Text |
| instruksi_khusus | Text |
| status_bpom | Boolean |
| nomor_bpom | Text |
| image_url | Text |

---

## Table: journals

| Field | Type |
|--------|------|
| id | UUID |
| created_at | Timestamp |
| keluhan_teks | Text |
| analisis_ai | Text |

---

## Table: master_bpom

| Field | Type |
|--------|------|
| nomor_registrasi | Text |
| nama_obat | Text |
| produsen | Text |
| bentuk_sediaan | Text |
| status | Text |

---

## Storage

```
medicine-images/
```

---

# 9. Key Features

## 1. Medication Scanner

Upload foto obat.

Gemini Vision akan membaca:

- Nama Obat
- Dosis
- Frekuensi
- Nomor BPOM
- Produsen
- Tanggal Kedaluwarsa

Kemudian menghasilkan JSON.

---

## 2. BPOM Validation

Melakukan pencocokan data hasil OCR dengan dataset BPOM.

Output:

- Valid
- Tidak ditemukan
- Perlu verifikasi

---

## 3. Medication Management

CRUD obat.

- Tambah
- Edit
- Hapus
- Detail

---

## 4. Medication Schedule

Menampilkan jadwal obat harian.

Pengguna dapat menekan tombol:

- Sudah diminum

---

## 5. AI Health Journal

Pengguna dapat menulis keluhan.

Contoh:

> Batuk sejak pagi dan tenggorokan terasa sakit.

Gemini memberikan respon edukatif.

Riwayat otomatis disimpan.

---

## 6. Dashboard

Menampilkan:

- Total obat
- Obat aktif
- Riwayat jurnal
- Ringkasan kondisi

---

## 7. AI Health Summary

Gemini membaca seluruh riwayat.

Output:

> Dalam 7 hari terakhir keluhan batuk mulai menurun dan kepatuhan konsumsi obat mencapai 90%.

---

# 10. Functional Requirements

## Medication

- Upload foto
- Scan AI
- Validasi BPOM
- Simpan obat
- Edit obat
- Hapus obat

---

## Journal

- Input keluhan
- AI Response
- Simpan riwayat

---

## Dashboard

- Statistik
- Riwayat
- Summary

---

# 11. Non Functional Requirements

- Responsive
- Mudah digunakan lansia
- Free Tier
- Cepat (<3 detik untuk operasi biasa)
- Mudah dikembangkan
- Mudah di-deploy

---

# 12. API Contract

## Scan Medicine

Input

```
Image
```

Output

```json
{
    "nama_obat":"",
    "dosis":"",
    "frekuensi":"",
    "nomor_bpom":"",
    "expired":"",
    "produsen":""
}
```

---

## Journal

Input

```
Keluhan
```

Output

```
Analisis AI
```

---

## Summary

Input

- Medication History
- Journal History

Output

```
Health Summary
```

---

# 13. Prompt Engineering

## Scanner Prompt

Ekstrak seluruh informasi obat dari gambar dan hasilkan JSON yang valid.

---

## Journal Prompt

Berikan edukasi berdasarkan keluhan pengguna tanpa memberikan diagnosis maupun resep.

---

## Summary Prompt

Ringkas kondisi kesehatan berdasarkan seluruh riwayat obat dan jurnal.

---

## Validation Prompt

Bandingkan informasi OCR dengan dataset BPOM dan tampilkan status validasi.

---

# 14. Environment Variables

```env
VITE_SUPABASE_URL=

VITE_SUPABASE_ANON_KEY=

VITE_GEMINI_API_KEY=
```

---

# 15. Folder Structure

```
src/

components/

pages/
│
├── Dashboard
├── Medication
├── Scanner
├── Journal

services/

hooks/

lib/

utils/

types/

assets/
```

---

# 16. Task Breakdown

## Epic 1

Project Foundation

- Setup React
- Setup Tailwind
- Setup Supabase
- Setup Gemini

---

## Epic 2

Medication Scanner

- Upload
- OCR
- Preview
- Save

---

## Epic 3

BPOM Validation

- Import Dataset
- Search
- Validation

---

## Epic 4

Medication Management

- CRUD
- Detail
- Schedule

---

## Epic 5

AI Journal

- Chat
- Save
- History

---

## Epic 6

Dashboard

- Statistics
- History
- AI Summary

---

## Epic 7

Deployment

- Deploy Vercel
- Testing
- Documentation

---

# 17. Initial GitHub Issues

## Issue #1

Project Initialization

---

## Issue #2

Setup Supabase

---

## Issue #3

Setup Gemini API

---

## Issue #4

Database Design

---

## Issue #5

Medication Scanner

---

## Issue #6

BPOM Validation

---

## Issue #7

Medication CRUD

---

## Issue #8

Medication Schedule

---

## Issue #9

AI Health Journal

---

## Issue #10

Dashboard

---

## Issue #11

AI Health Summary

---

## Issue #12

Deployment

---

# 18. Deployment

Frontend

- Vercel

Backend

- Supabase

AI

- Gemini API

---

# 19. MVP Definition of Done

Aplikasi dianggap selesai apabila:

- Pengguna dapat login (opsional jika Auth diaktifkan).
- Pengguna dapat memindai obat menggunakan AI.
- AI berhasil mengekstrak informasi obat.
- Obat berhasil divalidasi menggunakan data BPOM.
- Data tersimpan di Supabase.
- Pengguna dapat membuat jurnal kesehatan.
- Dashboard menampilkan seluruh riwayat.
- AI dapat membuat ringkasan kondisi kesehatan.
- Aplikasi berhasil di-deploy ke Vercel.