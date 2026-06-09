import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import useAuthStore from '../store/useAuthStore'

export default function Login() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await axiosInstance.post('/auth/login', form)
      localStorage.setItem('quantra_token', data.token)
      setAuth(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Invalid email or password')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      fontFamily: "'Outfit', sans-serif",
    }}>

      {/* LEFT — white side with illustration */}
      <div style={{
        flex: 1, background: '#ffffff',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        padding: '60px 40px',
      }}>
        {/* Logo */}
        <div style={{ marginBottom: '48px', alignSelf: 'flex-start', paddingLeft: '20px' }}>
          <span style={{
            fontFamily: "'Outfit', sans-serif",
            fontSize: '2.5rem', fontWeight: 900,
            letterSpacing: '-0.03em',
            background: 'linear-gradient(135deg, #1d4ed8, #2563eb)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}>
            Quantra
          </span>
        </div>

        {/* Illustration */}
        <div style={{ width: '100%', maxWidth: '380px', marginBottom: '40px' }}>
          <svg viewBox="0 0 400 300" xmlns="http://www.w3.org/2000/svg" style={{ width: '100%' }}>
            {/* Desk */}
            <rect x="80" y="220" width="240" height="12" rx="4" fill="#e2e8f0"/>
            <rect x="100" y="232" width="8" height="40" rx="3" fill="#cbd5e1"/>
            <rect x="292" y="232" width="8" height="40" rx="3" fill="#cbd5e1"/>

            {/* Monitor */}
            <rect x="140" y="130" width="140" height="90" rx="8" fill="#1e293b"/>
            <rect x="148" y="138" width="124" height="74" rx="4" fill="#0f172a"/>
            {/* Chart lines on screen */}
            <polyline points="158,195 175,175 192,182 210,160 227,168 244,148 261,155" fill="none" stroke="#22c55e" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
            <polyline points="158,200 175,192 192,196 210,185 227,190 244,178 261,182" fill="none" stroke="#6366f1" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" opacity="0.7"/>
            {/* Monitor stand */}
            <rect x="202" y="220" width="16" height="10" rx="2" fill="#334155"/>
            <rect x="188" y="228" width="44" height="5" rx="2" fill="#334155"/>

            {/* Chair */}
            <rect x="150" y="260" width="80" height="8" rx="4" fill="#94a3b8"/>
            <rect x="183" y="268" width="14" height="20" rx="3" fill="#94a3b8"/>
            <circle cx="175" cy="295" r="5" fill="#64748b"/>
            <circle cx="205" cy="295" r="5" fill="#64748b"/>
            {/* Person */}
            <circle cx="210" cy="200" r="16" fill="#fbbf24"/>
            <rect x="196" y="215" width="28" height="35" rx="8" fill="#2563eb"/>
            {/* Arms */}
            <rect x="178" y="218" width="20" height="8" rx="4" fill="#2563eb"/>
            <rect x="222" y="218" width="20" height="8" rx="4" fill="#2563eb"/>
            {/* Hands on keyboard */}
            <ellipse cx="185" cy="235" rx="7" ry="5" fill="#fbbf24"/>
            <ellipse cx="235" cy="235" rx="7" ry="5" fill="#fbbf24"/>
            {/* Hair */}
            <ellipse cx="210" cy="190" rx="16" ry="10" fill="#1e293b"/>

            {/* Floating chart card */}
            <rect x="280" y="120" width="90" height="60" rx="8" fill="white" opacity="0.95"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }}/>
            <text x="292" y="140" fontSize="8" fill="#64748b" fontFamily="sans-serif">NIFTY 50</text>
            <text x="292" y="155" fontSize="11" fontWeight="bold" fill="#22c55e" fontFamily="sans-serif">▲ 1.24%</text>
            <text x="292" y="169" fontSize="9" fill="#1e293b" fontFamily="sans-serif">22,450.50</text>

            {/* Floating badge */}
            <rect x="30" y="140" width="80" height="44" rx="8" fill="white" opacity="0.95"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.12))' }}/>
            <text x="44" y="158" fontSize="8" fill="#64748b" fontFamily="sans-serif">Portfolio</text>
            <text x="44" y="173" fontSize="10" fontWeight="bold" fill="#6366f1" fontFamily="sans-serif">+₹6,018</text>

            {/* Decorative dots */}
            <circle cx="60" cy="80" r="4" fill="#dbeafe"/>
            <circle cx="340" cy="90" r="6" fill="#dbeafe"/>
            <circle cx="350" cy="240" r="4" fill="#e0e7ff"/>
            <circle cx="50" cy="260" r="5" fill="#f0fdf4"/>
          </svg>
        </div>

        {/* Tagline */}
        <div style={{ textAlign: 'center', maxWidth: '320px' }}>
          <p style={{ fontSize: '1.25rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
            Practice trading. Build confidence.
          </p>
          <p style={{ fontSize: '1.00rem', color: '#94a3b8', lineHeight: 1.6 }}>
            Trade NSE stocks with virtual ₹10,00,000. Real market data, zero risk.
          </p>
        </div>
      </div>

      {/* RIGHT — blue side with form */}
      <div style={{
        width: '480px', flexShrink: 0,
        background: 'linear-gradient(160deg, #1d4ed8 0%, #2563eb 50%, #1e40af 100%)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: '40px 32px', position: 'relative', overflow: 'hidden',
      }}>
        {/* Background decorative circles */}
        <div style={{
          position: 'absolute', bottom: '-60px', right: '-60px',
          width: '240px', height: '240px', borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.1)',
        }}/>
        <div style={{
          position: 'absolute', bottom: '-30px', right: '-30px',
          width: '160px', height: '160px', borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.08)',
        }}/>
        <div style={{
          position: 'absolute', top: '-40px', left: '-40px',
          width: '160px', height: '160px', borderRadius: '50%',
          border: '2px solid rgba(255,255,255,0.08)',
        }}/>

        {/* Form card */}
        <div style={{
          background: 'white', borderRadius: '20px',
          padding: '36px 32px', width: '100%', maxWidth: '360px',
          boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          position: 'relative', zIndex: 1,
        }}>
          <h2 style={{
            fontSize: '1.6rem', fontWeight: 800,
            color: '#0f172a', marginBottom: '4px',
            letterSpacing: '-0.04em',
          }}>
            Welcome back!
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '24px' }}>
            Sign in to your Quantra account
          </p>

          {error && (
            <div style={{
              padding: '10px 14px', borderRadius: '10px', marginBottom: '16px',
              background: '#fef2f2', border: '1px solid #fecaca',
              fontSize: '0.78rem', color: '#dc2626',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', color: '#94a3b8',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/>
                  <polyline points="22,6 12,13 2,6"/>
                </svg>
              </div>
              <input
                type="email" name="email" value={form.email}
                onChange={handleChange} placeholder="Email Address" required
                style={{
                  width: '100%', padding: '13px 14px 13px 42px',
                  borderRadius: '12px', border: '1.5px solid #e2e8f0',
                  background: '#f8fafc', fontSize: '0.85rem',
                  color: '#0f172a', outline: 'none', transition: 'border-color 0.15s',
                  fontFamily: "'Outfit', sans-serif",
                }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Password */}
            <div style={{ position: 'relative' }}>
              <div style={{
                position: 'absolute', left: '14px', top: '50%',
                transform: 'translateY(-50%)', color: '#94a3b8',
              }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                  <path d="M7 11V7a5 5 0 0 1 10 0v4"/>
                </svg>
              </div>
              <input
                type="password" name="password" value={form.password}
                onChange={handleChange} placeholder="Password" required
                style={{
                  width: '100%', padding: '13px 14px 13px 42px',
                  borderRadius: '12px', border: '1.5px solid #e2e8f0',
                  background: '#f8fafc', fontSize: '0.85rem',
                  color: '#0f172a', outline: 'none', transition: 'border-color 0.15s',
                  fontFamily: "'Outfit', sans-serif",
                }}
                onFocus={e => e.target.style.borderColor = '#2563eb'}
                onBlur={e => e.target.style.borderColor = '#e2e8f0'}
              />
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={{
              width: '100%', padding: '13px',
              borderRadius: '12px', border: 'none',
              background: loading
                ? '#93c5fd'
                : 'linear-gradient(135deg, #2563eb, #1d4ed8)',
              color: '#fff', fontSize: '0.9rem', fontWeight: 700,
              cursor: loading ? 'not-allowed' : 'pointer',
              fontFamily: "'Outfit', sans-serif",
              marginTop: '4px', transition: 'opacity 0.15s',
              boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.92' }}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {loading ? 'Signing in...' : 'Login'}
            </button>
          </form>

          <p style={{
            fontSize: '0.78rem', textAlign: 'center',
            marginTop: '20px', color: '#94a3b8',
          }}>
            Don't have an account?{' '}
            <Link to="/register" style={{
              color: '#2563eb', fontWeight: 700, textDecoration: 'none',
            }}>
              Sign Up
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}