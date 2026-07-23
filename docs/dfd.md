# Data Flow Diagram (DFD) - AI Medication Assistant

---

## DFD Level 0: Context Diagram

```
      ┌─────────────────────────────────────────────────────────┐
      │                   AI MEDICATION ASSISTANT               │
      │                       (Sistem)                          │
      └─────────────────────────────────────────────────────────┘
               ▲              ▲              ▲
               │              │              │
    ┌──────────┴──┐   ┌───────┴───────┐   ┌─┴──────────┐
    │   Dokter    │   │   Keluarga    │   │   Pasien   │
    └─────────────┘   └───────────────┘   └────────────┘
```

### External Entities

| Entitas | Deskripsi |
|---------|-----------|
| Dokter | Tenaga kesehatan yang mengelola obat & konsultasi |
| Keluarga | Anggota keluarga yang membantu perawatan pasien |
| Pasien | Pengguna akhir yang menerima perawatan |

---

## DFD Level 1: Proses Utama

```
                        ┌─────────────────────┐
                        │    1.0 Auth         │
                        │  (Login/Register)   │
                        └──────────┬──────────┘
                                   │
                                   ▼
                        ┌─────────────────────┐
                        │    2.0 Dashboard    │
                        │  (Statistik &       │
                        │   Ringkasan)        │
                        └──────────┬──────────┘
                                   │
              ┌────────────────────┼────────────────────┐
              ▼                    ▼                    ▼
   ┌──────────────────┐  ┌──────────────────┐  ┌──────────────────┐
   │  3.0 Medication  │  │  4.0 Journal     │  │  5.0 Consultation│
   │  (CRUD + Scan +  │  │  (Catat Keluhan  │  │  (Tiket & Chat)  │
   │   BPOM + Diminum)│  │   + AI Response) │  │                  │
   └──────────────────┘  └──────────────────┘  └──────────────────┘
                              │                        │
                              └───────────┬────────────┘
                                          ▼
                               ┌──────────────────────┐
                               │    6.0 Profile       │
                               │  (Info + Log Role)   │
                               └──────────────────────┘
```

### Deskripsi Proses

| Proses | Nama | Fungsi |
|--------|------|--------|
| 1.0 | Auth | Menangani login, register, session management |
| 2.0 | Dashboard | Menampilkan statistik, kalender, obat perlu diminum, antrian konsultasi |
| 3.0 | Medication | CRUD obat, scan AI, validasi BPOM, tandai diminum |
| 4.0 | Journal | Catat keluhan, response AI, riwayat jurnal |
| 5.0 | Consultation | Buat tiket, chat, ambil tiket, selesaikan |
| 6.0 | Profile | Info user, role, akses, log aktivitas (dokter) |

---

## DFD Level 2: Proses 3.0 Medication

```
                                ┌──────────────────────┐
                                │    Groq AI Vision    │
                                │  (Baca gambar obat)  │
                                └──────────┬───────────┘
                                           │ JSON
                                           ▼
┌──────────┐    Upload    ┌──────────────────────────────────┐    Query    ┌──────────────────┐
│  Dokter  │─────────────▶│        3.1 Scan Obat            │──────────▶│    API BPOM      │
│          │              │  (Upload -> AI -> Parse ->      │            │ (Validasi NIE)   │
│          │              │   Validasi -> Simpan)            │            └──────────────────┘
│          │              └──────────┬───────────────────────┘
│          │                         │ Data Obat Baru
│          │                         ▼
│          │              ┌──────────────────────────────────┐
│          ├─────────────▶│        3.2 CRUD Obat            │
│          │              │  (Tambah/Edit/Hapus)             │
│          │              └──────────┬───────────────────────┘
│          │                         │
│          │                         ▼
│          │              ┌──────────────────────────────────┐
│          ├─────────────▶│        3.3 Jadwal Obat          │
│          │              │  (Tandai "Sudah Diminum")        │
├──────────┤              └──────────┬───────────────────────┘
│Keluarga  │                         │
│          ├─────────────▶           │
│          │                         ▼
├──────────┤              ┌──────────────────────────────────┐
│  Pasien  │              │      Database Medications       │
│          ├─────────────▶│      (Supabase PostgreSQL)      │
└──────────┘              └──────────────────────────────────┘
```

### Alur Data 3.0 Medication

| Data | Sumber | Tujuan | Format |
|------|--------|--------|--------|
| Image | Dokter | 3.1 Scan Obat | File (JPG/PNG) |
| JSON Obat | Groq AI | 3.1 Scan Obat | JSON |
| Status BPOM | API BPOM | 3.1 Scan Obat | String |
| Data Obat Baru | 3.1 | Database Medications | Row |
| CRUD Command | Dokter | 3.2 CRUD Obat | Action |
| Taken Command | Semua Role | 3.3 Jadwal Obat | Action |
| Last Taken At | 3.3 | Database Medications | Timestamp |

---

## DFD Level 2: Proses 4.0 Journal

