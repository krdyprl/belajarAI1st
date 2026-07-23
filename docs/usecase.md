# Use Case Diagram - AI Medication Assistant

---

## 👨‍⚕️ Level 1: Dokter

```
┌─────────────────────────────────────────────────────┐
│                  UC Dokter                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐    ┌──────────────────┐          │
│  │ Login/Logout  │    │  Kelola Obat      │          │
│  └──────────────┘    │  (Tambah/Edit/    │          │
│                      │   Hapus)          │          │
│  ┌──────────────┐    └──────────────────┘          │
│  │ Lihat Dashboard│                                │
│  │ - Statistik    │    ┌──────────────────┐          │
│  │ - Antrian      │    │  Kelola Konsultasi│          │
│  │ - Kepatuhan    │    │  - Lihat antrian  │          │
│  └──────────────┘    │  - Ambil tiket     │          │
│                      │  - Balas pesan     │          │
│  ┌──────────────┐    │  - Selesaikan      │          │
│  │ Scan Obat      │    └──────────────────┘          │
│  │ - Upload foto  │                                  │
│  │ - AI Vision    │    ┌──────────────────┐          │
│  │ - Validasi BPOM│    │  Generate Ringkasan│          │
│  │ - Simpan       │    │  AI Kesehatan    │          │
│  └──────────────┘    └──────────────────┘          │
│                                                     │
│  ┌──────────────┐    ┌──────────────────┐          │
│  │ Lihat Log     │    │  Baca Jurnal     │          │
│  │ Aktivitas     │    │  Pasien          │          │
│  └──────────────┘    └──────────────────┘          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Skenario Use Case Dokter

| UC | Nama | Aktor | Deskripsi |
|----|------|-------|-----------|
| UC-01 | Login | Dokter | Masuk dengan email & password |
| UC-02 | Lihat Dashboard | Dokter | Melihat ringkasan statistik, antrian konsultasi, obat perlu diminum |
| UC-03 | Scan Obat | Dokter | Upload foto kemasan -> AI baca -> validasi BPOM -> simpan |
| UC-04 | Tambah Obat | Dokter | Input manual data obat baru untuk pasien |
| UC-05 | Edit Obat | Dokter | Mengubah informasi obat yang sudah tersimpan |
| UC-06 | Hapus Obat | Dokter | Menghapus obat dari database |
| UC-07 | Tandai Diminum | Dokter | Menandai obat sudah dikonsumsi (untuk bantu pasien) |
| UC-08 | Lihat Antrian Konsultasi | Dokter | Melihat daftar tiket konsultasi yang masuk |
| UC-09 | Ambil Tiket | Dokter | Mengambil satu tiket konsultasi untuk dijawab |
| UC-10 | Balas Chat | Dokter | Mengirim pesan balasan ke pasien |
| UC-11 | Selesaikan Konsultasi | Dokter | Menutup tiket setelah selesai |
| UC-12 | Generate Ringkasan AI | Dokter | Membuat ringkasan kondisi kesehatan pasien via AI |
| UC-13 | Lihat Log Aktivitas | Dokter | Melihat riwayat aktivitas semua user |
| UC-14 | Baca Jurnal Pasien | Dokter | Membaca catatan keluhan yang ditulis pasien |

---

## 👨‍👩‍👧‍👦 Level 2: Keluarga

```
┌─────────────────────────────────────────────────────┐
│                  UC Keluarga                         │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐    ┌──────────────────┐          │
│  │ Login/Logout  │    │  Lihat Obat      │          │
│  └──────────────┘    │  (Read Only)      │          │
│                      └──────────────────┘          │
│  ┌──────────────┐                                  │
│  │ Lihat Dashboard│    ┌──────────────────┐          │
│  │ - Statistik    │    │  Tandai Diminum   │          │
│  │ - Obat Perlu   │    └──────────────────┘          │
│  │   Diminum      │                                  │
│  └──────────────┘    ┌──────────────────┐          │
│                      │  Catat Jurnal     │          │
│  ┌──────────────┐    │  - Tulis keluhan  │          │
│  │ Buat Konsultasi│   │  - AI Response    │          │
│  │ - Buat tiket  │    │  - Lihat riwayat  │          │
│  │ - Baca balasan│    └──────────────────┘          │
│  └──────────────┘                                  │
│                                                     │
│  ┌──────────────┐    ┌──────────────────┐          │
│  │ Lihat Profile │    │  Lihat Jadwal     │          │
│  │ & Role Saya   │    │  Obat Harian      │          │
│  └──────────────┘    └──────────────────┘          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Skenario Use Case Keluarga

