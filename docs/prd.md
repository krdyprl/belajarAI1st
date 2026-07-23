# PRD: AI Medication Assistant

> Single Source of Truth (SSOT) - Sprint 1  
> Version: 2.0

---

# 1. Vision

Membangun aplikasi berbasis AI yang membantu keluarga dan tenaga kesehatan mengelola konsumsi obat, memvalidasi obat menggunakan data BPOM, mencatat jurnal kesehatan, menyediakan konsultasi pasien-dokter, dan memberikan ringkasan kondisi kesehatan secara sederhana, cepat, dan gratis menggunakan React, Supabase, dan Groq AI.

---

# 2. Problem Statement

Masalah yang ingin diselesaikan:

- Jadwal konsumsi obat sering terlupakan.
- Informasi pada kemasan obat sulit dibaca terutama oleh lansia.
- Riwayat obat dan keluhan kesehatan masih dicatat secara manual.
- Sulit memastikan apakah obat telah terdaftar di BPOM.
- Pasien tidak memiliki saluran komunikasi langsung ke tenaga kesehatan.
- Tidak ada riwayat aktivitas (audit log) untuk setiap perubahan data.
- Tidak ada satu tempat untuk melihat perkembangan kondisi kesehatan.

---

# 3. Goals

Aplikasi bertujuan untuk:

- Memindai kemasan obat menggunakan AI Vision.
- Mengekstrak informasi obat secara otomatis.
- Memvalidasi obat menggunakan API BPOM.
- Menyimpan riwayat obat.
- Menyimpan jurnal kesehatan.
- Menampilkan dashboard kesehatan.
- Membuat ringkasan kondisi kesehatan menggunakan AI.
- **Menyediakan konsultasi berbasis tiket antara pasien dan dokter.**
- **Mencatat seluruh aktivitas pengguna (audit log).**
- **Membatasi akses CRUD obat hanya untuk role dokter.**

---

# 4. Non Goals

Versi ini tidak mencakup:

- Diagnosis penyakit.
- Resep digital.
- Integrasi BPJS.
- Integrasi Rumah Sakit.
- WhatsApp Notification.
- Mobile App native.
- Multi Enterprise.
- Video call / telemedicine.

---

# 5. Target User

## Primary User

Tenaga kesehatan (dokter/perawat) yang bertugas mengelola obat dan merespon keluhan pasien.

## Secondary User

- Anggota keluarga yang membantu mengingatkan jadwal konsumsi obat.
- Pasien atau lansia yang mencatat keluhan dan melihat jadwal konsumsi obat.

---

# 6. Roles

| Role | Hak Akses |
|------|-----------|
| **Dokter** | CRUD obat, lihat & balas konsultasi, kelola pasien, lihat semua log, generate summary |
| **Keluarga** | Lihat jadwal obat, tandai "Sudah Diminum", baca konsultasi, catat jurnal |
| **Pasien** | Lihat jadwal obat, tandai "Sudah Diminum", buat tiket konsultasi, catat jurnal, lihat jawaban dokter |

---

# 7. Tech Stack

## Frontend

- React
- Vite
- TailwindCSS

## Backend (BaaS)

- Supabase
- PostgreSQL
- Supabase Storage

## AI

- Groq AI (Llama 3.3 70B untuk teks, Qwen 3.6 27B untuk vision)

## Deployment

- Vercel

## Library

- React Router
- React Hook Form
- Zod
- Papa Parse
- Supabase JS
- Lucide React
- React Hot Toast
- TailwindCSS v4

---

# 8. Architecture

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
      ├─────────────► Groq AI API
      │
      └─────────────► API Indonesia (BPOM)
