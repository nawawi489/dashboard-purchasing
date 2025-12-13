import { useState, useRef, useEffect } from 'react'
import { fetchItems } from '../services/items'

type Item = {
  name: string
  unit: string
  supplier?: string
  price?: number
  phone?: string
}

type Props = {
  value: string
  onChange: (item: Item | null, name: string) => void
}

export default function ItemSearchDropdown({ value, onChange }: Props) {
  const [items, setItems] = useState<Item[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [open, setOpen] = useState(false)
  const [search, setSearch] = useState('')
  const dropdownRef = useRef<HTMLDivElement>(null)

  const loadItems = async () => {
    if (loading) return
    setLoading(true)
    setError(null)
    try {
      const data = await fetchItems()
      setItems(data)
    } catch (e) {
      console.error('Gagal mengambil data barang', e)
      setError('Tidak dapat memuat data barang')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false)
        setSearch('')
      }
    }
    document.addEventListener('mousedown', handler)
    return () => document.removeEventListener('mousedown', handler)
  }, [])

  return (
    <div ref={dropdownRef} className="control dropdown">
      <label className="label">Nama Barang</label>
      <input 
        className="input" 
        placeholder="Cari atau pilih barang"
        value={open ? search : value}
        onChange={e => {
          setOpen(true)
          setSearch(e.target.value)
          // Allow typing new name that doesn't exist in list
          if (!open) loadItems()
        }}
        onFocus={() => { 
          setOpen(true)
          loadItems() 
        }}
      />
      {open && (
        <div className="dropdown-panel" onMouseDown={e => e.preventDefault()}>
          {loading ? (
            <div className="dropdown-empty">Memuat data…</div>
          ) : error ? (
            <div className="dropdown-empty">{error}</div>
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
                    onChange(it, it.name)
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
  )
}
