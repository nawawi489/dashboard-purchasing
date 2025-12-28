import { useNavigate } from 'react-router-dom'
import { useState } from 'react'
import Header from '../components/Header'
import { OUTLETS } from '../constants'
import { LineItem } from '../types'

export default function ManualPurchaseRequestPage() {
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
  const [itemsList, setItemsList] = useState<LineItem[]>([])
  const [editQuantities, setEditQuantities] = useState<Record<number, string>>({})

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => setDate(e.target.value)
  const handleOutletChange = (e: React.ChangeEvent<HTMLSelectElement>) => setOutlet(e.target.value)
  const handleItemNameChange = (e: React.ChangeEvent<HTMLInputElement>) => setItemName(e.target.value)
  const handleUnitChange = (e: React.ChangeEvent<HTMLInputElement>) => setUnit(e.target.value)
  const handleSupplierChange = (e: React.ChangeEvent<HTMLInputElement>) => setSupplier(e.target.value)
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => setPrice(Number(e.target.value))
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => setQuantity(Number(e.target.value))

  const resetForm = () => {
    setItemName('')
    setUnit('')
    setSupplier('')
    setPrice(0)
    setQuantity(1)
  }

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
    resetForm()
  }

  const handleListQtyChange = (idx: number, value: string) => {
    setEditQuantities(prev => ({ ...prev, [idx]: value }))
  }

  const handleListQtyBlur = (idx: number) => {
    const raw = editQuantities[idx]
    const num = Number(raw)
    const q = !raw || isNaN(num) || num <= 0 ? 1 : num
    const next = [...itemsList]
    next[idx] = { ...next[idx], quantity: q }
    setItemsList(next)
    setEditQuantities(prev => {
      const { [idx]: _, ...rest } = prev
      return rest
    })
  }

  const handleRemoveItem = (idx: number) => {
    const next = itemsList.filter((_, i) => i !== idx)
    setItemsList(next)
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
            <input type="date" className="input" value={date} onChange={handleDateChange} />
          </div>
          <div className="control">
            <label className="label">Outlet</label>
            <select className="select" value={outlet} onChange={handleOutletChange}>
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
              onChange={handleItemNameChange}
            />
          </div>
          <div className="control">
            <label className="label">Satuan</label>
            <input 
              className="input" 
              placeholder="Contoh: kg, box, pcs" 
              value={unit} 
              onChange={handleUnitChange} 
            />
          </div>
          <div className="control">
            <label className="label">Nama Supplier</label>
            <input 
              className="input" 
              placeholder="Nama Supplier"
              value={supplier} 
              onChange={handleSupplierChange} 
            />
          </div>
          <div className="control">
            <label className="label">Harga Satuan</label>
            <input 
              type="number"
              className="input" 
              placeholder="0"
              value={price || ''} 
              onChange={handlePriceChange} 
            />
          </div>
          <div className="control">
            <label className="label">Jumlah</label>
            <input type="number" min={1} className="input" value={quantity} onChange={handleQuantityChange} />
          </div>
        </div>
        <div className="actions">
          <button className="btn" onClick={resetForm}>Reset</button>
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
                    <input 
                      type="number" 
                      min={1} 
                      className="input qty-input" 
                      value={editQuantities[idx] ?? String(it.quantity)} 
                      onChange={e => handleListQtyChange(idx, e.target.value)} 
                      onBlur={() => handleListQtyBlur(idx)}
                    />
                    <button className="btn" onClick={() => handleRemoveItem(idx)}>Hapus</button>
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
