import { useProfile, useHoldings, useOrders } from '../hooks/usePortfolio'
import { useSocket, useLivePrices } from '../hooks/useSocket'
import { useNavigate } from 'react-router-dom'
import { useEffect, useState } from 'react'
import axiosInstance from '../api/axiosInstance'

function StatCard({ label, value, sub, accent, icon, delay = 0 }) {
  return (
    <div style={{
      background: 'var(--surface)', border: '1px solid var(--border)',
      borderRadius: '16px', padding: '20px 22px',
      boxShadow: 'var(--shadow-sm)', position: 'relative', overflow: 'hidden',
      transition: 'transform 0.2s, box-shadow 0.2s',
      animation: `fadeUp 0.4s ${delay}s ease-out both`,
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.boxShadow = 'var(--shadow-sm)' }}
    >
      {/* Top accent bar */}
      <div style={{ position: 'absolute', top: 0, left: 0, right: 0, height: '3px', background: accent, borderRadius: '16px 16px 0 0' }} />

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginTop: '4px' }}>
        <div>
          <p style={{ fontSize: '0.68rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '10px' }}>
            {label}
          </p>
          <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.5rem', fontWeight: 700, color: 'var(--text)', lineHeight: 1, letterSpacing: '-0.02em' }}>
            {value}
          </p>
          {sub && <p style={{ fontSize: '0.75rem', marginTop: '6px', color: 'var(--muted)' }}>{sub}</p>}
        </div>
        <div style={{
          width: '38px', height: '38px', borderRadius: '10px', flexShrink: 0,
          background: accent + '22', display: 'flex', alignItems: 'center',
          justifyContent: 'center', fontSize: '1.1rem',
        }}>
          {icon}
        </div>
      </div>
    </div>
  )
}

