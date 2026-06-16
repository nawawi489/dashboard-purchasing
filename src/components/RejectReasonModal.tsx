import { useEffect, useState } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  onConfirm: (reason: string) => void
  trxId: string
  itemName: string
  isLoading?: boolean
}

export default function RejectReasonModal({
  isOpen,
  onClose,
  onConfirm,
  trxId,
  itemName,
  isLoading = false,
}: Props) {
  const [reason, setReason] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setReason('')
      setError('')
    }
  }, [isOpen])

  if (!isOpen) return null

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const trimmed = reason.trim()
    if (!trimmed) {
      setError('Alasan penolakan wajib diisi')
      return
    }
    onConfirm(trimmed)
  }

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        display: 'flex',
        alignItems: 'flex-start',
        justifyContent: 'center',
        zIndex: 1000,
        overflowY: 'auto',
        padding: '16px 8px',
      }}
    >
      <div
        className="panel"
        style={{
          width: '100%',
          maxWidth: '440px',
          margin: '20px',
          maxHeight: '100%',
          overflowY: 'auto',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '16px' }}>Tolak Pengajuan</h2>

        <div style={{ marginBottom: 12, fontSize: 14, color: '#555' }}>
          <div>
            <strong>ID Pengajuan:</strong> {trxId}
          </div>
          <div>
            <strong>Nama Peralatan:</strong> {itemName}
          </div>
        </div>

        <form onSubmit={handleSubmit}>
          <div className="control">
            <label className="label">Alasan Penolakan</label>
            <textarea
              className="input"
              rows={4}
              placeholder="Tuliskan alasan penolakan pengajuan ini..."
              value={reason}
              onChange={e => {
                setReason(e.target.value)
                if (error) setError('')
              }}
              disabled={isLoading}
            />
            {error && (
              <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{error}</div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '20px' }}>
            <button
              type="button"
              className="btn"
              onClick={onClose}
              style={{ flex: 1 }}
              disabled={isLoading}
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn"
              style={{
                flex: 1,
                backgroundColor: '#dc2626',
                color: '#fff',
                borderColor: '#dc2626',
              }}
              disabled={isLoading}
            >
              {isLoading ? 'Mengirim...' : 'Kirim Penolakan'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
