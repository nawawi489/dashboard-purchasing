import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import Header from '../components/Header'
import { useAuth } from '../contexts/AuthContext'

type MenuItem = {
  key: string
  title: string
  subtitle: string
  emoji: string
  href: string
}

export function HomePage() {
  const { logout } = useAuth()
  const items = useMemo<MenuItem[]>(
    () => [
      { key: 'pr', title: 'Permintaan PO', subtitle: 'Ajukan kebutuhan pembelian', emoji: '📝', href: '/pr' },
      { key: 'approval', title: 'Approval', subtitle: 'Status persetujuan pembelian', emoji: '✅', href: '/approval' },
    ],
    [],
  )

  return (
    <div className="container">
      <Header
        title="Dashboard Purchasing"
        rightSlot={(
          <button className="user" aria-label="Logout" title="Logout" onClick={logout}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <path d="M16 17l5-5-5-5" />
              <path d="M21 12H9" />
            </svg>
          </button>
        )}
      />

      <section className="hero">
        <h1>Menu Utama</h1>
        <p>Pilih modul untuk melanjutkan</p>
      </section>

      <section className="grid">
        {items.map((item) => (
          <Link key={item.key} to={item.href} className="card" aria-label={item.title}>
            <div className="card-icon" aria-hidden="true">{item.emoji}</div>
            <div className="card-body">
              <div className="card-title">{item.title}</div>
              <div className="card-subtitle">{item.subtitle}</div>
            </div>
          </Link>
        ))}
      </section>
    </div>
  )
}