```
┌──────────┐    Teks         ┌──────────────────────────────────┐
│  Dokter  ├────────────────▶│                                │
│          │                 │      4.1 Tulis Keluhan          │
├──────────┤                 │  (Input -> AI Response ->      │
│Keluarga  ├────────────────▶│   Simpan Riwayat)               │
│          │                 │                                │
├──────────┤                 └──────────┬───────────────────────┘
│  Pasien  ├────────────────▶           │
│          │                            │
└──────────┘                            │ Response Edukasi
                                        ▼
                              ┌──────────────────────────────────┐
                              │         Groq AI (Llama)          │
                              │  (Analisis keluhan -> Edukasi)   │
                              └──────────┬───────────────────────┘
                                         │
                                         ▼
                              ┌──────────────────────────────────┐
                              │      Database Journals           │
                              │      (Supabase PostgreSQL)       │
                              └──────────────────────────────────┘
```

### Alur Data 4.0 Journal

| Data | Sumber | Tujuan | Format |
|------|--------|--------|--------|
| Teks Keluhan | User | 4.1 Tulis Keluhan | Text |
| Prompt | 4.1 | Groq AI | String |
| Response | Groq AI | 4.1 | Text |
| Journal Record | 4.1 | Database Journals | Row |

---

## DFD Level 2: Proses 5.0 Consultation

```
┌──────────┐              ┌──────────────────────────────────────┐
│  Dokter  │◄────────────▶│                                     │
│          │              │     5.1 Manajemen Tiket              │
├──────────┤              │  (Buat -> Lihat Antrian -> Ambil -> │
│Keluarga  │─────────────▶│   Selesaikan)                        │
│          │              │                                     │
├──────────┤              └──────────┬───────────────────────────┘
│  Pasien  │─────────────▶           │
│          │                         │ Status Update
└──────────┘                         ▼
                          ┌──────────────────────────────────────┐
                          │     5.2 Chat / Pesan                │
                          │  (Kirim -> Simpan -> Riwayat)        │
                          └──────────┬───────────────────────────┘
                                     │
                                     ▼
                          ┌──────────────────────────────────────┐
                          │  Database Consultations & Messages   │
                          │  (Supabase PostgreSQL)               │
                          └──────────────────────────────────────┘
```

### Alur Data 5.0 Consultation

| Data | Sumber | Tujuan | Format |
|------|--------|--------|--------|
| Tiket Baru | Pasien/Keluarga | 5.1 Manajemen Tiket | Row |
| Ambil Tiket | Dokter | 5.1 Manajemen Tiket | Action |
| Selesaikan | Dokter | 5.1 Manajemen Tiket | Action |
| Pesan | Dokter/Pasien | 5.2 Chat | Text |
| Messages | 5.2 | Database | Row |
| Status | 5.1 | Database | Enum |

---

## DFD Level 2: Proses 2.0 Dashboard

```
┌──────────┐              ┌──────────────────────────────────────┐
│  Semua   │              │        2.1 Statistik Cards          │
│  Role    ├─────────────▶│  (Total Obat, Diminum, Catatan)     │
│          │              └──────────┬───────────────────────────┘
│          │                         │
│          │              ┌──────────▼───────────────────────────┐
│          │              │  2.2 Kalender + Health Tracker      │
│          ├─────────────▶│  (Progress bar kepatuhan)            │
│          │              └──────────┬───────────────────────────┘
│          │                         │
│          │              ┌──────────▼───────────────────────────┐
│          │              │  2.3 Obat Perlu Diminum             │
│          ├─────────────▶│  (Daftar + Tombol Diminum)           │
│          │              └──────────┬───────────────────────────┘
│          │                         │
│          │              ┌──────────▼───────────────────────────┐
│          │              │  2.4 Quick Actions                  │
│          ├─────────────▶│  (Foto Obat / Catatan / Konsultasi)  │
│          │              └──────────┬───────────────────────────┘
│          │                         │
│          └──────┬──────┘           │
│                 ▼                  ▼
│       ┌──────────────────────────────────────────┐
│       │     Database (Medications + Journals)    │
│       │     (Supabase PostgreSQL)                │
│       └──────────────────────────────────────────┘
```

### Alur Data 2.0 Dashboard

| Data | Sumber | Tujuan | Format |
|------|--------|--------|--------|
| Query Statistik | 2.1 | Database | SQL |
| Count Data | Database | 2.1 | Number |
| Query Kepatuhan | 2.2 | Database | SQL |
| Persentase | 2.2 | Frontend | Number |
| Pending Obat | 2.3 | Database | Array |
| Taken Action | User | 2.3 | Action |
| Navigasi | User | 2.4 | Route |

---

## DFD Level 2: Proses 6.0 Profile

