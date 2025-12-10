import { Link } from 'react-router-dom'

type Props = { to: string; title?: string }

export default function BackButton({ to, title = 'Kembali' }: Props) {
  return (
    <Link to={to} className="back-btn" aria-label={title} title={title}>
      <img src="/icons/back.svg" alt={title} />
    </Link>
  )
}

