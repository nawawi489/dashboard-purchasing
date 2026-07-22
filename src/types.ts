export type LineItem = {
  id?: string
  name: string
  unit: string
  quantity: number
  price?: number
  supplier?: string
  phone?: string
  brand?: string
  specification?: string
  coa?: string
  coaDescription?: string
  category?: string
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
  hargaKonversiResep?: number
  satuanKonversiResep?: string
  jumlahKonversiResep?: number
  inputKaspin?: boolean
}

export type ItemRow = {
  id?: string
  name: string
  unit: string
  supplier?: string
  price?: number
  phone?: string
  brand?: string
  specification?: string
  coa?: string
  coaDescription?: string
  category?: string
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
    'ID BARANG': string
    'Nama Barang': string
    SATUAN: string
    JUMLAH: number
    Harga: number
    Subtotal: number
  }>
}

export type FlatPOPayload = {
  version: string
  'Tanggal PO': string
  Outlet: string
  'Nama Supplier': string
  'Nomor WhatsApp': string
  'ID BARANG': string
  'Nama Barang': string
  SATUAN: string
  JUMLAH: number
  Harga: number
  Subtotal: number
  Status: string
}

export type InventoryApprovalStatus = 'Terima' | 'Tolak' | 'Pending'

export type InventoryApprovalItem = {
  trxId: string
  date?: string
  tanggalTerima?: string
  outlet: string
  itemId: string
  itemName: string
  spesifikasi?: string
  supplier?: string
  unit?: string
  quantity: number
  totalEstimasiBiaya: number
  status: InventoryApprovalStatus
  tanggalApproval?: string
  nominalDisetujui?: number
  verifikasiSpv?: boolean
  buktiDokumentasi?: string
  verifikasiInputAset?: boolean
  nomorInvoice?: string
  statusPembayaran?: string
  grandTotal?: number
}

export type InventoryApprovalPayload = {
  trxId: string
  itemId: string
  outlet: string
  status: 'Terima' | 'Tolak'
  alasan?: string
}
