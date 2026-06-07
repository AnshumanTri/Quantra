import { NavLink, useNavigate } from 'react-router-dom'
import { useProfile } from '../../hooks/usePortfolio'

const nav = [
  { to: '/dashboard', label: 'Dashboard', icon:
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="3" y="3" width="7" height="7"/><rect x="14" y="3" width="7" height="7"/><rect x="14" y="14" width="7" height="7"/><rect x="3" y="14" width="7" height="7"/></svg>
  },
  { to: '/watchlist', label: 'Watchlist', icon:
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>
  },
  { to: '/portfolio', label: 'Portfolio', icon:
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-6"/></svg>
  },
  { to: '/holdings', label: 'Holdings', icon:
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v2"/></svg>
  },
  { to: '/orders', label: 'Orders', icon:
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/><polyline points="10 9 9 9 8 9"/></svg>
  },
]

export default function Sidebar() {
  const { data: profile } = useProfile()
  const navigate = useNavigate()

  const fmt = (n) => new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 }).format(n)

  return (
    <aside style={{
      width: '200px', flexShrink: 0,
      background: 'var(--surface)',
      borderRight: '1px solid var(--border)',
      display: 'flex', flexDirection: 'column',
    }}>
      {/* Logo */}
      <div style={{ height: '48px', display: 'flex', alignItems: 'center', padding: '0 18px', borderBottom: '1px solid var(--border)' }}>
        <span style={{
  fontFamily: "'Outfit', sans-serif",
  fontWeight: 700,
  fontSize: '1.15rem',
  letterSpacing: '-0.04em',
  color: 'var(--accent)',
}}>
  Quantra
</span>
      </div>

      {/* Nav */}
      <nav style={{ flex: 1, padding: '10px 10px', display: 'flex', flexDirection: 'column', gap: '2px' }}>
        {nav.map(({ to, label, icon }) => (
          <NavLink
            key={to} to={to}
            className={({ isActive }) => `nav-link${isActive ? ' active' : ''}`}
          >
            <span style={{ flexShrink: 0, opacity: 0.8 }}>{icon}</span>
            {label}
          </NavLink>
        ))}
      </nav>

      {/* Balance */}
      <div style={{ margin: '10px', borderRadius: '12px', overflow: 'hidden' }}>
        <div style={{
          background: 'linear-gradient(135deg, var(--accent-soft), var(--bull-soft))',
          border: '1px solid var(--border2)',
          borderRadius: '12px', padding: '14px',
        }}>
          <p className="label" style={{ marginBottom: '4px' }}>Available</p>
          <p className="num" style={{ fontSize: '1.05rem', fontWeight: 700, color: 'var(--bull)', marginBottom: '8px' }}>
            {profile ? fmt(profile.balance) : '—'}
          </p>
          <button
            onClick={() => navigate('/portfolio')}
            style={{
              background: 'var(--accent)', color: '#fff',
              border: 'none', borderRadius: '6px', padding: '5px 10px',
              fontSize: '0.72rem', fontWeight: 600, cursor: 'pointer', width: '100%',
            }}
          >
            View Portfolio →
          </button>
        </div>
      </div>
    </aside>
  )
}