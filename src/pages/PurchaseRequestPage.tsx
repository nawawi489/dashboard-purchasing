import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import Header from '../components/Header'
import ItemSearchDropdown from '../components/ItemSearchDropdown'
import { OUTLETS } from '../constants'

export default function PurchaseRequestPage() {
  const navigate = useNavigate()
  const outlets = OUTLETS

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10))
  const [outlet, setOutlet] = useState<string>('')
  const [itemName, setItemName] = useState<string>('')
  const [unit, setUnit] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [supplier, setSupplier] = useState<string>('')
  const [price, setPrice] = useState<number>(0)
  const [phone, setPhone] = useState<string>('')
  const [itemsList, setItemsList] = useState<Array<{ name: string; unit: string; quantity: number; price?: number; supplier?: string; phone?: string }>>([])

  const addToList = () => {
    if (!itemName || !unit || quantity <= 0) return
    const currentSupplier = supplier || ''
    if (itemsList.length > 0) {
      const headerSupplier = itemsList[0].supplier || ''
      if (headerSupplier && currentSupplier && headerSupplier !== currentSupplier) {
        alert('Barang dari supplier berbeda akan dibuat PO terpisah. Tambahkan hanya dari satu supplier.')
        return
      }
    }
    const idx = itemsList.findIndex(it => it.name === itemName && it.unit === unit)
    if (idx >= 0) {
      const next = [...itemsList]
      const prev = next[idx]
      next[idx] = { ...prev, quantity: prev.quantity + quantity, price: price || prev.price, supplier: currentSupplier || prev.supplier, phone: phone || prev.phone }
      setItemsList(next)
    } else {
      setItemsList([...itemsList, { name: itemName, unit, quantity, price, supplier: currentSupplier, phone }])
    }
    setItemName('')
    setUnit('')
    setSupplier('')
    setPrice(0)
    setPhone('')
    setQuantity(1)
  }

  const handleSubmit = async () => {
    if (!date || !outlet) return
    if (itemsList.length === 0) {
      alert('Tambahkan minimal satu barang ke daftar sebelum mengirim.')
      return
    }
    setSubmitting(true)
    const payload = { date, outlet, items: itemsList }
    navigate('/confirm-po', { state: payload })
    setSubmitting(false)
  }

  return (
    <div className="container">
      <Header title="Permintaan Pembelian" backTo="/" />
      <section className="hero">
        <h1>Permintaan PO</h1>
        <p>Silakan isi form di bawah ini untuk input PO.</p>
      </section>

      <section className="panel">
        <div className="form-grid">
          <div className="control">
            <label className="label">Tanggal PO</label>
            <input type="date" className="input" value={date} onChange={e => setDate(e.target.value)} />
          </div>
          <div className="control">
            <label className="label">Outlet</label>
            <select className="select" value={outlet} onChange={e => setOutlet(e.target.value)}>
              <option value="">Pilih Outlet</option>
              {outlets.map(o => (<option key={o} value={o}>{o}</option>))}
            </select>
          </div>
          
          <ItemSearchDropdown 
            value={itemName}
            onChange={(item, name) => {
              setItemName(name)
              if (item) {
                setUnit(item.unit)
                setSupplier(item.supplier || '')
                setPrice(item.price || 0)
                setPhone(item.phone || '')
              } else {
                // Reset fields if needed when custom name is typed
                // For now, we keep previous values or user clears them manually
              }
            }}
          />

          <div className="control">
            <label className="label">Satuan</label>
            <input className="input" placeholder="Contoh: kg, box, pcs" value={unit} onChange={e => setUnit(e.target.value)} readOnly={true} />
          </div>
          <div className="control">
            <label className="label">Nama Supplier</label>
            <input className="input" value={supplier} readOnly={true} />
          </div>
          <div className="control">
            <label className="label">Harga Satuan</label>
            <input className="input" value={price ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price) : ''} readOnly={true} />
          </div>
          <div className="control">
            <label className="label">Jumlah</label>
            <input type="number" min={1} className="input" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
          </div>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => { setItemName(''); setUnit(''); setSupplier(''); setPrice(0); setPhone(''); setQuantity(1); }}>Reset</button>
          <button className="btn" disabled={!itemName || !unit || quantity <= 0} onClick={addToList}>Tambah ke daftar</button>
          <button className="btn btn-primary" disabled={submitting || !date || !outlet || itemsList.length === 0} onClick={handleSubmit}>Kirim</button>
        </div>
      </section>

      <div style={{ marginTop: 12, textAlign: 'center', fontSize: 14, color: 'var(--muted)' }}>
        Jika tidak menemukan barang yang dicari, silakan <Link to="/pr/manual" style={{ color: 'var(--primary)', textDecoration: 'underline' }}>isi form kosong</Link>.
      </div>

      <section className="panel" style={{ marginTop: 12 }}>
        <div className="form-grid">
          {itemsList.length === 0 ? (
            <div className="dropdown-empty">Belum ada barang dalam daftar</div>
          ) : (
            itemsList.map((it, idx) => (
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
                  <div className="qty-row">
                    <input type="number" min={1} className="input qty-input" value={it.quantity} onChange={e => {
                      const q = Number(e.target.value) || 1
                      const next = [...itemsList]
                      next[idx] = { ...it, quantity: q }
                      setItemsList(next)
                    }} />
                    <button className="btn" onClick={() => {
                      const next = itemsList.filter((x, i) => i !== idx)
                      setItemsList(next)
                    }}>Hapus</button>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </section>
    </div>
  )
}
