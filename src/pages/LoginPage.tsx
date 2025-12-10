import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import Footer from '../components/Footer'

export default function LoginPage() {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { login } = useAuth()
  const navigate = useNavigate()

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault()
    if (!username || !password) {
      setError('Username dan password wajib diisi')
      return
    }

    const validUser = import.meta.env.VITE_AUTH_USERNAME
    const validPass = import.meta.env.VITE_AUTH_PASSWORD

    if (username !== validUser || password !== validPass) {
      setError('Username atau password salah')
      return
    }
    
    login(username)
    navigate('/')
  }

  return (
    <div style={{ 
      minHeight: '100vh', 
      display: 'flex', 
      flexDirection: 'column',
      background: '#f3f4f6' 
    }}>
      <div style={{ 
        flex: 1,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '24px'
      }}>
        <div className="panel" style={{ width: '100%', maxWidth: '400px', padding: '32px' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <h1 style={{ margin: 0, fontSize: '24px', color: 'var(--primary)' }}>Dashboard Purchasing</h1>
            <p style={{ margin: '8px 0 0', color: 'var(--muted)' }}>Silakan login untuk melanjutkan</p>
          </div>

          <form onSubmit={handleLogin} className="form-grid" style={{ gridTemplateColumns: '1fr' }}>
            <div className="control">
              <label className="label">Username</label>
              <input 
                type="text" 
                className="input" 
                value={username} 
                onChange={e => setUsername(e.target.value)}
                placeholder="Masukkan username"
              />
            </div>
            <div className="control">
              <label className="label">Password</label>
              <input 
                type="password" 
                className="input" 
                value={password} 
                onChange={e => setPassword(e.target.value)}
                placeholder="Masukkan password"
              />
            </div>
            
            {error && (
              <div style={{ color: 'red', fontSize: '14px', textAlign: 'center' }}>
                {error}
              </div>
            )}

            <button type="submit" className="btn btn-primary" style={{ marginTop: '16px' }}>
              Login
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </div>
  )
}
