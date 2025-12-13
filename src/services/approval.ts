import { normalizeNumber, normalizeText } from '../utils/format'
import { WEBHOOK_LIST_PO } from '../config'

export type ApprovalStatus = 'Terima' | 'Tolak' | 'Pending'

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
  status: ApprovalStatus
  verifikasiSpv?: boolean
  statusPembayaran?: string
  grandTotal?: number
}

const FALLBACK: ApprovalItem[] = [
  { trxId: 'TRX-0003', tag: 'PO', date: '2025-11-28', itemId: 'BRG-003', itemName: 'Tepung Terigu', outlet: 'Pizza Nyantuy Gowa', supplier: 'PT Sumber Terigu', unit: 'kg', quantity: 10, price: 12000, status: 'Tolak', statusPembayaran: 'Lunas' },
  { trxId: 'TRX-0001', tag: 'PO', date: '2025-12-01', itemId: 'BRG-001', itemName: 'Sayur Frozen', outlet: 'Pizza Nyantuy Gowa', supplier: 'PT Makassar Kulina Utama', unit: 'Karton', quantity: 2, price: 28400, status: 'Pending', statusPembayaran: 'Hutang' },
  { trxId: 'TRX-0002', tag: 'PO', date: '2025-12-05', itemId: 'BRG-002', itemName: 'Daging Sapi 1kg', outlet: 'Pizza Nyantuy Gowa', supplier: 'PT Sumber Daging', unit: 'kg', quantity: 5, price: 95000, status: 'Terima', statusPembayaran: 'Hutang' },
]

export async function fetchApprovalItems(): Promise<ApprovalItem[]> {
  try {
    console.log('Fetching approval items from:', WEBHOOK_LIST_PO)
    const res = await fetch(WEBHOOK_LIST_PO, { headers: { Accept: 'application/json' }, cache: 'no-store' })
    if (!res.ok) {
      console.error('Fetch failed:', res.status, res.statusText)
      const text = await res.text()
      console.error('Response body:', text)
      throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
    }
    const data = await res.json()
    const list = Array.isArray(data) ? data : (data?.data || data?.items || [])
    
    // Debugging: Log first item to check available fields
    if (list.length > 0) {
      console.log('First raw item from n8n:', list[0])
    }

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
        verifikasiSpv: (() => {
          const v = row['VerifikasiSPV'] ?? row['Verifikasi SPV'] ?? row['verifikasi spv'] ?? row.verifikasiSpv
          if (typeof v === 'boolean') return v
          return String(v).toLowerCase() === 'true'
        })(),
        status: (() => {
          const s = row['Verifikasi Finance'] ?? row['verifikasi finance'] ?? row['Status'] ?? row.status
          const str = String(s).toLowerCase().trim()
          
          if (str === 'terima' || str === 'true') return 'Terima'
          if (str === 'tolak') return 'Tolak'
          
          return 'Pending'
        })() as ApprovalStatus,
        statusPembayaran: normalizeText(row['Status Pembayaran'] || row['status pembayaran'] || row['statusPembayaran'] || row.statusPembayaran || ''),
        grandTotal: normalizeNumber(row.grandTotal || 0),
      }
    })
    return mapped
  } catch (e) {
    console.error('Gagal mengambil data approval', e)
    throw e
  }
}
