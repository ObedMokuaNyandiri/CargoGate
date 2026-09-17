'use client';

import { useState, useEffect } from 'react';

export default function DataSourcePanel() {
  const [expanded, setExpanded] = useState(false);
  const [info, setInfo] = useState(null);
  const [loading, setLoading] = useState(false);

  const loadInfo = async () => {
    if (info) return; // Already loaded
    setLoading(true);
    try {
      // Trigger a lightweight scan to force CSV loading, then fetch info
      const res = await fetch('/api/description/scan', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ description: 'test' }),
      });
      if (res.ok) {
        // The csvLoader is now initialized; read info from a dedicated endpoint
        // For MVP, we embed known static info + dynamic load timestamp
        const data = await res.json();
        setInfo({
          loadTimestamp: new Date().toISOString(),
          eoriEndpoint: 'https://ec.europa.eu/taxation_customs/dds2/eos/validation/services/validation',
          eoriWsdl: 'https://ec.europa.eu/taxation_customs/dds2/eos/validation/services/validation?wsdl',
          hsSource: 'WCO 2017 2022 Correlation.csv',
          vagueSource: 'acceptable_unacceptable_goods_annex.csv',
        });
      }
    } catch {
      // Ignore — panel is informational
    } finally {
      setLoading(false);
    }
  };

  const handleToggle = () => {
    const next = !expanded;
    setExpanded(next);
    if (next) loadInfo();
  };

  return (
    <section className="card card-data-source" id="datasource-section">
      <button
        className="card-header card-header-toggle"
        onClick={handleToggle}
        aria-expanded={expanded}
        aria-controls="datasource-content"
      >
        <div className="card-icon card-icon-sm">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
            <ellipse cx="12" cy="5" rx="9" ry="3" />
            <path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3" />
            <path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5" />
          </svg>
        </div>
        <div>
          <h2>Data Source Management</h2>
          <p className="card-subtitle">Integration endpoints & CSV data source details</p>
        </div>
        <span className={`chevron ${expanded ? 'chevron-up' : ''}`}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </span>
      </button>

      {expanded && (
        <div className="datasource-content" id="datasource-content">
          {loading && <p className="ds-loading">Loading data source information…</p>}

          {info && (
            <div className="ds-grid">
              <div className="ds-card">
                <div className="ds-card-header">
                  <span className="ds-dot ds-dot-live" />
                  <h4>EU EOS SOAP API</h4>
                </div>
                <div className="ds-entry">
                  <span className="ds-key">Endpoint</span>
                  <a
                    href={info.eoriEndpoint}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ds-link"
                  >
                    {info.eoriEndpoint}
                  </a>
                </div>
                <div className="ds-entry">
                  <span className="ds-key">WSDL</span>
                  <a
                    href={info.eoriWsdl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="ds-link"
                  >
                    {info.eoriWsdl}
                  </a>
                </div>
                <div className="ds-entry">
                  <span className="ds-key">Protocol</span>
                  <span className="ds-value">SOAP 1.1 / Document-Literal</span>
                </div>
                <div className="ds-entry">
                  <span className="ds-key">Rate Limit</span>
                  <span className="ds-value">10 requests / minute (server-enforced)</span>
                </div>
              </div>

              <div className="ds-card">
                <div className="ds-card-header">
                  <span className="ds-dot ds-dot-csv" />
                  <h4>HS Code Correlation Index</h4>
                </div>
                <div className="ds-entry">
                  <span className="ds-key">Source File</span>
                  <span className="ds-value">{info.hsSource}</span>
                </div>
                <div className="ds-entry">
                  <span className="ds-key">Coverage</span>
                  <span className="ds-value">WCO HS 2017 → HS 2022 transitions</span>
                </div>
                <div className="ds-entry">
                  <span className="ds-key">Storage</span>
                  <span className="ds-value">In-memory Map (loaded at cold start)</span>
                </div>
              </div>

              <div className="ds-card">
                <div className="ds-card-header">
                  <span className="ds-dot ds-dot-csv" />
                  <h4>ICS2 Vague Terms Blacklist</h4>
                </div>
                <div className="ds-entry">
                  <span className="ds-key">Source File</span>
                  <span className="ds-value">{info.vagueSource}</span>
                </div>
                <div className="ds-entry">
                  <span className="ds-key">Coverage</span>
                  <span className="ds-value">EU ICS2 Annex: Acceptable / Unacceptable Goods Descriptions</span>
                </div>
                <div className="ds-entry">
                  <span className="ds-key">Matching</span>
                  <span className="ds-value">Word-boundary regex, case-insensitive</span>
                </div>
              </div>

              <div className="ds-meta">
                <span>Indices loaded: {info.loadTimestamp}</span>
              </div>
            </div>
          )}
        </div>
      )}
    </section>
  );
}
