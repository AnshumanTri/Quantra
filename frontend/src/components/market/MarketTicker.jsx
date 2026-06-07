import { useEffect, useState } from 'react'
import axiosInstance from '../../api/axiosInstance'

const FALLBACK = [
  { symbol: 'NIFTY 50',   price: 22450.50, change_pct: -0.46 },
  { symbol: 'SENSEX',     price: 73847.20, change_pct: -0.50 },
  { symbol: 'BANK NIFTY', price: 48234.60, change_pct:  0.49 },
  { symbol: 'RELIANCE',   price: 2847.50,  change_pct:  1.22 },
  { symbol: 'TCS',        price: 3921.10,  change_pct: -1.14 },
  { symbol: 'INFY',       price: 1456.75,  change_pct:  0.86 },
  { symbol: 'HDFCBANK',   price: 1678.30,  change_pct: -0.53 },
  { symbol: 'WIPRO',      price: 456.20,   change_pct:  1.24 },
  { symbol: 'ICICIBANK',  price: 1234.50,  change_pct:  1.30 },
  { symbol: 'SBIN',       price: 812.60,   change_pct:  1.16 },
  { symbol: 'BAJFINANCE', price: 7123.40,  change_pct: -1.28 },
  { symbol: 'TATAMOTORS', price: 924.85,   change_pct:  2.07 },
]

export default function MarketTicker() {
  const [items, setItems] = useState(FALLBACK)

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await axiosInstance.get('/market/indices')
        const indices = Object.values(data.indices || {})
        if (indices.length > 0) setItems([...indices, ...FALLBACK.slice(3)])
      } catch {}
    }
    load()
    const id = setInterval(load, 30000)
    return () => clearInterval(id)
  }, [])

  const doubled = [...items, ...items]

  return (
    <div className="ticker-wrap" style={{
      height: '30px', flexShrink: 0,
      background: 'linear-gradient(90deg, #0a0a14, #0f0f1e, #0a0a14)',
      borderBottom: '1px solid rgba(99,102,241,0.2)',
      display: 'flex', alignItems: 'center',
    }}>
      <div className="ticker-track">
        {doubled.map((item, i) => {
          const up = item.change_pct >= 0
          return (
            <div key={i} style={{
              display: 'flex', alignItems: 'center', gap: '8px',
              padding: '0 20px',
              borderRight: '1px solid rgba(255,255,255,0.06)',
              whiteSpace: 'nowrap',
            }}>
              <span style={{ fontSize: '0.7rem', fontWeight: 600, color: 'rgba(255,255,255,0.6)', letterSpacing: '0.05em' }}>
                {item.symbol}
              </span>
              <span className="num" style={{ fontSize: '0.7rem', color: 'rgba(255,255,255,0.9)', fontWeight: 500 }}>
                {item.price?.toLocaleString('en-IN', { maximumFractionDigits: 2 })}
              </span>
              <span className="num" style={{
                fontSize: '0.66rem', fontWeight: 600,
                color: up ? '#4ade80' : '#f87171',
                background: up ? 'rgba(74,222,128,0.1)' : 'rgba(248,113,113,0.1)',
                padding: '1px 5px', borderRadius: '3px',
              }}>
                {up ? '▲' : '▼'} {Math.abs(item.change_pct).toFixed(2)}%
              </span>
            </div>
          )
        })}
      </div>
    </div>
  )
}