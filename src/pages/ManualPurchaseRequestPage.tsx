import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Header from '../components/Header'

export default function ManualPurchaseRequestPage() {
  const navigate = useNavigate()
  const outlets = [
    'Pizza Nyantuy Sungai Poso',
    'Pizza Nyantuy Gowa',
    'Pizza Nyantuy Sudiang',
    'Pizza Nyantuy Barombong',
    'Pizza Nyantuy Limbung',
  ]

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10))
  const [outlet, setOutlet] = useState<string>('')
  const [itemName, setItemName] = useState<string>('')
  const [unit, setUnit] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [supplier, setSupplier] = useState<string>('')
  const [price, setPrice] = useState<number>(0)
  const [itemsList, setItemsList] = useState<Array<{ name: string; unit: string; quantity: number; price?: number; supplier?: string; phone?: string }>>([])

  const addToList = () => {
    if (!itemName || !unit || quantity <= 0) return
    const currentSupplier = supplier || ''
    
    // Check for mixed suppliers
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
      next[idx] = { ...prev, quantity: prev.quantity + quantity, price: price || prev.price, supplier: currentSupplier || prev.supplier }
      setItemsList(next)
    } else {
      setItemsList([...itemsList, { name: itemName, unit, quantity, price, supplier: currentSupplier }])
    }
    setItemName('')
    setUnit('')
    // Keep supplier same for convenience or reset? Usually reset if we want fresh input, but user might be entering multiple items from same supplier.
    // In original PR page, supplier comes from item selection. Here it is manual.
    // Let's reset it to avoid confusion, or keep it? The requirement says "input manual", doesn't specify behavior.
    // Resetting seems safer to avoid accidental wrong supplier.
    // setSupplier('') 
    // Actually, if they are adding multiple items from same supplier manually, keeping it might be better.
    // But let's follow the original page's behavior:
    // Original: setSupplier('') (line 86)
    setSupplier('')
    setPrice(0)
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
      <Header title="Input Manual PO" backTo="/pr" />
      <section className="hero">
        <h1>Input Manual PO</h1>
        <p>Isi form di bawah ini secara manual jika barang tidak ditemukan.</p>
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
          <div className="control">
            <label className="label">Nama Barang</label>
            <input 
              className="input" 
              placeholder="Nama Barang"
              value={itemName}
              onChange={e => setItemName(e.target.value)}
            />
          </div>
          <div className="control">
            <label className="label">Satuan</label>
            <input 
              className="input" 
              placeholder="Contoh: kg, box, pcs" 
              value={unit} 
              onChange={e => setUnit(e.target.value)} 
            />
          </div>
          <div className="control">
            <label className="label">Nama Supplier</label>
            <input 
              className="input" 
              placeholder="Nama Supplier"
              value={supplier} 
              onChange={e => setSupplier(e.target.value)} 
            />
          </div>
          <div className="control">
            <label className="label">Harga Satuan</label>
            <input 
              type="number"
              className="input" 
              placeholder="0"
              value={price || ''} 
              onChange={e => setPrice(Number(e.target.value))} 
            />
          </div>
          <div className="control">
            <label className="label">Jumlah</label>
            <input type="number" min={1} className="input" value={quantity} onChange={e => setQuantity(Number(e.target.value))} />
          </div>
        </div>
        <div className="actions">
          <button className="btn" onClick={() => { setItemName(''); setUnit(''); setSupplier(''); setPrice(0); setQuantity(1); }}>Reset</button>
          <button className="btn" disabled={!itemName || !unit || quantity <= 0} onClick={addToList}>Tambah ke daftar</button>
          <button className="btn btn-primary" disabled={submitting || !date || !outlet || itemsList.length === 0} onClick={handleSubmit}>Kirim</button>
        </div>
      </section>

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
