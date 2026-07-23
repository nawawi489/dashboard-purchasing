import Header from '../components/Header'
import { useCallback, useEffect, useMemo, useRef, useState } from 'react'
import InventoryApprovalCard from '../components/InventoryApprovalCard'
import Pagination from '../components/Pagination'
import RejectReasonModal from '../components/RejectReasonModal'
import {
  fetchPerlengkapanApprovalItems,
  submitPerlengkapanApproval,
} from '../services/perlengkapanApproval'
import {
  InventoryApprovalItem,
  InventoryApprovalStatus,
} from '../types'
import { OUTLETS } from '../constants'

type SortOrder = 'desc' | 'asc'
type Decision = 'Terima' | 'Tolak'

// Konversi tanggal "DD/MM/YYYY" atau "YYYY-MM-DD" menjadi timestamp number.
function parseTanggalToTime(d?: string): number {
  if (!d) return 0
  const trimmed = d.trim()
  if (!trimmed) return 0

  // DD/MM/YYYY
  const slash = trimmed.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/)
  if (slash) {
    const [, dd, mm, yyyy] = slash
    const t = new Date(Number(yyyy), Number(mm) - 1, Number(dd)).getTime()
    return Number.isNaN(t) ? 0 : t
  }

  // Fallback: percayakan ke parser Date standar (ISO dll).
  const t = new Date(trimmed).getTime()
  return Number.isNaN(t) ? 0 : t
}

