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
        <div className="nav-links" style={{ display: 'flex', gap: '24px', alignItems: 'center', marginLeft: 'auto', marginRight: '24px' }}>
          <Link href="#validator" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '500', fontSize: '0.95rem' }}>Validator</Link>
          <Link href="#features" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '500', fontSize: '0.95rem' }}>Features</Link>
          <Link href="#api" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontWeight: '500', fontSize: '0.95rem' }}>API</Link>
        </div>
        <div className="nav-actions">
          <Link href="#api" style={{ textDecoration: 'none' }}>
            <ApiRequestButton className="nav-btn" style={{ marginRight: '12px', color: 'var(--text-primary)', borderColor: 'var(--border-subtle)', fontWeight: '600' }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ color: 'var(--accent-primary)' }}><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
              API Access
            </ApiRequestButton>
          </Link>
          <span className="credits-badge" style={{ background: 'var(--bg-card)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.85rem', border: '1px solid var(--border)', marginRight: '10px' }}>
            <strong>Free Validation Tool</strong>
          </span>
        </div>
      </nav>

      <main className="dashboard">
        <section id="validator" className="dashboard-split">
          <div className="dashboard-main">
            <header id="home" className="hero" style={{ textAlign: 'center', padding: 'var(--space-2xl) 0 var(--space-xl) 0' }}>
              <div className="hero-content" style={{ maxWidth: '800px', margin: '0 auto' }}>
                <h1 style={{ fontSize: '3.5rem', lineHeight: '1.1', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1rem', letterSpacing: '-0.03em' }}>
                  The Ultimate Free
                  <br />
                  <span style={{ color: 'var(--accent-primary)' }}>ICS2 Compliance</span> Checker
                </h1>
                <h2 style={{ fontSize: '1.5rem', fontWeight: '500', color: 'var(--text-secondary)', marginBottom: '1.5rem', marginTop: '0', letterSpacing: '-0.01em' }}>
                  Eliminate EU Border Delays Instantly
                </h2>
                <p className="hero-subtitle" style={{ margin: '0 auto var(--space-lg) auto', maxWidth: '600px', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  Shipping cargo into or through the European Union demands absolute regulatory precision. 
                  Validate EORI numbers, HS Codes, and goods descriptions against official EU ICS2 regulations in real-time. Completely free.
                </p>
                
                <div className="hero-badges" style={{ justifyContent: 'center' }}>
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

            <div id="api" className="api-upsell-card" style={{ marginTop: '0', background: 'linear-gradient(145deg, #0f172a, #1e293b)', border: '1px solid rgba(14, 165, 233, 0.4)', borderRadius: '16px', padding: '24px', boxShadow: '0 20px 40px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.1)', color: '#fff' }}>
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
        </section>

        <section id="features" className="seo-section" style={{ marginTop: 'var(--space-3xl)' }}>
          <div style={{ maxWidth: '800px', margin: '0 auto', textAlign: 'center', marginBottom: 'var(--space-2xl)' }}>
            <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--text-primary)', marginBottom: '1rem', letterSpacing: '-0.02em' }}>
              Why CargoGate for ICS2 Compliance?
            </h2>
            <p style={{ fontSize: '1.1rem', color: 'var(--text-secondary)', lineHeight: '1.7' }}>
              Under the EU's strict Import Control System 2 (ICS2) mandate, a single vague cargo description or an obsolete tariff code can trigger immediate customs rejections, unexpected holds, and catastrophic supply chain delays.
            </p>
          </div>

          <div style={{ background: 'var(--bg-card)', padding: 'var(--space-xl)', borderRadius: '16px', border: '1px solid var(--border-subtle)', marginBottom: 'var(--space-2xl)', boxShadow: 'var(--shadow-card)' }}>
            <h3 style={{ marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '700' }}>Stop EU Customs Holds Before They Happen</h3>
            <p style={{ marginBottom: '1.5rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
              EU customs authorities routinely flag and block shipments due to non-compliant Entry Summary Declarations (ENS). CargoGate eliminates manual verification errors by automating cargo description and tariff classification audits.
            </p>
            <ul style={{ paddingLeft: '1.5rem', margin: '0', color: 'var(--text-secondary)', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
              <li><strong>Prevent Costly Rejections:</strong> Catch non-compliant data before submitting your manifest to EU authorities.</li>
              <li><strong>Accelerate Clearance Speed:</strong> Keep your freight moving through European ports and airports without administrative bottlenecks.</li>
              <li><strong>Protect Sensitive Trade Data:</strong> Audit your goods descriptions using an enterprise-grade engine designed around total privacy.</li>
            </ul>
          </div>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '700' }}>Enterprise Features Built for Global Logistics</h3>
          <div className="seo-feature-grid">
            <div className="seo-feature-card">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path><polyline points="14 2 14 8 20 8"></polyline><line x1="16" y1="13" x2="8" y2="13"></line><line x1="16" y1="17" x2="8" y2="17"></line><polyline points="10 9 9 9 8 9"></polyline></svg>
                1. AI-Powered ICS2 Goods Description Validator
              </h3>
              <p>
                Our proprietary Natural Language Processing (NLP) engine is engineered to mirror the exact screening algorithms used by EU Customs. It automatically identifies and flags high-risk placeholder terms (such as "parts," "equipment," or "mixed cargo") and verifies that your manifest contains the precise physical item identifiers required for immediate clearance.
              </p>
            </div>
            
            <div className="seo-feature-card">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z"></path><polyline points="3.27 6.96 12 12.01 20.73 6.96"></polyline><line x1="12" y1="22.08" x2="12" y2="12"></line></svg>
                2. Live EU HS Code Verifier
              </h3>
              <p>
                Eliminate the risk of using outdated 2017 tariff schedules. CargoGate's EU HS Code Verifier integrates the latest World Customs Organization (WCO) correlation index. The tool strictly enforces valid 4-digit and 6-digit global subheading boundaries and triggers instant alerts if you attempt to process an obsolete tariff classification.
              </p>
            </div>

            <div className="seo-feature-card">
              <h3>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                3. 100% Stateless Zero-Trust Privacy
              </h3>
              <p>
                We recognize that supply chain manifests contain confidential client and cargo data. Unlike standard tools or clunky government portals, CargoGate operates with a strict Zero Data Retention architecture:
              </p>
              <ul style={{ marginTop: '0.75rem', paddingLeft: '1.2rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                <li style={{ marginBottom: '0.25rem' }}><strong>In-Memory Processing:</strong> Every byte of data is validated temporarily in memory and destroyed instantly after screening.</li>
                <li style={{ marginBottom: '0.25rem' }}><strong>No Database Logging:</strong> We store zero client lists, packing details, or transaction histories.</li>
                <li style={{ marginBottom: '0.25rem' }}><strong>Zero Friction:</strong> No account creation, no password management, and no hidden fees - just instant compliance validation.</li>
              </ul>
            </div>
          </div>

          <h3 style={{ marginTop: '3rem', marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '700' }}>Built for High-Volume Logistics Operations</h3>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Freight Forwarders & NVOCCs:</strong> Rapidly pre-screen client manifests before ENS submission to avoid customs fines.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Customs Brokers:</strong> Guarantee full compliance with EU security and tax frameworks on every entry.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Global E-Commerce Exporters:</strong> Maintain uninterrupted delivery schedules across all 27 EU member states.</li>
          </ul>

          <div style={{ marginTop: '3rem', padding: '1.5rem', background: 'rgba(14, 165, 233, 0.1)', borderRadius: '8px', border: '1px solid rgba(14, 165, 233, 0.2)' }}>
            <h3 style={{ color: 'var(--accent-primary)', marginBottom: '0.5rem', fontSize: '1.25rem', fontWeight: '700' }}>Validate Your Shipping Manifest in Seconds</h3>
            <p style={{ margin: 0, color: 'var(--text-secondary)' }}>
              Don't let vague descriptions or invalid HS codes paralyze your logistics network. Test your shipment data through CargoGate's free, secure engine right now and experience frictionless compliance.
            </p>
          </div>
        </section>
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
