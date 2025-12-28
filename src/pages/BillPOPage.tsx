import Header from '../components/Header'
import { useEffect, useMemo, useState } from 'react'
import BillCard from '../components/BillCard'
import Pagination from '../components/Pagination'
import PaymentProofModal from '../components/PaymentProofModal'
import { fetchApprovalItems } from '../services/approval'
import { submitPaymentProof } from '../services/payment'
import { ApprovalItem } from '../types'

interface BillGroup {
  invoice: string
  trxId: string
  outlet: string
  items: ApprovalItem[]
  date?: string
}

const ITEMS_PER_PAGE = 9

export default function BillPOPage() {
  // Data State
  const [items, setItems] = useState<ApprovalItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  
  // UI State
  const [outletFilter, setOutletFilter] = useState('')
  const [currentPage, setCurrentPage] = useState(1)

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    trxId: string
    outlet: string
    invoice: string
    isSubmitting: boolean
  }>({
    isOpen: false,
    trxId: '',
    outlet: '',
    invoice: '',
    isSubmitting: false
  })

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

  // Reset page when filter changes
  useEffect(() => {
    setCurrentPage(1)
  }, [outletFilter])

  const outlets = useMemo(() => {
    const set = new Set(items.map(i => i.outlet).filter(Boolean))
    return Array.from(set).sort()
  }, [items])

  // Group items by nomorInvoice AND outlet
  const groupedItems = useMemo<BillGroup[]>(() => {
    // 1. Filter items
    const filtered = items.filter(item => {
      const isHutang = (item.statusPembayaran || '').toLowerCase() === 'hutang'
      const isValidStatus = ['Terima', 'Pending'].includes(item.status || '')
      const matchesOutlet = !outletFilter || item.outlet === outletFilter
      const inv = (item.nomorInvoice || '').trim()
      const hasInvoice = inv.length > 0
      return isHutang && isValidStatus && matchesOutlet && hasInvoice
    })

    // 2. Group by composite key
    const groups: Record<string, ApprovalItem[]> = {}
    filtered.forEach(item => {
      const inv = (item.nomorInvoice || '').trim() || 'UNKNOWN'
      const outlet = item.outlet || 'UNKNOWN'
      const key = `${inv}||${outlet}`
      
      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })
    
    // 3. Convert to array and sort
    return Object.entries(groups)
      .map(([key, groupItems]) => {
        const [invoice, outlet] = key.split('||')
        return {
          invoice,
          trxId: groupItems[0]?.trxId || 'UNKNOWN',
          outlet,
          items: groupItems,
          date: groupItems[0]?.date
        }
      })
      .sort((a, b) => {
         const da = a.date ? new Date(a.date).getTime() : 0
         const db = b.date ? new Date(b.date).getTime() : 0
         return db - da
      })
  }, [items, outletFilter])

  // Pagination Logic
  const totalPages = Math.ceil(groupedItems.length / ITEMS_PER_PAGE)
  const paginatedItems = groupedItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  )

  const handleOpenModal = (trxId: string, outletName: string, invoiceNumber: string) => {
    setModalState(prev => ({
      ...prev,
      isOpen: true,
      trxId: trxId,
      outlet: outletName,
      invoice: invoiceNumber
    }))
  }

  const handleCloseModal = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false,
      trxId: '',
      outlet: ''
    }))
  }

  const handleOutletFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOutletFilter(e.target.value)
  }

  const handleSubmitPaymentProof = async (trxId: string, file: File, invoiceNumber: string) => {
    setModalState(prev => ({ ...prev, isSubmitting: true }))
    try {
      const success = await submitPaymentProof(trxId, file, modalState.outlet, invoiceNumber)
      if (success) {
        alert(`Bukti pembayaran untuk ${trxId} berhasil dikirim!`)
        handleCloseModal()
        // Optional: Refresh data to reflect changes if needed
        // loadData() 
      }
    } catch (e) {
      alert('Gagal mengirim bukti pembayaran. Silakan coba lagi.')
    } finally {
      setModalState(prev => ({ ...prev, isSubmitting: false }))
    }
  }

  const renderContent = () => {
    if (loading) {
      return <div className="dropdown-empty">Memuat data…</div>
    }

    if (error) {
      return (
        <div className="dropdown-empty" style={{ gridColumn: '1 / -1', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px' }}>
          <div style={{ marginBottom: 12, color: 'red' }}>{error}</div>
          <button className="btn" onClick={loadData}>Refresh Data</button>
        </div>
      )
    }

    if (groupedItems.length === 0) {
      return <div className="dropdown-empty">Tidak ada data tagihan</div>
    }

    return (
      <>
        {paginatedItems.map((group) => (
          <BillCard
            key={`${group.invoice}-${group.outlet}`}
            trxId={group.trxId}
            items={group.items}
            onInputPaymentProof={() => handleOpenModal(group.trxId, group.outlet, group.invoice)}
            invoice={group.invoice}
          />
        ))}
        
        <Pagination 
          currentPage={currentPage} 
          totalPages={totalPages} 
          onPageChange={setCurrentPage} 
        />
      </>
    )
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
            <select 
              className="select" 
              value={outletFilter} 
              onChange={handleOutletFilterChange}
            >
              <option value="">Semua Outlet</option>
              {outlets.map(o => (<option key={o} value={o}>{o}</option>))}
            </select>
          </div>
        </div>
      </section>
      
      <section className="grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(340px, 1fr))' }}>
        {renderContent()}
      </section>

      <PaymentProofModal 
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        trxId={modalState.trxId}
        outlet={modalState.outlet}
        invoice={modalState.invoice}
        onSubmit={handleSubmitPaymentProof}
        isLoading={modalState.isSubmitting}
      />
    </div>
  )
}
