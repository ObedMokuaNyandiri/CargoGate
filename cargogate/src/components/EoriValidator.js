'use client';

import { useState } from 'react';
import StatusBadge from './StatusBadge';

export default function EoriValidator({ user }) {
  const [eori, setEori] = useState('');
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [paymentRequired, setPaymentRequired] = useState(false);

  const handleValidate = async () => {
    const trimmed = eori.trim().toUpperCase();
    if (!trimmed) return;

    setLoading(true);
    setResult(null);
    setError(null);
    setPaymentRequired(false);

    try {
      const res = await fetch('/api/eori/validate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ eori: trimmed }),
      });

      const data = await res.json();

      if (res.status === 402 || data.error === 'PAYMENT_REQUIRED') {
        setPaymentRequired(true);
        return;
      }

      if (!res.ok) {
        setError(data.error || data.message || 'Validation failed.');
        return;
      }

      setResult(data);
    } catch (err) {
      setError('Network error. Please check your connection and try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter') handleValidate();
  };

  const getStatus = () => {
    if (!result) return null;
    return result.valid ? 'valid' : 'invalid';
  };

  const getDetails = () => {
    if (!result || !result.valid) return null;
    const details = {};
    if (result.entityName) details['Entity'] = result.entityName;
    if (result.street) details['Street'] = result.street;
    if (result.postalCode && result.city) {
      details['Location'] = `${result.postalCode} ${result.city}`;
    } else if (result.city) {
      details['City'] = result.city;
    }
    if (result.country) details['Country'] = result.country;
    if (result.requestDate) details['Verified'] = result.requestDate;
    return Object.keys(details).length > 0 ? details : null;
  };

  return (
    <section className="card" id="eori-section">
      <div className="card-header">
        <div className="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2" />
            <circle cx="9" cy="7" r="4" />
            <path d="M22 21v-2a4 4 0 0 0-3-3.87" />
            <path d="M16 3.13a4 4 0 0 1 0 7.75" />
          </svg>
        </div>
        <div>
          <h2>Consignee Verification</h2>
          <p className="card-subtitle">Validate EORI numbers against the EU EOS Database</p>
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="eori-input" className="input-label">
          EORI Number
        </label>
        <div className="input-wrapper">
          <div className="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
              <line x1="16" y1="2" x2="16" y2="6"></line>
              <line x1="8" y1="2" x2="8" y2="6"></line>
              <line x1="3" y1="10" x2="21" y2="10"></line>
            </svg>
          </div>
          <input
            id="eori-input"
            type="text"
            className="input-field input-with-icon"
            placeholder="e.g., DE123456789012345"
            value={eori}
            onChange={(e) => setEori(e.target.value.toUpperCase())}
            onKeyDown={handleKeyDown}
            maxLength={17}
            spellCheck={false}
            autoComplete="off"
            disabled={!user}
          />
        </div>
        <span className="input-hint">Format: 2-letter country code + up to 15 alphanumeric characters</span>
      </div>

      {user ? (
        <button
          className="btn btn-primary btn-full"
          onClick={handleValidate}
          disabled={loading || !eori.trim()}
          id="eori-validate-btn"
        >
          {loading ? 'Verifying…' : 'Verify EORI'}
        </button>
      ) : (
        <a href="/login" className="btn btn-primary btn-full" style={{ textAlign: 'center' }}>
          Sign In to Verify
        </a>
      )}

      {paymentRequired && (
        <div style={{ marginTop: '1.5rem', background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', border: '1px solid #fca5a5' }}>
          <h4 style={{ margin: '0 0 0.5rem 0', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>
            0 Credits Remaining
          </h4>
          <p style={{ margin: '0 0 1rem 0', fontSize: '0.9rem' }}>You have 0 credits. Purchase credits to continue validating shipments.</p>
          <a href="/billing" className="btn btn-primary" style={{ display: 'block', textAlign: 'center', width: '100%', background: '#dc2626', color: 'white', textDecoration: 'none' }}>
            Buy Credits
          </a>
        </div>
      )}

      {error && (
        <div style={{ marginTop: '1.5rem' }}>
          <StatusBadge status="error" message={error} />
        </div>
      )}

      <StatusBadge
        status={getStatus()}
        message={result?.message}
        details={getDetails()}
        loading={loading}
      />
    </section>
  );
}
