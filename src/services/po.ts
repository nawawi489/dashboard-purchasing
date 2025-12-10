import { LineItem } from '../types'
import { WEBHOOK_INPUT_PO_V3 } from '../config'

const INPUT_WEBHOOK_URL = WEBHOOK_INPUT_PO_V3

export function buildConfirmBody(date: string, outlet: string, items: LineItem[]) {
  const headerSupplier = items[0]?.supplier || ''
  const headerPhone = items[0]?.phone || ''
  const waNumber = (headerPhone || '').replace(/[^0-9]/g, '')
  const grandTotal = items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0)
  return {
    version: 'v2',
    'Tanggal PO': date,
    Outlet: outlet,
    'Nama Supplier': headerSupplier || '',
    'Nomor WhatsApp': waNumber || '',
    'Grand Total': grandTotal,
    Status: 'Submitted',
    Items: items.map(it => ({
      'Nama Barang': it.name,
      SATUAN: it.unit,
      JUMLAH: it.quantity,
      Harga: it.price || 0,
      Subtotal: (it.price || 0) * (it.quantity || 0),
    })),
  }
}

export async function submitPO(body: any): Promise<Response> {
  return fetch(INPUT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
}
