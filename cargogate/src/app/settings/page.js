import { createClient } from '@/utils/supabase/server'
import Link from 'next/link'
import SettingsForm from '@/components/SettingsForm'

export default async function SettingsPage() {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()
  
  let profile = null
  if (user) {
    const { data } = await supabase
      .from('profiles')
      .select('company_name, role')
      .eq('id', user.id)
      .single()
    profile = data
  }

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
          <h2>Profile Settings</h2>
          <p>Manage your account details</p>
        </div>

        <SettingsForm initialProfile={profile} />

        <div className="auth-footer" style={{ marginTop: '1.5rem' }}>
          <Link href="/">← Back to Dashboard</Link>
        </div>
      </div>
    </main>
  )
}
