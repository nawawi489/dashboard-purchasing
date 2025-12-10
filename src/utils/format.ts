export function formatIDR(n: number) {
  return new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)
}

export function normalizeText(v: unknown): string {
  return typeof v === 'string' ? v.trim() : v == null ? '' : String(v)
}

export function normalizeNumber(v: unknown): number {
  if (typeof v === 'number') return v
  if (typeof v === 'string') return Number(v.replace(/[^0-9.-]/g, '')) || 0
  return 0
}

