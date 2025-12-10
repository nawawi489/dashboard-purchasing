import { formatIDR } from '../utils/format'

type Props = {
  trxId: string
  tag?: string
  date?: string
  itemId?: string
  itemName: string
  outlet: string
  supplier: string
  unit: string
  quantity: number
  price: number
  status: 'Terima' | 'Tolak' | 'Pending'
}

export default function ApprovalCard(props: Props) {
  const total = (props.price || 0) * (props.quantity || 0)
  const statusColor = props.status === 'Terima' ? '#16a34a' : props.status === 'Tolak' ? '#dc2626' : '#64748b'

  return (
    <div className="approval-card">
      <div className="approval-card__header">
        <div className="approval-card__trx">#{props.trxId}</div>
        <div className="approval-card__tag" style={{ color: statusColor, borderColor: statusColor }}>{props.status}</div>
      </div>
      <div className="approval-card__body">
        <div className="approval-card__title-row">
          <div className="approval-card__title">{props.itemName}</div>
          {props.itemId ? <div className="approval-card__itemid">{props.itemId}</div> : <span />}
        </div>
        <div className="approval-card__subtitle">{props.outlet}</div>
        {props.date ? <div className="approval-card__subtitle">{props.date}</div> : <span />}
        <div className="approval-card__divider" />
        <div className="approval-card__grid">
          <div>
            <div className="label">Supplier</div>
            <div className="approval-card__value">{props.supplier}</div>
          </div>
          <div>
            <div className="label">Jumlah PO</div>
            <div className="approval-card__value">{props.quantity} {props.unit}</div>
          </div>
          <div>
            <div className="label">Harga Satuan</div>
            <div className="approval-card__value">{formatIDR(props.price)}</div>
          </div>
          <div>
            <div className="label">Total Harga</div>
            <div className="approval-card__value" style={{ color: 'var(--primary)', fontWeight: 700 }}>{formatIDR(total)}</div>
          </div>
        </div>
      </div>
    </div>
  )
}
