import { useProfile, useHoldings } from '../hooks/usePortfolio'
import { useSocket, useLivePrices } from '../hooks/useSocket'
import { useNavigate } from 'react-router-dom'

export default function Portfolio() {
  const navigate = useNavigate()
  const { data: profile } = useProfile()
  const { data: holdings = [] } = useHoldings()
  const symbols = holdings.map(h => h.symbol)
  useSocket(symbols)
  const { prices } = useLivePrices()

  const fmt = (v) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v)

  const totalInvested = holdings.reduce((s, h) => s + h.avg_price * h.quantity, 0)
  const totalCurrent  = holdings.reduce((s, h) => s + (prices[h.symbol] || h.avg_price) * h.quantity, 0)
  const totalPnL      = totalCurrent - totalInvested
  const cash          = profile?.balance || 0
  const netWorth      = cash + totalCurrent
  const isProfit      = totalPnL >= 0

  const colors = ['var(--accent)', 'var(--bull)', 'var(--teal)', 'var(--purple)', 'var(--accent2)', 'var(--bear)']

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '900px' }}>

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
    Portfolio
  </h1>
  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 400 }}>
    Complete portfolio overview
  </p>
</div>

      {/* Net worth hero */}
      <div style={{
        background: 'linear-gradient(135deg, var(--surface) 0%, var(--surface2) 100%)',
        border: '1px solid var(--border2)', borderRadius: '16px',
        padding: '28px', boxShadow: 'var(--shadow-md)',
        position: 'relative', overflow: 'hidden',
      }}>
        <div style={{
          position: 'absolute', top: '-40px', right: '-40px',
          width: '180px', height: '180px', borderRadius: '50%',
          background: 'var(--accent-soft)', filter: 'blur(40px)',
        }} />
        <p className="label" style={{ marginBottom: '8px' }}>Net Worth</p>
        <p className="num" style={{ fontSize: '2.2rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.03em', marginBottom: '6px' }}>
          {fmt(netWorth)}
        </p>
        <p style={{ fontSize: '0.82rem', color: isProfit ? 'var(--bull)' : 'var(--bear)', fontWeight: 500 }}>
          {isProfit ? '▲' : '▼'} P&L: {isProfit ? '+' : ''}{fmt(totalPnL)}
        </p>

        {/* Breakdown pills */}
        <div style={{ display: 'flex', gap: '10px', marginTop: '20px', flexWrap: 'wrap' }}>
          {[
            { label: 'Cash',   value: fmt(cash),         color: 'var(--blue)',   pct: netWorth > 0 ? ((cash / netWorth) * 100).toFixed(1) : 0 },
            { label: 'Equity', value: fmt(totalCurrent), color: 'var(--purple)', pct: netWorth > 0 ? ((totalCurrent / netWorth) * 100).toFixed(1) : 0 },
          ].map(({ label, value, color, pct }) => (
            <div key={label} style={{
              background: 'var(--surface)', border: '1px solid var(--border)',
              borderRadius: '10px', padding: '10px 16px', minWidth: '160px',
            }}>
              <p className="label" style={{ marginBottom: '4px' }}>{label} · {pct}%</p>
              <p className="num" style={{ fontSize: '0.95rem', fontWeight: 700, color }}>{value}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Allocation bars */}
      {holdings.length > 0 && (
        <div className="card" style={{ padding: '20px' }}>
          <p style={{ fontSize: '0.85rem', fontWeight: 700, color: 'var(--text)', marginBottom: '16px' }}>
            Equity Allocation
          </p>

          {/* Stacked bar */}
          <div style={{ display: 'flex', height: '10px', borderRadius: '8px', overflow: 'hidden', marginBottom: '20px', gap: '2px' }}>
            {holdings.map((h, i) => {
              const val = (prices[h.symbol] || h.avg_price) * h.quantity
              const pct = totalCurrent > 0 ? (val / totalCurrent) * 100 : 0
              return (
                <div key={h.symbol} style={{ width: `${pct}%`, background: colors[i % colors.length], borderRadius: '2px', minWidth: '4px', transition: 'width 0.5s ease' }} />
              )
            })}
          </div>

          {/* Holdings list */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
            {holdings.map((h, i) => {
              const ltp  = prices[h.symbol] || h.avg_price
              const val  = ltp * h.quantity
              const pct  = totalCurrent > 0 ? ((val / totalCurrent) * 100).toFixed(1) : 0
              const pnl  = (ltp - h.avg_price) * h.quantity
              const up   = pnl >= 0
              const color = colors[i % colors.length]

              return (
                <div key={h.symbol}
                  onClick={() => navigate(`/chart/${h.symbol}`)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: '12px',
                    padding: '12px', borderRadius: '10px', cursor: 'pointer',
                    background: 'var(--surface2)', transition: 'transform 0.1s',
                  }}
                  onMouseEnter={e => e.currentTarget.style.transform = 'translateX(4px)'}
                  onMouseLeave={e => e.currentTarget.style.transform = ''}
                >
                  {/* Color dot */}
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: color, flexShrink: 0 }} />

                  {/* Name */}
                  <div style={{ flex: 1 }}>
                    <p style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>{h.symbol}</p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{h.quantity} shares · {pct}%</p>
                  </div>

                  {/* Allocation bar */}
                  <div style={{ flex: 2, height: '4px', background: 'var(--border2)', borderRadius: '4px', overflow: 'hidden' }}>
                    <div style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: '4px', transition: 'width 0.5s ease' }} />
                  </div>

                  {/* Values */}
                  <div style={{ textAlign: 'right', minWidth: '120px' }}>
                    <p className="num" style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>{fmt(val)}</p>
                    <p className="num" style={{ fontSize: '0.7rem', color: up ? 'var(--bull)' : 'var(--bear)' }}>
                      {up ? '+' : ''}{fmt(pnl)}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}
    </div>
  )
}