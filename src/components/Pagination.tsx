import React from 'react'

type Props = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null

  const buildPages = (): Array<number | '...'> => {
    // Small totals: show all
    if (totalPages <= 7) {
      return Array.from({ length: totalPages }, (_, i) => i + 1)
    }

    // Large totals: dynamic sliding window
    const pages: Array<number | '...'> = []

    // Case A: at the beginning (page 1-2)
    if (currentPage < 3) {
      pages.push(1, 2, 3)
      pages.push('...', totalPages)
      return pages
    }

    // Case B: near the end (last 3 pages)
    if (currentPage >= totalPages - 2) {
      pages.push('...')
      const start = Math.max(1, totalPages - 3)
      for (let p = start; p < totalPages; p++) pages.push(p)
      pages.push(totalPages)
      return pages
    }

    // Case C: middle — hide previous two, show current + next two
    pages.push('...')
    pages.push(currentPage, currentPage + 1, currentPage + 2)
    pages.push('...', totalPages)
    return pages
  }
  const pages = buildPages()

  return (
    <div style={{ gridColumn: '1 / -1', display: 'flex', justifyContent: 'center', gap: 8, marginTop: 24, flexWrap: 'wrap' }}>
      <button 
        className="btn" 
        disabled={currentPage === 1}
        onClick={() => onPageChange(Math.max(1, currentPage - 1))}
      >
        Previous
      </button>
      
      <span style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        {pages.map((p, idx) => (
          p === '...'
            ? (
              <span key={`ellipsis-${idx}`} style={{ padding: '0 8px', color: 'var(--muted)' }}>…</span>
            )
            : (
              <button
                key={p}
                className={`btn ${currentPage === p ? 'btn-primary' : ''}`}
                style={{ 
                  background: currentPage === p ? 'var(--primary)' : '#fff',
                  color: currentPage === p ? '#fff' : 'var(--text)',
                  borderColor: currentPage === p ? 'var(--primary)' : 'var(--border)',
                  minWidth: 32,
                  padding: '0 8px'
                }}
                onClick={() => onPageChange(p)}
              >
                {p}
              </button>
            )
        ))}
      </span>

      <button 
        className="btn" 
        disabled={currentPage === totalPages}
        onClick={() => onPageChange(Math.min(totalPages, currentPage + 1))}
      >
        Next
      </button>
    </div>
  )
}
