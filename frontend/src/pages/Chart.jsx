import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useOHLC } from '../hooks/useMarketData'
import { useSocket, useLivePrices } from '../hooks/useSocket'
import { useWatchlist, useAddWatchlist, useRemoveWatchlist } from '../hooks/usePortfolio'
import useThemeStore from '../store/useThemeStore'
import CandlestickChart from '../components/charts/CandlestickChart'
import OrderModal from '../components/orders/OrderModal'

const INTERVALS = ['1D', '1W', '1M', '1Y']

export default function Chart() {
  const { symbol }   = useParams()
  const navigate     = useNavigate()
  const { isDark }   = useThemeStore()
  const [chartInterval, setChartInterval] = useState('1M')
  const [showOrder,  setShowOrder]  = useState(false)
  const [orderType,  setOrderType]  = useState('BUY')

  const { data: candles = [], isLoading } = useOHLC(symbol, chartInterval)
  useSocket([symbol])
  const { prices } = useLivePrices()
  const livePrice  = prices[symbol]

  const { data: watchlist = [] } = useWatchlist()
  const inWL = watchlist.some(w => w.symbol === symbol)
  const addWL    = useAddWatchlist()
  const removeWL = useRemoveWatchlist()

  const lastCandle  = candles[candles.length - 1]
  const firstCandle = candles[0]
  const priceChange = lastCandle && firstCandle ? parseFloat((lastCandle.close - firstCandle.open).toFixed(2)) : null
  const changePct   = priceChange !== null && firstCandle?.open ? ((priceChange / firstCandle.open) * 100).toFixed(2) : null
  const isUp        = priceChange >= 0

  const fmt = v => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 2 }).format(v)
  const fmtVol = v => {
    if (!v) return '—'
    if (v >= 10000000) return `${(v / 10000000).toFixed(2)}Cr`
    if (v >= 100000)   return `${(v / 100000).toFixed(2)}L`
    if (v >= 1000)     return `${(v / 1000).toFixed(2)}K`
    return v.toString()
  }

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', maxWidth: '1100px', animation: 'fadeUp 0.3s ease-out both' }}>

      {/* Back */}
      <button onClick={() => navigate(-1)} style={{
        display: 'inline-flex', alignItems: 'center', gap: '6px',
        background: 'none', border: 'none', cursor: 'pointer',
        fontSize: '0.8rem', color: 'var(--muted)', fontFamily: "'Outfit', sans-serif",
        padding: 0, transition: 'color 0.15s', width: 'fit-content',
      }}
        onMouseEnter={e => e.currentTarget.style.color = 'var(--text)'}
        onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
      >
        ← Back
      </button>

      {/* Header */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '22px 24px', boxShadow: 'var(--shadow-sm)',
      }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px' }}>

          {/* Left: symbol + price */}
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '6px' }}>
              <div style={{
                width: '40px', height: '40px', borderRadius: '10px',
                background: 'linear-gradient(135deg, var(--accent-soft), var(--purple-soft))',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                fontSize: '1rem', fontWeight: 700, color: 'var(--accent)',
              }}>
                {symbol?.charAt(0)}
              </div>
              <div>
                <h1 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.9rem', fontWeight: 700, letterSpacing: '-0.04em', color: 'var(--text)', lineHeight: 1 }}>
                  {symbol}
                </h1>
                <p style={{ fontSize: '0.72rem', color: 'var(--muted)', marginTop: '2px' }}>NSE · Equity</p>
              </div>
            </div>

            <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginTop: '8px' }}>
              {livePrice && (
                <span style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '1.8rem', fontWeight: 700, color: 'var(--text)', letterSpacing: '-0.02em' }}>
                  ₹{livePrice.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
                </span>
              )}
              {priceChange !== null && (
                <span style={{
                  fontFamily: "'JetBrains Mono', monospace",
                  fontSize: '0.9rem', fontWeight: 600,
                  color: isUp ? 'var(--bull)' : 'var(--bear)',
                  background: isUp ? 'var(--bull-soft)' : 'var(--bear-soft)',
                  padding: '3px 10px', borderRadius: '8px',
                }}>
                  {isUp ? '▲' : '▼'} {isUp ? '+' : ''}{fmt(priceChange)} ({isUp ? '+' : ''}{changePct}%)
                  <span style={{ fontSize: '0.7rem', opacity: 0.7, marginLeft: '6px' }}>{chartInterval}</span>
                </span>
              )}
            </div>
          </div>

          {/* Right: action buttons */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <button
              onClick={() => inWL ? removeWL.mutate(symbol) : addWL.mutate({ symbol, company_name: symbol })}
              style={{
                background: inWL ? 'var(--accent-soft)' : 'var(--surface2)',
                color: inWL ? 'var(--accent)' : 'var(--text2)',
                border: `1px solid ${inWL ? 'var(--accent)' : 'var(--border2)'}`,
                borderRadius: '8px', padding: '8px 14px', fontSize: '0.8rem',
                fontWeight: 600, cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
                transition: 'all 0.15s',
              }}
            >
              {inWL ? '★ Watching' : '☆ Watchlist'}
            </button>
            <button
              onClick={() => { setOrderType('BUY'); setShowOrder(true) }}
              style={{
                background: 'var(--bull)', color: '#fff',
                border: 'none', borderRadius: '8px', padding: '8px 20px',
                fontSize: '0.83rem', fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif", transition: 'filter 0.15s',
                boxShadow: '0 2px 8px rgba(34,197,94,0.3)',
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.currentTarget.style.filter = ''}
            >
              Buy
            </button>
            <button
              onClick={() => { setOrderType('SELL'); setShowOrder(true) }}
              style={{
                background: 'var(--bear)', color: '#fff',
                border: 'none', borderRadius: '8px', padding: '8px 20px',
                fontSize: '0.83rem', fontWeight: 700, cursor: 'pointer',
                fontFamily: "'Outfit', sans-serif", transition: 'filter 0.15s',
                boxShadow: '0 2px 8px rgba(239,68,68,0.3)',
              }}
              onMouseEnter={e => e.currentTarget.style.filter = 'brightness(1.1)'}
              onMouseLeave={e => e.currentTarget.style.filter = ''}
            >
              Sell
            </button>
          </div>
        </div>

        {/* OHLC stats */}
        {lastCandle && (
          <div style={{
            display: 'flex', gap: '0', marginTop: '20px',
            paddingTop: '16px', borderTop: '1px solid var(--border)',
            flexWrap: 'wrap',
          }}>
            {[
              { label: 'Open',   value: fmt(lastCandle.open),   color: 'var(--text)' },
              { label: 'High',   value: fmt(lastCandle.high),   color: 'var(--bull)' },
              { label: 'Low',    value: fmt(lastCandle.low),    color: 'var(--bear)' },
              { label: 'Close',  value: fmt(lastCandle.close),  color: isUp ? 'var(--bull)' : 'var(--bear)' },
              { label: 'Volume', value: fmtVol(lastCandle.volume), color: 'var(--accent)' },
            ].map(({ label, value, color }, i) => (
              <div key={label} style={{
                padding: '0 24px', borderRight: i < 4 ? '1px solid var(--border)' : 'none',
                minWidth: '100px',
              }}>
                <p style={{ fontSize: '0.65rem', fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--muted)', marginBottom: '4px' }}>
                  {label}
                </p>
                <p style={{ fontFamily: "'JetBrains Mono', monospace", fontSize: '0.88rem', fontWeight: 600, color }}>
                  {value}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Chart */}
      <div style={{
        background: 'var(--surface)', border: '1px solid var(--border)',
        borderRadius: '16px', padding: '18px 20px', boxShadow: 'var(--shadow-sm)',
      }}>
        {/* Interval buttons + candle count */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '16px' }}>
          {INTERVALS.map(iv => (
            <button key={iv} onClick={() => setChartInterval(iv)} style={{
              padding: '5px 14px', borderRadius: '7px', fontSize: '0.78rem', fontWeight: 600,
              cursor: 'pointer', fontFamily: "'Outfit', sans-serif", transition: 'all 0.15s',
              background: chartInterval === iv ? 'var(--accent)' : 'transparent',
              color: chartInterval === iv ? '#fff' : 'var(--muted)',
              border: chartInterval === iv ? 'none' : '1px solid var(--border2)',
            }}>
              {iv}
            </button>
          ))}
          <span style={{ marginLeft: 'auto', fontSize: '0.72rem', color: 'var(--muted)' }}>
            {candles.length > 0 ? `${candles.length} candles` : ''}
          </span>
        </div>

        {/* Chart area */}
        {isLoading ? (
          <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '12px' }}>
            <div style={{ width: '28px', height: '28px', border: '2px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite' }} />
            <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>Loading chart data...</p>
          </div>
        ) : candles.length === 0 ? (
          <div style={{ height: '400px', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
            <p style={{ fontSize: '2rem' }}>📉</p>
            <p style={{ color: 'var(--muted)', fontSize: '0.82rem' }}>No chart data available</p>
          </div>
        ) : (
          <CandlestickChart candles={candles} isDark={isDark} />
        )}
      </div>

      {showOrder && (
        <OrderModal
          stock={{ symbol, company_name: symbol, price: livePrice || lastCandle?.close || 0, userQuantity: 0, defaultType: orderType }}
          onClose={() => setShowOrder(false)}
        />
      )}
    </div>
  )
}