function MoverRow({ item, type, onClick }) {
  const up = type === 'gainer'
  return (
    <div onClick={onClick} style={{
      display: 'flex', justifyContent: 'space-between', alignItems: 'center',
      padding: '9px 12px', borderRadius: '10px', cursor: 'pointer',
      background: 'var(--surface2)', transition: 'transform 0.1s, background 0.1s',
      marginBottom: '6px',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'translateX(4px)'; e.currentTarget.style.background = up ? 'var(--bull-soft)' : 'var(--bear-soft)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.background = 'var(--surface2)' }}
    >
      <div>
        <p style={{ fontSize: '0.82rem', fontWeight: 600, color: 'var(--text)' }}>{item.symbol}</p>
        <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: 'var(--muted)' }}>
          ₹{item.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
        </p>
      </div>
      <span style={{
        fontFamily: "'JetBrains Mono', monospace",
        fontSize: '0.75rem', fontWeight: 700,
        color: up ? 'var(--bull)' : 'var(--bear)',
        background: up ? 'var(--bull-soft)' : 'var(--bear-soft)',
        padding: '3px 8px', borderRadius: '6px',
      }}>
        {up ? '▲' : '▼'} {Math.abs(item.change_pct).toFixed(2)}%
      </span>
    </div>
  )
}

function HeatCell({ item, onClick }) {
  const up  = item.change_pct >= 0
  const abs = Math.min(Math.abs(item.change_pct) / 4, 1)
  const bg  = up
    ? `rgba(34,197,94,${0.12 + abs * 0.35})`
    : `rgba(239,68,68,${0.12 + abs * 0.35})`
  return (
    <div onClick={onClick} style={{
      background: bg, borderRadius: '8px', padding: '10px 6px',
      display: 'flex', flexDirection: 'column', alignItems: 'center',
      justifyContent: 'center', cursor: 'pointer', minHeight: '54px',
      border: `1px solid ${up ? 'rgba(34,197,94,0.25)' : 'rgba(239,68,68,0.25)'}`,
      transition: 'transform 0.15s, box-shadow 0.15s',
    }}
      onMouseEnter={e => { e.currentTarget.style.transform = 'scale(1.06)'; e.currentTarget.style.zIndex = 2; e.currentTarget.style.position = 'relative'; e.currentTarget.style.boxShadow = 'var(--shadow-md)' }}
      onMouseLeave={e => { e.currentTarget.style.transform = ''; e.currentTarget.style.zIndex = ''; e.currentTarget.style.boxShadow = '' }}
    >
      <p style={{ fontSize: '0.68rem', fontWeight: 700, color: 'var(--text)', textAlign: 'center', lineHeight: 1.2 }}>{item.symbol}</p>
      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.62rem', color: up ? 'var(--bull)' : 'var(--bear)', marginTop: '3px', fontWeight: 600 }}>
        {up ? '+' : ''}{item.change_pct?.toFixed(1)}%
      </p>
    </div>
  )
}

export default function Dashboard() {
  const navigate  = useNavigate()
  const { data: profile, isLoading } = useProfile()
  const { data: holdings = [] }      = useHoldings()
  const { data: orders = [] }        = useOrders()
  const [movers,  setMovers]  = useState({ gainers: [], losers: [] })
  const [heatmap, setHeatmap] = useState([])
  const [moverLoading, setMoverLoading] = useState(true)

  const symbols = holdings.map(h => h.symbol)
  useSocket(symbols)
  const { prices } = useLivePrices()

  useEffect(() => {
    axiosInstance.get('/market/movers')
      .then(r => {
        setMovers(r.data)
        const all  = [...(r.data.gainers || []), ...(r.data.losers || [])]
        const seen = new Set()
        setHeatmap(all.filter(s => { if (seen.has(s.symbol)) return false; seen.add(s.symbol); return true }))
        setMoverLoading(false)
      })
      .catch(() => setMoverLoading(false))
  }, [])

  const fmt     = v => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v)
  const fmtDate = d => new Date(d).toLocaleString('en-IN', { day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit' })

  const totalInvested = holdings.reduce((s, h) => s + h.avg_price * h.quantity, 0)
  const totalCurrent  = holdings.reduce((s, h) => s + (prices[h.symbol] || h.avg_price) * h.quantity, 0)
  const totalPnL      = totalCurrent - totalInvested
  const pnlPct        = totalInvested > 0 ? ((totalPnL / totalInvested) * 100).toFixed(2) : '0.00'
  const isProfit      = totalPnL >= 0

  const hour = new Date().getHours()
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening'

  if (isLoading) return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '60vh', flexDirection: 'column', gap: '14px' }}>
      <div style={{ width: '28px', height: '28px', border: '2px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
      <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Loading...</p>
    </div>
  )

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '22px', maxWidth: '1200px', padding: '4px 0' }}>

      {/* Greeting */}
      <div style={{ animation: 'fadeUp 0.3s ease-out both' }}>
        <h1 style={{
          fontFamily: "'Outfit', sans-serif",
          fontSize: '2rem', fontWeight: 700,
          letterSpacing: '-0.04em', color: 'var(--text)',
          marginBottom: '4px', lineHeight: 1.2,
        }}>
          {greeting}, {profile?.name?.split(' ')[0]} 👋
        </h1>
        <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 400 }}>
          {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: '14px' }}>
        <StatCard label="Available Balance" value={fmt(profile?.balance || 0)} sub="Paper trading funds" accent="linear-gradient(90deg,#6366f1,#8b5cf6)" icon="💰" delay={0.05} />
        <StatCard label="Total Invested"    value={fmt(totalInvested)}          sub={`${holdings.length} position${holdings.length !== 1 ? 's' : ''}`} accent="linear-gradient(90deg,#f59e0b,#ef4444)" icon="📈" delay={0.1} />
        <StatCard label="Current Value"     value={fmt(totalCurrent)}           sub="Mark to market"  accent="linear-gradient(90deg,#06b6d4,#22c55e)" icon="💹" delay={0.15} />
        <StatCard
          label="Total P&L"
          value={<span style={{ color: isProfit ? 'var(--bull)' : 'var(--bear)' }}>{isProfit ? '+' : ''}{fmt(totalPnL)}</span>}
          sub={<span style={{ color: isProfit ? 'var(--bull)' : 'var(--bear)', fontFamily: "'JetBrains Mono', monospace" }}>{isProfit ? '+' : ''}{pnlPct}%</span>}
          accent={isProfit ? 'linear-gradient(90deg,#22c55e,#06b6d4)' : 'linear-gradient(90deg,#ef4444,#f59e0b)'}
          icon={isProfit ? '🚀' : '📉'}
          delay={0.2}
        />
      </div>

      {/* Holdings + Orders */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px' }}>

        {/* Holdings */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)', animation: 'fadeUp 0.4s 0.2s ease-out both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Holdings</h2>
            <button onClick={() => navigate('/holdings')} style={{ fontSize: '0.72rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
              View all →
            </button>
          </div>
          {holdings.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', marginBottom: '8px' }}>📊</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)', marginBottom: '12px' }}>No holdings yet</p>
              <button onClick={() => navigate('/watchlist')} style={{
                background: 'var(--accent)', color: '#fff', border: 'none',
                borderRadius: '8px', padding: '7px 16px', fontSize: '0.78rem',
                fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
              }}>
                Start Trading →
              </button>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {holdings.slice(0, 5).map((h, i) => {
                const ltp = prices[h.symbol] || h.avg_price
                const pnl = (ltp - h.avg_price) * h.quantity
                const up  = pnl >= 0
                const avatarColors = ['#6366f1','#22c55e','#06b6d4','#f59e0b','#ef4444']
                return (
                  <div key={h.symbol} onClick={() => navigate(`/chart/${h.symbol}`)} style={{
                    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                    padding: '10px 12px', borderRadius: '10px', cursor: 'pointer',
                    background: 'var(--surface2)', transition: 'transform 0.1s',
                  }}
                    onMouseEnter={e => e.currentTarget.style.transform = 'translateX(3px)'}
                    onMouseLeave={e => e.currentTarget.style.transform = ''}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{
                        width: '32px', height: '32px', borderRadius: '8px', flexShrink: 0,
                        background: avatarColors[i % avatarColors.length] + '22',
                        border: `1px solid ${avatarColors[i % avatarColors.length]}44`,
                        display: 'flex', alignItems: 'center', justifyContent: 'center',
                        fontSize: '0.75rem', fontWeight: 700, color: avatarColors[i % avatarColors.length],
                      }}>
                        {h.symbol.charAt(0)}
                      </div>
                      <div>
                        <p style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>{h.symbol}</p>
                        <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{h.quantity} share{h.quantity !== 1 ? 's' : ''}</p>
                      </div>
                    </div>
                    <div style={{ textAlign: 'right' }}>
                      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>
                        {fmt(ltp * h.quantity)}
                      </p>
                      <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.7rem', color: up ? 'var(--bull)' : 'var(--bear)' }}>
                        {up ? '+' : ''}{fmt(pnl)}
                      </p>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>

        {/* Recent Orders */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '20px', boxShadow: 'var(--shadow-sm)', animation: 'fadeUp 0.4s 0.25s ease-out both' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h2 style={{ fontSize: '0.9rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>Recent Orders</h2>
            <button onClick={() => navigate('/orders')} style={{ fontSize: '0.72rem', color: 'var(--accent)', background: 'none', border: 'none', cursor: 'pointer', fontWeight: 600, fontFamily: "'Outfit', sans-serif" }}>
              View all →
            </button>
          </div>
          {orders.length === 0 ? (
            <div style={{ padding: '30px 0', textAlign: 'center' }}>
              <p style={{ fontSize: '2rem', marginBottom: '8px' }}>📋</p>
              <p style={{ fontSize: '0.8rem', color: 'var(--muted)' }}>No orders placed yet</p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {orders.slice(0, 5).map(o => (
                <div key={o.id} style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 12px', borderRadius: '10px', background: 'var(--surface2)',
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{
                      fontSize: '0.65rem', fontWeight: 700, letterSpacing: '0.04em',
                      padding: '3px 8px', borderRadius: '6px', minWidth: '34px', textAlign: 'center',
                      background: o.order_type === 'BUY' ? 'var(--bull-soft)' : 'var(--bear-soft)',
                      color: o.order_type === 'BUY' ? 'var(--bull)' : 'var(--bear)',
                    }}>
                      {o.order_type}
                    </span>
                    <div>
                      <p style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>{o.symbol}</p>
                      <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{fmtDate(o.created_at)}</p>
                    </div>
                  </div>
                  <div style={{ textAlign: 'right' }}>
                    <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>
                      {fmt(o.price * o.quantity)}
                    </p>
                    <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>{o.quantity} share{o.quantity !== 1 ? 's' : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Gainers + Losers + Heatmap */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1.6fr', gap: '14px', animation: 'fadeUp 0.4s 0.3s ease-out both' }}>

        {/* Gainers */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--bull)', boxShadow: '0 0 6px var(--bull)' }} />
            <h2 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Top Gainers</h2>
          </div>
          {moverLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[1,2,3,4,5].map(i => <div key={i} className="shimmer" style={{ height: '40px', borderRadius: '8px' }} />)}
            </div>
          ) : movers.gainers.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.78rem', textAlign: 'center', padding: '20px 0' }}>No data</p>
          ) : (
            movers.gainers.map(item => (
              <MoverRow key={item.symbol} item={item} type="gainer" onClick={() => navigate(`/chart/${item.symbol}`)} />
            ))
          )}
        </div>

        {/* Losers */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--bear)', boxShadow: '0 0 6px var(--bear)' }} />
            <h2 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Top Losers</h2>
          </div>
          {moverLoading ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
              {[1,2,3,4,5].map(i => <div key={i} className="shimmer" style={{ height: '40px', borderRadius: '8px' }} />)}
            </div>
          ) : movers.losers.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.78rem', textAlign: 'center', padding: '20px 0' }}>No data</p>
          ) : (
            movers.losers.map(item => (
              <MoverRow key={item.symbol} item={item} type="loser" onClick={() => navigate(`/chart/${item.symbol}`)} />
            ))
          )}
        </div>

        {/* Heatmap */}
        <div style={{ background: 'var(--surface)', border: '1px solid var(--border)', borderRadius: '16px', padding: '18px', boxShadow: 'var(--shadow-sm)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '14px' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: 'var(--accent)', boxShadow: '0 0 6px var(--accent)' }} />
            <h2 style={{ fontSize: '0.78rem', fontWeight: 700, color: 'var(--text)', textTransform: 'uppercase', letterSpacing: '0.07em' }}>Market Heatmap</h2>
          </div>
          {moverLoading ? (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
              {[1,2,3,4,5,6,7,8,9,10].map(i => <div key={i} className="shimmer" style={{ height: '54px', borderRadius: '8px' }} />)}
            </div>
          ) : heatmap.length === 0 ? (
            <p style={{ color: 'var(--muted)', fontSize: '0.78rem', textAlign: 'center', padding: '20px 0' }}>No data</p>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
              {heatmap.slice(0, 10).map(item => (
                <HeatCell key={item.symbol} item={item} onClick={() => navigate(`/chart/${item.symbol}`)} />
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}