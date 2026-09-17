import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { packageId } = await req.json();

    // Verify auth
    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Packages config
    const packages = {
      'pkg-1': { credits: 1, amount: 150 },
      'pkg-10': { credits: 10, amount: 1000 },
      'pkg-50': { credits: 50, amount: 5000 },
    };

    const pkg = packages[packageId];
    if (!pkg) {
      return NextResponse.json({ error: 'Invalid package' }, { status: 400 });
    }

    // Connect to Supabase as Service Role to create payment record securely
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Get user from auth header
    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Generate unique payment ID
    const paymentId = `PAY-${Math.floor(Math.random() * 1000000).toString().padStart(6, '0')}`;

    // Insert pending payment
    const { error: insertError } = await supabase
      .from('payments')
      .insert({
        id: paymentId,
        user_id: user.id,
        amount: pkg.amount,
        currency: 'KES',
        status: 'PENDING',
        credits_purchased: pkg.credits,
      });

    if (insertError) {
      console.error('Error creating payment:', insertError);
      return NextResponse.json({ error: 'Failed to create payment record' }, { status: 500 });
    }

    // Return success and the simulated checkout URL (in production this would be M-Pesa or Stripe URL)
    return NextResponse.json({
      success: true,
      paymentId,
      // For local testing, we return a simulated checkout URL
      checkoutUrl: `/billing/checkout?paymentId=${paymentId}&amount=${pkg.amount}`,
    });

  } catch (error) {
    console.error('Payment creation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
