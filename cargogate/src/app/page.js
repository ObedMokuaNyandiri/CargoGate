import EoriValidator from '@/components/EoriValidator';
import HsCodeValidator from '@/components/HsCodeValidator';
import ApiRequestButton from '@/components/ApiRequestButton';
import Link from 'next/link';

export default function Home() {
  return (
    <>
      <nav className="nav-bar">
        <Link href="/" className="nav-brand">
          <div className="nav-logo">
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none">
              <path d="M16 5L7 10v12l9 5 9-5V10L16 5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <path d="M7 10l9 5 9-5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
              <line x1="16" y1="15" x2="16" y2="27" stroke="currentColor" strokeWidth="1.5"/>
              <circle cx="16" cy="15" r="1.5" fill="currentColor"/>
            </svg>
          </div>
          <span className="nav-brand-text">
            CargoGate <span className="nav-brand-accent">Compliance</span>
          </span>
        </Link>
        <div className="nav-actions">
          <ApiRequestButton className="nav-btn" style={{ marginRight: '12px', color: 'var(--text-primary)', borderColor: 'var(--border-subtle)', fontWeight: '600' }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-primary)' }}><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
            API Access
          </ApiRequestButton>
          <span className="credits-badge" style={{ background: 'var(--bg-card)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.85rem', border: '1px solid var(--border)', marginRight: '10px' }}>
            <strong>Free Validation Tool</strong>
          </span>
        </div>
      </nav>

      <main className="dashboard">
        <div className="dashboard-split">
          <div className="dashboard-main">
            <header className="hero" style={{ textAlign: 'left', padding: '0 0 var(--space-xl) 0', marginBottom: '0' }}>
              <div className="hero-content">
                <h1 style={{ fontSize: '3rem', lineHeight: '1.1', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '0.5rem', letterSpacing: '-0.03em' }}>
                  The Ultimate Free
                  <br />
                  <span style={{ color: 'var(--accent-primary)' }}>ICS2 Compliance</span> Checker
                </h1>
                <h2 style={{ fontSize: '1.25rem', fontWeight: '600', color: 'var(--text-secondary)', marginBottom: '1.5rem', marginTop: '0' }}>
                  Eliminate EU Border Delays Instantly
                </h2>
                <p className="hero-subtitle" style={{ margin: '0 0 var(--space-lg) 0', maxWidth: '100%', fontSize: '1.05rem', lineHeight: '1.6' }}>
                  Shipping cargo into or through the European Union demands absolute regulatory precision. 
                  Validate EORI numbers, HS Codes, and goods descriptions against official EU ICS2 regulations in real-time. Completely free.
                </p>
                
                <div className="hero-badges" style={{ justifyContent: 'flex-start' }}>
                  <span className="hero-badge">
                    <span className="hero-badge-dot" />
                    EU EOS Live
                  </span>
                  <span className="hero-badge">
                    <span className="hero-badge-dot hero-badge-dot-blue" />
                    HS 2022 Index
                  </span>
                  <span className="hero-badge">
                    <span className="hero-badge-dot hero-badge-dot-amber" />
                    ICS2 Scanner
                  </span>
                </div>
              </div>
            </header>

            <div style={{ marginBottom: '24px', padding: '16px', background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '16px', boxShadow: 'var(--shadow-btn)' }}>
              <div style={{ background: 'rgba(16, 185, 129, 0.1)', padding: '10px', borderRadius: '50%', color: '#10b981' }}>
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink: 0 }}>
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
                </svg>
              </div>
              <div>
                <h4 style={{ margin: '0 0 4px 0', color: 'var(--text-primary)', fontSize: '1rem', fontWeight: '700' }}>Zero Data Retention Guarantee</h4>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                  Validated in memory. Instantly destroyed. We do not store or log your proprietary manifests.
                </p>
              </div>
            </div>

            <div className="api-upsell-card" style={{ marginTop: 'var(--space-2xl)', background: 'linear-gradient(145deg, #0f172a, #1e293b)', border: '1px solid rgba(14, 165, 233, 0.4)', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)', color: '#fff' }}>
              <div style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '4px', background: 'linear-gradient(90deg, #3b82f6, #0ea5e9, #2dd4bf)' }}></div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '16px' }}>
                <div style={{ background: 'rgba(14, 165, 233, 0.2)', padding: '10px', borderRadius: '12px', color: '#38bdf8' }}>
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                </div>
                <h3 style={{ margin: 0, fontSize: '1.4rem', fontWeight: '800', letterSpacing: '-0.02em', background: 'linear-gradient(90deg, #fff, #cbd5e1)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
                  Automate ICS2 Compliance
                </h3>
              </div>
              <p style={{ margin: '0 0 20px 0', fontSize: '0.95rem', color: '#cbd5e1', lineHeight: '1.6' }}>
                Connect our stateless NLP validation engine directly to your ERP or Warehouse Management System.
              </p>
              
              <div style={{ background: 'rgba(0,0,0,0.3)', padding: '16px', borderRadius: '12px', border: '1px solid rgba(255,255,255,0.05)', marginBottom: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.1em', fontWeight: '700', marginBottom: '4px' }}>ENTERPRISE TIER API</div>
                  <div style={{ fontSize: '0.85rem', color: '#38bdf8', fontWeight: '600' }}>50,000 requests / mo</div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ color: '#fff', fontWeight: '800', fontSize: '1.5rem', lineHeight: '1' }}>$199</div>
                  <div style={{ fontSize: '0.75rem', color: '#94a3b8' }}>per month</div>
                </div>
              </div>
              
              <ApiRequestButton className="btn" style={{ width: '100%', padding: '14px', background: '#ffffff', color: '#0f172a', fontWeight: '700', borderRadius: '8px', border: 'none', transition: 'transform 0.2s ease', boxShadow: '0 4px 14px rgba(255,255,255,0.2)' }}>
                Request API Keys
              </ApiRequestButton>
            </div>
          </div>

          <aside className="dashboard-sidebar">
            <div className="validation-console">
              <div className="console-body" style={{ flexDirection: 'column', gap: 'var(--space-md)' }}>
                <EoriValidator />
                <HsCodeValidator />
              </div>
            </div>
          </aside>
        </div>


      </main>

      <footer className="site-footer">
        <p style={{ marginBottom: '8px' }}>© {new Date().getFullYear()} CargoGate · Free EU ICS2 Compliance Platform</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <Link href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</Link>
        </div>
      </footer>
    </>
  );
}
