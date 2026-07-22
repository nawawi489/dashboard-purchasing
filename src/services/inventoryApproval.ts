import { normalizeNumber, normalizeText } from '../utils/format'
import {
  WEBHOOK_APPROVE_PENGAJUAN_PERALATAN,
  WEBHOOK_LIST_PENGAJUAN_PERALATAN,
  WEBHOOK_LIST_PENGAJUAN_PERALATAN_APPROVED,
  WEBHOOK_PAYMENT_PROOF_INVENTORY,
} from '../config'
import {
  InventoryApprovalItem,
  InventoryApprovalPayload,
  InventoryApprovalStatus,
} from '../types'

export { type InventoryApprovalItem, type InventoryApprovalPayload, type InventoryApprovalStatus }

function parseStatus(val: unknown): InventoryApprovalStatus {
  const str = String(val || '').trim()
  const lower = str.toLowerCase()
  if (lower === 'terima' || lower === 'true') return 'Terima'
  if (lower === 'tolak' || lower === 'false') return 'Tolak'
  if (lower === 'pending') return 'Pending'
  return 'Pending'
}

function parseBool(val: unknown): boolean {
  if (typeof val === 'boolean') return val
  const str = String(val).toLowerCase().trim()
  return str === 'true' || str === 'yes' || str === '1'
}

async function fetchInventoryItemsFrom(
  baseUrl: string,
  outlet?: string,
): Promise<InventoryApprovalItem[]> {
  try {
    let url = baseUrl
    const separator = url.includes('?') ? '&' : '?'
    url = `${url}${separator}outlet=${encodeURIComponent(outlet || '')}`

    const res = await fetch(url, {
      headers: { Accept: 'application/json' },
      cache: 'no-store',
    })

    if (!res.ok) {
      throw new Error(`Fetch failed: ${res.status} ${res.statusText}`)
    }

    const text = await res.text()
    if (!text) return []

    let data
    try {
      data = JSON.parse(text)
    } catch (e) {
      console.error('Invalid JSON from n8n:', text)
      return []
    }

    const list = Array.isArray(data) ? data : data?.data || data?.items || []

    return list.map((row: any): InventoryApprovalItem => {
      // Sheet sekarang dipisah per-outlet (di-switch oleh n8n lewat query "outlet"),
      // jadi baris tidak lagi membawa kolom Outlet sendiri — pakai outlet yang diminta.
      const rowOutlet =
        row.outlet ||
        row.Outlet ||
        row.OUTLET ||
        outlet ||
        '-'
      const itemIdRaw =
        row['ID Peralatan'] ||
        row['Id Peralatan'] ||
        row['id peralatan'] ||
        row.idPeralatan ||
        row.itemId ||
        ''
      const trxIdRaw =
        row['ID Pengajuan'] ||
        row['Id Pengajuan'] ||
        row['id pengajuan'] ||
        row.idPengajuan ||
        row.trxId ||
        ''

      return {
        trxId: normalizeText(trxIdRaw || `ROW-${row.row_number ?? Math.random().toString(36).slice(2, 8)}`),
        date: normalizeText(row['Tanggal Pengajuan'] || row['tanggal pengajuan'] || row.date || ''),
        tanggalTerima: normalizeText(row['Tanggal Terima'] || row['tanggal terima'] || ''),
        outlet: normalizeText(rowOutlet),
        itemId: normalizeText(itemIdRaw),
        itemName: normalizeText(
          row['Nama Peralatan'] ||
            row['nama peralatan'] ||
            row.namaPeralatan ||
            row.itemName ||
            '-',
        ),
        spesifikasi: normalizeText(
          row['Spesifikasi / Tipe'] ||
            row['Spesifikasi/Tipe'] ||
            row['spesifikasi / tipe'] ||
            row.spesifikasi ||
            '',
        ),
        supplier: normalizeText(row['Nama Supplier'] || row['nama supplier'] || row.supplier || ''),
        unit: normalizeText(row['Satuan Barang'] || row['satuan barang'] || row.unit || row.satuan || ''),
        quantity: normalizeNumber(row.Qty ?? row.qty ?? row.quantity ?? 0),
        totalEstimasiBiaya: normalizeNumber(
          row['Total Estimasi Biaya'] ||
            row['total estimasi biaya'] ||
            row.totalEstimasiBiaya ||
            0,
        ),
        status: parseStatus(
          row['Status Approval Finance'] ||
            row['status approval finance'] ||
            row.statusApprovalFinance ||
            row.status,
        ),
        tanggalApproval: normalizeText(row['Tanggal Approval'] || row['tanggal approval'] || ''),
        nominalDisetujui: normalizeNumber(
          row['Nominal Disetujui'] || row['nominal disetujui'] || row.nominalDisetujui || 0,
        ) || undefined,
        verifikasiSpv: parseBool(
          row['Verifikasi SPV'] || row['verifikasi spv'] || row.verifikasiSpv,
        ),
        buktiDokumentasi: normalizeText(
          row['Bukti Dokumentasi Penerimaan'] ||
            row['bukti dokumentasi penerimaan'] ||
            row.buktiDokumentasi ||
            '',
        ),
        verifikasiInputAset: parseBool(
          row['Verifikasi Input Aset'] ||
            row['verifikasi input aset'] ||
            row.verifikasiInputAset,
        ),
        nomorInvoice: normalizeText(row['Nomor Invoice'] || row['nomor invoice'] || row.nomorInvoice || ''),
        statusPembayaran: normalizeText(
          row['Status Pembayaran'] || row['status pembayaran'] || row.statusPembayaran || '',
        ),
        grandTotal: normalizeNumber(
          row['Total Tagihan'] || row['total tagihan'] || row.grandTotal || 0,
        ) || undefined,
      }
    })
  } catch (e) {
    console.error('Gagal mengambil data approval inventaris', e)
    throw e
  }
}

export async function fetchInventoryApprovalItems(
  outlet?: string,
): Promise<InventoryApprovalItem[]> {
  return fetchInventoryItemsFrom(WEBHOOK_LIST_PENGAJUAN_PERALATAN, outlet)
}

export async function fetchApprovedInventoryItems(
  outlet?: string,
): Promise<InventoryApprovalItem[]> {
  return fetchInventoryItemsFrom(WEBHOOK_LIST_PENGAJUAN_PERALATAN_APPROVED, outlet)
}

export async function submitInventoryApproval(
  payload: InventoryApprovalPayload,
): Promise<boolean> {
  const response = await fetch(WEBHOOK_APPROVE_PENGAJUAN_PERALATAN, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(payload),
  })

  if (!response.ok) {
    throw new Error(`Request failed: ${response.status} ${response.statusText}`)
  }

  return true
}

export async function submitInventoryPaymentProof(
  trxId: string,
  file: File,
  outlet: string,
  nomorInvoice?: string,
): Promise<boolean> {
  const formData = new FormData()
  formData.append('trxId', trxId)
  formData.append('outlet', outlet)
  formData.append('file', file)
  if (nomorInvoice !== undefined) formData.append('nomorInvoice', nomorInvoice)

  const response = await fetch(WEBHOOK_PAYMENT_PROOF_INVENTORY, {
    method: 'POST',
    body: formData,
  })

  if (!response.ok) {
    throw new Error(`Upload failed: ${response.status} ${response.statusText}`)
  }

  return true
}
