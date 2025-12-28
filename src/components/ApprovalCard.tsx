import { formatIDR } from '../utils/format'
import { ApprovalItem } from '../types'

type Props = ApprovalItem

export default function ApprovalCard(props: Props) {
  const total = (props.price || 0) * (props.quantity || 0)
  const statusClass = props.status === 'Terima' ? 'status-terima' : props.status === 'Tolak' ? 'status-tolak' : 'status-pending'

  return (
    <div className="approval-card">
      <div className="approval-card__header">
        <div className="approval-card__trx">#{props.trxId}</div>
        <div className={`approval-card__tag ${statusClass}`}>{props.status}</div>
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
