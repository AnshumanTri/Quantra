import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import axiosInstance from '../api/axiosInstance'
import useAuthStore from '../store/useAuthStore'

export default function Register() {
  const navigate = useNavigate()
  const { setAuth } = useAuthStore()
  const [form, setForm] = useState({ name: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleChange = e => setForm({ ...form, [e.target.name]: e.target.value })

  const handleSubmit = async e => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      const { data } = await axiosInstance.post('/auth/register', form)
      localStorage.setItem('quantra_token', data.token)
      setAuth(data.token, data.user)
      navigate('/dashboard')
    } catch (err) {
      setError(err.response?.data?.error || 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div style={{
      display: 'flex', minHeight: '100vh',
      fontFamily: "'Outfit', sans-serif",
    }}>

      {/* LEFT — white side */}
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
            fontSize: '1.6rem', fontWeight: 800,
            letterSpacing: '-0.05em',
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
            {/* Background grid */}
            {[0,1,2,3,4].map(i => (
              <line key={`h${i}`} x1="40" y1={80 + i * 40} x2="360" y2={80 + i * 40}
                stroke="#f1f5f9" strokeWidth="1"/>
            ))}
            {[0,1,2,3,4,5,6,7].map(i => (
              <line key={`v${i}`} x1={40 + i * 46} y1="80" x2={40 + i * 46} y2="240"
                stroke="#f1f5f9" strokeWidth="1"/>
            ))}

            {/* Area chart fill */}
            <defs>
              <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#2563eb" stopOpacity="0.3"/>
                <stop offset="100%" stopColor="#2563eb" stopOpacity="0.02"/>
              </linearGradient>
            </defs>
            <path d="M40,200 L86,180 L132,190 L178,150 L224,160 L270,120 L316,130 L360,100 L360,240 L40,240 Z"
              fill="url(#chartGrad)"/>
            {/* Chart line */}
            <polyline
              points="40,200 86,180 132,190 178,150 224,160 270,120 316,130 360,100"
              fill="none" stroke="#2563eb" strokeWidth="3"
              strokeLinecap="round" strokeLinejoin="round"/>
            {/* Dots on line */}
            {[[40,200],[132,190],[224,160],[316,130],[360,100]].map(([x,y], i) => (
              <circle key={i} cx={x} cy={y} r="5" fill="white" stroke="#2563eb" strokeWidth="2.5"/>
            ))}

            {/* Floating stats cards */}
            <rect x="260" y="60" width="100" height="50" rx="10" fill="white"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.10))' }}/>
            <text x="275" y="80" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">Balance</text>
            <text x="275" y="97" fontSize="11" fontWeight="bold" fill="#0f172a" fontFamily="sans-serif">₹9,96,988</text>

            <rect x="40" y="55" width="100" height="50" rx="10" fill="white"
              style={{ filter: 'drop-shadow(0 4px 12px rgba(0,0,0,0.10))' }}/>
            <text x="55" y="75" fontSize="8" fill="#94a3b8" fontFamily="sans-serif">Total P&L</text>
            <text x="55" y="92" fontSize="11" fontWeight="bold" fill="#22c55e" fontFamily="sans-serif">+₹6,018 ▲</text>

            {/* Bottom labels */}
            {['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug'].map((m, i) => (
              <text key={m} x={40 + i * 46} y="258" fontSize="8" fill="#cbd5e1"
                fontFamily="sans-serif" textAnchor="middle">{m}</text>
            ))}
          </svg>
        </div>

        <div style={{ textAlign: 'center', maxWidth: '300px' }}>
          <p style={{ fontSize: '1rem', fontWeight: 600, color: '#1e293b', marginBottom: '8px' }}>
            Start your trading journey today
          </p>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', lineHeight: 1.6 }}>
            Join thousands of traders practicing with real NSE market data and zero risk.
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
        {/* Decorative circles */}
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
            Hello!
          </h2>
          <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '24px' }}>
            Sign up to get started with Quantra
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

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '13px' }}>

            {/* Name */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
                  <circle cx="12" cy="7" r="4"/>
                </svg>
              </div>
              <input
                type="text" name="name" value={form.name}
                onChange={handleChange} placeholder="Full Name" required
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

            {/* Email */}
            <div style={{ position: 'relative' }}>
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
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
              <div style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)', color: '#94a3b8' }}>
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
              marginTop: '4px',
              boxShadow: '0 4px 14px rgba(37,99,235,0.4)',
              transition: 'opacity 0.15s',
            }}
              onMouseEnter={e => { if (!loading) e.currentTarget.style.opacity = '0.92' }}
              onMouseLeave={e => e.currentTarget.style.opacity = '1'}
            >
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>

          <p style={{
            fontSize: '0.78rem', textAlign: 'center',
            marginTop: '20px', color: '#94a3b8',
          }}>
            Already have an account?{' '}
            <Link to="/login" style={{
              color: '#2563eb', fontWeight: 700, textDecoration: 'none',
            }}>
              Login
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}