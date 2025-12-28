import { useState, useRef, useEffect, useMemo } from 'react'
import { fetchItems } from '../services/items'
import { ItemRow } from '../types'

type Props = {
  value: string
  onChange: (item: ItemRow | null, name: string) => void
}

export default function ItemSearchDropdown({ value, onChange }: Props) {
  const [items, setItems] = useState<ItemRow[]>([])
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

  const filteredItems = useMemo(() => {
    const q = search.trim().toLowerCase()
    return (q ? items.filter(it => it.name.toLowerCase().includes(q)) : items).slice(0, 50)
  }, [items, search])

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setOpen(true)
    setSearch(e.target.value)
    if (!open) loadItems()
  }

  const handleInputFocus = () => {
    setOpen(true)
    loadItems()
  }

  const handleItemClick = (it: ItemRow) => {
    onChange(it, it.name)
    setOpen(false)
    setSearch('')
  }

  return (
    <div ref={dropdownRef} className="control dropdown">
      <label className="label">Nama Barang</label>
      <input 
        className="input" 
        placeholder="Cari atau pilih barang"
        value={open ? search : value}
        onChange={handleInputChange}
        onFocus={handleInputFocus}
      />
      {open && (
        <div className="dropdown-panel" onMouseDown={e => e.preventDefault()}>
          {loading ? (
            <div className="dropdown-empty">Memuat data…</div>
          ) : error ? (
            <div className="dropdown-empty">{error}</div>
          ) : filteredItems.length === 0 ? (
            <div className="dropdown-empty">Tidak ada hasil</div>
          ) : (
            filteredItems.map(it => (
              <div 
                key={it.name} 
                className="dropdown-item"
                onClick={() => handleItemClick(it)}
              >
                <span>{it.name}</span>
                <span style={{ color: 'var(--muted)', fontSize: 12 }}>
                  {it.supplier || '-'}
                </span>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  )
}
