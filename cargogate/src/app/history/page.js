import { createClient } from '@/utils/supabase/server';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { logout } from '@/app/auth-actions';

export default async function HistoryPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  
  if (!user) {
    redirect('/login');
  }

  // Get Profile
  const { data: profile } = await supabase
    .from('profiles')
    .select('company_name, role')
    .eq('id', user.id)
    .single();

  // Get Credit Account
  const { data: creditAccount } = await supabase
    .from('credit_accounts')
    .select('id, balance')
    .eq('user_id', user.id)
    .single();

  let transactions = [];
  let pastValidations = [];

  if (creditAccount) {
    // Get full ledger
    const { data: txs } = await supabase
      .from('credit_transactions')
      .select('*')
      .eq('credit_account_id', creditAccount.id)
      .order('created_at', { ascending: false });
    if (txs) transactions = txs;
  }

  // Get past validations
  const { data: sessions } = await supabase
    .from('validation_sessions')
    .select(`
      id,
      type,
      status,
      created_at,
      validation_checks (
        check_type,
        input_value,
        result
      )
    `)
    .eq('user_id', user.id)
    .eq('status', 'COMPLETED')
    .order('created_at', { ascending: false })
    .limit(50);
  
  if (sessions) {
    pastValidations = sessions;
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg-default)', color: 'var(--text-primary)', fontFamily: 'var(--font-sans)' }}>
      {/* Navbar (Same as dashboard) */}
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
          <div className="nav-credits">
            <span className="credits-badge" style={{ background: 'var(--bg-card)', padding: '4px 10px', borderRadius: '16px', fontSize: '0.85rem', border: '1px solid var(--border)', marginRight: '10px' }}>
              Credits: <strong>{creditAccount?.balance || 0}</strong>
            </span>
          </div>
          <Link href="/billing" className="nav-btn" style={{ background: 'var(--accent-primary)', color: 'white', border: 'none' }}>
            Buy Credits
          </Link>
          <Link href="/" className="nav-btn">Dashboard</Link>
          <form action={logout}>
            <button type="submit" className="nav-btn">Log Out</button>
          </form>
        </div>
      </nav>

      <main style={{ maxWidth: '1000px', margin: '3rem auto', padding: '0 2rem' }}>
        <h1 style={{ fontSize: '2rem', fontWeight: 700, marginBottom: '2rem' }}>Account History</h1>
        
        <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: '3rem' }}>
          
          {/* Complete Ledger */}
          <section>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 600 }}>Credit Ledger</h2>
            </div>
            <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={{ padding: '1rem', fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Date</th>
                    <th style={{ padding: '1rem', fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Activity</th>
                    <th style={{ padding: '1rem', fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Reference</th>
                    <th style={{ padding: '1rem', fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-muted)', textAlign: 'right' }}>Credits</th>
                  </tr>
                </thead>
                <tbody>
                  {transactions.map((tx, idx) => (
                    <tr key={tx.id} style={{ borderBottom: idx !== transactions.length - 1 ? '1px solid var(--border)' : 'none' }}>
                      <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(tx.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 500 }}>
                        {tx.type === 'PURCHASE' && 'Credit Purchase'}
                        {tx.type === 'VALIDATION' && 'Validation Scan'}
                        {tx.type === 'BONUS' && 'Signup Bonus'}
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)', fontWeight: 400, marginTop: '2px' }}>{tx.reason}</div>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '0.875rem', color: 'var(--text-muted)' }}>
                        <code style={{ fontSize: '0.75rem', background: 'var(--bg-subtle)', padding: '2px 6px', borderRadius: '4px' }}>
                          {tx.reference?.length > 15 ? tx.reference.substring(0, 8) + '...' : tx.reference}
                        </code>
                      </td>
                      <td style={{ padding: '1rem', fontSize: '1rem', fontWeight: 600, textAlign: 'right', color: tx.amount > 0 ? '#059669' : '#dc2626' }}>
                        {tx.amount > 0 ? '+' : ''}{tx.amount}
                      </td>
                    </tr>
                  ))}
                  {transactions.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No transactions found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

          {/* Past Validations */}
          <section>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: '1rem' }}>Past Validations (Last 50)</h2>
            <div style={{ background: 'var(--bg-card)', borderRadius: '12px', border: '1px solid var(--border)', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left' }}>
                <thead style={{ background: 'var(--bg-subtle)', borderBottom: '1px solid var(--border)' }}>
                  <tr>
                    <th style={{ padding: '1rem', fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Date</th>
                    <th style={{ padding: '1rem', fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Type</th>
                    <th style={{ padding: '1rem', fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Input Scanned</th>
                    <th style={{ padding: '1rem', fontWeight: 500, fontSize: '0.875rem', color: 'var(--text-muted)' }}>Overall Result</th>
                  </tr>
                </thead>
                <tbody>
                  {pastValidations.map((session, idx) => {
                    const hasInvalid = session.validation_checks.some(c => c.result === 'INVALID');
                    return (
                      <tr key={session.id} style={{ borderBottom: idx !== pastValidations.length - 1 ? '1px solid var(--border)' : 'none' }}>
                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>{new Date(session.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}</td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem', fontWeight: 500 }}>{session.type}</td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {session.validation_checks.map((check, cIdx) => (
                              <span key={cIdx}>
                                <strong style={{ color: 'var(--text-muted)' }}>{check.check_type === 'HS_CODE' ? 'HS' : check.check_type === 'DESCRIPTION' ? 'Desc' : 'EORI'}:</strong> {check.input_value}
                              </span>
                            ))}
                          </div>
                        </td>
                        <td style={{ padding: '1rem', fontSize: '0.875rem' }}>
                           <span style={{ 
                             display: 'inline-block', 
                             padding: '4px 8px', 
                             borderRadius: '4px', 
                             fontSize: '0.75rem', 
                             fontWeight: 600,
                             background: hasInvalid ? '#fee2e2' : '#dcfce7',
                             color: hasInvalid ? '#991b1b' : '#166534'
                           }}>
                             {hasInvalid ? 'ATTENTION REQUIRED' : 'PASSED'}
                           </span>
                        </td>
                      </tr>
                    );
                  })}
                  {pastValidations.length === 0 && (
                    <tr>
                      <td colSpan="4" style={{ padding: '2rem', textAlign: 'center', color: 'var(--text-muted)' }}>No past validations found.</td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </section>

        </div>
      </main>
      
      <footer className="site-footer" style={{ marginTop: '4rem' }}>
        <p style={{ marginBottom: '8px' }}>© {new Date().getFullYear()} CargoGate · Enterprise EU ICS2 Compliance Platform</p>
      </footer>
    </div>
  );
}
