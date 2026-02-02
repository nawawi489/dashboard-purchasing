import Header from '../components/Header'
import { useMemo, useState } from 'react'
import BillCard from '../components/BillCard'
import Pagination from '../components/Pagination'
import PaymentProofModal from '../components/PaymentProofModal'
import { submitStrukKaspinProof } from '../services/payment'
import { ApprovalItem } from '../types'
import { OUTLETS } from '../constants'
import { useApprovalItemsWithOutletFilter } from '../hooks/useApprovalItemsWithOutletFilter'

interface BillGroup {
  invoice: string
  trxId: string
  outlet: string
  items: ApprovalItem[]
  date?: string
}

const ITEMS_PER_PAGE = 12

export default function StrukPage() {
  const {
    items,
    loading,
    error,
    outletFilter,
    setOutletFilter,
    loadData,
  } = useApprovalItemsWithOutletFilter('Tidak dapat memuat data struk')

  const [currentPage, setCurrentPage] = useState(1)

  // Modal State
  const [modalState, setModalState] = useState<{
    isOpen: boolean
    trxId: string
    outlet: string
    invoice: string
    isSubmitting: boolean
    itemName: string
    hargaKonversiResep?: number
    satuanKonversiResep?: string
    jumlahKonversiResep?: number
  }>({
    isOpen: false,
    trxId: '',
    outlet: '',
    invoice: '',
    isSubmitting: false,
    itemName: '',
    hargaKonversiResep: undefined,
    satuanKonversiResep: undefined,
    jumlahKonversiResep: undefined,
  })

  const groupedItems = useMemo<BillGroup[]>(() => {
    const filtered = items.filter(item => {
      const matchesOutlet = !outletFilter || item.outlet === outletFilter
      const inv = (item.nomorInvoice || '').trim()
      const hasInvoice = inv.length > 0
      const isInputKaspin = item.inputKaspin === false
      return matchesOutlet && hasInvoice && isInputKaspin
    })

    return filtered
      .map((item) => ({
        invoice: (item.nomorInvoice || '').trim() || 'UNKNOWN',
        trxId: item.trxId || 'UNKNOWN',
        outlet: item.outlet || 'UNKNOWN',
        items: [item],
        date: item.date,
      }))
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

  const handleOpenModal = (item: ApprovalItem) => {
    setModalState(prev => ({
      ...prev,
      isOpen: true,
      trxId: item.trxId,
      outlet: item.outlet,
      invoice: item.nomorInvoice || '',
      itemName: item.itemName,
      hargaKonversiResep: item.hargaKonversiResep,
      satuanKonversiResep: item.satuanKonversiResep,
      jumlahKonversiResep: item.jumlahKonversiResep,
    }))
  }

  const handleCloseModal = () => {
    setModalState(prev => ({
      ...prev,
      isOpen: false,
      trxId: '',
      outlet: '',
      itemName: '',
    }))
  }

  const handleOutletFilterChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setOutletFilter(e.target.value)
    setCurrentPage(1)
  }

  const handleSubmitPaymentProof = async (trxId: string, file: File, invoiceNumber: string) => {
    setModalState(prev => ({ ...prev, isSubmitting: true }))
    try {
      const success = await submitStrukKaspinProof(trxId, file, modalState.outlet, invoiceNumber, {
        itemName: modalState.itemName,
        hargaKonversiResep: modalState.hargaKonversiResep,
        jumlahKonversiResep: modalState.jumlahKonversiResep,
        satuanKonversiResep: modalState.satuanKonversiResep,
      })
      if (success) {
        alert(`Bukti struk untuk ${trxId} berhasil dikirim!`)
        handleCloseModal()
        // Optional: Refresh data to reflect changes if needed
        // loadData() 
      }
    } catch (e) {
      alert('Gagal mengirim bukti struk. Silakan coba lagi.')
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
      return <div className="dropdown-empty">Tidak ada data struk yang perlu diinput</div>
    }

    return (
      <>
        {paginatedItems.map((group) => {
          const item = group.items[0]
          return (
            <BillCard
              key={`${group.trxId}-${group.outlet}-${group.invoice}-${item?.itemId || 'item'}`}
              trxId={group.trxId}
              items={group.items}
              onInputPaymentProof={() => handleOpenModal(item)}
              invoice={group.invoice}
              ctaLabel="Input Struk Pembelian"
            />
          )
        })}
      </>
    )
  }

  return (
    <div className="container">
      <Header title="Input Struk" backTo="/" />

      <section className="hero">
        <h1>Input Struk</h1>
        <p>Input bukti struk pembelian</p>
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

      {totalPages > 1 && (
        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
          onPageChange={setCurrentPage}
        />
      )}

      <PaymentProofModal 
        isOpen={modalState.isOpen}
        onClose={handleCloseModal}
        trxId={modalState.trxId}
        outlet={modalState.outlet}
        invoice={modalState.invoice}
        onSubmit={handleSubmitPaymentProof}
        isLoading={modalState.isSubmitting}
        variant="struk"
        itemName={modalState.itemName}
        hargaKonversiResep={modalState.hargaKonversiResep}
        satuanKonversiResep={modalState.satuanKonversiResep}
        jumlahKonversiResep={modalState.jumlahKonversiResep}
      />
    </div>
  )
}
