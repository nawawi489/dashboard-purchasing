import { LineItem, POWebhookPayload, FlatPOPayload } from '../types'
import { WEBHOOK_INPUT_PO_V3 } from '../config'

const INPUT_WEBHOOK_URL = WEBHOOK_INPUT_PO_V3

export function buildConfirmBody(date: string, outlet: string, items: LineItem[]): POWebhookPayload {
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
      'ID BARANG': it.id || '',
      'Nama Barang': it.name,
      SATUAN: it.unit,
      JUMLAH: it.quantity,
      Harga: it.price || 0,
      Subtotal: (it.price || 0) * (it.quantity || 0),
    })),
  }
}

export function buildFlatPOBody(date: string, outlet: string, item: LineItem): FlatPOPayload {
  const phone = item.phone || ''
  const waNumber = phone.replace(/[^0-9]/g, '')
  return {
    version: 'v2',
    'Tanggal PO': date,
    Outlet: outlet,
    'Nama Supplier': item.supplier || '',
    'Nomor WhatsApp': waNumber || '',
    'ID BARANG': item.id || '',
    'Nama Barang': item.name,
    SATUAN: item.unit,
    JUMLAH: item.quantity,
    Harga: item.price || 0,
    Subtotal: (item.price || 0) * (item.quantity || 0),
    Status: 'Submitted'
  }
}

export async function submitPO(body: POWebhookPayload): Promise<Response> {
  return fetch(INPUT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify(body),
  })
}

export async function submitBulkPO(payloads: FlatPOPayload[]): Promise<Response> {
  return fetch(INPUT_WEBHOOK_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Accept: 'application/json' },
    body: JSON.stringify({ data: payloads }),
  })
}
