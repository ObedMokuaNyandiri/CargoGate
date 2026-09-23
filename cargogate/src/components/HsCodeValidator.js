'use client';

import { useState, useCallback, useRef, useEffect } from 'react';
import StatusBadge from './StatusBadge';

export default function HsCodeValidator() {
  const [hsCode, setHsCode] = useState('');
  const [description, setDescription] = useState('');
  const [hsResult, setHsResult] = useState(null);
  const [descResult, setDescResult] = useState(null);
  const [loading, setLoading] = useState(false);
  const [descLoading, setDescLoading] = useState(false);
  const [error, setError] = useState(null);
  const debounceRef = useRef(null);

  // Format HS code with dots: XXXX.XX
  const formatInput = (raw) => {
    const digits = raw.replace(/[^\d]/g, '').slice(0, 6);
    if (digits.length > 4) {
      return `${digits.slice(0, 4)}.${digits.slice(4)}`;
    }
    return digits;
  };

  const handleHsChange = (e) => {
    setHsCode(formatInput(e.target.value));
  };

  // Debounced description scanning
  const scanDescriptionDebounced = useCallback((text) => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    if (!text.trim()) {
      setDescResult(null);
      return;
    }

    debounceRef.current = setTimeout(async () => {
      setDescLoading(true);
      try {
        const res = await fetch('/api/description/scan', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ description: text }),
        });
        const data = await res.json();
        if (res.ok) {
          setDescResult(data);
        }
      } catch {
        // Silently fail on debounced scans
      } finally {
        setDescLoading(false);
      }
    }, 300);
  }, []);

  const handleDescriptionChange = (e) => {
    const val = e.target.value;
    setDescription(val);
    scanDescriptionDebounced(val);
  };

  // Cleanup debounce on unmount
  useEffect(() => {
    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, []);

  const handleVerify = async () => {
    setLoading(true);
    setHsResult(null);
    setError(null);

    // Call individual endpoints manually if we don't have the old `/api/compliance/validate` route
    // Wait, the previous implementation called `/api/compliance/validate`!
    // Let me check if I should replace it with direct calls to /api/hs/validate and /api/description/scan
    // Actually, earlier the user had /api/hs/validate.
    // Let's call /api/hs/validate for HS code, and description scan is already handled by debouncing.
    // So if hsCode is provided, we call /api/hs/validate
    try {
      if (hsCode.trim()) {
        const hsRes = await fetch('/api/hs/validate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ hsCode: hsCode.trim() }),
        });
        const hsData = await hsRes.json();
        if (!hsRes.ok) {
          setError(hsData.error || 'Validation failed.');
        } else {
          setHsResult(hsData);
        }
      }
    } catch {
      setError('Network error. Please check your connection.');
    } finally {
      setLoading(false);
    }
  };

  const getHsStatus = () => {
    if (!hsResult) return null;
    return hsResult.isDeprecated ? 'deprecated' : 'compliant';
  };

  const getHsDetails = () => {
    if (!hsResult) return null;
    const details = {};
    if (hsResult.hs2022Codes?.length > 0) {
      details['HS 2022 Code(s)'] = hsResult.hs2022Codes.join(', ');
    }
    return Object.keys(details).length > 0 ? details : null;
  };

  // Highlight flagged terms in the description
  const renderHighlightedDescription = () => {
    if (!descResult?.flaggedTerms?.length || !description) return null;

    let highlighted = description;
    const terms = descResult.flaggedTerms.map(f => f.term);

    // Sort by length descending to replace longer terms first
    terms.sort((a, b) => b.length - a.length);

    const parts = [];
    let remaining = description;
    let idx = 0;

    // Simple approach: split by flagged terms
    for (const term of terms) {
      const regex = new RegExp(`(${term.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')})`, 'gi');
      remaining = remaining.replace(regex, `⟪FLAG⟫$1⟪/FLAG⟫`);
    }

    const segments = remaining.split(/⟪FLAG⟫|⟪\/FLAG⟫/);
    return segments.map((seg, i) => {
      const isFlagged = terms.some(t => t.toLowerCase() === seg.toLowerCase());
      return isFlagged ? (
        <mark key={i} className="flagged-term">{seg}</mark>
      ) : (
        <span key={i}>{seg}</span>
      );
    });
  };

  return (
    <section className="card" id="product-section">
      <div className="card-header">
        <div className="card-icon">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <path d="M21 16V8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16z" />
            <polyline points="3.27 6.96 12 12.01 20.73 6.96" />
            <line x1="12" y1="22.08" x2="12" y2="12" />
          </svg>
        </div>
        <div>
          <h2>Product Categorization</h2>
          <p className="card-subtitle">Validate HS Codes & Goods Descriptions for ICS2 compliance</p>
        </div>
      </div>

      <div className="input-group">
        <label htmlFor="hs-input" className="input-label">
          HS Code (6-digit)
        </label>
        <div className="input-wrapper">
          <div className="input-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
              <line x1="9" y1="9" x2="15" y2="15"></line>
              <line x1="15" y1="9" x2="9" y2="15"></line>
            </svg>
          </div>
          <input
            id="hs-input"
            type="text"
            className="input-field input-with-icon"
            placeholder="e.g., 8525.80"
            value={hsCode}
            onChange={handleHsChange}
            maxLength={7}
            spellCheck={false}
            autoComplete="off"
          />
        </div>
        <span className="input-hint">Harmonized System code — auto-formatted</span>
      </div>

      <div className="input-group">
        <label htmlFor="desc-input" className="input-label">
          Goods Description
          {descLoading && <span className="scanning-indicator"> scanning…</span>}
        </label>
        <div className="textarea-wrapper">
          <div className="input-icon" style={{ top: '0.875rem' }}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <line x1="21" y1="10" x2="3" y2="10"></line>
              <line x1="21" y1="6" x2="3" y2="6"></line>
              <line x1="21" y1="14" x2="3" y2="14"></line>
              <line x1="21" y1="18" x2="3" y2="18"></line>
            </svg>
          </div>
          <textarea
            id="desc-input"
            className="input-field textarea input-with-icon"
            placeholder="e.g., 48-port network switch, Cisco Catalyst 9300, 4 units"
            value={description}
            onChange={handleDescriptionChange}
            rows={3}
            maxLength={2000}
            spellCheck={true}
          />
          {descResult && !descResult.valid && description && (
            <div className="textarea-overlay input-with-icon" aria-hidden="true">
              {renderHighlightedDescription()}
            </div>
          )}
        </div>
        <span className="input-hint">Be specific — avoid generic terms like "electronics" or "parts"</span>
      </div>

      <button
        className="btn btn-primary btn-full"
        onClick={handleVerify}
        disabled={loading || !hsCode.trim()}
        id="compliance-verify-btn"
      >
        {loading ? 'Verifying Compliance…' : 'Verify Compliance'}
      </button>

      {error && <StatusBadge status="error" message={error} />}

      {hsResult && (
        <StatusBadge
          status={getHsStatus()}
          message={hsResult.message}
          details={getHsDetails()}
          loading={loading}
        />
      )}

      {descResult && (
        <div className="desc-results">
          <StatusBadge
            status={descResult.valid ? 'compliant' : 'invalid'}
            message={descResult.message}
          />
          {descResult.flaggedTerms?.length > 0 && (
            <div className="flagged-list">
              <h4>Flagged Terms</h4>
              {descResult.flaggedTerms.map((f, i) => (
                <div key={i} className="flagged-item">
                  <span className="flagged-term-label">"{f.term}"</span>
                  <span className="flagged-arrow">→</span>
                  <span className="flagged-suggestion">{f.suggestion}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </section>
  );
}
