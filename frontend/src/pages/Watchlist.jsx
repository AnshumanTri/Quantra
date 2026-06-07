import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useWatchlist, useAddWatchlist, useRemoveWatchlist } from '../hooks/usePortfolio'
import { useStockSearch, useQuotes } from '../hooks/useMarketData'
import { useSocket, useLivePrices } from '../hooks/useSocket'
import OrderModal from '../components/orders/OrderModal'

export default function Watchlist() {
  const navigate = useNavigate()
  const { data: watchlist = [] } = useWatchlist()
  const symbols = watchlist.map(w => w.symbol)

  // quotes for H/L data (REST, refreshes every 15s)
  const { data: quotes = {} } = useQuotes(symbols)

  // socket for live price ticking
  useSocket(symbols)
  const { prices, prevPrices } = useLivePrices()

  const addWL    = useAddWatchlist()
  const removeWL = useRemoveWatchlist()
  const [query,    setQuery]    = useState('')
  const [selected, setSelected] = useState(null)
  const { data: results = [] } = useStockSearch(query)

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
    Watchlist
  </h1>
  <p style={{ fontSize: '0.8rem', color: 'var(--muted)', fontWeight: 400 }}>
    {watchlist.length} stock{watchlist.length !== 1 ? 's' : ''} tracked
  </p>
</div>

      {/* Search */}
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '10px',
          background: 'var(--surface)', border: '1px solid var(--border2)',
          borderRadius: '12px', padding: '10px 16px', boxShadow: 'var(--shadow-sm)',
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"
               style={{ color: 'var(--muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Add stocks — e.g. RELIANCE, TCS, INFY"
            style={{
              flex: 1, background: 'none', border: 'none', outline: 'none',
              fontSize: '0.85rem', color: 'var(--text)',
              fontFamily: "'Outfit', sans-serif",
            }}
          />
          {query && (
            <button onClick={() => setQuery('')}
              style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', fontSize: '0.9rem' }}>
              ✕
            </button>
          )}
        </div>

        {/* Search dropdown */}
        {results.length > 0 && query && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0, right: 0,
            background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: '12px', boxShadow: 'var(--shadow-lg)',
            overflow: 'hidden', zIndex: 50,
          }}>
            {results.map((s, i) => (
              <div key={s.symbol}
                onClick={() => { addWL.mutate({ symbol: s.symbol, company_name: s.company_name }); setQuery('') }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '11px 16px', cursor: 'pointer',
                  borderBottom: i < results.length - 1 ? '1px solid var(--border)' : 'none',
                  transition: 'background 0.1s',
                }}
                onMouseEnter={e => e.currentTarget.style.background = 'var(--surface2)'}
                onMouseLeave={e => e.currentTarget.style.background = ''}
              >
                <div>
                  <p style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>{s.symbol}</p>
                  <p style={{ fontSize: '0.72rem', color: 'var(--muted)' }}>{s.company_name}</p>
                </div>
                <span style={{
                  fontSize: '0.72rem', color: 'var(--bull)', fontWeight: 600,
                  background: 'var(--bull-soft)', padding: '3px 8px', borderRadius: '6px',
                }}>
                  + Add
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Table */}
      <div className="card" style={{ overflow: 'hidden' }}>
        {watchlist.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center' }}>
            <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>⭐</p>
            <p style={{ fontSize: '0.9rem', fontWeight: 600, color: 'var(--text)', marginBottom: '4px' }}>
              Your watchlist is empty
            </p>
            <p style={{ fontSize: '0.78rem', color: 'var(--muted)' }}>
              Search above to add stocks you want to track
            </p>
          </div>
        ) : (
          <table className="tbl">
            <thead>
              <tr>
                <th style={{ textAlign: 'left' }}>Stock</th>
                <th style={{ textAlign: 'right' }}>LTP</th>
                <th style={{ textAlign: 'right' }}>Change</th>
                <th style={{ textAlign: 'right' }}>High / Low</th>
                <th style={{ textAlign: 'right' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {watchlist.map(item => {
                const price      = prices[item.symbol]
                const prev       = prevPrices[item.symbol]
                const quote      = quotes[item.symbol]
                const isUp       = price > prev
                const isDown     = price < prev
                const flashClass = isUp ? 'flash-up' : isDown ? 'flash-down' : ''

                return (
                  <tr key={item.symbol} style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`/chart/${item.symbol}`)}>

                    {/* Symbol */}
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <div style={{
                          width: '34px', height: '34px', borderRadius: '8px', flexShrink: 0,
                          background: 'linear-gradient(135deg, var(--accent-soft), var(--blue-soft))',
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          fontSize: '0.78rem', fontWeight: 700, color: 'var(--accent)',
                        }}>
                          {item.symbol.charAt(0)}
                        </div>
                        <div>
                          <p style={{ fontSize: '0.83rem', fontWeight: 600, color: 'var(--text)' }}>
                            {item.symbol}
                          </p>
                          <p style={{ fontSize: '0.7rem', color: 'var(--muted)' }}>
                            {item.company_name}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* LTP — flashes on change */}
                    <td style={{ textAlign: 'right' }}>
                      <span className={`num ${flashClass}`} style={{
                        fontSize: '0.88rem', fontWeight: 600,
                        color: isUp ? 'var(--bull)' : isDown ? 'var(--bear)' : 'var(--text)',
                        padding: '2px 6px', borderRadius: '4px', display: 'inline-block',
                      }}>
                        {price
                          ? `₹${price.toLocaleString('en-IN', { maximumFractionDigits: 2 })}`
                          : '—'
                        }
                      </span>
                    </td>

                    {/* Change % */}
                    <td style={{ textAlign: 'right' }}>
                      {price && prev ? (
                        <span className={`badge ${price >= prev ? 'badge-bull' : 'badge-bear'}`}>
                          {price >= prev ? '▲' : '▼'}{' '}
                          {Math.abs(((price - prev) / prev) * 100).toFixed(2)}%
                        </span>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>—</span>
                      )}
                    </td>

                    {/* High / Low — from REST quote */}
                    <td style={{ textAlign: 'right' }}>
                      {quote?.high || quote?.low ? (
                        <div style={{ lineHeight: 1.6 }}>
                          <p style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.72rem', fontWeight: 600,
                            color: 'var(--bull)',
                          }}>
                            H: ₹{quote.high?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '—'}
                          </p>
                          <p style={{
                            fontFamily: "'JetBrains Mono', monospace",
                            fontSize: '0.72rem', fontWeight: 600,
                            color: 'var(--bear)',
                          }}>
                            L: ₹{quote.low?.toLocaleString('en-IN', { maximumFractionDigits: 2 }) || '—'}
                          </p>
                        </div>
                      ) : (
                        <span style={{ color: 'var(--muted)', fontSize: '0.78rem' }}>—</span>
                      )}
                    </td>

                    {/* Actions */}
                    <td style={{ textAlign: 'right' }} onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: '6px', justifyContent: 'flex-end' }}>
                        <button
                          className="btn btn-bull"
                          style={{ padding: '5px 12px', fontSize: '0.72rem' }}
                          onClick={() => setSelected({
                            symbol: item.symbol,
                            company_name: item.company_name,
                            price: price || quote?.price || 0,
                            userQuantity: 0,
                          })}
                        >
                          Buy
                        </button>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '5px 10px', fontSize: '0.72rem' }}
                          onClick={() => navigate(`/chart/${item.symbol}`)}
                        >
                          Chart
                        </button>
                        <button
                          className="btn btn-ghost"
                          style={{ padding: '5px 10px', fontSize: '0.72rem', color: 'var(--bear)' }}
                          onClick={() => removeWL.mutate(item.symbol)}
                        >
                          ✕
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        )}
      </div>

      {selected && (
        <OrderModal stock={selected} onClose={() => setSelected(null)} />
      )}
    </div>
  )
}