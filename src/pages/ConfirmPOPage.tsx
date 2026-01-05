import { useLocation, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Header from '../components/Header'
import { formatIDR } from '../utils/format'
import { LineItem, PRPayload } from '../types'
import { buildFlatPOBody, submitBulkPO } from '../services/po'

export default function ConfirmPOPage() {
  const navigate = useNavigate()
  const { state } = useLocation()
  const data = (state as PRPayload) || { date: '', outlet: '', items: [] }
  const [submitting, setSubmitting] = useState(false)

  const items: LineItem[] = data.items || []

  // Group items by supplier
  const groupedItems = items.reduce((acc, item) => {
    const key = item.supplier || 'Tanpa Supplier'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, LineItem[]>)

  const grandTotal = items.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0)

  const handleConfirm = async () => {
    setSubmitting(true)
    try {
      // Build one big array of flat items
      const flatPayloads = items.map(item => buildFlatPOBody(data.date, data.outlet, item))
      
      const response = await submitBulkPO(flatPayloads)

      if (!response.ok) {
        throw new Error('Gagal mengirim data PO')
      }

      // If all success, show summary
      const waNumber = (items[0]?.phone || '').replace(/[^0-9]/g, '')
      
      navigate('/po-success', { state: {
        items: items.map(it => ({ name: it.name, unit: it.unit, quantity: it.quantity, supplier: it.supplier, phone: it.phone, id: it.id, price: it.price })),
        supplier: Object.keys(groupedItems).join(', '), // List all suppliers
        phone: waNumber || '',
      } })
    } catch (e) {
      alert('Gagal mengirim PO. Coba lagi nanti.')
      console.error(e)
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="container" style={{ paddingBottom: 200 }}>
      <Header title="Konfirmasi PO" backTo="/pr" />

      <section className="hero">
        <h1>Konfirmasi PO</h1>
        <p>Mohon periksa kembali pesanan Anda sebelum dikirim.</p>
      </section>

      {Object.entries(groupedItems).map(([supplierName, groupItems]) => {
        const groupTotal = groupItems.reduce((sum, it) => sum + (it.price || 0) * (it.quantity || 0), 0)
        return (
          <section key={supplierName} className="panel" style={{ marginBottom: 16 }}>
             <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8 }}>
              {supplierName}
             </div>
             
            <div className="item-list">
              {groupItems.map((it) => (
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
              ))}
            </div>
            
            <div className="section-divider" />
            <div className="control" style={{ justifyContent: 'flex-end', marginTop: 12 }}>
               <div className="label" style={{ marginRight: 12 }}>Total Supplier Ini:</div>
               <div style={{ fontWeight: 700, color: 'var(--primary)' }}>{formatIDR(groupTotal)}</div>
            </div>
          </section>
        )
      })}

      <section className="panel" style={{ 
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        margin: 0,
        borderRadius: '16px 16px 0 0',
        border: 'none',
        borderTop: '2px solid var(--primary)',
        boxShadow: '0 -4px 12px rgba(0,0,0,0.1)',
        zIndex: 100,
        backgroundColor: '#fff',
        padding: '16px 24px'
      }}>
        <div style={{ maxWidth: 1120, margin: '0 auto' }}>
          <div className="form-grid" style={{ marginBottom: 16 }}>
            <div className="control"><div className="label">Tanggal PO</div><div>{data.date}</div></div>
            <div className="control"><div className="label">Outlet</div><div>{data.outlet}</div></div>
            <div className="control"><div className="label">Total Keseluruhan</div><div style={{ fontWeight: 700, color: 'var(--primary)', fontSize: '1.2rem' }}>{formatIDR(grandTotal)}</div></div>
          </div>
          <div className="actions" style={{ marginTop: 0 }}>
            <button className="btn" onClick={() => navigate('/pr')}>Edit</button>
            <button className="btn btn-primary" onClick={handleConfirm} disabled={submitting || items.length === 0}>
              {submitting ? 'Mengirim...' : `Konfirmasi (${Object.keys(groupedItems).length} PO)`}
            </button>
          </div>
        </div>
      </section>
      
    </div>
  )
}
