import Header from '../components/Header'
import { useEffect, useMemo, useState } from 'react'
import ApprovalCard from '../components/ApprovalCard'
import Pagination from '../components/Pagination'
import { fetchApprovalItems, ApprovalItem } from '../services/approval'

export default function ApprovalPage() {
  const [items, setItems] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [outlet, setOutlet] = useState('')
  const [status, setStatus] = useState('')
  const [sort, setSort] = useState<'desc' | 'asc'>('desc')
  const [page, setPage] = useState(1)
  const pageSize = 8

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchApprovalItems()
      setItems(data)
    } catch (e) {
      setError('Tidak dapat memuat data approval')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const outlets = useMemo(() => {
    const set = new Set(items.map(i => i.outlet).filter(Boolean))
    return Array.from(set)
  }, [items])

  const filtered = useMemo(() => {
    // Filter hanya yang VerifikasiSPV = false
    let base = items.filter(i => i.verifikasiSpv === false)
    
    if (outlet) base = base.filter(i => i.outlet === outlet)
    if (status) base = base.filter(i => i.status === status)
    return base
  }, [items, outlet, status])

  const sorted = useMemo(() => {
    const toTime = (d?: string) => (d ? new Date(d).getTime() || 0 : 0)
    const next = [...filtered].sort((a, b) => {
      const da = toTime(a.date)
      const db = toTime(b.date)
      return sort === 'desc' ? db - da : da - db
    })
    return next
  }, [filtered, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageData = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  return (
    <div className="container">
      <Header title="Approval" backTo="/" />
      <section className="hero">
        <h1>Approval</h1>
        <p>Cek status pesanan PO</p>
      </section>
      <section className="panel">
        <div className="form-grid">
          <div className="control">
            <label className="label">Filter Outlet</label>
            <select className="select" value={outlet} onChange={e => { setOutlet(e.target.value); setPage(1) }}>
              <option value="">Semua Outlet</option>
              {outlets.map(o => (<option key={o} value={o}>{o}</option>))}
            </select>
          </div>
          <div className="control">
            <label className="label">Filter Status</label>
            <select className="select" value={status} onChange={e => { setStatus(e.target.value); setPage(1) }}>
              <option value="">Semua Status</option>
              <option value="Terima">Terima</option>
              <option value="Tolak">Tolak</option>
              <option value="Pending">Pending</option>
            </select>
          </div>
          <div className="control">
            <label className="label">Urutkan Tanggal</label>
            <select className="select" value={sort} onChange={e => { setSort((e.target.value as any) || 'desc'); setPage(1) }}>
              <option value="desc">Terbaru</option>
              <option value="asc">Terlama</option>
            </select>
          </div>
        </div>
      </section>
      <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
        {loading ? (
          <div className="dropdown-empty">Memuat data…</div>
        ) : error ? (
          <div className="dropdown-empty" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <div style={{ marginBottom: 12, color: 'red' }}>{error}</div>
            <button className="btn" onClick={loadData}>Refresh Data</button>
          </div>
        ) : pageData.length === 0 ? (
          <div className="dropdown-empty">Tidak ada data</div>
        ) : (
          pageData.map((i, idx) => (
            <ApprovalCard
              key={i.trxId + i.itemName + i.unit + idx}
              trxId={i.trxId}
              tag={i.tag}
              date={i.date}
              itemId={i.itemId}
              itemName={i.itemName}
              outlet={i.outlet}
              supplier={i.supplier}
              unit={i.unit}
              quantity={i.quantity}
              price={i.price}
              status={i.status}
            />
          ))
        )}
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setPage} 
        />
      </section>
    </div>
  )
}
