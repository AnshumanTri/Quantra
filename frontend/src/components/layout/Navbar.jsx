import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import useThemeStore from '../../store/useThemeStore'
import useAuthStore from '../../store/useAuthStore'
import { useStockSearch } from '../../hooks/useMarketData'

export default function Navbar() {
  const { isDark, toggle } = useThemeStore()
  const { user, logout } = useAuthStore()
  const navigate = useNavigate()
  const [query, setQuery] = useState('')
  const { data: results = [] } = useStockSearch(query)

  return (
    <header style={{
      height: '48px', display: 'flex', alignItems: 'center',
      justifyContent: 'space-between', padding: '0 20px', flexShrink: 0,
      background: 'var(--surface)', borderBottom: '1px solid var(--border)',
    }}>
      {/* Search */}
      <div style={{ position: 'relative' }}>
        <div style={{
          display: 'flex', alignItems: 'center', gap: '8px',
          background: 'var(--surface2)', border: '1px solid var(--border2)',
          borderRadius: '10px', padding: '7px 12px', width: '280px',
        }}>
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ color: 'var(--muted)', flexShrink: 0 }}>
            <circle cx="11" cy="11" r="8"/><path d="m21 21-4.35-4.35"/>
          </svg>
          <input
            value={query}
            onChange={e => setQuery(e.target.value)}
            placeholder="Search stocks..."
            style={{
              background: 'none', border: 'none', outline: 'none',
              fontSize: '0.82rem', color: 'var(--text)', width: '100%',
              fontFamily: "'Outfit', sans-serif",
            }}
          />
          {query && (
            <button onClick={() => setQuery('')} style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--muted)', padding: 0, lineHeight: 1 }}>✕</button>
          )}
        </div>

        {results.length > 0 && query && (
          <div style={{
            position: 'absolute', top: 'calc(100% + 6px)', left: 0,
            background: 'var(--surface)', border: '1px solid var(--border2)',
            borderRadius: '12px', boxShadow: 'var(--shadow-lg)',
            width: '300px', overflow: 'hidden', zIndex: 100,
          }}>
            {results.map((s, i) => (
              <div key={s.symbol}
                onClick={() => { navigate(`/chart/${s.symbol}`); setQuery('') }}
                style={{
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center',
                  padding: '10px 14px', cursor: 'pointer',
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
                <span style={{ fontSize: '0.7rem', color: 'var(--accent)', fontWeight: 600 }}>View →</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Right */}
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
        <button
          onClick={toggle}
          style={{
            display: 'flex', alignItems: 'center', gap: '6px',
            background: 'var(--surface2)', border: '1px solid var(--border2)',
            borderRadius: '8px', padding: '6px 12px',
            fontSize: '0.75rem', fontWeight: 500, color: 'var(--text2)',
            cursor: 'pointer', fontFamily: "'Outfit', sans-serif",
          }}
        >
          {isDark ? '☀️' : '🌙'} {isDark ? 'Light' : 'Dark'}
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <div style={{
            width: '30px', height: '30px', borderRadius: '50%',
            background: 'linear-gradient(135deg, var(--accent), var(--purple))',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            color: '#fff', fontSize: '0.78rem', fontWeight: 700,
          }}>
            {user?.name?.charAt(0).toUpperCase() || 'U'}
          </div>
          <span style={{ fontSize: '0.82rem', fontWeight: 500, color: 'var(--text2)' }}>
            {user?.name?.split(' ')[0]}
          </span>
          <button
            onClick={logout}
            style={{
              background: 'none', border: 'none', cursor: 'pointer',
              fontSize: '0.75rem', color: 'var(--muted)', fontFamily: "'Outfit', sans-serif',",
              transition: 'color 0.15s',
            }}
            onMouseEnter={e => e.currentTarget.style.color = 'var(--bear)'}
            onMouseLeave={e => e.currentTarget.style.color = 'var(--muted)'}
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  )
}