```
┌──────────┐              ┌──────────────────────────────────────┐
│  Semua   │              │        6.1 Info Pengguna            │
│  Role    ├─────────────▶│  (Nama, Email, Role, Avatar)        │
│          │              └──────────┬───────────────────────────┘
│          │                         │
│          │              ┌──────────▼───────────────────────────┐
│          │              │  6.2 Hak Akses per Role             │
│          ├─────────────▶│  (Daftar fitur yang bisa digunakan)  │
│          │              └──────────┬───────────────────────────┘
│          │                         │
│          │              ┌──────────▼───────────────────────────┐
│          │              │  6.3 Log Aktivitas (Dokter Only)    │
│          ├─────────────▶│  (Riwayat aksi semua user)           │
│          │              └──────────┬───────────────────────────┘
│          │                         │
│          │              ┌──────────▼───────────────────────────┐
│          │              │        6.4 Logout                   │
│          └─────────────▶│  (Hapus session -> Redirect login)   │
│                         └──────────────────────────────────────┘
```

### Alur Data 6.0 Profile

| Data | Sumber | Tujuan | Format |
|------|--------|--------|--------|
| User ID | Auth | 6.1 Info Pengguna | UUID |
| Profile Data | Database | 6.1 | Row |
| Role | Profile | 6.2 | Text |
| Actions Log | Database | 6.3 | Array |
| Logout Signal | User | 6.4 | Action |

---

## DFD Level 2: Arsitektur Sistem

```
                           ┌───────────────────────────────────────────┐
                           │          REACT FRONTEND                   │
                           │                                           │
                           │  ┌─────────┐  ┌─────────┐  ┌─────────┐   │
                           │  │  Pages  │  │Components│  │Hooks    │   │
                           │  └────┬────┘  └────┬────┘  └────┬────┘   │
                           │       │            │            │        │
                           │       └────────────┼────────────┘        │
                           │                    │                     │
                           │           ┌────────▼────────┐            │
                           │           │  Lib / API     │            │
                           │           │  (Supabase     │            │
                           │           │   Client +     │            │
                           │           │   Service)     │            │
                           │           └────────┬────────┘            │
                           └────────────────────┼─────────────────────┘
                                                │
                ┌───────────────────────────────┼───────────────────────┐
                │                               │                       │
                ▼                               ▼                       ▼
    ┌──────────────────────┐    ┌──────────────────────┐    ┌──────────────────────┐
    │     SUPABASE         │    │     GROQ API         │    │     API INDONESIA    │
    │                      │    │                      │    │                      │
    │  ┌────────────────┐  │    │  ┌────────────────┐  │    │  ┌────────────────┐  │
    │  │  Auth          │  │    │  │ Llama 3.3 70B  │  │    │  │  BPOM Search   │  │
    │  │  (Email/Pass)  │  │    │  │ (Journal/      │  │    │  │  & Detail NIE  │  │
    │  └────────────────┘  │    │  │  Summary)      │  │    │  └────────────────┘  │
    │                      │    │  └────────────────┘  │                      │
    │  ┌────────────────┐  │    │                      │                      │
    │  │  PostgreSQL    │  │    │  ┌────────────────┐  │                      │
    │  │  - profiles    │  │    │  │ Qwen 3.6 27B   │  │                      │
    │  │  - families    │  │    │  │ (Vision/Scan)  │  │                      │
    │  │  - patients    │  │    │  └────────────────┘  │                      │
    │  │  - medications │  │    └──────────────────────┘                      │
    │  │  - journals    │  │                                                 │
    │  │  - consult.    │  │                                                 │
    │  │  - messages    │  │                                                 │
    │  │  - activity    │  │                                                 │
    │  └────────────────┘  │                                                 │
    │                      │                                                 │
    │  ┌────────────────┐  │                                                 │
    │  │  Storage       │  │                                                 │
    │  │  (Gambar Obat) │  │                                                 │
    │  └────────────────┘  │                                                 │
    └──────────────────────┘                                                 │
                                                                            │
    ┌───────────────────────────────────────────────────────────────────────┘
    │
    ▼
┌──────────────────────────────────────────────────────────────────────────┐
│                            EXTERNAL API KEY                              │
│                                                                          │
│  VITE_SUPABASE_URL  +  VITE_SUPABASE_ANON_KEY                            │
│  VITE_GROQ_API_KEY  +  VITE_BPOM_API_KEY                                 │
└──────────────────────────────────────────────────────────────────────────┘
```

### Penyimpanan Data

| Store | Tipe | Digunakan Untuk |
|-------|------|-----------------|
| Supabase Auth | BaaS | Registrasi, login, session JWT |
| Supabase PostgreSQL | Relational | Semua data aplikasi (7 tabel) |
| Supabase Storage | File | Gambar kemasan obat |
| Groq AI | API | AI Vision (scan), AI Text (journal, summary) |
| API Indonesia | API | Validasi nomor BPOM |

### External API Key

| Key | Kegunaan |
|-----|----------|
| `VITE_SUPABASE_URL` | URL project Supabase |
| `VITE_SUPABASE_ANON_KEY` | Anon key untuk akses database |
| `VITE_GROQ_API_KEY` | API key untuk Groq AI |
| `VITE_BPOM_API_KEY` | API key untuk validasi BPOM |
