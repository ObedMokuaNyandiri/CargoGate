'use client';

import { useState } from 'react';

export default function BillingPage() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const packages = [
    { id: 'pkg-1', name: '1 Credit', credits: 1, price: 150, popular: false },
    { id: 'pkg-10', name: '10 Credits', credits: 10, price: 1000, popular: true },
    { id: 'pkg-50', name: '50 Credits', credits: 50, price: 5000, popular: false },
  ];

  const handlePurchase = async (packageId) => {
    setLoading(true);
    setError(null);

    try {
      // Get the current user's session token from Supabase (assuming supabase is setup client side)
      // Since we are not doing a full client setup here, we rely on the server-side cookie, or we can fetch a route that gets it.
      // But wait! Server components handle auth cookies. Client components might need the supabase client.
      // For simplicity in this demo, our API routes can read the cookie if we pass it, or we can just send the request.
      
      const res = await fetch('/api/payments/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // We need authorization header, but if we're using cookies, we should update the route to use cookies instead of Bearer token, or we must pass the token.
          // Wait, let's update the API route to use the server client to read cookies!
        },
        body: JSON.stringify({ packageId })
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || 'Failed to initialize payment');
      }

      // Redirect to simulated checkout page
      window.location.href = data.checkoutUrl;

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  return (
    <div className="layout-content" style={{ maxWidth: '1000px', margin: '0 auto' }}>
      <header className="page-header" style={{ textAlign: 'center', marginBottom: '3rem' }}>
        <h1 style={{ fontSize: '2.5rem', fontWeight: 700, color: '#111827', marginBottom: '1rem' }}>
          Purchase Credits
        </h1>
        <p style={{ fontSize: '1.125rem', color: '#4b5563', maxWidth: '600px', margin: '0 auto' }}>
          One credit equals one completed validation transaction. Choose the package that fits your shipping volume.
        </p>
      </header>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '1rem', borderRadius: '8px', marginBottom: '2rem', textAlign: 'center' }}>
          {error}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '2rem' }}>
        {packages.map((pkg) => (
          <div 
            key={pkg.id} 
            className="card" 
            style={{ 
              position: 'relative',
              border: pkg.popular ? '2px solid #2563eb' : '1px solid #e5e7eb',
              transform: pkg.popular ? 'scale(1.05)' : 'none',
              zIndex: pkg.popular ? 10 : 1,
              display: 'flex',
              flexDirection: 'column',
              padding: '2rem'
            }}
          >
            {pkg.popular && (
              <div style={{
                position: 'absolute',
                top: '-12px',
                left: '50%',
                transform: 'translateX(-50%)',
                background: '#2563eb',
                color: 'white',
                padding: '4px 12px',
                borderRadius: '12px',
                fontSize: '0.875rem',
                fontWeight: 600
              }}>
                Most Popular
              </div>
            )}
            
            <h3 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>
              {pkg.name}
            </h3>
            
            <div style={{ fontSize: '2.5rem', fontWeight: 700, color: '#111827', marginBottom: '2rem' }}>
              <span style={{ fontSize: '1.25rem', fontWeight: 500, verticalAlign: 'top', marginRight: '4px' }}>KES</span>
              {pkg.price.toLocaleString()}
            </div>
            
            <ul style={{ listStyle: 'none', padding: 0, margin: '0 0 2rem 0', flex: 1 }}>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#4b5563' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                {pkg.credits} Compliance Check{pkg.credits > 1 ? 's' : ''}
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#4b5563' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                HS Code & Description 
              </li>
              <li style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem', color: '#4b5563' }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>
                EORI Number Verification
              </li>
            </ul>
            
            <button 
              className="btn btn-primary" 
              onClick={() => handlePurchase(pkg.id)}
              disabled={loading}
              style={{ 
                width: '100%', 
                background: pkg.popular ? '#2563eb' : '#f3f4f6', 
                color: pkg.popular ? 'white' : '#111827',
                border: pkg.popular ? 'none' : '1px solid #d1d5db'
              }}
            >
              {loading ? 'Processing...' : 'Buy Now'}
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
