"use client";

import { useState } from 'react';

export default function ApiRequestModal({ isOpen, onClose }) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setError('');
    
    const formData = new FormData(e.target);
    const dataObj = Object.fromEntries(formData.entries());

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(dataObj)
      });
      
      const data = await response.json();
      if (data.success) {
        setSuccess(true);
      } else {
        setError(data.message || "Failed to submit request.");
      }
    } catch (err) {
      setError("Something went wrong. Please try again or email us directly.");
    }
    
    setIsSubmitting(false);
  };

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Request API Access</h2>
          <button className="modal-close" onClick={onClose}>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
          </button>
        </div>

        {success ? (
          <div className="modal-success">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#10b981" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
            <h3>Request Received!</h3>
            <p>Our team will review your application and send API keys to your email shortly.</p>
            <button className="btn btn-primary" onClick={onClose} style={{ marginTop: '16px' }}>Close Window</button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="modal-form">
            <p className="modal-subtitle">Connect your ERP/WMS to our automated compliance engine. API plans start at $199/month.</p>
            
            {error && <div className="modal-error">{error}</div>}

            <div className="form-group">
              <label htmlFor="name">Full Name</label>
              <input type="text" id="name" name="name" required placeholder="Jane Doe" className="form-input" />
            </div>

            <div className="form-group">
              <label htmlFor="email">Work Email</label>
              <input type="email" id="email" name="email" required placeholder="jane@logistics.com" className="form-input" />
            </div>

            <div className="form-group">
              <label htmlFor="company">Company Name</label>
              <input type="text" id="company" name="company" required placeholder="Global Freight Forwarding Inc." className="form-input" />
            </div>

            <div className="form-group">
              <label htmlFor="volume">Expected Monthly Validation Volume</label>
              <select id="volume" name="volume" className="form-input" required>
                <option value="">Select expected volume...</option>
                <option value="Less than 10,000">Less than 10,000 / month</option>
                <option value="10,000 - 50,000">10,000 - 50,000 / month (Standard)</option>
                <option value="50,000 - 250,000">50,000 - 250,000 / month</option>
                <option value="250,000+">250,000+ / month (Custom)</option>
              </select>
            </div>

            <div className="form-group">
              <label htmlFor="use_case">How do you plan to use the API? (Optional)</label>
              <textarea id="use_case" name="use_case" rows="3" placeholder="e.g. Integrating directly into our proprietary WMS for real-time ENS screening." className="form-input"></textarea>
            </div>

            <div className="modal-footer">
              <button type="button" className="btn" onClick={onClose} style={{ border: '1px solid var(--border)', background: 'transparent' }}>Cancel</button>
              <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
                {isSubmitting ? 'Sending Request...' : 'Submit Request'}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
