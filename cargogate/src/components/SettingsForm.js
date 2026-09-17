'use client'

import { useActionState } from 'react'
import { updateProfile } from '@/app/auth-actions'

export default function SettingsForm({ initialProfile }) {
  const [state, formAction, pending] = useActionState(async (prevState, formData) => {
    return await updateProfile(formData)
  }, null)

  return (
    <form action={formAction}>
      <div className="input-group">
        <label className="input-label" htmlFor="role">Role</label>
        <input 
          id="role"
          name="role"
          type="text" 
          className="input-field" 
          defaultValue={initialProfile?.role || ''} 
          placeholder="e.g. Freight Forwarder, Exporter"
        />
      </div>

      <div className="input-group">
        <label className="input-label" htmlFor="company_name">Company Name</label>
        <input 
          id="company_name" 
          name="company_name" 
          type="text" 
          className="input-field" 
          defaultValue={initialProfile?.company_name || ''}
          placeholder="Global Freight Ltd." 
          required 
        />
      </div>

      {state?.error && (
        <div className="status-badge status-invalid" style={{ marginTop: '0', marginBottom: '1.5rem', padding: '0.75rem' }}>
          <div className="status-badge-header" style={{ marginBottom: '0' }}>
            <div className="status-icon">⚠</div>
            <div className="status-label">Update Failed</div>
          </div>
          <div className="status-message" style={{ fontSize: '13px', marginTop: '4px' }}>{state.error}</div>
        </div>
      )}

      <button type="submit" className="btn btn-primary btn-full" disabled={pending}>
        {pending ? 'Saving Changes...' : 'Save Changes'}
      </button>
    </form>
  )
}
