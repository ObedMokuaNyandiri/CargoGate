import CookieConsent from '@/components/CookieConsent';
import './globals.css';

export const metadata = {
  title: 'CargoGate Compliance',
  description:
    'Pre-booking compliance firewall for EU ICS2. Validate EORI numbers, HS Codes, and goods descriptions against official regulations in real-time.',
  keywords: 'EORI, HS Code, ICS2, compliance, customs, EU, cargo, validation',
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
