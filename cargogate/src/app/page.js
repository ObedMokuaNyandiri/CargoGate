import EoriValidator from '@/components/EoriValidator';
import HsCodeValidator from '@/components/HsCodeValidator';
import { logout } from '@/app/auth-actions';
import { createClient } from '@/utils/supabase/server';
import Link from 'next/link';

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  let profile = null;
  let credits = 0;
  let recentActivity = [];
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('company_name, role')
      .eq('id', user.id)
      .single();
    profile = data;

    const { data: creditAccount } = await supabase
      .from('credit_accounts')
      .select('id, balance')
      .eq('user_id', user.id)
      .single();
    if (creditAccount) {
      credits = creditAccount.balance;
    }

    if (creditAccount) {
      const { data: txs } = await supabase
        .from('credit_transactions')
        .select('created_at, type, reason, amount')
        .eq('credit_account_id', creditAccount.id)
        .order('created_at', { ascending: false })
        .limit(5);
      
      if (txs) recentActivity = txs;
    }
  }

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
          {profile && (
            <div className="nav-profile">
              <span className="nav-company">{profile.company_name}</span>
              <span className="nav-role">Badge: {profile.role}</span>
            </div>
          )}
          {user ? (
            <>
              <div className="nav-credits">
                <span className="credits-badge" style={{ background: 'var(--bg-card)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.85rem', border: '1px solid var(--border)', marginRight: '10px' }}>
                  Credits: <strong>{credits}</strong>
                </span>
              </div>
              <Link href="/settings" className="nav-btn">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"></path></svg>
                Settings
              </Link>
              <form action={logout}>
                <button type="submit" className="nav-btn">
                  Log Out
                </button>
              </form>
            </>
          ) : (
            <>
              <Link href="/login" className="nav-btn">Log In</Link>
              <Link href="/signup" className="nav-btn" style={{ background: 'var(--accent-primary)', color: 'white', border: 'none' }}>Sign Up</Link>
            </>
          )}
        </div>
      </nav>

      <main className="dashboard">
        <header className="hero">
          <div className="hero-content">
            <h1>
              <span className="title-cargo">CargoGate</span>{' '}
              <span className="title-compliance">Compliance</span>
            </h1>
            <p className="hero-subtitle">
              Instant pre-booking compliance firewall. Validate EORI numbers, HS Codes, 
              and goods descriptions against EU ICS2 regulations in real-time.
            </p>
            <div className="hero-badges">
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

        <div className="dashboard-grid">
          <EoriValidator user={!!user} />
          <HsCodeValidator user={!!user} />
        </div>

        {user && recentActivity.length > 0 && (
          <div className="recent-activity" style={{ marginTop: '3rem', maxWidth: '800px', margin: '3rem auto 0 auto', background: 'var(--bg-card)', borderRadius: '12px', padding: '2rem', border: '1px solid var(--border)', boxShadow: 'var(--shadow-sm)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Recent Activity</h2>
              <Link href="/history" style={{ fontSize: '0.875rem', color: 'var(--accent-primary)', textDecoration: 'none', fontWeight: 500 }}>
                View Full History &rarr;
              </Link>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {recentActivity.map((tx, idx) => (
                <div key={idx} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', paddingBottom: '1rem', borderBottom: idx !== recentActivity.length - 1 ? '1px solid var(--border)' : 'none' }}>
                  <div>
                    <div style={{ fontWeight: 500, color: 'var(--text-primary)' }}>
                      {tx.type === 'VALIDATION' ? 'Validation' : tx.type === 'PURCHASE' ? 'Credit Purchase' : 'Signup Bonus'}
                    </div>
                    <div style={{ fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                      {new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} · {tx.reason}
                    </div>
                  </div>
                  <div style={{ fontWeight: 600, color: tx.amount > 0 ? '#059669' : '#dc2626' }}>
                    {tx.amount > 0 ? '+' : ''}{tx.amount}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      <footer className="site-footer">
        <p style={{ marginBottom: '8px' }}>© {new Date().getFullYear()} CargoGate · Enterprise EU ICS2 Compliance Platform</p>
        <div style={{ display: 'flex', justifyContent: 'center', gap: '16px' }}>
          <Link href="/privacy" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Privacy Policy</Link>
          <Link href="/terms" style={{ color: 'var(--text-muted)', textDecoration: 'none' }}>Terms of Service</Link>
        </div>
      </footer>
    </>
  );
}
