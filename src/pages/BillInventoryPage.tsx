import Header from '../components/Header'
import { useMemo, useState } from 'react'
import BillCard from '../components/BillCard'
import Pagination from '../components/Pagination'
import PaymentProofModal from '../components/PaymentProofModal'
import { submitInventoryPaymentProof } from '../services/inventoryApproval'
import { ApprovalItem, InventoryApprovalItem } from '../types'
import { OUTLETS } from '../constants'
import { useInventoryApprovalItemsWithOutletFilter } from '../hooks/useInventoryApprovalItemsWithOutletFilter'

interface BillGroup {
  invoice: string
  trxId: string
  outlet: string
  items: ApprovalItem[]
  date?: string
}

const ITEMS_PER_PAGE = 9

function toApprovalItem(item: InventoryApprovalItem): ApprovalItem {
  return {
    trxId: item.trxId,
    tag: 'Peralatan',
    date: item.date,
    itemId: item.itemId,
    itemName: item.itemName,
    outlet: item.outlet,
    supplier: item.supplier || '-',
    unit: item.unit || '',
    quantity: item.quantity,
    price: item.quantity > 0 ? item.totalEstimasiBiaya / item.quantity : item.totalEstimasiBiaya,
    status: item.status,
    statusPembayaran: item.statusPembayaran,
    grandTotal: item.grandTotal || item.totalEstimasiBiaya,
    nomorInvoice: item.nomorInvoice,
  }
}

export default function BillInventoryPage() {
  const {
    items,
    loading,
    error,
    outletFilter,
    setOutletFilter,
    loadData,
  } = useInventoryApprovalItemsWithOutletFilter('Tidak dapat memuat data tagihan inventaris')

  const [currentPage, setCurrentPage] = useState(1)

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
    isSubmitting: false,
  })

  const groupedItems = useMemo<BillGroup[]>(() => {
    const filtered = items.filter(item => {
      const isHutang = (item.statusPembayaran || '').toLowerCase() === 'hutang'
      const isValidStatus = ['Terima', 'Pending'].includes(item.status || '')
      const matchesOutlet = !outletFilter || item.outlet === outletFilter
      const inv = (item.nomorInvoice || '').trim()
      const hasInvoice = inv.length > 0
      return isHutang && isValidStatus && matchesOutlet && hasInvoice
    })

    const groups: Record<string, InventoryApprovalItem[]> = {}
    filtered.forEach(item => {
      const inv = (item.nomorInvoice || '').trim() || 'UNKNOWN'
      const outlet = item.outlet || 'UNKNOWN'
      const key = `${inv}||${outlet}`

      if (!groups[key]) groups[key] = []
      groups[key].push(item)
    })

    return Object.entries(groups)
      .map(([key, groupItems]) => {
        const [invoice, outlet] = key.split('||')
        return {
          invoice,
          trxId: groupItems[0]?.trxId || 'UNKNOWN',
          outlet,
          items: groupItems.map(toApprovalItem),
          date: groupItems[0]?.date,
        }
      })
      .sort((a, b) => {
        const da = a.date ? new Date(a.date).getTime() : 0
        const db = b.date ? new Date(b.date).getTime() : 0
        return db - da
      })
  }, [items, outletFilter])

  const totalPages = Math.ceil(groupedItems.length / ITEMS_PER_PAGE)
  const paginatedItems = groupedItems.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE,
  )

  const handleOpenModal = (trxId: string, outletName: string, invoiceNumber: string) => {
    setModalState(prev => ({
      ...prev,
      isOpen: true,
      trxId,
      outlet: outletName,
      invoice: invoiceNumber,
    }))
  }

  const handleCloseModal = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false,
      trxId: '',
      outlet: '',
    }))
  }

  const handleOutletFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOutletFilter(e.target.value)
    setCurrentPage(1)
  }

  const handleSubmitPaymentProof = async (trxId: string, file: File, invoiceNumber: string) => {
    setModalState(prev => ({ ...prev, isSubmitting: true }))
    try {
      const success = await submitInventoryPaymentProof(trxId, file, modalState.outlet, invoiceNumber)
      if (success) {
        alert(`Bukti pembayaran untuk ${trxId} berhasil dikirim!`)
        handleCloseModal()
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
          <button className="btn" onClick={() => loadData(true)}>Refresh Data</button>
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
            ctaLabel="Input Bukti Pembayaran"
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
      <Header title="Tagihan Inventaris" backTo="/" />
      <section className="hero">
        <h1>Tagihan Inventaris</h1>
        <p>Input bukti pembayaran tagihan inventaris</p>
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
              {OUTLETS.map(o => (<option key={o} value={o}>{o}</option>))}
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
        variant="payment"
      />
    </div>
  )
}
