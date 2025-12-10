import { Link, useLocation } from 'react-router-dom'
import Header from '../components/Header'

export default function POSuccessPage() {
  const { state } = useLocation() as { state?: {
    items: Array<{ name: string; unit: string; quantity: number }>
    supplier: string
    phone?: string
  } }
  const data = state || { items: [], supplier: '', phone: '' }
  const waNumber = (data.phone || '').replace(/[^0-9]/g, '')
  const waLink = waNumber ? `https://wa.me/${waNumber}` : undefined

  return (
    <div className="container">
      <Header title="PO Berhasil" backTo="/" />

      <section className="panel">
        <div className="form-grid">
          <div className="control"><div className="label">Supplier</div><div>{data.supplier || '-'}</div></div>
          <div className="control"><div className="label">Nomor WhatsApp Supplier</div>
            {waLink ? (
              <a href={waLink} target="_blank" rel="noreferrer" className="phone-link">{waNumber}</a>
            ) : (
              <div className="dropdown-empty">Tidak tersedia</div>
            )}
          </div>
          {Array.isArray(data.items) && data.items.length > 0 ? (
          data.items.map((it) => (
            <div key={it.name + it.unit} className="control line-row-3">
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
            </div>
          ))
          ) : (
            <div className="dropdown-empty">Tidak ada item</div>
          )}
        </div>
      </section>

      <section className="actions" style={{ marginTop: 12 }}>
        <Link to="/pr" className="btn btn-primary">Ke halaman PR</Link>
      </section>
    </div>
  )
}