```

Arsitektur menggunakan Backend as a Service (BaaS), sehingga tidak memerlukan Express, FastAPI, maupun server backend tambahan.

---

# 9. Database Design

## Table: profiles

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | PK, references auth.users |
| full_name | Text | |
| role | Text | 'dokter', 'keluarga', 'pasien' |
| family_id | UUID | FK → families.id |
| avatar_url | Text | nullable |
| created_at | Timestamp | |

## Table: families

| Field | Type |
|-------|------|
| id | UUID |
| name | Text |
| created_by | UUID |
| created_at | Timestamp |

## Table: patients

| Field | Type |
|-------|------|
| id | UUID |
| family_id | UUID |
| name | Text |
| user_id | UUID, nullable |
| created_by | UUID |
| created_at | Timestamp |

## Table: medications

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| patient_id | UUID | |
| created_by | UUID | |
| created_at | Timestamp | |
| nama_obat | Text | |
| dosis | Text | |
| frekuensi | Text | |
| instruksi_khusus | Text | |
| status_bpom | Text | 'valid', 'kurang_dapat_dipercaya', 'perlu_verifikasi', 'pending' |
| nomor_bpom | Text | |
| image_url | Text | |
| last_taken_at | Timestamp | nullable |

## Table: journals

| Field | Type |
|-------|------|
| id | UUID |
| patient_id | UUID |
| created_by | UUID |
| created_at | Timestamp |
| keluhan_teks | Text |
| analisis_ai | Text |

## Table: consultations (BARU)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| patient_id | UUID | FK → patients.id |
| doctor_id | UUID | nullable, FK → auth.users, diisi saat dokter mengambil tiket |
| title | Text | Judul keluhan |
| status | Text | 'open', 'in_progress', 'resolved' |
| created_at | Timestamp | |
| updated_at | Timestamp | |

## Table: consultation_messages (BARU)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| consultation_id | UUID | FK → consultations.id |
| sender_id | UUID | FK → auth.users |
| message | Text | |
| created_at | Timestamp | |

## Table: activity_logs (BARU)

| Field | Type | Notes |
|-------|------|-------|
| id | UUID | |
| user_id | UUID | FK → auth.users |
| action | Text | 'create', 'update', 'delete', 'login', 'logout', 'scan', 'journal', 'reply' |
| entity_type | Text | 'medication', 'journal', 'consultation', 'profile' |
| entity_id | UUID | nullable |
| metadata | JSONB | nullable, untuk detail tambahan |
| created_at | Timestamp | |

## Storage

```
medicine-images/
```

---

# 10. Key Features

## 1. Medication Scanner

Upload foto obat. Groq Vision membaca:

- Nama Obat
- Dosis
- Frekuensi
- Nomor BPOM
- Produsen
- Tanggal Kedaluwarsa

Kemudian menghasilkan JSON.

## 2. BPOM Validation

Melakukan pencocokan data hasil OCR dengan API BPOM (apiindonesia.id).

Output:
- Valid
- Tidak ditemukan (Kurang Dapat Dipercaya)
- Perlu verifikasi

## 3. Medication Management

CRUD obat. **Hanya role dokter yang bisa menambah, mengedit, dan menghapus obat.**
Keluarga & pasien hanya bisa melihat dan menandai "Sudah Diminum".

## 4. Medication Schedule

Menampilkan jadwal obat harian.
Pengguna dapat menekan tombol "Sudah Diminum".

## 5. AI Health Journal

Pasien/keluarga dapat menulis keluhan.
Groq memberikan respon edukatif.
Riwayat otomatis disimpan.

## 6. Dashboard

Menampilkan:

- Total obat
- Obat aktif
- Riwayat jurnal
- Ringkasan kondisi
- **Kalender/ringkasan harian**
- **Kartu health tracker**

## 7. AI Health Summary (BARU: Role-based)

**Dokter**: dapat generate summary untuk setiap pasien.
**Pasien/Keluarga**: melihat summary yang sudah di-generate oleh dokter.

## 8. Chat Konsultasi (BARU)

### Flow

1. Pasien buat tiket konsultasi (judul + deskripsi keluhan)
2. Tiket masuk ke antrian dokter (status: open)
3. Dokter lihat daftar tiket, ambil satu (status: in_progress)
4. Dokter dan pasien dapat saling membalas pesan dalam tiket
5. Dokter tutup tiket setelah selesai (status: resolved)

### Rules

- Hanya dokter yang bisa mengubah status tiket
- Pasien hanya bisa melihat tiket miliknya sendiri
- Dokter bisa melihat semua tiket dengan status open/in_progress

## 9. Activity Log (BARU)

Setiap aktivitas berikut tercatat di `activity_logs`:

| Aktivitas | action | entity_type |
|-----------|--------|-------------|
| Login | login | profile |
| Logout | logout | profile |
| Tambah obat | create | medication |
| Edit obat | update | medication |
| Hapus obat | delete | medication |
| Scan obat | scan | medication |
| Tulis jurnal | journal | journal |
| Buat tiket | create | consultation |
| Balas tiket | reply | consultation |
| Tutup tiket | resolve | consultation |
| Generate summary | summary | journal |

## 10. Redesign Total

### Tema
- **Background**: Gradient purple lembut `#E8E0F0` → `#F5F0FF`
- **Komponen**: Glassmorphism (background transparan, backdrop-blur, border semi-transparan)
- **Card**: Rounded-2xl, shadow lembut, border subtle
- **Typography**: Font besar, kontras tinggi, tetap senior-friendly

