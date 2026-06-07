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
      minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
      background: 'var(--color-light-bg)',
    }}>
      <div style={{ width: '100%', maxWidth: '380px', padding: '0 16px' }}>
        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <h1 style={{
            fontFamily: "'DM Sans', sans-serif", fontWeight: 700,
            fontSize: '2rem', letterSpacing: '-0.04em', margin: 0,
            color: 'var(--color-accent)',
          }}>
            Quantra
          </h1>
          <p style={{ fontSize: '0.82rem', color: 'var(--color-light-muted)', marginTop: '6px' }}>
            Create your account
          </p>
        </div>

        <div className="card" style={{ padding: '28px' }}>
          <h2 style={{ fontSize: '1rem', fontWeight: 600, margin: '0 0 20px', color: 'var(--color-light-text)' }}>
            Get started
          </h2>

          {error && (
            <div style={{
              padding: '10px 12px', borderRadius: '8px', marginBottom: '16px',
              background: 'var(--color-bear-soft)', border: '1px solid rgba(239,68,68,0.2)',
              fontSize: '0.78rem', color: 'var(--color-bear)',
            }}>
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
            {[
              { name: 'name',     type: 'text',     label: 'Full name'  },
              { name: 'email',    type: 'email',    label: 'Email'      },
              { name: 'password', type: 'password', label: 'Password'   },
            ].map(({ name, type, label }) => (
              <div key={name}>
                <label style={{ fontSize: '0.75rem', color: 'var(--color-light-muted)', display: 'block', marginBottom: '5px' }}>
                  {label}
                </label>
                <input
                  type={type} name={name} value={form[name]}
                  onChange={handleChange} required
                  style={{
                    width: '100%', padding: '9px 12px', borderRadius: '8px',
                    border: '1px solid var(--color-light-border2)',
                    background: 'var(--color-light-raised)',
                    color: 'var(--color-light-text)',
                    fontSize: '0.85rem', outline: 'none', transition: 'border-color 0.15s',
                  }}
                  onFocus={e => e.target.style.borderColor = 'var(--color-accent)'}
                  onBlur={e => e.target.style.borderColor = 'var(--color-light-border2)'}
                />
              </div>
            ))}
            <button
              type="submit" disabled={loading}
              style={{
                width: '100%', padding: '10px', borderRadius: '8px',
                background: loading ? 'rgba(59,130,246,0.5)' : 'var(--color-accent)',
                color: '#fff', fontWeight: 600, fontSize: '0.85rem',
                border: 'none', cursor: loading ? 'not-allowed' : 'pointer', marginTop: '4px',
              }}
            >
              {loading ? 'Creating account...' : 'Create account'}
            </button>
          </form>

          <p style={{ fontSize: '0.78rem', textAlign: 'center', marginTop: '18px', color: 'var(--color-light-muted)' }}>
            Already have an account?{' '}
            <Link to="/login" style={{ color: 'var(--color-accent)', textDecoration: 'none', fontWeight: 500 }}>
              Sign in
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}