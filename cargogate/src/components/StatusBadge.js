'use client';

import { useState } from 'react';

export default function StatusBadge({ status, message, details, loading }) {
  if (loading) {
    return (
      <div className="status-badge status-loading">
        <div className="status-spinner" />
        <span>Validating…</span>
      </div>
    );
  }

  if (!status) return null;

  const statusClass = {
    valid: 'status-valid',
    invalid: 'status-invalid',
    compliant: 'status-valid',
    deprecated: 'status-warning',
    unknown: 'status-info',
    error: 'status-invalid',
  }[status] || 'status-info';

  const iconMap = {
    valid: '✓',
    invalid: '✗',
    compliant: '✓',
    deprecated: '⚠',
    unknown: 'ℹ',
    error: '✗',
  };

  return (
    <div className={`status-badge ${statusClass}`} role="status" aria-live="polite">
      <div className="status-badge-header">
        <span className="status-icon">{iconMap[status] || 'ℹ'}</span>
        <span className="status-label">{status.toUpperCase()}</span>
      </div>
      {message && <p className="status-message">{message}</p>}
      {details && (
        <div className="status-details">
          {Object.entries(details).map(([key, value]) =>
            value ? (
              <div key={key} className="status-detail-row">
                <span className="detail-key">{key}:</span>
                <span className="detail-value">{value}</span>
              </div>
            ) : null
          )}
        </div>
      )}
    </div>
  );
}
