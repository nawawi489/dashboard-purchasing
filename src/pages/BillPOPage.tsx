import Header from '../components/Header'
import { useEffect, useMemo, useState } from 'react'
import BillCard from '../components/BillCard'
import Pagination from '../components/Pagination'
import PaymentProofModal from '../components/PaymentProofModal'
import { fetchApprovalItems, ApprovalItem } from '../services/approval'
import { submitPaymentProof } from '../services/payment'

export default function BillPOPage() {
  const [items, setItems] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [outlet, setOutlet] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const itemsPerPage = 9

  // Modal State
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [selectedTrxId, setSelectedTrxId] = useState('')
  const [selectedOutlet, setSelectedOutlet] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  const loadData = async () => {
    setLoading(true)
    setError(null)
    try {
      const data = await fetchApprovalItems()
      setItems(data)
    } catch (e) {
      setError('Tidak dapat memuat data tagihan')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadData()
  }, [])

  const outlets = useMemo(() => {
    const set = new Set(items.map(i => i.outlet).filter(Boolean))
    return Array.from(set).sort()
  }, [items])

  // Group items by trxId AND outlet
  const groupedItems = useMemo(() => {
    // Filter by logic:
    // 1. statusPembayaran == 'Hutang'
    // 2. status IN ('Terima', 'Pending')
    // 3. Outlet matches (if selected)
    
    let filteredItems = items.filter(item => {
      const isHutang = (item.statusPembayaran || '').toLowerCase() === 'hutang'
      const isValidStatus = item.status === 'Terima' || item.status === 'Pending'
      return isHutang && isValidStatus
    })

    if (outlet) {
      filteredItems = filteredItems.filter(i => i.outlet === outlet)
    }

    const groups: Record<string, ApprovalItem[]> = {}
    filteredItems.forEach(item => {
      // Create composite key using trxId and outlet to ensure separation
      const trxId = item.trxId || 'UNKNOWN'
      const outlet = item.outlet || 'UNKNOWN'
      const key = `${trxId}||${outlet}`
      
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })
    
    // Convert to array and sort by date (newest first)
    return Object.entries(groups).map(([key, groupItems]) => {
      const [trxId] = key.split('||')
      return {
        trxId,
        items: groupItems,
        date: groupItems[0]?.date
      }
    }).sort((a, b) => {
       const da = a.date ? new Date(a.date).getTime() : 0
       const db = b.date ? new Date(b.date).getTime() : 0
       return db - da
    })
  }, [items, outlet])

  // Pagination Logic
  const totalPages = Math.ceil(groupedItems.length / itemsPerPage)
  const paginatedItems = groupedItems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  )

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [outlet])

  const handleOpenModal = (trxId: string, outletName: string) => {
    setSelectedTrxId(trxId)
    setSelectedOutlet(outletName)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    setIsModalOpen(false)
    setSelectedTrxId('')
    setSelectedOutlet('')
  }

  const handleSubmitPaymentProof = async (trxId: string, file: File) => {
    setIsSubmitting(true)
    try {
      const success = await submitPaymentProof(trxId, file, selectedOutlet)
      if (success) {
        alert(`Bukti pembayaran untuk ${trxId} berhasil dikirim!`)
        handleCloseModal()
        // Optional: Refresh data to reflect changes if needed
        // loadData() 
      }
    } catch (e) {
      alert('Gagal mengirim bukti pembayaran. Silakan coba lagi.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="container">
      <Header title="Tagihan PO" backTo="/" />
      <section className="hero">
        <h1>Tagihan PO</h1>
        <p>Input bukti pembayaran tagihan PO</p>
      </section>

      <section className="panel" style={{ marginBottom: 24 }}>
        <div className="form-grid">
          <div className="control">
            <label className="label">Filter Outlet</label>
            <select className="select" value={outlet} onChange={e => setOutlet(e.target.value)}>
              <option value="">Semua Outlet</option>
              {outlets.map(o => (<option key={o} value={o}>{o}</option>))}
            </select>
          </div>
        </div>
      </section>
      
      <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
        {loading ? (
          <div className="dropdown-empty">Memuat data…</div>
        ) : error ? (
          <div className="dropdown-empty" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
            <div style={{ marginBottom: 12, color: 'red' }}>{error}</div>
            <button className="btn" onClick={loadData}>Refresh Data</button>
          </div>
        ) : groupedItems.length === 0 ? (
          <div className="dropdown-empty">Tidak ada data tagihan</div>
        ) : (
          <>
            {paginatedItems.map((group, idx) => (
              <BillCard
                key={`${group.trxId}-${idx}`}
                trxId={group.trxId}
                items={group.items}
                onInputPaymentProof={() => handleOpenModal(group.trxId, group.items[0]?.outlet || '')}
              />
            ))}
            
            <Pagination 
              currentPage={currentPage} 
              totalPages={totalPages} 
              onPageChange={setCurrentPage} 
            />
          </>
        )}
      </section>

      <PaymentProofModal 
        isOpen={isModalOpen}
        onClose={handleCloseModal}
        trxId={selectedTrxId}
        outlet={selectedOutlet}
        onSubmit={handleSubmitPaymentProof}
        isLoading={isSubmitting}
      />
    </div>
  )
}
