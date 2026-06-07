import { useOrders } from '../hooks/usePortfolio'

export default function Orders() {
  const { data: orders = [], isLoading } = useOrders()

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v)
  const fmtDate = (d) => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })

  const totalBuy  = orders.filter(o => o.order_type === 'BUY').reduce((s, o) => s + o.price * o.quantity, 0)
  const totalSell = orders.filter(o => o.order_type === 'SELL').reduce((s, o) => s + o.price * o.quantity, 0)

  if (isLoading) return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--muted)' }}>Loading...</div>

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1000px' }}>

      <div style={{ marginBottom: '4px' }}>
  <h1 style={{
    fontFamily: "'Outfit', sans-serif",
    fontSize: '1.9rem',
    fontWeight: 700,
    letterSpacing: '-0.05em',
    color: 'var(--text)',
    lineHeight: 1.1,
    marginBottom: '5px',
  }}>
    Orders
  </h1>
  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 400 }}>
    {orders.length} total order{orders.length !== 1 ? 's' : ''}
  </p>
</div>
      {/* Stats row */}
      {orders.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px' }}>
          {[
            { label: 'Total Orders',  value: orders.length,        color: 'var(--accent)' },
            { label: 'Total Bought',  value: fmt(totalBuy),        color: 'var(--bull)'   },
            { label: 'Total Sold',    value: fmt(totalSell),       color: 'var(--bear)'   },
          ].map(({ label, value, color }) => (
            <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
              <p className="label" style={{ marginBottom: '6px' }}>{label}</p>
              <p className="num" style={{ fontSize: '1.1rem', fontWeight: 700, color }}>{value}</p>
            </div>
          ))}
        </div>
      )}

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {orders.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📋</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>No orders yet</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Your order history will appear here</p>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Stock</th>
                <th style={{ textAlign: 'center' }}>Type</th>
                <th style={{ textAlign: 'right' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Price</th>
                <th style={{ textAlign: 'right' }}>Total Value</th>
                <th style={{ textAlign: 'center' }}>Status</th>
                <th style={{ textAlign: 'right' }}>Time</th>
              </tr>
            </thead>
            <tbody>
              {orders.map(o => (
                <tr key={o.id}>
                  <td>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                        background: o.order_type === 'BUY' ? 'var(--bull-soft)' : 'var(--bear-soft)',
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700,
                        color: o.order_type === 'BUY' ? 'var(--bull)' : 'var(--bear)',
                      }}>
                        {o.symbol.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>{o.symbol}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{o.company_name}</p>
                      </div>
                    </div>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className={`badge ${o.order_type === 'BUY' ? 'badge-bull' : 'badge-bear'}`}>
                      {o.order_type}
                    </span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="num" style={{ fontWeight: 600, color: 'var(--text)' }}>{o.quantity}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="num" style={{ color: 'var(--text2)' }}>{fmt(o.price)}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span className="num" style={{ fontWeight: 600, color: 'var(--text)' }}>
                      {fmt(o.price * o.quantity)}
                    </span>
                  </td>
                  <td style={{ textAlign: 'center' }}>
                    <span className="badge badge-executed">{o.status}</span>
                  </td>
                  <td style={{ textAlign: 'right' }}>
                    <span style={{ fontSize: '0.75rem', color: 'var(--muted)' }}>{fmtDate(o.created_at)}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}