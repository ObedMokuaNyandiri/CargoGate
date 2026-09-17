import Link from 'next/link';

export const metadata = {
  title: 'Privacy Policy | CargoGate',
  description: 'CargoGate Privacy Policy and Data Handling procedures for GDPR compliance.',
};

export default function PrivacyPage() {
  return (
    <div className="legal-container">
      <div style={{ marginBottom: '2rem' }}>
        <a href="/" className="btn btn-secondary" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', padding: '6px 12px', fontSize: '12px' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="19" y1="12" x2="5" y2="12"></line><polyline points="12 19 5 12 12 5"></polyline></svg>
          Back to Dashboard
        </a>
      </div>
      <div className="legal-header">
        <div className="auth-logo" style={{ marginBottom: '1rem', display: 'inline-flex' }}>
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32" fill="none" width="48" height="48">
            <path d="M16 5L7 10v12l9 5 9-5V10L16 5z" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <path d="M7 10l9 5 9-5" stroke="currentColor" strokeWidth="1.5" fill="none"/>
            <line x1="16" y1="15" x2="16" y2="27" stroke="currentColor" strokeWidth="1.5"/>
            <circle cx="16" cy="15" r="1.5" fill="currentColor"/>
          </svg>
        </div>
        <h1>Privacy Policy</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="legal-content">
        <h2>1. Introduction</h2>
        <p>
          At CargoGate ("we", "our", or "us"), we are committed to protecting your personal data and 
          respecting your privacy. This Privacy Policy outlines how we collect, use, and safeguard 
          your information when you use our EU ICS2 compliance platform.
        </p>

        <h2>2. Data We Collect</h2>
        <p>We may collect and process the following data:</p>
        <ul>
          <li><strong>Account Data:</strong> Email addresses and company names used for authentication and account management.</li>
          <li><strong>Validation Data:</strong> EORI numbers, HS Codes, and goods descriptions submitted through our platform for validation against EU databases.</li>
          <li><strong>Technical Data:</strong> IP addresses, browser types, and cookie data used to ensure the security and performance of our services.</li>
        </ul>

        <h2>3. How We Use Your Data</h2>
        <p>We use the data we collect primarily to:</p>
        <ul>
          <li>Provide real-time compliance validation against EU regulations (ICS2).</li>
          <li>Maintain and secure your account.</li>
          <li>Improve our machine learning models for goods description analysis (using anonymized text snippets).</li>
          <li>Comply with our own legal and regulatory obligations.</li>
        </ul>

        <h2>4. Data Retention</h2>
        <p>
          We retain your account data for as long as your account is active. EORI and HS Code queries are 
          processed in real-time. We may store anonymized validation logs for diagnostic and audit purposes 
          for a maximum of 90 days, after which they are securely deleted.
        </p>

        <h2>5. Your Rights (GDPR & CCPA)</h2>
        <p>Under applicable data protection laws, you have the right to:</p>
        <ul>
          <li>Request access to the personal data we hold about you.</li>
          <li>Request the correction of inaccurate data.</li>
          <li>Request the erasure of your personal data ("Right to be Forgotten").</li>
          <li>Object to or restrict the processing of your data.</li>
          <li>Manage your cookie preferences using our Cookie Consent tool.</li>
        </ul>
        <p>
          To exercise any of these rights, please contact us at <strong>privacy@cargogate.com</strong>.
        </p>

        <h2>6. Cookies and Tracking</h2>
        <p>
          We use cookies to ensure the basic functionality of the website and to enhance your online experience. 
          You can choose for each category to opt-in or opt-out via our Cookie Preferences modal at any time.
        </p>

        <h2>7. Changes to This Policy</h2>
        <p>
          We may update our Privacy Policy from time to time. We will notify you of any changes by posting 
          the new Privacy Policy on this page and updating the "Last updated" date at the top.
        </p>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <a href="/" className="btn btn-secondary">Return to Dashboard</a>
      </div>
    </div>
  );
}
