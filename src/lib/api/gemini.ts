const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY
const GROQ_BASE = 'https://api.groq.com/openai/v1'

if (!GROQ_API_KEY) {
  console.error('VITE_GROQ_API_KEY tidak terisi di .env')
}

const VISION_MODEL = 'qwen/qwen3.6-27b'
const TEXT_MODEL = 'llama-3.3-70b-versatile'

async function groqChat(model: string, messages: any[], json = false) {
  const res = await fetch(`${GROQ_BASE}/chat/completions`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model,
      messages,
      ...(json ? { response_format: { type: 'json_object' } } : {}),
    }),
  })

  if (!res.ok) {
    const err = await res.text()
    throw new Error(`Groq ${res.status}: ${err}`)
  }

  const jsonRes = await res.json()
  return jsonRes.choices[0].message.content
}

export interface ScanResult {
  nama_obat: string
  dosis: string
  frekuensi: string
  nomor_bpom: string
  expired: string
  produsen: string
}

export async function scanMedicine(imageBase64: string, mimeType: string): Promise<ScanResult> {
  const dataUrl = `data:${mimeType};base64,${imageBase64}`

  const content = await groqChat(VISION_MODEL, [
    {
      role: 'user',
      content: [
        {
          type: 'text',
          text: 'Ekstrak seluruh informasi obat dari gambar kemasan obat berikut. Hasilkan JSON valid dengan format: { "nama_obat": "", "dosis": "", "frekuensi": "", "nomor_bpom": "", "expired": "", "produsen": "" }',
        },
        { type: 'image_url', image_url: { url: dataUrl } },
      ],
    },
  ], true)

  const cleaned = content.replace(/```json?\s*/gi, '').replace(/```/g, '').trim()
  return JSON.parse(cleaned) as ScanResult
}

export async function analyzeJournal(keluhan: string): Promise<string> {
  return groqChat(TEXT_MODEL, [
    {
      role: 'system',
      content: 'Kamu adalah asisten kesehatan keluarga. Berikan edukasi berdasarkan keluhan berikut tanpa memberikan diagnosis maupun resep obat. Gunakan bahasa Indonesia yang sederhana dan mudah dipahami.',
    },
    { role: 'user', content: keluhan },
  ])
}

export async function generateSummary(medications: string, journals: string): Promise<string> {
  return groqChat(TEXT_MODEL, [
    {
      role: 'system',
      content: 'Kamu adalah asisten kesehatan. Ringkas kondisi kesehatan berdasarkan riwayat obat dan jurnal dalam bahasa Indonesia. Fokus pada perkembangan kondisi dan kepatuhan konsumsi obat. Berikan ringkasan singkat 2-3 kalimat.',
    },
    {
      role: 'user',
      content: `Riwayat Obat:\n${medications}\n\nRiwayat Jurnal:\n${journals}`,
    },
  ])
}
