import React, { useState, useEffect } from 'react'
import { formatIDR } from '../utils/format'

type Props = {
  isOpen: boolean
  onClose: () => void
  trxId: string
  outlet: string
  invoice: string
  onSubmit: (trxId: string, file: File, invoice: string) => void
  isLoading?: boolean
  variant?: 'payment' | 'struk'
  hargaKonversiResep?: number
  satuanKonversiResep?: string
  jumlahKonversiResep?: number
  itemName?: string
}

export default function PaymentProofModal({
  isOpen,
  onClose,
  trxId,
  outlet,
  invoice,
  onSubmit,
  isLoading = false,
  variant = 'payment',
  hargaKonversiResep,
  satuanKonversiResep,
  jumlahKonversiResep,
  itemName,
}: Props) {
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
      setError(variant === 'struk' ? 'Mohon pilih file struk pembelian' : 'Mohon pilih file bukti pembayaran')
      return
    }
    onSubmit(trxId, file, invoice)
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
          maxWidth: variant === 'struk' ? '760px' : '400px',
          margin: '20px',
          maxHeight: '100%',
          overflowY: 'auto',
        }}
      >
        <h2 style={{ marginTop: 0, marginBottom: '20px' }}>
          {variant === 'struk' ? 'Input Struk Pembelian' : 'Input Bukti Pembayaran'}
        </h2>

        {variant === 'struk' ? (
          <form onSubmit={handleSubmit}>
            <div
              style={{
                display: 'flex',
                flexWrap: 'wrap',
                gap: '16px',
              }}
            >
              <div style={{ flex: '1 1 0', minWidth: '260px' }}>
                <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 13, color: '#555' }}>
                  Informasi Transaksi
                </div>

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

                {itemName && (
                  <div className="control">
                    <label className="label">Nama Barang</label>
                    <input
                      type="text"
                      className="input"
                      value={itemName}
                      readOnly
                      style={{ backgroundColor: '#f5f5f5' }}
                    />
                  </div>
                )}

                <div className="control">
                  <label className="label">Nomor Invoice</label>
                  <input
                    type="text"
                    className="input"
                    value={invoice}
                    readOnly
                    style={{ backgroundColor: '#f5f5f5' }}
                  />
                </div>

                {(hargaKonversiResep != null ||
                  jumlahKonversiResep != null ||
                  satuanKonversiResep) && (
                  <div className="control">
                    <label className="label">Detail Konversi Resep</label>
                    <div
                      style={{
                        fontSize: '13px',
                        lineHeight: 1.5,
                        border: '1px solid #eee',
                        borderRadius: 4,
                        padding: 8,
                        backgroundColor: '#fafafa',
                      }}
                    >
                      {hargaKonversiResep != null && (
                        <div>
                          Harga Konversi Resep:{' '}
                          <span style={{ fontWeight: 600 }}>{formatIDR(hargaKonversiResep)}</span>
                        </div>
                      )}
                      {jumlahKonversiResep != null && (
                        <div>
                          Jumlah Konversi Resep:{' '}
                          <span style={{ fontWeight: 600 }}>
                            {jumlahKonversiResep} {satuanKonversiResep || ''}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div style={{ flex: '1 1 0', minWidth: '260px' }}>
                <div style={{ marginBottom: 16, fontWeight: 600, fontSize: 13, color: '#555' }}>
                  Upload Struk
                </div>

                <div className="control">
                  <label className="label">Struk Pembelian (PNG/JPG)</label>
                  <input
                    type="file"
                    accept=".png,.jpg,.jpeg"
                    onChange={handleFileChange}
                    className="input"
                    style={{ padding: '8px' }}
                  />
                  {error && (
                    <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{error}</div>
                  )}

                  {previewUrl && (
                    <div style={{ marginTop: '12px', textAlign: 'center' }}>
                      <img
                        src={previewUrl}
                        alt="Preview Struk Pembelian"
                        style={{
                          maxWidth: '100%',
                          maxHeight: '220px',
                          borderRadius: '4px',
                          border: '1px solid #ddd',
                        }}
                      />
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div
              style={{
                display: 'flex',
                justifyContent: 'flex-end',
                gap: '10px',
                marginTop: '24px',
              }}
            >
              <button
                type="button"
                className="btn"
                onClick={onClose}
                disabled={isLoading}
              >
                Batal
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={isLoading}
              >
                {isLoading ? 'Mengirim...' : 'Kirim'}
              </button>
            </div>
          </form>
        ) : (
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
              <label className="label">Nomor Invoice</label>
              <input
                type="text"
                className="input"
                value={invoice}
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
              {error && (
                <div style={{ color: 'red', fontSize: '12px', marginTop: '4px' }}>{error}</div>
              )}

              {previewUrl && (
                <div style={{ marginTop: '12px', textAlign: 'center' }}>
                  <img
                    src={previewUrl}
                    alt="Preview Bukti Pembayaran"
                    style={{
                      maxWidth: '100%',
                      maxHeight: '200px',
                      borderRadius: '4px',
                      border: '1px solid #ddd',
                    }}
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
        )}
      </div>
    </div>
  )
}
