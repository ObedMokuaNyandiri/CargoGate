import CookieConsent from '@/components/CookieConsent';
import './globals.css';

export const metadata = {
  title: 'Free ICS2 Compliance Checker & HS Code Verifier | CargoGate',
  description:
    'Instantly validate goods descriptions and HS codes for EU ICS2 compliance. 100% free, stateless NLP tool with zero data retention. Prevent border holds.',
  keywords: 'Free ICS2 Compliance Checker, ICS2 Goods Description Validator, EU HS Code Verifier, Import Control System 2 tool, EU Customs compliance tool, stateless HS code checker',
};

export const viewport = {
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700;800&family=JetBrains+Mono:wght@500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body>
        {children}
        <CookieConsent />
      </body>
    </html>
  );
}