| UC | Nama | Aktor | Deskripsi |
|----|------|-------|-----------|
| UC-01 | Login | Keluarga | Masuk dengan email & password |
| UC-02 | Lihat Dashboard | Keluarga | Melihat statistik & obat yang perlu diminum anggota keluarga |
| UC-03 | Lihat Obat | Keluarga | Melihat daftar obat pasien (read-only) |
| UC-04 | Tandai Diminum | Keluarga | Menandai obat sudah diminum untuk pasien |
| UC-05 | Catat Jurnal | Keluarga | Menulis keluhan kesehatan pasien + AI response |
| UC-06 | Buat Konsultasi | Keluarga | Membuat tiket konsultasi ke dokter untuk pasien |
| UC-07 | Baca Balasan | Keluarga | Membaca jawaban dokter di tiket konsultasi |
| UC-08 | Lihat Profile | Keluarga | Melihat informasi akun & hak akses |
| UC-09 | Lihat Jadwal | Keluarga | Melihat jadwal obat harian pasien |

---

## 🧑‍🦳 Level 3: Pasien

```
┌─────────────────────────────────────────────────────┐
│                  UC Pasien                           │
├─────────────────────────────────────────────────────┤
│                                                     │
│  ┌──────────────┐    ┌──────────────────┐          │
│  │ Login/Logout  │    │  Lihat Obat Saya  │          │
│  └──────────────┘    │  (Read Only)      │          │
│                      └──────────────────┘          │
│  ┌──────────────┐                                  │
│  │ Lihat Dashboard│    ┌──────────────────┐          │
│  │ - Statistik    │    │  Tandai Diminum   │          │
│  │ Saya           │    └──────────────────┘          │
│  │ - Obat Perlu   │                                  │
│  │   Diminum      │    ┌──────────────────┐          │
│  │ - Kepatuhan    │    │  Catat Jurnal     │          │
│  └──────────────┘    │  - Tulis keluhan  │          │
│                      │  - AI Saran        │          │
│  ┌──────────────┐    │  - Lihat riwayat  │          │
│  │ Buat Konsultasi│   └──────────────────┘          │
│  │ - Buat tiket  │                                  │
│  │ - Chat dokter  │    ┌──────────────────┐          │
│  │ - Baca saran   │    │  Lihat Profile    │          │
│  └──────────────┘    └──────────────────┘          │
│                                                     │
└─────────────────────────────────────────────────────┘
```

### Skenario Use Case Pasien

| UC | Nama | Aktor | Deskripsi |
|----|------|-------|-----------|
| UC-01 | Login | Pasien | Masuk dengan email & password |
| UC-02 | Lihat Dashboard | Pasien | Melihat statistik pribadi & obat yang perlu diminum |
| UC-03 | Lihat Obat Saya | Pasien | Melihat daftar obat yang diresepkan (read-only) |
| UC-04 | Tandai Diminum | Pasien | Menandai obat sendiri sudah diminum |
| UC-05 | Catat Jurnal | Pasien | Menulis keluhan pribadi + dapat saran AI |
| UC-06 | Buat Konsultasi | Pasien | Membuat tiket konsultasi ke dokter |
| UC-07 | Chat Dokter | Pasien | Mengirim & membaca pesan dengan dokter |
| UC-08 | Baca Saran Dokter | Pasien | Melihat jawaban/resep dari dokter |
| UC-09 | Lihat Profile | Pasien | Melihat informasi akun |

---

## 📊 Matrix Use Case per Role

| Use Case | Dokter | Keluarga | Pasien |
|----------|--------|----------|--------|
| Login/Logout | ✅ | ✅ | ✅ |
| Lihat Dashboard | ✅ | ✅ | ✅ |
| Tandai Diminum | ✅ | ✅ | ✅ |
| Lihat Obat (Read) | ✅ | ✅ | ✅ |
| Catat Jurnal | ✅ | ✅ | ✅ |
| Buat Konsultasi | ❌ | ✅ | ✅ |
| Balas Konsultasi | ✅ | ❌ | ❌ |
| Scan Obat | ✅ | ❌ | ❌ |
| Tambah/Edit/Hapus Obat | ✅ | ❌ | ❌ |
| Generate Ringkasan AI | ✅ | ❌ | ❌ |
| Lihat Log Aktivitas | ✅ | ❌ | ❌ |
