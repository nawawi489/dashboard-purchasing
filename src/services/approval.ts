import { normalizeNumber, normalizeText } from '../utils/format'
import { WEBHOOK_LIST_PO } from '../config'

export type ApprovalItem = {
  trxId: string
  tag?: string
  date?: string
  itemId?: string
  itemName: string
  outlet: string
  supplier: string
  unit: string
  quantity: number
  price: number
  status: 'Terima' | 'Tolak' | 'Pending'
}

const FALLBACK: ApprovalItem[] = [
  { trxId: 'TRX-0003', tag: 'PO', date: '2025-11-28', itemId: 'BRG-003', itemName: 'Tepung Terigu', outlet: 'Pizza Nyantuy Gowa', supplier: 'PT Sumber Terigu', unit: 'kg', quantity: 10, price: 12000, status: 'Tolak' },
  { trxId: 'TRX-0001', tag: 'PO', date: '2025-12-01', itemId: 'BRG-001', itemName: 'Sayur Frozen', outlet: 'Pizza Nyantuy Gowa', supplier: 'PT Makassar Kulina Utama', unit: 'Karton', quantity: 2, price: 28400, status: 'Pending' },
  { trxId: 'TRX-0002', tag: 'PO', date: '2025-12-05', itemId: 'BRG-002', itemName: 'Daging Sapi 1kg', outlet: 'Pizza Nyantuy Gowa', supplier: 'PT Sumber Daging', unit: 'kg', quantity: 5, price: 95000, status: 'Terima' },
]

export async function fetchApprovalItems(): Promise<ApprovalItem[]> {
  try {
    const res = await fetch(WEBHOOK_LIST_PO, { headers: { Accept: 'application/json' }, cache: 'no-store' })
    if (!res.ok) throw new Error('failed')
    const data = await res.json()
    const list = Array.isArray(data) ? data : (data?.data || data?.items || [])
    // Mapping data flat dari n8n (output workflow Get List PO)
    const mapped: ApprovalItem[] = list.map((row: any): ApprovalItem => {
      return {
        trxId: normalizeText(row['ID TRANSAKSI'] || row.trxId || 'TRX-XXXX'),
        tag: 'PO',
        date: normalizeText(row['TANGGAL PO'] || row.date || ''),
        itemId: normalizeText(row['ID BARANG'] || row.itemId || ''),
        itemName: normalizeText(row['NAMA BARANG'] || row.itemName || ''),
        outlet: normalizeText(row.outlet || row.Outlet || '-'),
        supplier: normalizeText(row['NAMA SUPLIER'] || row.supplier || '-'),
        unit: normalizeText(row['SATUAN'] || row.unit || ''),
        quantity: normalizeNumber(row['JUMLAH'] || row.quantity || 0),
        price: normalizeNumber(row['HARGA'] || row.price || 0),
        status: (() => {
          const s = row['Status'] ?? row.status
          if (s === true || String(s).toLowerCase() === 'true') return 'Terima'
          if (s === false || String(s).toLowerCase() === 'false') return 'Pending'
          return (normalizeText(s || 'Pending') as any) || 'Pending'
        })(),
      }
    })
    return mapped
  } catch (e) {
    console.error('Gagal mengambil data approval', e)
    throw e
  }
}
