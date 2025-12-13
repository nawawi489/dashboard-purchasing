import React from 'react'

type Props = {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export default function Pagination({ currentPage, totalPages, onPageChange }: Props) {
  if (totalPages <= 1) return null

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
        {Array.from({ length: totalPages }, (_, i) => i + 1).map(page => (
          <button
            key={page}
            className={`btn ${currentPage === page ? 'btn-primary' : ''}`}
            style={{ 
              background: currentPage === page ? 'var(--primary)' : '#fff',
              color: currentPage === page ? '#fff' : 'var(--text)',
              borderColor: currentPage === page ? 'var(--primary)' : 'var(--border)',
              minWidth: 32,
              padding: '0 8px'
            }}
            onClick={() => onPageChange(page)}
          >
            {page}
          </button>
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
