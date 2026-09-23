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
                <h1>
                  <span className="title-cargo">CargoGate</span>{' '}
                  <span className="title-compliance">Compliance</span>
                </h1>
                <p className="hero-subtitle" style={{ margin: '0 0 var(--space-lg) 0', maxWidth: '100%' }}>
                  Instant pre-booking compliance firewall. Validate EORI numbers, HS Codes, 
                  and goods descriptions against EU ICS2 regulations in real-time. Completely free.
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

            <div className="api-upsell-card" style={{ marginTop: 'var(--space-xl)' }}>
              <h3 style={{ margin: '0 0 12px 0', fontSize: '1.1rem', color: 'var(--text-primary)', display: 'flex', alignItems: 'center', gap: '8px' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="var(--accent-primary)" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="16 18 22 12 16 6"></polyline><polyline points="8 6 2 12 8 18"></polyline></svg>
                API Integration
              </h3>
              <p style={{ margin: '0 0 16px 0', fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: '1.6' }}>
                Automate your compliance pipeline. Connect our stateless NLP validation engine directly to your ERP or Warehouse Management System.
              </p>
              <div style={{ background: 'var(--bg-secondary)', padding: '12px', borderRadius: '6px', border: '1px solid var(--border-subtle)', marginBottom: '16px' }}>
                <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em', fontWeight: '600', marginBottom: '4px' }}>Enterprise Tier</div>
                <div style={{ color: 'var(--text-primary)', fontWeight: '700', fontSize: '1.1rem' }}>$199 <span style={{ fontSize: '0.85rem', fontWeight: '500', color: 'var(--text-secondary)' }}>/ month</span></div>
                <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '2px' }}>Includes 50,000 requests</div>
              </div>
              <ApiRequestButton className="btn btn-primary btn-full" style={{ padding: '0.75rem' }}>Request API Key</ApiRequestButton>
            </div>
          </div>

          <aside className="dashboard-sidebar">
            <div className="validation-console">
              <div className="console-header">
                <div className="console-header-dots">
                  <span className="console-dot red"></span>
                  <span className="console-dot yellow"></span>
                  <span className="console-dot green"></span>
                </div>
                <div className="console-header-title">ICS2 Compliance Engine v2.0</div>
              </div>
              <div className="console-body" style={{ flexDirection: 'column', gap: 'var(--space-md)' }}>
                <EoriValidator />
                <HsCodeValidator />
              </div>
            </div>
          </aside>
        </div>

        <section className="seo-section">
          <h2>The Ultimate Free ICS2 Compliance Checker: Eliminate EU Border Delays Instantly</h2>
          <p>
            Shipping cargo into or through the European Union demands absolute regulatory precision. Under the EU's strict Import Control System 2 (ICS2) mandate, a single vague cargo description or an obsolete tariff code can trigger immediate customs rejections, unexpected holds, and catastrophic supply chain delays.
          </p>
          <p>
            CargoGate's Free ICS2 Compliance Checker is your automated first line of defense. Built specifically for modern logistics managers, freight forwarders, and customs brokers, our high-speed validation engine audits your shipping manifests against official EU Customs standards in milliseconds - with zero data risk.
          </p>

          <h3 style={{ marginTop: '2rem', marginBottom: '1rem', color: 'var(--text-primary)', fontSize: '1.25rem', fontWeight: '700' }}>Stop EU Customs Holds Before They Happen</h3>
          <p>
            EU customs authorities routinely flag and block shipments due to non-compliant Entry Summary Declarations (ENS). CargoGate eliminates manual verification errors by automating cargo description and tariff classification audits.
          </p>
          <ul style={{ paddingLeft: '1.5rem', marginBottom: '2rem', color: 'var(--text-secondary)' }}>
            <li style={{ marginBottom: '0.5rem' }}><strong>Prevent Costly Rejections:</strong> Catch non-compliant data before submitting your manifest to EU authorities.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Accelerate Clearance Speed:</strong> Keep your freight moving through European ports and airports without administrative bottlenecks.</li>
            <li style={{ marginBottom: '0.5rem' }}><strong>Protect Sensitive Trade Data:</strong> Audit your goods descriptions using an enterprise-grade engine designed around total privacy.</li>
          </ul>

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
