import { useState } from 'react'
import Header from '../components/Header'
import { WEBHOOK_UPDATE_SISA_MODAL } from '../config'
import { OUTLETS } from '../constants'

export default function PlafonPage() {
  const [tanggal, setTanggal] = useState('')
  const [outlet, setOutlet] = useState('')
  const [foto, setFoto] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)

  const outlets = OUTLETS

  const isFormValid = tanggal && outlet && outlet !== '' && foto

  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader()
      reader.readAsDataURL(file)
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          // Split to get raw base64 (remove data:image/png;base64, prefix)
          const rawBase64 = reader.result.split(',')[1]
          resolve(rawBase64)
        } else {
          reject(new Error('Failed to convert file to base64'))
        }
      }
      reader.onerror = (error) => reject(error)
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!isFormValid) return

    setLoading(true)
    setError('')
    setSuccess(false)

    try {
      let fotoBase64 = ''
      if (foto) {
        fotoBase64 = await fileToBase64(foto)
      }

      const formData = new FormData()
      formData.append('tanggal', tanggal)
      formData.append('outlet', outlet)
      formData.append('foto', fotoBase64)

      const response = await fetch(WEBHOOK_UPDATE_SISA_MODAL, {
        method: 'POST',
        body: formData,
      })

      if (!response.ok) {
        throw new Error('Gagal mengirim data')
      }

      setSuccess(true)
      // Reset form
      setTanggal('')
      setOutlet('')
      setFoto(null)
      // Reset file input value manually since it's uncontrolled
      const fileInput = document.getElementById('foto-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Terjadi kesalahan')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container">
      <Header title="Plafon" backTo="/" />
      
      <section className="hero">
        <h1>Update Plafon</h1>
        <p>Update sisa modal belanja outlet</p>
      </section>

      <div className="panel">
        <form onSubmit={handleSubmit} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
          <div className="control">
            <label className="label">Tanggal</label>
            <input
              type="date"
              className="input"
              value={tanggal}
              onChange={(e) => setTanggal(e.target.value)}
              required
            />
          </div>

          <div className="control">
            <label className="label">Outlet</label>
            <select
              className="input"
              value={outlet}
              onChange={(e) => setOutlet(e.target.value)}
              required
            >
              <option value="">Pilih Outlet</option>
              {outlets.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>

          <div className="control">
            <label className="label">Foto Bukti</label>
            <input
              id="foto-input"
              type="file"
              className="input"
              accept="image/png, image/jpeg"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFoto(e.target.files[0])
                }
              }}
              required
            />
            <small style={{ color: 'var(--muted)', marginTop: '4px', display: 'block' }}>
              Format: PNG atau JPG
            </small>
          </div>

          {error && (
            <div style={{ color: 'red', padding: '10px', background: '#fee2e2', borderRadius: '4px' }}>
              {error}
            </div>
          )}

          {success && (
            <div style={{ color: 'green', padding: '10px', background: '#dcfce7', borderRadius: '4px' }}>
              Berhasil mengirim data!
            </div>
          )}

          <button 
            type="submit" 
            className="btn btn-primary" 
            disabled={loading || !isFormValid}
            style={{ opacity: !isFormValid ? 0.5 : 1, cursor: !isFormValid ? 'not-allowed' : 'pointer' }}
          >
            {loading ? 'Mengirim...' : 'Submit'}
          </button>
        </form>
      </div>
    </div>
  )
}
