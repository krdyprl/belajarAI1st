# 💊 AI Medication Assistant

> Aplikasi berbasis AI untuk membantu keluarga dan tenaga kesehatan mengelola konsumsi obat, memvalidasi obat dengan data BPOM, mencatat jurnal kesehatan, konsultasi pasien-dokter, dan menghasilkan ringkasan kondisi kesehatan.

![Status Proyek](https://img.shields.io/badge/status-active-brightgreen)
![React](https://img.shields.io/badge/React-19.2-61DAFB?logo=react)
![TypeScript](https://img.shields.io/badge/TypeScript-6.0-3178C6?logo=typescript)
![Supabase](https://img.shields.io/badge/Supabase-BaaS-3FCF8E?logo=supabase)
![Vite](https://img.shields.io/badge/Vite-7.0-646CFF?logo=vite)
![Tailwind](https://img.shields.io/badge/Tailwind-4.0-06B6D4?logo=tailwindcss)
![Groq AI](https://img.shields.io/badge/Groq%20AI-LLM-FF6600)
![Playwright](https://img.shields.io/badge/Playwright-E2E-45BA4B?logo=playwright)
![Netlify](https://img.shields.io/badge/Netlify-Deploy-00C7B7?logo=netlify)

---

## 📋 Daftar Isi

- [Tentang Project](#-tentang-project)
- [Masalah yang Diselesaikan](#-masalah-yang-diselesaikan)
- [Fitur Utama](#-fitur-utama)
- [Tech Stack](#-tech-stack)
- [Arsitektur](#-arsitektur)
- [Role & Hak Akses](#-role--hak-akses)
- [Database Schema](#-database-schema)
- [Cara Install & Menjalankan](#-cara-install--menjalankan)
- [Cara Menulis Commit](#-cara-menulis-commit)
- [Testing](#-testing)
- [Deployment](#-deployment)
- [Demo & Link](#-demo--link)
- [Sejauh Mana Project Ini?](#-sejauh-mana-project-ini)
- [⚠️ Catatan Keamanan — Key Bocor](#️-catatan-keamanan--key-bocor)
- [Dokumentasi Lain](#-dokumentasi-lain)

---

## 🎯 Tentang Project

**AI Medication Assistant** adalah aplikasi web *single-page* (SPA) yang dirancang untuk membantu pengelolaan pengobatan, khususnya bagi keluarga yang merawat pasien (lansia, anak-anak, atau anggota keluarga lain). Aplikasi ini menggunakan **AI Vision** untuk memindai kemasan obat, **AI Text** untuk menganalisis keluhan dan membuat ringkasan kesehatan, serta **API BPOM** untuk memvalidasi izin edar obat.

### Siapa Targetnya?

| Role | Deskripsi |
|------|-----------|
| 👨‍⚕️ **Dokter** | Tenaga kesehatan yang mengelola data obat, melihat jurnal pasien, dan merespons konsultasi |
| 👪 **Keluarga** | Anggota keluarga yang membantu mencatatkan obat, jurnal, dan membuat tiket konsultasi untuk pasien |
| 🧑 **Pasien** | Penerima perawatan yang bisa melihat jadwal obat, menulis jurnal, dan berkonsultasi |

### Problem Statement

- Jadwal konsumsi obat sering terlupakan
- Informasi kemasan obat sulit dibaca (terutama lansia)
- Riwayat obat dan keluhan masih dicatat manual
- Sulit memvalidasi apakah obat terdaftar BPOM
- Tidak ada saluran komunikasi langsung dari pasien ke tenaga kesehatan
- Tidak ada audit log untuk perubahan data
- Tidak ada ringkasan kondisi kesehatan yang terpusat

---

## ✨ Fitur Utama

### 📸 Scanner Obat (AI Vision)
- Ambil foto kemasan obat dari kamera atau upload file
- AI (Groq Qwen 3.6 27B Vision) membaca dan mengekstrak informasi dari gambar
- Data hasil scan (nama obat, dosis) otomatis terisi ke form

### ✅ Validasi BPOM
- Setiap obat divalidasi terhadap database BPOM via API Indonesia
- Status: **Valid**, **Kurang Dapat Dipercaya**, **Perlu Verifikasi**, **Pending**
- Ditampilkan dengan badge berwarna di setiap kartu obat

### 💊 Manajemen Obat
- **Dokter**: CRUD penuh (tambah, edit, hapus obat)
- **Keluarga/Pasien**: Melihat daftar obat dan menandai sudah diminum
- Jadwal obat dengan frekuensi dosis
- Kalender view: lihat obat yang harus diminum hari ini

### 📝 Jurnal Kesehatan + AI
- Catat keluhan dalam bentuk chat-like UI
- AI (Groq Llama 3.3 70B) memberikan analisis otomatis
- Riwayat jurnal tersimpan dan bisa dilihat kapan saja

### 🩺 Konsultasi Dokter
- Sistem tiket: Pasien/Keluarga buka tiket, Dokter ambil dan respons
- Chat real-time antar role
- Status: **Open → In Progress → Resolved**
- Dokter bisa melihat semua konsultasi; pasien hanya miliknya sendiri

### 📊 Dashboard
- Statistik: total obat, kepatuhan minum, jumlah jurnal, obat aktif
- Obat yang harus diminum hari ini
- Antrian konsultasi (untuk dokter)
- Tombol cepat: scan, catat jurnal, tambah obat
- **AI Summary Generator**: menghasilkan ringkasan kondisi kesehatan otomatis

### 📋 Activity Log (Audit Trail)
- Semua aktivitas pengguna tercatat: login, logout, CRUD, scan, jurnal, konsultasi
- Hanya dokter yang bisa melihat log penuh

### 👶 Onboarding Walkthrough
- 3-step intro untuk pengguna baru (disimpan di localStorage)
- Menjelaskan fitur utama aplikasi

### ♿ Senior-Friendly Design
- Font besar (≥16px)
- Touch target minimal 48px
- Bottom navigation untuk akses mudah satu tangan
- Glassmorphism UI dengan kontras warna tinggi

---

## 🛠 Tech Stack

| Lapisan | Teknologi | Fungsi |
|---------|-----------|--------|
| **Framework** | React 19 + Vite 7 | Frontend SPA cepat dengan HMR |
| **Bahasa** | TypeScript 6 | Type safety |
| **Styling** | Tailwind CSS 4 | Utility-first CSS dengan custom theme |
| **Routing** | React Router DOM 7 | Client-side routing |
| **Backend** | Supabase | BaaS: PostgreSQL, Auth, Storage, Edge Functions |
| **Database** | PostgreSQL (via Supabase) | Relational DB dengan RLS |
| **AI Vision** | Groq — Qwen 3.6 27B | Membaca teks dari gambar kemasan obat |
| **AI Text** | Groq — Llama 3.3 70B | Analisis jurnal, generate ringkasan kesehatan |
| **Validasi Obat** | API Indonesia (BPOM) | Validasi nomor izin edar obat |
| **Email** | Resend (via Supabase Edge Functions) | Email reminder obat |
| **Cron Job** | pg_cron (Supabase) | Trigger pengiriman reminder harian |
| **Form** | React Hook Form + Zod | Validasi form |
| **Icons** | Lucide React | Icon set |
| **Notifikasi** | React Hot Toast | Toast notification |
| **Testing** | Playwright | E2E testing (55 tests) |
| **Deploy** | Netlify | Hosting SPA |

---

## 🏗 Arsitektur

```
┌─────────────────────────────────────────────────────────────────────┐
│                        Browser (React SPA)                          │
│                                                                     │
│  ┌──────────┐  ┌──────────┐  ┌──────────┐  ┌────────────────┐     │
│  │ Dashboard │  │Medication│  │ Scanner  │  │ Journal / Chat │     │
│  └──────────┘  └──────────┘  └──────────┘  └────────────────┘     │
│       │              │             │                  │              │
│  ┌──────────────────────────────────────────────────────────────┐  │
│  │                    AuthContext (Supabase Auth)                │  │
│  └──────────────────────────────────────────────────────────────┘  │
└─────────────────────────────────────────────────────────────────────┘
                              │
        ┌─────────────────────┼─────────────────────┐
        ▼                     ▼                      ▼
┌───────────────┐   ┌───────────────┐   ┌──────────────────────┐
│  Supabase     │   │  Groq API     │   │  API Indonesia/BPOM  │
│  (PostgreSQL  │   │  (Vision +    │   │  (Validasi Obat)     │
│   + Auth +    │   │   Text AI)    │   │                      │
│   Storage +   │   │               │   │                      │
│   Edge Fn)    │   │               │   │                      │
└───────┬───────┘   └───────────────┘   └──────────────────────┘
        │
┌───────┴───────────────────────────────────────────────────────┐
│  PostgreSQL Database                                           │
│  ┌──────────┐ ┌──────────┐ ┌──────────┐ ┌──────────────────┐  │
│  │ profiles │ │ patients │ │medications│ │ journals         │  │
│  │ families │ │ consult. │ │ msg      │ │ activity_logs    │  │
│  └──────────┘ └──────────┘ └──────────┘ └──────────────────┘  │
│  ┌──────────────────────────────────────────────────────────┐  │
│  │ Row Level Security (RLS) — akses berdasarkan role        │  │
│  └──────────────────────────────────────────────────────────┘  │
└───────────────────────────────────────────────────────────────┘
```

**Pola arsitektur:**
- **Client-heavy**: Semua logika bisnis di frontend (React). Backend adalah BaaS (Supabase).
- **Security via RLS**: Authorization dilakukan di database via Row Level Security, bukan di kode aplikasi. Frontend hanya tau role user untuk UI visibility.
- **Edge Functions** untuk tugas server-side: reminder email via cron + Resend.
- **Direct API calls**: Frontend panggil Groq API dan BPOM API langsung (VITE_* prefix = client-safe, tapi tetap sensitive).

---

## 👥 Role & Hak Akses

| Fitur | Dokter | Keluarga | Pasien |
|-------|--------|----------|--------|
| Lihat obat | ✅ | ✅ | ✅ |
| Tambah/edit/hapus obat | ✅ | ❌ | ❌ |
| Scan obat (AI Vision) | ✅ | ✅ | ✅ |
| Validasi BPOM | ✅ | ✅ | ✅ |
| Catat jurnal | ✅ | ✅ | ✅ |
| Lihat jurnal pasien | ✅ | ✅ | ✅ |
| Analisis AI jurnal | ✅ | ✅ | ✅ |
| Buat tiket konsultasi | ✅ | ✅ | ✅ |
| Ambil & respons tiket | ✅ | ❌ | ❌ |
| Chat konsultasi | ✅ | ✅ | ✅ |
| Generate AI Summary | ✅ | ❌ | ❌ |
| Lihat Activity Log | ✅ | ❌ | ❌ |
| Dashboard statistik | ✅ | ✅ | ✅ |

---

## 🗄 Database Schema

**8 tables + 1 storage bucket:**

```
auth.users (built-in Supabase)
  │
  ├── profiles [id → auth.users] (role: dokter/keluarga/pasien, family_id)
  │
  ├── families (id, name, created_by → auth.users)
  │
  ├── patients [family_id → families] (name, user_id → auth.users)
  │    │
  │    ├── medications [patient_id → patients] (nama_obat, dosis, frekuensi,
  │    │               status_bpom, nomor_bpom, image_url, last_taken_at)
  │    │
  │    ├── journals [patient_id → patients] (keluhan_teks, analisis_ai)
  │    │
  │    └── consultations [patient_id → patients] (doctor_id → auth.users,
  │                  status: open/in_progress/resolved)
  │           └── consultation_messages (consultation_id, sender_id, message)
  │
  └── activity_logs (user_id, action, entity_type, entity_id, metadata)
```

**Storage:** `medicine-images` (public bucket untuk foto obat)  
**Trigger:** `handle_new_user()` — auto-create profile saat user mendaftar  
**RLS:** Aktif di semua tabel (7 table policies)

> Detail lengkap ada di [`docs/prd.md`](docs/prd.md), [`docs/dfd.md`](docs/dfd.md), dan [`docs/usecase.md`](docs/usecase.md)

---

## 🚀 Cara Install & Menjalankan

### Prerequisites

- **Node.js** ≥ 18
- **npm**
- Akun **Supabase** (free tier cukup)
- API Key **Groq** ([console.groq.com](https://console.groq.com))
- API Key **BPOM** ([apiindonesia.id](https://apiindonesia.id))
- **(Opsional)** Akun **Resend** untuk email reminder

### 1. Clone & Install

```bash
git clone https://github.com/krdyprl/belajarAI1st.git
cd belajarAI1st
npm install
```

### 2. Setup Environment Variables

Buat file `.env` di root project:

```env
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key
VITE_GROQ_API_KEY=gsk_your-groq-key
VITE_BPOM_API_KEY=aip_live_your-bpom-key
RESEND_API_KEY=re_your-resend-api-key
```

> File `.env` sudah di `.gitignore` — tidak akan ter-commit.  
> Copy `.env.example` ke `.env` dan isi dengan nilai yang sesuai.  
> `RESEND_API_KEY` hanya untuk Supabase Edge Functions (email), tidak perlu di VITE_.

### 3. Setup Database

Database migration ada di `supabase/migrations/000_all.sql` — jalankan di Supabase SQL Editor:

```sql
-- Di Supabase Dashboard → SQL Editor → Paste & Run
\i supabase/migrations/000_all.sql
```

Atau upload via Supabase CLI:

```bash
supabase db push
```

### 4. Seed Data (Opsional)

Ada 3 file seed di `supabase/seed/`:

```bash
# Buka supabase/seed/start.sql, ganti email placeholder,
# lalu jalankan di Supabase SQL Editor
```

> **Catatan:** Seed menggunakan email hardcoded. Ganti dengan email asli sebelum menjalankan. Lihat detail di `supabase/seed/start.sql`.

### 5. Setup Edge Functions (Opsional — untuk email reminder)

Deploy fungsi Supabase Edge:

```bash
# Deploy kedua fungsi
supabase functions deploy send-email
supabase functions deploy reminder
```

Set environment variables di Supabase Dashboard:
- `RESEND_API_KEY` — API key Resend
- `SUPABASE_SERVICE_ROLE_KEY` — Service role key Supabase (untuk reminder query database)

> ⚠️ `RESEND_API_KEY` hanya untuk server-side (Edge Functions), tidak pernah terekspos ke client.

### 6. Jalankan

```bash
npm run dev
```

Buka `http://localhost:5173` di browser.

---

## 📝 Cara Menulis Commit

Project ini menggunakan gaya *conventional commit* informal — tidak ada format baku yang ketat, tapi berikut pola yang dipakai:

```
<type>: <deskripsi singkat>
<blank line>
<detail lebih lanjut jika perlu>
```

### Prefix yang digunakan sejauh ini:

| Prefix | Contoh | Kegunaan |
|--------|--------|----------|
| `Sprint N:` | `Sprint 2: DB refactor, fix RLS, seed, vercel, docs, tests` | Menandai sprint besar |
| `Merge pull request` | `Merge pull request #25 from krdyprl/sprint3` | Merge PR |
| `MVP` | `MVP AI Medication Assistant - all features complete` | Milestone besar |

### Format yang disarankan ke depan:

```bash
git commit -m "feat: tambah fitur X"
git commit -m "fix: perbaiki bug Y di halaman Z"
git commit -m "docs: update README"
git commit -m "refactor: simplify component A"
git commit -m "test: tambah E2E test untuk halaman B"
git commit -m "chore: update dependencies"
```

Gunakan body commit untuk menjelaskan **kenapa** perubahan dilakukan.

---

## 🧪 Testing

### E2E Tests (Playwright)

Project memiliki **55 tests E2E** yang mencakup:

| Test File | Fokus |
|-----------|-------|
| `auth.spec.ts` | Login, register, role selector, redirect |
| `dashboard.spec.ts` | Redirect setelah login, elemen dashboard |
| `medication.spec.ts` | Halaman medication, form fields |
| `scanner.spec.ts` | Halaman scanner, form elements |
| `navigation.spec.ts` | Onboarding, bottom nav, branding |
| `design.spec.ts` | Design system: glass, rounded, font size |
| `accessibility.spec.ts` | Senior-friendly: font, buttons, kontras |
| `profile.spec.ts` | Profile page, redirects |

**Menjalankan:**

```bash
# Semua test (headless)
npm run test:e2e

# Dengan UI mode
npm run test:e2e:ui
```

**Config:** Viewport 390×844 (mobile-first), timeout 30s, base URL `http://localhost:5173`.

> Playwright akan menjalankan Vite dev server otomatis sebelum test.

---

## 🌐 Deployment

Project di-deploy ke **Netlify** sebagai SPA.

[![Deploy to Netlify](https://www.netlify.com/img/deploy/button.svg)](https://app.netlify.com/start/deploy?repository=https://github.com/krdyprl/belajarAI1st)

### Manual Deploy

```bash
# 1. Build dulu
npm run build

# 2. Install Netlify CLI (opsional)
npm install -g netlify-cli

# 3. Deploy
netlify deploy --prod --dir=dist
```

### Langkah-langkah via Dashboard:

1. Push ke GitHub repository
2. Login ke [Netlify](https://app.netlify.com) → **Add new site** → **Import an existing project**
3. Pilih GitHub repo `krdyprl/belajarAI1st`
4. Set build settings (otomatis terbaca dari `netlify.toml`):
   - **Build command:** `npm run build`
   - **Publish directory:** `dist`
5. Tambah environment variables di **Site Settings → Environment variables**:
   ```
   VITE_SUPABASE_URL=https://your-project.supabase.co
   VITE_SUPABASE_ANON_KEY=your-anon-key
   VITE_GROQ_API_KEY=gsk_your-groq-key
   VITE_BPOM_API_KEY=aip_live_your-bpom-key
   ```
6. Klik **Deploy** — selesai!

> ⚡ **Tip:** SPA redirect sudah diatur di `netlify.toml` — semua route `/*` diarahkan ke `/index.html` agar React Router bisa handle di client-side.

---

## 🔑 Test Credentials

Setelah menjalankan `seed/start.sql`, gunakan akun berikut untuk testing:

| Role | Email | Password |
|------|-------|----------|
| 👨‍⚕️ **Dokter** | `prlkrdy@gmail.com` | `123456admin` |
| 👪 **Keluarga** | `kiparulian@gmail.com` | `test123` |
| 🧑 **Pasien** | `nanyardak098@gmail.com` | `test123` |


---

## 🔗 Demo & Link

| Resource | Link |
|----------|------|
| 🌐 **Live Demo** | [https://belajar-ai-1st.netlify.app](https://belajar-ai-1st.netlify.app) |
| 📦 **GitHub Repo** | [https://github.com/krdyprl/belajarAI1st](https://github.com/krdyprl/belajarAI1st) |
| 📄 **PRD** | [`docs/prd.md`](docs/prd.md) |
| 📊 **DFD** | [`docs/dfd.md`](docs/dfd.md) |
| 🎯 **Use Case** | [`docs/usecase.md`](docs/usecase.md) |

---

## 📈 Sejauh Mana Project Ini?

### ✅ Yang Sudah Selesai (MVP v2.0)

**Sprint 1 — Foundation (MVP)**
- [x] Setup React + Vite + Tailwind + TypeScript
- [x] Supabase Auth (login, register, session management)
- [x] AuthContext + Protected Routes
- [x] Database schema (7 tables + RLS policies)
- [x] Role-based UI: Dokter / Keluarga / Pasien
- [x] Medication CRUD (dokter only)
- [x] Scan obat dengan AI Vision (Groq)
- [x] Validasi BPOM via API Indonesia
- [x] Jurnal kesehatan + AI analysis
- [x] Dashboard dengan statistik
- [x] Senior-friendly UI (glassmorphism, font besar)
- [x] Onboarding walkthrough
- [x] 28 Playwright E2E tests

**Sprint 2 — Enhancement**
- [x] Konsultasi (ticket system + chat)
- [x] Activity Log (audit trail)
- [x] Activity logging (semua action tercatat)
- [x] Fix RLS: dokter bisa CRUD + query patients
- [x] Modular refactor (services/, patients.ts)
- [x] Gabung migrations jadi 1 (000_all.sql)
- [x] Docs: PRD, DFD, Use Case
- [x] 55 Playwright E2E tests
- [x] Netlify deployment config

**Sprint 3 — Polish**
- [x] Perbaikan lanjutan
- [ ] *(Detail ada di commit merge sprint3)*

### ❌ Belum Tersedia (Non-Goals)

- ❌ Diagnosis penyakit
- ❌ Resep digital
- ❌ WhatsApp Notification
- ❌ Mobile App native (masih web SPA)

### 📊 Metrik

| Metrik | Value |
|--------|-------|
| **Tests** | 55 E2E (Playwright) |
| **Tables** | 7 + auth.users |
| **Migrations** | 6 (digabung jadi 1 file final) |
| **Edge Functions** | 2 (reminder, send-email) |
| **AI Models** | 2 (Vision: Qwen 3.6 27B, Text: Llama 3.3 70B) |
| **Pages** | 10 route pages |
| **Components** | 7 reusable UI components |
| **Sprints** | 3 sprint |
| **Deploy** | Netlify SPA |

---

## ⚠️ Keamanan — API Key Management

Project ini menggunakan beberapa API key yang **tidak boleh** terekspos di git.

### Yang sudah dilakukan:

| Langkah | Status |
|---------|--------|
| `.env` di `.gitignore` | ✅ Sejak awal |
| `.env.example` hanya berisi placeholder | ✅ |
| Source code menggunakan `import.meta.env.VITE_*` | ✅ — di-load saat runtime, bukan hardcode |
| Edge Functions pakai `Deno.env.get()` | ✅ — env var dari Supabase Dashboard |
| Tidak ada key di git history | ✅ — diverifikasi |

### Aturan untuk Developer:

1. **Jangan pernah** commit file `.env` — sudah di `.gitignore`
2. **Jangan** hardcode API key di source code — selalu pakai env vars
3. **Set env vars** di Netlify Dashboard (bukan di file)
4. **Set env vars** di Supabase Dashboard untuk Edge Functions
5. **Rotate key** secara berkala jika ada indikasi bocor

### Dimana env vars harus diset:

| Platform | Cara |
|----------|------|
| **Development lokal** | File `.env` di root project |
| **Netlify (deploy)** | Netlify Dashboard → Site Settings → Environment Variables |
| **Supabase Edge Functions** | Supabase Dashboard → Edge Functions → Secrets |
| **Cron Reminder** | Set `RESEND_API_KEY` + `SUPABASE_SERVICE_ROLE_KEY` di Supabase |

---

## 📚 Dokumentasi Lain

| Dokumen | Deskripsi | Link |
|---------|-----------|------|
| **PRD** | Product Requirements Document lengkap | [`docs/prd.md`](docs/prd.md) |
| **DFD** | Data Flow Diagram Level 0, 1, 2 | [`docs/dfd.md`](docs/dfd.md) |
| **Use Case** | Use case diagram per role | [`docs/usecase.md`](docs/usecase.md) |
| **Migrations** | SQL migrations (final: 000_all.sql) | [`supabase/migrations/`](supabase/migrations/) |
| **E2E Tests** | Playwright test specs | [`e2e/`](e2e/) |

---

## 🙏 Kredit

Dibangun dengan:
- ⚛️ [React](https://react.dev/) + ⚡ [Vite](https://vitejs.dev/)
- 🎨 [Tailwind CSS](https://tailwindcss.com/)
- 🔥 [Supabase](https://supabase.com/)
- 🧠 [Groq](https://groq.com/) — AI inference
- 🇮🇩 [API Indonesia](https://apiindonesia.id/) — data BPOM
- ✉️ [Resend](https://resend.com/) — email delivery
- 🎭 [Playwright](https://playwright.dev/) — testing
- ▲ [Vercel](https://vercel.com/) — hosting

---

