'use client'

import { useActionState } from 'react'
import { signup } from '@/app/auth-actions'
import Link from 'next/link'

export default function SignupPage() {
  const [state, formAction, pending] = useActionState(async (prevState, formData) => {
    return await signup(formData)
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
          <h2>Create your account</h2>
          <p>Join CargoGate Compliance</p>
        </div>

        {state?.success ? (
          <div className="confirm-screen">
            <div className="confirm-icon">
              <svg viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                <polyline points="22,6 12,13 2,6"></polyline>
              </svg>
            </div>
            <h3>Verification Link Sent</h3>
            <p>
              We've securely dispatched a confirmation link to your inbox. Please click the link to verify your identity and activate your account.
            </p>
            <Link href="/login" className="btn btn-primary btn-full">
              Proceed to Login
            </Link>
          </div>
        ) : (
          <form action={formAction}>
            <div className="input-group">
              <label className="input-label" htmlFor="full_name">Full Name</label>
              <input 
                id="full_name" 
                name="full_name" 
                type="text" 
                className="input-field" 
                placeholder="Jane Doe" 
                required 
              />
            </div>

            <div className="input-group">
              <label className="input-label" htmlFor="phone_number">Phone Number</label>
              <input 
                id="phone_number" 
                name="phone_number" 
                type="tel" 
                className="input-field" 
                placeholder="+44 20 7123 4567" 
                required 
              />
            </div>

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
                placeholder="Min. 6 characters" 
                minLength="6"
                required 
              />
            </div>

            {state?.error && (
              <div className="status-badge status-invalid" style={{ marginTop: '0', marginBottom: '1.5rem', padding: '0.75rem' }}>
                <div className="status-badge-header" style={{ marginBottom: '0' }}>
                  <div className="status-icon">⚠</div>
                  <div className="status-label">Signup Failed</div>
                </div>
                <div className="status-message" style={{ fontSize: '13px', marginTop: '4px' }}>{state.error}</div>
              </div>
            )}

            <button type="submit" className="btn btn-primary btn-full" disabled={pending}>
              {pending ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
        )}

        <div className="auth-footer">
          Already have an account? <Link href="/login">Log in</Link>
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
