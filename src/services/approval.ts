import { normalizeNumber, normalizeText } from '../utils/format'
import { WEBHOOK_LIST_PO } from '../config'
import { ApprovalItem, ApprovalStatus } from '../types'

export { type ApprovalItem, type ApprovalStatus }

export async function fetchApprovalItems(): Promise<ApprovalItem[]> {
  try {
    const res = await fetch(WEBHOOK_LIST_PO, { 
      headers: { Accept: 'application/json' }, 
      cache: 'no-store' 
    })
    
    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
    }

    const data = await res.json()
    const list = Array.isArray(data) ? data : (data?.data || data?.items || [])
    
    // Mapping data flat dari n8n (output workflow Get List PO)
    return list.map((row: any): ApprovalItem => {
      // Helper untuk parsing status
      const parseStatus = (val: any): ApprovalStatus => {
        const str = String(val || '').toLowerCase().trim()
        if (str === 'terima' || str === 'true') return 'Terima'
        if (str === 'tolak') return 'Tolak'
        return 'Pending'
      }

      // Helper untuk parsing boolean
      const parseBool = (val: any): boolean => {
        if (typeof val === 'boolean') return val
        return String(val).toLowerCase() === 'true'
      }

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
        verifikasiSpv: parseBool(row['VerifikasiSPV'] ?? row['Verifikasi SPV'] ?? row['verifikasi spv'] ?? row.verifikasiSpv),
        status: parseStatus(row['Verifikasi Finance'] ?? row['verifikasi finance'] ?? row['Status'] ?? row.status),
        statusPembayaran: normalizeText(row['Status Pembayaran'] || row['status pembayaran'] || row['statusPembayaran'] || row.statusPembayaran || ''),
        grandTotal: normalizeNumber(row.grandTotal || 0),
        nomorInvoice: normalizeText(row['NOMOR INVOICE'] || row['Nomor Invoice'] || row.nomorInvoice || ''),
      }
    })
  } catch (e) {
    console.error('Gagal mengambil data approval', e)
    throw e
  }
}
