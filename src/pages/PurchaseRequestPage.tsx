import { useNavigate, Link } from 'react-router-dom'
import { useState } from 'react'
import { Minus, Plus, Trash2 } from 'lucide-react'
import Header from '../components/Header'
import ItemSearchDropdown from '../components/ItemSearchDropdown'
import { OUTLETS } from '../constants'
import { LineItem } from '../types'

export default function PurchaseRequestPage() {
  const navigate = useNavigate()
  const outlets = OUTLETS

  const [date, setDate] = useState<string>(new Date().toISOString().slice(0,10))
  const [outlet, setOutlet] = useState<string>('')
  const [itemId, setItemId] = useState<string>('')
  const [itemName, setItemName] = useState<string>('')
  const [unit, setUnit] = useState<string>('')
  const [quantity, setQuantity] = useState<number>(1)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [supplier, setSupplier] = useState<string>('')
  const [price, setPrice] = useState<number>(0)
  const [phone, setPhone] = useState<string>('')
  const [itemsList, setItemsList] = useState<LineItem[]>([])

  const resetForm = () => {
    setItemId('')
    setItemName('')
    setUnit('')
    setSupplier('')
    setPrice(0)
    setPhone('')
    setQuantity(1)
  }

  const addToList = () => {
    if (!itemName || !unit || quantity <= 0) return
    const currentSupplier = supplier || ''
    
    const idx = itemsList.findIndex(it => it.name === itemName && it.unit === unit && it.supplier === currentSupplier)
    if (idx >= 0) {
      const next = [...itemsList]
      const prev = next[idx]
      next[idx] = { 
        ...prev, 
        quantity: prev.quantity + quantity, 
        price: price || prev.price, 
        supplier: currentSupplier || prev.supplier, 
        phone: phone || prev.phone 
      }
      setItemsList(next)
    } else {
      setItemsList([...itemsList, { 
        id: itemId,
        name: itemName, 
        unit, 
        quantity, 
        price, 
        supplier: currentSupplier, 
        phone 
      }])
    }
    resetForm()
  }

  // Group items by supplier
  const groupedItems = itemsList.reduce((acc, item) => {
    const key = item.supplier || 'Tanpa Supplier'
    if (!acc[key]) acc[key] = []
    acc[key].push(item)
    return acc
  }, {} as Record<string, LineItem[]>)

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

  const handleDateChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setDate(e.target.value)
  }

  const handleOutletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOutlet(e.target.value)
  }

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setQuantity(Number(e.target.value))
  }

  const handleItemQuantityChange = (idx: number, val: number) => {
    const q = val || 1
    const next = [...itemsList]
    next[idx] = { ...next[idx], quantity: q }
    setItemsList(next)
  }

  const handleRemoveItem = (idx: number) => {
    const next = itemsList.filter((_, i) => i !== idx)
    setItemsList(next)
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
            <input type="date" className="input" value={date} onChange={handleDateChange} />
          </div>
          <div className="control">
            <label className="label">Outlet</label>
            <select className="select" value={outlet} onChange={handleOutletChange}>
              <option value="">Pilih Outlet</option>
              {outlets.map(o => (<option key={o} value={o}>{o}</option>))}
            </select>
          </div>
          
          <ItemSearchDropdown 
            value={itemName}
            onChange={(item, name) => {
              setItemName(name)
              if (item) {
                setItemId(item.id || '')
                setUnit(item.unit)
                setSupplier(item.supplier || '')
                setPrice(item.price || 0)
                setPhone(item.phone || '')
              }
            }}
          />

          <div className="control">
            <label className="label">Satuan</label>
            <input className="input" placeholder="Contoh: kg, box, pcs" value={unit} readOnly />
          </div>
          <div className="control">
            <label className="label">Nama Supplier</label>
            <input className="input" value={supplier} readOnly />
          </div>
          <div className="control">
            <label className="label">Harga Satuan</label>
            <input className="input" value={price ? new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(price) : ''} readOnly />
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

      <section className="panel" style={{ marginTop: 12, backgroundColor: 'transparent', boxShadow: 'none', border: 'none', padding: 0 }}>
        {itemsList.length === 0 ? (
          <div className="panel dropdown-empty">Belum ada barang dalam daftar</div>
        ) : (
          Object.entries(groupedItems).map(([supplierName, items]) => (
            <div key={supplierName} className="panel" style={{ marginBottom: 16 }}>
              <div style={{ fontWeight: 'bold', marginBottom: 12, fontSize: '1.1rem' }}>{supplierName}</div>
              {items.map((it, idx) => {
                // Find original index in itemsList for updates
                const originalIdx = itemsList.indexOf(it)
                return (
                   <div key={idx} style={{ marginBottom: 12, borderBottom: '1px solid #eee', paddingBottom: 12 }}>
                     <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: 8 }}>{it.name}</div>
                     
                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                       <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                         <div style={{ fontSize: '0.9rem', color: '#666' }}>{it.id || '-'}</div>
                         <div style={{ fontSize: '0.9rem', color: '#666' }}>{it.unit}</div>
                       </div>
                       
                       <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                         <button 
                           className="btn" 
                           style={{ padding: 8, minWidth: 32, display: 'grid', placeItems: 'center' }}
                           onClick={() => handleItemQuantityChange(originalIdx, it.quantity - 1)}
                           disabled={it.quantity <= 1}
                         >
                           <Minus size={16} />
                         </button>
                         <input 
                           type="number" 
                           min={1} 
                           style={{ width: 60, textAlign: 'center', padding: '4px', border: '1px solid #ccc', borderRadius: 4 }}
                           value={it.quantity} 
                           onChange={e => handleItemQuantityChange(originalIdx, Number(e.target.value))} 
                         />
                         <button 
                           className="btn" 
                           style={{ padding: 8, minWidth: 32, display: 'grid', placeItems: 'center' }}
                           onClick={() => handleItemQuantityChange(originalIdx, it.quantity + 1)}
                         >
                           <Plus size={16} />
                         </button>
                         <div style={{ borderLeft: '1px solid #ccc', height: 24, margin: '0 8px' }}></div>
                          <button 
                            className="btn" 
                            style={{ color: 'red', borderColor: 'red', padding: 8, minWidth: 32, display: 'grid', placeItems: 'center' }} 
                            onClick={() => handleRemoveItem(originalIdx)}
                            title="Hapus"
                          >
                            <Trash2 size={16} />
                          </button>
                       </div>
                     </div>
                   </div>
                 )
              })}
            </div>
          ))
        )}
      </section>
    </div>
  )
}
