'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false);
  const [showModal, setShowModal] = useState(false);
  
  // Consent toggles
  const [analytics, setAnalytics] = useState(false);
  const [marketing, setMarketing] = useState(false);

  useEffect(() => {
    // Check if consent has already been given
    const consent = localStorage.getItem('cargogate_cookie_consent');
    if (!consent) {
      setShowBanner(true);
    } else {
      try {
        const parsed = JSON.parse(consent);
        setAnalytics(parsed.analytics);
        setMarketing(parsed.marketing);
        // Here you would initialize your actual analytics/marketing scripts if true
      } catch (e) {
        setShowBanner(true);
      }
    }
  }, []);

  const savePreferences = (prefs) => {
    localStorage.setItem('cargogate_cookie_consent', JSON.stringify(prefs));
    setShowBanner(false);
    setShowModal(false);
    
    // In a real application, this is where you would programmatically load
    // Google Analytics or Meta pixels based on prefs.analytics and prefs.marketing
  };

  const handleAcceptAll = () => {
    const prefs = { essential: true, analytics: true, marketing: true };
    setAnalytics(true);
    setMarketing(true);
    savePreferences(prefs);
  };

  const handleRejectAll = () => {
    const prefs = { essential: true, analytics: false, marketing: false };
    setAnalytics(false);
    setMarketing(false);
    savePreferences(prefs);
  };

  const handleSaveCustom = () => {
    savePreferences({ essential: true, analytics, marketing });
  };

  if (!showBanner && !showModal) return null;

  return (
    <>
      {showBanner && !showModal && (
        <div className="cookie-banner">
          <div className="cookie-banner-content">
            <div className="cookie-text">
              <h3>We respect your privacy</h3>
              <p>
                We use cookies to enhance your browsing experience, serve personalized content, and analyze our traffic. 
                By clicking "Accept All", you consent to our use of cookies. Read our{' '}
                <Link href="/privacy" className="cookie-link">Privacy Policy</Link> and{' '}
                <Link href="/terms" className="cookie-link">Terms of Service</Link>.
              </p>
            </div>
            <div className="cookie-actions">
              <button className="btn btn-secondary" onClick={() => setShowModal(true)}>Customize</button>
              <button className="btn btn-secondary" onClick={handleRejectAll}>Reject All</button>
              <button className="btn btn-primary" onClick={handleAcceptAll}>Accept All</button>
            </div>
          </div>
        </div>
      )}

      {showModal && (
        <div className="cookie-modal-overlay">
          <div className="cookie-modal card">
            <div className="cookie-modal-header">
              <h2>Cookie Preferences</h2>
              <button className="btn-close" aria-label="Close modal" onClick={() => {
                if (!localStorage.getItem('cargogate_cookie_consent')) setShowBanner(true);
                setShowModal(false);
              }}>
                <svg viewBox="0 0 24 24" width="24" height="24" stroke="currentColor" strokeWidth="2" fill="none"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>
            <div className="cookie-modal-body">
              <p className="cookie-modal-desc">
                We use cookies to help you navigate efficiently and perform certain functions. You will find detailed information about all cookies under each consent category below.
              </p>

              <div className="cookie-option">
                <div className="cookie-option-info">
                  <h4>Strictly Necessary</h4>
                  <p>Required for the website to function properly, including secure authentication and session management. Cannot be switched off.</p>
                </div>
                <div className="toggle-switch toggle-disabled">
                  <input type="checkbox" checked disabled readOnly />
                  <span className="slider"></span>
                </div>
              </div>

              <div className="cookie-option">
                <div className="cookie-option-info">
                  <h4>Analytics & Performance</h4>
                  <p>Allow us to analyze site usage and performance to improve your experience.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={analytics} onChange={(e) => setAnalytics(e.target.checked)} />
                  <span className="slider"></span>
                </label>
              </div>

              <div className="cookie-option">
                <div className="cookie-option-info">
                  <h4>Marketing & Tracking</h4>
                  <p>Used by our advertising partners to build a profile of your interests and show relevant adverts on other sites.</p>
                </div>
                <label className="toggle-switch">
                  <input type="checkbox" checked={marketing} onChange={(e) => setMarketing(e.target.checked)} />
                  <span className="slider"></span>
                </label>
              </div>
            </div>
            
            <div className="cookie-modal-footer">
              <button className="btn btn-secondary" onClick={handleRejectAll}>Reject All</button>
              <button className="btn btn-primary" onClick={handleSaveCustom}>Save Preferences</button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
