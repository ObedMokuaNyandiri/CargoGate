'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function CheckoutContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get('paymentId');
  const amount = searchParams.get('amount');
  
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);

  const simulatePayment = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // Simulate the external provider calling our webhook
      const providerRef = `MPESA${Math.floor(Math.random() * 100000000)}`;
      
      const res = await fetch('/api/payments/webhook', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          paymentId,
          providerReference: providerRef
        })
      });

      if (!res.ok) {
        throw new Error('Simulated webhook failed');
      }

      setSuccess(true);
      
      // Redirect back to dashboard after a delay
      setTimeout(() => {
        router.push('/');
      }, 3000);

    } catch (err) {
      setError(err.message);
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div style={{ textAlign: 'center', padding: '4rem 2rem' }}>
        <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#059669" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{ margin: '0 auto 1rem auto' }}>
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827', marginBottom: '0.5rem' }}>Payment Successful!</h2>
        <p style={{ color: '#4b5563' }}>Your credits have been added to your account. Redirecting to dashboard...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: '400px', margin: '4rem auto', padding: '2rem', background: 'white', borderRadius: '12px', boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
      <h2 style={{ fontSize: '1.5rem', fontWeight: 600, color: '#111827', marginBottom: '1.5rem', textAlign: 'center' }}>
        Simulated M-Pesa Checkout
      </h2>
      
      <div style={{ marginBottom: '2rem', padding: '1rem', background: '#f3f4f6', borderRadius: '8px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem' }}>
          <span style={{ color: '#4b5563' }}>Payment ID:</span>
          <span style={{ fontWeight: 500 }}>{paymentId}</span>
        </div>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <span style={{ color: '#4b5563' }}>Amount:</span>
          <span style={{ fontWeight: 600, fontSize: '1.25rem' }}>KES {amount}</span>
        </div>
      </div>

      {error && (
        <div style={{ background: '#fee2e2', color: '#991b1b', padding: '0.75rem', borderRadius: '8px', marginBottom: '1.5rem', fontSize: '0.875rem' }}>
          {error}
        </div>
      )}

      <button 
        className="btn btn-primary"
        style={{ width: '100%', background: '#059669', color: 'white', border: 'none' }}
        onClick={simulatePayment}
        disabled={loading}
      >
        {loading ? 'Processing...' : 'Simulate Payment Success'}
      </button>
      
      <button 
        className="btn"
        style={{ width: '100%', marginTop: '1rem', background: 'transparent', border: '1px solid #d1d5db' }}
        onClick={() => router.push('/billing')}
        disabled={loading}
      >
        Cancel
      </button>
    </div>
  );
}

export default function CheckoutPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '4rem' }}>Loading checkout...</div>}>
      <CheckoutContent />
    </Suspense>
  );
}
