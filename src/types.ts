export type LineItem = {
  name: string
  unit: string
  quantity: number
  price?: number
  supplier?: string
  phone?: string
}

export type PRPayload = {
  date: string
  outlet: string
  items: LineItem[]
}

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
  nomorInvoice?: string
}

export type ItemRow = {
  name: string
  unit: string
  supplier?: string
  price?: number
  phone?: string
}

export type POWebhookPayload = {
  version: string
  'Tanggal PO': string
  Outlet: string
  'Nama Supplier': string
  'Nomor WhatsApp': string
  'Grand Total': number
  Status: string
  Items: Array<{
    'Nama Barang': string
    SATUAN: string
    JUMLAH: number
    Harga: number
    Subtotal: number
  }>
}

