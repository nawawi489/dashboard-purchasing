import { normalizeNumber, normalizeText } from '../utils/format'
import { WEBHOOK_GET_BARANG } from '../config'
import { ItemRow } from '../types'

export type { ItemRow }

const WEBHOOK_URL = WEBHOOK_GET_BARANG

export async function fetchItems(): Promise<ItemRow[]> {
  try {
    const res = await fetch(WEBHOOK_URL, { 
      headers: { Accept: 'application/json' }, 
      cache: 'no-store' 
    })
    
    if (!res.ok) throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
    
    const data = await res.json()
    const list = Array.isArray(data) ? data : (data?.data || data?.items || [])
    
    if (!Array.isArray(list)) return []

    const mapped: ItemRow[] = list.map((row: any) => ({
      name: normalizeText(row.Barang ?? row.item_name ?? row.nama_barang ?? row.item),
      unit: normalizeText(row.Satuan ?? row.unit ?? row.satuan),
      supplier: normalizeText(row['Nama Supplier'] ?? row.supplier),
      price: normalizeNumber(row.Harga ?? row.price),
      phone: normalizeText(row['Nomor WhatsApp'] ?? row.whatsapp ?? row.phone),
    }))

    // Deduplicate by name
    const dedup = new Map<string, ItemRow>()
    for (const it of mapped) {
      if (!it.name) continue
      if (!dedup.has(it.name)) dedup.set(it.name, it)
    }

    return Array.from(dedup.values())
  } catch (e) {
    console.error('Gagal mengambil data barang', e)
    return []
  }
}
