import Link from 'next/link';

export const metadata = {
  title: 'Terms of Service | CargoGate',
  description: 'CargoGate Terms of Service and Liability Disclaimer.',
};

export default function TermsPage() {
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
        <h1>Terms of Service</h1>
        <p>Last updated: {new Date().toLocaleDateString()}</p>
      </div>

      <div className="legal-content">
        <h2>1. Acceptance of Terms</h2>
        <p>
          By accessing or using the CargoGate Compliance platform, you agree to be bound by these Terms of Service. 
          If you do not agree to these terms, please do not use our services.
        </p>

        <h2>2. Description of Service</h2>
        <p>
          CargoGate provides an informational pre-booking compliance tool designed to validate EORI numbers, 
          HS Codes, and goods descriptions against current EU ICS2 guidelines.
        </p>

        <h2>3. No Legal or Customs Liability</h2>
        <p>
          <strong>CRITICAL DISCLAIMER:</strong> CargoGate is a software tool intended to assist with compliance 
          checks. The results provided (including "Valid", "Invalid", or suggested HS Codes) are for informational 
          purposes only. 
        </p>
        <p>
          We do not guarantee that customs authorities will accept the validated data. 
          <strong> You, the exporter or forwarder, remain solely liable for the accuracy of your customs declarations, 
          ENS filings, and any resulting fines, delays, or penalties imposed by customs authorities.</strong>
        </p>

        <h2>4. User Accounts</h2>
        <p>
          You are responsible for maintaining the confidentiality of your account credentials. You must immediately 
          notify us of any unauthorized use of your account.
        </p>

        <h2>5. Acceptable Use</h2>
        <p>You agree not to:</p>
        <ul>
          <li>Use the platform for any illegal purpose.</li>
          <li>Attempt to reverse engineer the application or our machine learning models.</li>
          <li>Use automated bots or scripts to scrape data from the service without an explicit API agreement.</li>
        </ul>

        <h2>6. Termination</h2>
        <p>
          We reserve the right to suspend or terminate your access to the service at any time, with or without notice, 
          for conduct that we believe violates these Terms or is harmful to other users of the service, us, or third parties.
        </p>

        <h2>7. Contact Us</h2>
        <p>
          If you have any questions about these Terms, please contact us at <strong>privacy@cargogate.com</strong>.
        </p>
      </div>
      
      <div style={{ textAlign: 'center', marginTop: '2rem' }}>
        <a href="/" className="btn btn-secondary">Return to Dashboard</a>
      </div>
    </div>
  );
}
