'use client'

import { useActionState } from 'react'
import { login } from '@/app/auth-actions'
import Link from 'next/link'

export default function LoginPage() {
  const [state, formAction, pending] = useActionState(async (prevState, formData) => {
    return await login(formData)
  }, null)

  return (
    <main className="auth-page">
      <div className="auth-card">
        <div className="auth-header">
          <div className="auth-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
              <path d="M16 5L7 10v12l9 5 9-5V10L16 5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M7 10l9 5 9-5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <line x1="16" y1="15" x2="16" y2="27" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="16" cy="15" r="1.5" fill="currentColor"/>
            </svg>
          </div>
          <h2>Welcome back</h2>
          <p>Log in to your account</p>
        </div>

        <form action={formAction}>
          <div className="input-group">
            <label className="input-label" htmlFor="email">Email Address</label>
            <input 
              id="email" 
              name="email" 
              type="email" 
              className="input-field" 
              placeholder="agent@example.com" 
              required 
            />
          </div>

          <div className="input-group">
            <label className="input-label" htmlFor="password">Password</label>
            <input 
              id="password" 
              name="password" 
              type="password" 
              className="input-field" 
              placeholder="••••••••" 
              required 
            />
          </div>

          {state?.error && (
            <div className="status-badge status-invalid" style={{ marginTop: '0', marginBottom: '1.5rem', padding: '0.75rem' }}>
              <div className="status-badge-header" style={{ marginBottom: '0' }}>
                <div className="status-icon">⚠</div>
                <div className="status-label">Authentication Failed</div>
              </div>
              <div className="status-message" style={{ fontSize: '13px', marginTop: '4px' }}>{state.error}</div>
            </div>
          )}

          <button type="submit" className="btn btn-primary btn-full" disabled={pending}>
            {pending ? 'Logging in...' : 'Log In'}
          </button>
        </form>

        <div className="auth-footer">
          Don't have an account? <Link href="/signup">Sign up</Link>
        </div>
        
        <div className="auth-trust">
          Secure EU ICS2 Compliance Infrastructure
          <div style={{ display: 'flex', justifyContent: 'center', gap: '16px', marginTop: '12px' }}>
            <Link href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</Link>
            <Link href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</Link>
          </div>
        </div>
      </div>
    </main>
  )
}
