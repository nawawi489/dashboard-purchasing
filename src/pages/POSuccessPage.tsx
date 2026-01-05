import { Link, useLocation } from 'react-router-dom'
import Header from '../components/Header'
import { LineItem } from '../types'

export default function POSuccessPage() {
  const { state } = useLocation() as { state?: {
    items: LineItem[]
    supplier: string
    phone?: string
  } }
  const data = state || { items: [], supplier: '', phone: '' }

  // Group items by supplier for display, similar to ConfirmPOPage
  const groupedItems = (data.items || []).reduce((acc, item) => {
    const key = item.supplier || 'Tanpa Supplier'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, LineItem[]>)

  return (
    <div className="container" style={{ paddingBottom: 120 }}>
      <Header title="PO Berhasil" backTo="/" />

      <section className="hero">
        <h1 style={{ color: '#16a34a' }}>PO Berhasil Dibuat!</h1>
        <p>Permintaan Anda telah berhasil dikirim dan menunggu persetujuan.</p>
      </section>

      <div className="grid" style={{ alignItems: 'start', marginTop: 16 }}>
        {Object.entries(groupedItems).map(([supplierName, items]) => {
          const phone = items[0]?.phone || ''
          const waNumber = phone.replace(/[^0-9]/g, '')
          const waLink = waNumber ? `https://wa.me/${waNumber}` : undefined

          return (
            <section key={supplierName} className="panel" style={{ marginBottom: 0 }}>
              <div style={{ fontWeight: 'bold', fontSize: '1.2rem', marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>{supplierName}</span>
                {waLink && (
                  <a href={waLink} target="_blank" rel="noreferrer" className="phone-link" style={{ fontSize: '0.9rem', fontWeight: 'normal' }}>
                    Hubungi Supplier
                  </a>
                )}
              </div>

              <div className="item-list">
                {items.map((it, idx) => (
                  <div key={idx} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 12 }}>
                    <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: 8 }}>{it.name}</div>
                    
                    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>{it.id || '-'}</div>
                      <div style={{ fontSize: '0.9rem', color: '#666' }}>{it.unit}</div>
                      <div style={{ marginLeft: 'auto', fontWeight: 'bold' }}>x {it.quantity}</div>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )
        })}
      </div>

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
        <div style={{ maxWidth: 1120, margin: '0 auto', display: 'flex', justifyContent: 'center' }}>
          <Link to="/pr" className="btn btn-primary" style={{ width: '100%', maxWidth: 300, textAlign: 'center' }}>Buat PO Baru</Link>
        </div>
      </section>
    </div>
  )
}
