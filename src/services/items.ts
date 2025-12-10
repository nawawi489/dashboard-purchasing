import { normalizeNumber, normalizeText } from '../utils/format'
import { WEBHOOK_GET_BARANG } from '../config'

export type ItemRow = { name: string; unit: string; supplier?: string; price?: number; phone?: string }

const WEBHOOK_URL = WEBHOOK_GET_BARANG

const FALLBACK_ITEMS: ItemRow[] = [
  { name: 'Cabe Sashet', unit: 'Karton', supplier: 'CV SUKSES BERSAMA', price: 155028, phone: '62887436312467' },
]

export async function fetchItems(): Promise<ItemRow[]> {
  try {
    const res = await fetch(WEBHOOK_URL, { headers: { Accept: 'application/json' }, cache: 'no-store' })
    if (!res.ok) throw new Error('failed')
    const data = await res.json()
    const list = Array.isArray(data) ? data : (data?.data || data?.items || [])
    const mapped = Array.isArray(list)
      ? list.map((row: any) => ({
          name: normalizeText(row.Barang ?? row.item_name ?? row.nama_barang ?? row.item),
          unit: normalizeText(row.Satuan ?? row.unit ?? row.satuan),
          supplier: normalizeText(row['Nama Supplier'] ?? row.supplier),
          price: normalizeNumber(row.Harga ?? row.price),
          phone: normalizeText(row['Nomor WhatsApp'] ?? row.whatsapp ?? row.phone),
        }))
      : []
    const dedup = new Map<string, ItemRow>()
    for (const it of mapped) {
      if (!it.name) continue
      if (!dedup.has(it.name)) dedup.set(it.name, it)
    }
    const normalized = Array.from(dedup.values())
    return normalized.length > 0 ? normalized : FALLBACK_ITEMS
  } catch (e) {
    console.error('Gagal mengambil data barang', e)
    return FALLBACK_ITEMS
  }
}