export default function PerlengkapanApprovalPage() {
  const [items, setItems] = useState<InventoryApprovalItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [outlet, setOutlet] = useState('')
  const [dataCache, setDataCache] = useState<Record<string, InventoryApprovalItem[]>>({})

  const [sort, setSort] = useState<SortOrder>('desc')
  const [page, setPage] = useState(1)
  const [submitting, setSubmitting] = useState<Record<string, boolean>>({})
  const [decided, setDecided] = useState<Record<string, Decision>>({})
  const [rejectingItem, setRejectingItem] = useState<InventoryApprovalItem | null>(null)
  const pageSize = 8

  // Refs untuk menghindari stale closure di dalam loadData
  const dataCacheRef = useRef(dataCache)
  const outletRef = useRef(outlet)
  useEffect(() => {
    dataCacheRef.current = dataCache
  }, [dataCache])
  useEffect(() => {
    outletRef.current = outlet
  }, [outlet])

  const loadData = useCallback(async (forceRefresh = false) => {
    const currentOutlet = outletRef.current
    const cache = dataCacheRef.current
    if (!forceRefresh && cache[currentOutlet] !== undefined) {
      setItems(cache[currentOutlet])
      return
    }

    setLoading(true)
    setError(null)
    try {
      const data = await fetchPerlengkapanApprovalItems(currentOutlet)
      setItems(data)
      setDataCache(prev => ({
        ...prev,
        [currentOutlet]: data,
      }))
    } catch (e) {
      setError('Tidak dapat memuat data approval perlengkapan')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    loadData()
  }, [outlet, loadData])

  const filtered = useMemo(() => {
    let base = items.filter(i => {
      const key = `${i.trxId}||${i.itemId}`
      const status = i.status === 'Pending' && decided[key] ? decided[key] : i.status
      // Hanya tampilkan yang masih menunggu keputusan (Pending / Terima / Tolak dari API atau state lokal)
      void status
      return true
    })

    if (outlet) base = base.filter(i => i.outlet === outlet)

    return base
  }, [items, outlet, decided])

  const sorted = useMemo(() => {
    const next = [...filtered].sort((a, b) => {
      const da = parseTanggalToTime(a.date)
      const db = parseTanggalToTime(b.date)
      return sort === 'desc' ? db - da : da - db
    })
    return next
  }, [filtered, sort])

  const totalPages = Math.max(1, Math.ceil(sorted.length / pageSize))
  const currentPage = Math.min(page, totalPages)
  const pageData = sorted.slice((currentPage - 1) * pageSize, currentPage * pageSize)

  const handleOutletChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOutlet(e.target.value)
    setPage(1)
  }

  const handleSortChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setSort(e.target.value as SortOrder)
    setPage(1)
  }

  const applyLocalDecision = (item: InventoryApprovalItem, decision: Decision) => {
    const key = `${item.trxId}||${item.itemId}`
    setDecided(prev => ({ ...prev, [key]: decision }))
    // Update items dan dataCache secara terpisah; updater harus pure (tanpa side-effect).
    setItems(prev => {
      const nextStatus: InventoryApprovalStatus = decision
      return prev.map(it =>
        it.trxId === item.trxId && it.itemId === item.itemId
          ? { ...it, status: nextStatus }
          : it,
      )
    })
    setDataCache(prev => {
      const currentOutlet = outletRef.current
      const list = prev[currentOutlet] || []
      const next = list.map(it =>
        it.trxId === item.trxId && it.itemId === item.itemId
          ? { ...it, status: decision }
          : it,
      )
      if (next === list) return prev
      return { ...prev, [currentOutlet]: next }
    })
  }

  const submitDecision = async (
    item: InventoryApprovalItem,
    decision: Decision,
    reason?: string,
  ) => {
    // itemId boleh kosong: item hasil input manual (bukan pilih dari database)
    // tidak punya ID katalog, tapi trxId tetap unik per baris pengajuan.
    if (!item.trxId || !item.outlet) {
      alert('Data tidak lengkap untuk approval perlengkapan')
      return
    }
    if (decision === 'Tolak' && !reason) {
      alert('Alasan penolakan wajib diisi')
      return
    }

    const key = `${item.trxId}||${item.itemId}`
    setSubmitting(prev => ({ ...prev, [key]: true }))
    try {
      await submitPerlengkapanApproval({
        trxId: item.trxId,
        itemId: item.itemId,
        outlet: item.outlet,
        status: decision,
        alasan: decision === 'Tolak' ? reason : undefined,
      })
      applyLocalDecision(item, decision)
      alert(
        decision === 'Terima'
          ? 'Approval perlengkapan berhasil dikirim'
          : 'Penolakan perlengkapan berhasil dikirim',
      )
    } catch (e) {
      alert('Gagal mengirim approval perlengkapan')
    } finally {
      setSubmitting(prev => ({ ...prev, [key]: false }))
    }
  }

  const handleAccept = async (item: InventoryApprovalItem) => {
    await submitDecision(item, 'Terima')
  }

  const handleRejectClick = (item: InventoryApprovalItem) => {
    setRejectingItem(item)
  }

  const handleRejectConfirm = async (reason: string) => {
    if (!rejectingItem) return
    const item = rejectingItem
    setRejectingItem(null)
    await submitDecision(item, 'Tolak', reason)
  }

  return (
    <div className="container">
      <Header title="Approval Perlengkapan" backTo="/" />
      <section className="hero">
        <h1>Approval Permintaan Perlengkapan</h1>
        <p>Cek &amp; setujui pengajuan perlengkapan</p>
      </section>
      <section className="panel">
        <div className="form-grid">
          <div className="control">
            <label className="label">Filter Outlet</label>
            <select className="select" value={outlet} onChange={handleOutletChange}>
              <option value="">Semua Outlet</option>
              {OUTLETS.map(o => (<option key={o} value={o}>{o}</option>))}
            </select>
          </div>
          <div className="control">
            <label className="label">Urutkan Tanggal</label>
            <select className="select" value={sort} onChange={handleSortChange}>
              <option value="desc">Terbaru</option>
              <option value="asc">Terlama</option>
            </select>
          </div>
        </div>
      </section>
      <section
        className="grid"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}
      >
        {loading ? (
          <div className="dropdown-empty">Memuat data…</div>
        ) : error ? (
          <div
            className="dropdown-empty"
            style={{
              gridColumn: '1 / -1',
              display: 'flex',
              flexDirection: 'column',
              alignItems: 'center',
              justifyContent: 'center',
              padding: '40px',
            }}
          >
            <div style={{ marginBottom: 12, color: 'red' }}>{error}</div>
            <button className="btn" onClick={() => loadData(true)}>Refresh Data</button>
          </div>
        ) : pageData.length === 0 ? (
          <div className="dropdown-empty">Tidak ada data</div>
        ) : (
          pageData.map((i, idx) => {
            const key = `${i.trxId}||${i.itemId}`
            const localDecision = decided[key]
            const isAccepted =
              localDecision === 'Terima' || (!localDecision && i.status === 'Terima')
            const isRejected =
              localDecision === 'Tolak' || (!localDecision && i.status === 'Tolak')
            return (
              <InventoryApprovalCard
                key={`${i.trxId}-${i.itemId}-${idx}`}
                trxId={i.trxId}
                date={i.date}
                itemId={i.itemId}
                itemName={i.itemName}
                outlet={i.outlet}
                spesifikasi={i.spesifikasi}
                quantity={i.quantity}
                totalEstimasiBiaya={i.totalEstimasiBiaya}
                status={i.status}
                verifikasiSpv={i.verifikasiSpv}
                nominalDisetujui={i.nominalDisetujui}
                onAccept={() => handleAccept(i)}
                onReject={() => handleRejectClick(i)}
                isSubmitting={submitting[key]}
                isAccepted={isAccepted}
                isRejected={isRejected}
              />
            )
          })
        )}
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setPage}
        />
      </section>

      <RejectReasonModal
        isOpen={rejectingItem !== null}
        onClose={() => setRejectingItem(null)}
        onConfirm={handleRejectConfirm}
        trxId={rejectingItem?.trxId || ''}
        itemName={rejectingItem?.itemName || ''}
        isLoading={
          rejectingItem
            ? submitting[`${rejectingItem.trxId}||${rejectingItem.itemId}`]
            : false
        }
      />
    </div>
  )
}
