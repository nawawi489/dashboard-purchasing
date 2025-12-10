import { useNavigate, Link } from 'react-router-dom'
import { useEffect, useRef, useState } from 'react'
import Header from '../components/Header'
import { normalizeNumber, normalizeText } from '../utils/format'
import { fetchItems } from '../services/items'

export default function PurchaseRequestPage() {
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
  const [phone, setPhone] = useState<string>('')
  const [itemsList, setItemsList] = useState<Array<{ name: string; unit: string; quantity: number; price?: number; supplier?: string; phone?: string }>>([])
  const [items, setItems] = useState<Array<{ name: string; unit: string; supplier?: string; price?: number; phone?: string }>>([])
  const [search, setSearch] = useState<string>('')
  const [open, setOpen] = useState<boolean>(false)
  const [loadingItems, setLoadingItems] = useState<boolean>(false)
  const [loadError, setLoadError] = useState<string | null>(null)
  const dropdownRef = useRef<HTMLDivElement | null>(null)

  const formatIDR = (n: number) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n)

  const loadItems = async () => {
    if (loadingItems) return
    setLoadingItems(true)
    setLoadError(null)
    try {
      const data = await fetchItems()
      setItems(data)
    } catch (e) {
      console.error('Gagal mengambil data barang', e)
      setLoadError('Tidak dapat memuat data barang')
    } finally {
      setLoadingItems(false)
    }
  }

  useEffect(() => { loadItems() }, [])

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (!dropdownRef.current) return
      if (!dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

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
          <div ref={dropdownRef} className="control dropdown">
            <label className="label">Nama Barang</label>
            <input 
              className="input" 
              placeholder="Cari atau pilih barang"
              value={open ? search : itemName}
              onChange={e => {
                setOpen(true)
                setSearch(e.target.value)
              }}
              onFocus={() => { setOpen(true); loadItems() }}
            />
            {open && (
              <div className="dropdown-panel" onMouseDown={e => e.preventDefault()}>
                {loadingItems ? (
                  <div className="dropdown-empty">Memuat data…</div>
                ) : loadError ? (
                  <div className="dropdown-empty">{loadError}</div>
                ) : (
                  (() => {
                    const q = search.trim().toLowerCase()
                    const filtered = (q ? items.filter(it => it.name.toLowerCase().includes(q)) : items).slice(0, 50)
                    if (filtered.length === 0) return <div className="dropdown-empty">Tidak ada hasil</div>
                    return filtered.map(it => (
                      <div 
                        key={it.name} 
                        className="dropdown-item"
                        onClick={() => {
                          setItemName(it.name)
                          setUnit(it.unit)
                          setSupplier(it.supplier || '')
                          setPrice(it.price || 0)
                          setPhone(it.phone || '')
                          setOpen(false)
                          setSearch('')
                        }}
                      >
                        <span>{it.name}</span>
                        <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                          {it.supplier || '-'}
                        </span>
                      </div>
                    ))
                  })()
                )}
              </div>
            )}
          </div>
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
