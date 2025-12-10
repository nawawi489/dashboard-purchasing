import { ReactNode } from 'react'
import BackButton from './BackButton'

type Props = {
  title: string
  backTo?: string
  rightSlot?: ReactNode
}

export default function Header({ title, backTo, rightSlot }: Props) {
  return (
    <header className="header">
      {rightSlot ? (
        <>
          <div className="brand">{title}</div>
          {rightSlot}
        </>
      ) : (
        <div className="brand-row">
          {backTo ? <BackButton to={backTo} /> : <span />}
          <div className="brand">{title}</div>
        </div>
      )}
    </header>
  )
}

