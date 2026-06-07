import { useState } from 'react'
import { useHoldings } from '../hooks/usePortfolio'
import { useSocket, useLivePrices } from '../hooks/useSocket'
import { useNavigate } from 'react-router-dom'
import OrderModal from '../components/orders/OrderModal'

export default function Holdings() {
  const navigate = useNavigate()
  const { data: holdings = [], isLoading } = useHoldings()
  const symbols = holdings.map(h => h.symbol)
  useSocket(symbols)
  const { prices } = useLivePrices()
  const [selected, setSelected] = useState(null)

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v)

  const totalInvested = holdings.reduce((s, h) => s + h.avg_price * h.quantity, 0)
  const totalCurrent  = holdings.reduce((s, h) => s + (prices[h.symbol] || h.avg_price) * h.quantity, 0)
  const totalPnL      = totalCurrent - totalInvested
  const pnlPct        = totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : '0.00'
  const isProfit      = totalPnL >= 0

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
    Holdings
  </h1>
  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 400 }}>
    {holdings.length} position{holdings.length !== 1 ? 's' : ''}
  </p>
</div>
      {/* Summary cards */}
      {holdings.length > 0 && (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '12px' }}>
          {[
            { label: 'Invested',      value: fmt(totalInvested), color: 'var(--blue)',   bg: 'var(--blue-soft)'   },
            { label: 'Current Value', value: fmt(totalCurrent),  color: 'var(--teal)',   bg: 'var(--teal-soft)'   },
            { label: 'Total P&L',     value: (isProfit ? '+' : '') + fmt(totalPnL), color: isProfit ? 'var(--bull)' : 'var(--bear)', bg: isProfit ? 'var(--bull-soft)' : 'var(--bear-soft)' },
            { label: 'Returns',       value: (isProfit ? '+' : '') + pnlPct + '%', color: isProfit ? 'var(--bull)' : 'var(--bear)', bg: isProfit ? 'var(--bull-soft)' : 'var(--bear-soft)' },
          ].map(({ label, value, color, bg }) => (
            <div key={label} style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '12px', padding: '16px', boxShadow: 'var(--shadow-sm)' }}>
              <p className="label" style={{ marginBottom: '6px' }}>{label}</p>
              <p className="num" style={{ fontSize: '1.1rem', fontWeight: 700, color }}>
                {value}
              </p>
            </div>
          ))}
        </div>
      )}

      {/* Holdings table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {holdings.length === 0 ? (
          <div style={{ padding: '60px', textAlign: 'center' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>💼</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>No holdings yet</p>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>Buy some stocks to see them here</p>
            <button className="btn btn-primary" style={{ marginTop: '14px' }}
              onClick={() => navigate('/watchlist')}>
              Go to Watchlist
            </button>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Stock</th>
                <th style={{ textAlign: 'right' }}>Qty</th>
                <th style={{ textAlign: 'right' }}>Avg Price</th>
                <th style={{ textAlign: 'right' }}>LTP</th>
                <th style={{ textAlign: 'right' }}>Invested</th>
                <th style={{ textAlign: 'right' }}>Current</th>
                <th style={{ textAlign: 'right' }}>P&L</th>
                <th style={{ textAlign: 'right' }}>Action</th>
              </tr>
            </thead>
            <tbody>
              {holdings.map(h => {
                const ltp    = prices[h.symbol] || h.avg_price
                const pnl    = (ltp - h.avg_price) * h.quantity
                const pct    = (((ltp - h.avg_price) / h.avg_price) * 100).toFixed(2)
                const profit = pnl >= 0
                return (
                  <tr key={h.symbol}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}
                           onClick={() => navigate(`/chart/${h.symbol}`)}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '8px',
                          background: `linear-gradient(135deg, var(--accent-soft), var(--purple-soft))`,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.78rem', fontWeight: 700, color: 'var(--purple)', flexShrink: 0,
                        }}>
                          {h.symbol.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>{h.symbol}</p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{h.company_name}</p>
                        </div>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="num" style={{ fontWeight: 600, color: 'var(--text)' }}>{h.quantity}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="num" style={{ color: 'var(--text2)' }}>{fmt(h.avg_price)}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="num" style={{ fontWeight: 600, color: profit ? 'var(--bull)' : 'var(--bear)' }}>
                        {fmt(ltp)}
                      </span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="num" style={{ color: 'var(--text2)' }}>{fmt(h.avg_price * h.quantity)}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <span className="num" style={{ fontWeight: 600, color: 'var(--text)' }}>{fmt(ltp * h.quantity)}</span>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <div>
                        <p className="num" style={{ fontSize: '0.8rem', fontWeight: 700, color: profit ? 'var(--bull)' : 'var(--bear)' }}>
                          {profit ? '+' : ''}{fmt(pnl)}
                        </p>
                        <p className="num" style={{ fontSize: '0.68rem', color: profit ? 'var(--bull)' : 'var(--bear)' }}>
                          {profit ? '+' : ''}{pct}%
                        </p>
                      </div>
                    </td>
                    <td style={{ textAlign: 'right' }}>
                      <button className="btn btn-bear" style={{ padding: '5px 12px', fontSize: '0.72rem' }}
                        onClick={() => setSelected({ symbol: h.symbol, company_name: h.company_name, price: ltp, userQuantity: h.quantity })}>
                        Sell
                      </button>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {selected && <OrderModal stock={{ ...selected, defaultType: 'SELL' }} onClose={() => setSelected(null)} />}
    </div>
  )
}