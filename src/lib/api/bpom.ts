const BPOM_API_KEY = import.meta.env.VITE_BPOM_API_KEY

export interface BpomSearchResult {
  nie: string
  product_name: string
  status: string
}

export interface BpomDetailResult {
  nie: string
  product_name: string
  category: string
}

export type BpomStatus = 'valid' | 'kurang_dapat_dipercaya' | 'perlu_verifikasi' | 'pending'

export async function searchBpom(query: string): Promise<BpomSearchResult[]> {
  const res = await fetch(
    `https://use.apiindonesia.id/api/v1/bpom?q=${encodeURIComponent(query)}`,
    { headers: { 'x-api-key': BPOM_API_KEY } }
  )
  if (!res.ok) return []
  const json = await res.json()
  return json.data as BpomSearchResult[]
}

export async function getBpomDetail(nie: string): Promise<BpomDetailResult | null> {
  const res = await fetch(
    `https://use.apiindonesia.id/api/v1/bpom/${nie}`,
    { headers: { 'x-api-key': BPOM_API_KEY } }
  )
  if (!res.ok) return null
  const json = await res.json()
  return json.data as BpomDetailResult
}

export async function validateMedicine(
  scannedName: string,
  scannedNie: string
): Promise<{ status: BpomStatus; detail: BpomDetailResult | null }> {
  if (scannedNie) {
    const detail = await getBpomDetail(scannedNie)
    if (detail) {
      const match = detail.product_name.toLowerCase().includes(scannedName.toLowerCase())
      return {
        status: match ? 'valid' : 'perlu_verifikasi',
        detail,
      }
    }
  }
  const results = await searchBpom(scannedName)
  if (results.length > 0) {
    return { status: 'perlu_verifikasi', detail: null }
  }
  return { status: 'kurang_dapat_dipercaya', detail: null }
}
