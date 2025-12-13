import React, { useState, useEffect } from 'react'

type Props = {
  isOpen: boolean
  onClose: () => void
  trxId: string
  outlet: string
  onSubmit: (trxId: string, file: File) => void
  isLoading?: boolean
}

export default function PaymentProofModal({ isOpen, onClose, trxId, outlet, onSubmit, isLoading = false }: Props) {
  const [file, setFile] = useState<File | null>(null)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [error, setError] = useState('')

  useEffect(() => {
    if (!isOpen) {
      setFile(null)
      setPreviewUrl(null)
      setError('')
    }
  }, [isOpen])

  // Cleanup preview URL when component unmounts or previewUrl changes
  useEffect(() => {
    return () => {
      if (previewUrl) {
        URL.revokeObjectURL(previewUrl)
      }
    }
  }, [previewUrl])

  if (!isOpen) return null

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    setError('')

    if (selectedFile) {
      if (selectedFile.type === 'image/png' || selectedFile.type === 'image/jpeg' || selectedFile.type === 'image/jpg') {
        setFile(selectedFile)
        const objectUrl = URL.createObjectURL(selectedFile)
        setPreviewUrl(objectUrl)
      } else {
        setFile(null)
        setPreviewUrl(null)
        setError('Hanya file PNG atau JPG yang diperbolehkan')
      }
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!file) {
      setError('Mohon pilih file bukti pembayaran')
      return
    }
    onSubmit(trxId, file)
  }

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    }}>
      <div className="panel" style={{ width: '100%', maxWidth: '400px', margin: '20px' }}>
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>Input Bukti Pembayaran</h2>
        
        <form onSubmit={handleSubmit}>
          <div className="control">
            <label className="label">ID Transaksi</label>
            <input 
              type="text" 
              className="input" 
              value={trxId} 
              readOnly 
              style={{ backgroundColor: '#f5f5f5' }} 
            />
          </div>

          <div className="control">
            <label className="label">Outlet</label>
            <input 
              type="text" 
              className="input" 
              value={outlet} 
              readOnly 
              style={{ backgroundColor: '#f5f5f5' }} 
            />
          </div>

          <div className="control">
            <label className="label">Bukti Transfer (PNG/JPG)</label>
            <input 
              type="file" 
              accept=".png,.jpg,.jpeg"
              onChange={handleFileChange}
              className="input"
              style={{ padding: '8px' }}
            />
            {error && <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{error}</div>}
            
            {previewUrl && (
              <div style={{ marginTop: '12px', textAlign: 'center' }}>
                <img 
                  src={previewUrl} 
                  alt="Preview Bukti Pembayaran" 
                  style={{ maxWidth: '100%', maxHeight: '200px', borderRadius: '4px', border: '1px solid #ddd' }} 
                />
              </div>
            )}
          </div>

          <div style={{ display: 'flex', gap: '10px', marginTop: '24px' }}>
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
              className="btn btn-primary" 
              style={{ flex: 1 }}
              disabled={isLoading}
            >
              {isLoading ? 'Mengirim...' : 'Kirim'}
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}
