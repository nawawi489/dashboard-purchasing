import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Header from '../components/Header'
import { formatIDR } from '../utils/format'
import { LineItem } from '../types'
import { buildConfirmBody, submitPO } from '../services/po'

export default function ConfirmPOPage() {
  const navigate = useNavigate()
  const { state } = useLocation() as { state?: {
    date: string
    outlet: string
    items: Array<{ name: string; unit: string; quantity: number; price?: number; supplier?: string; phone?: string }>
  } }
  const [submitting, setSubmitting] = useState(false)

  const data = state || { date: '', outlet: '', items: [] as Array<{ name: string; unit: string; quantity: number; price?: number; supplier?: string; phone?: string }> }
  const items: LineItem[] = Array.isArray((data as any).items) ? ((data as any).items as LineItem[]) : []
  const headerSupplier = items[0]?.supplier || ''
  const headerPhone = items[0]?.phone || ''

  const grandTotal = items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0)
  const waNumber = (headerPhone || '').replace(/[^0-9]/g, '')

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      const body = buildConfirmBody(data.date, data.outlet, items)
      const res = await submitPO(body)
      if (!res.ok) {
        const t = await res.text().catch(() => '')
        alert(`Gagal mengirim PO. Status: ${res.status}. ${t}`)
        return
      }
      navigate('/po-success', { state: {
        items: items.map(it => ({ name: it.name, unit: it.unit, quantity: it.quantity })),
        supplier: headerSupplier || '',
        phone: waNumber || '',
      } })
    } catch (e) {
      alert('Gagal mengirim PO. Coba lagi nanti.')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container">
      <Header title="Konfirmasi PO" backTo="/pr" />

      <section className="panel">
        <div className="form-grid">
          <div className="control"><div className="label">Tanggal PO</div><div>{data.date}</div></div>
          <div className="control"><div className="label">Outlet</div><div>{data.outlet}</div></div>
          <div className="control"><div className="label">Supplier</div><div>{headerSupplier || '-'}</div></div>
          <div className="control"><div className="label">Total</div><div style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatIDR(grandTotal)}</div></div>
        </div>

        <div className="section-divider" />

        <div className="item-list">
          {items.length === 0 ? (
            <div className="dropdown-empty">Tidak ada item</div>
          ) : (
            items.map((it) => (
              <div key={it.name + it.unit} className="control line-row-4 item-row">
                <div>
                  <div className="label">Nama Barang</div>
                  <div>{it.name}</div>
                </div>
                <div>
                  <div className="label">Satuan</div>
                  <div>{it.unit}</div>
                </div>
                <div>
                  <div className="label">Jumlah</div>
                  <div>{it.quantity}</div>
                </div>
                <div>
                  <div className="label">Subtotal</div>
                  <div>{formatIDR((it.price || 0) * (it.quantity || 0))}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="actions">
          <button className="btn" onClick={() => navigate('/pr')}>Edit</button>
          <button className="btn btn-primary" onClick={handleConfirm} disabled={submitting || items.length === 0}>Konfirmasi</button>
        </div>
      </section>

      
    </div>
  )
}