### Layout Baru
- Header: Greeting "Selamat pagi, [Nama]" + Avatar besar
- Content: Cards grid dengan ikon besar dan warna gradient
- Dashboard: Stats cards + kalender widget + health tracker + rekomendasi AI
- Bottom nav tetap untuk mobile

### Warna
- Primary: `#7C3AED` (ungu)
- Gradient bg: `#E8E0F0` → `#F5F0FF`
- Card glass: `rgba(255,255,255,0.7)` dengan backdrop-blur
- Success: `#059669`
- Warning: `#D97706`
- Error: `#DC2626`

---

# 11. Functional Requirements

## Medication

- Upload foto
- Scan AI
- Validasi BPOM
- Simpan obat ***(hanya dokter)***
- Edit obat ***(hanya dokter)***
- Hapus obat ***(hanya dokter)***
- Tandai "Sudah Diminum" ***(semua role)***

## Journal

- Input keluhan
- AI Response
- Simpan riwayat

## Consultation

- Buat tiket (pasien)
- Lihat antrian (dokter)
- Ambil tiket (dokter)
- Kirim pesan (dokter & pasien)
- Tutup tiket (dokter)

## Activity Log

- Auto-log setiap aktivitas via trigger atau fungsi
- Tampilkan log di halaman khusus (dokter only)

## Dashboard

- Statistik
- Riwayat
- Kalender
- Health tracker
- AI Summary

---

# 12. Non Functional Requirements

- Responsive (mobile-first)
- Mudah digunakan lansia
- Free Tier
- Cepat (<3 detik untuk operasi biasa)
- Mudah dikembangkan
- Mudah di-deploy
- Akses role-based (RLS)
- Audit trail lengkap

---

# 13. Environment Variables

```env
VITE_SUPABASE_URL=
VITE_SUPABASE_ANON_KEY=
VITE_GROQ_API_KEY=
VITE_BPOM_API_KEY=
```

---

# 14. Folder Structure

```
src/
  components/
  pages/
    ├── Dashboard
    ├── Medication
    ├── Scanner
    ├── Journal
    ├── Consultation     (BARU)
    ├── ActivityLog      (BARU)
  services/
  hooks/
  lib/
    api/
  utils/
  types/
  assets/
```

---

# 15. Task Breakdown

## Epic 1-7 (Selesai dari Sprint 0)

- Project Foundation
- Medication Scanner
- BPOM Validation
- Medication Management
- AI Journal
- Dashboard
- Deployment

## Epic 8: Role Update

- Migrasi role admin → dokter
- Update RLS policies (CRUD obat hanya dokter)
- Update UI berdasarkan role

## Epic 9: Activity Log

- Buat tabel activity_logs
- Buat fungsi auto-log di Supabase
- Buat halaman Activity Log (dokter only)

## Epic 10: Chat Konsultasi

- Buat tabel consultations + consultation_messages
- Buat halaman Consultation (daftar tiket)
- Buat halaman detail tiket + chat
- Implementasi RLS chat

## Epic 11: Redesign Total

- Update theme/style.css (gradient, glassmorphism)
- Redesign Layout
- Redesign Dashboard (kalender, health tracker, greeting)
- Redesign semua halaman dengan gaya baru

---

# 16. Initial GitHub Issues (Sprint 1)

## Issue #16

Role Update (admin → dokter) + RLS

## Issue #17

Activity Log System

## Issue #18

Chat Konsultasi (Ticket-based)

## Issue #19

Redesign Total (Gradient + Glassmorphism)

---

# 17. Deployment

Frontend

- Vercel

Backend

- Supabase

AI

- Groq API

---

# 18. MVP Definition of Done (v2.0)

Aplikasi dianggap selesai apabila:

- Role dokter dapat CRUD obat (keluarga/pasien hanya lihat)
- Role dokter dapat melihat log aktivitas
- Semua aktivitas tercatat otomatis di activity_logs
- Pasien dapat membuat tiket konsultasi
- Dokter dapat melihat antrian dan membalas tiket
- Pasien dapat melihat jawaban dokter
- Seluruh tampilan menggunakan desain baru (gradient + glassmorphism)
- Aplikasi tetap ramah lansia (font besar, kontras tinggi)
- Build berhasil tanpa error
