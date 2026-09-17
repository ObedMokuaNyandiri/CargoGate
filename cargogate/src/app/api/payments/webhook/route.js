import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(req) {
  try {
    const { paymentId, providerReference } = await req.json();

    if (!paymentId || !providerReference) {
      return NextResponse.json({ error: 'Missing parameters' }, { status: 400 });
    }

    // Connect to Supabase as Service Role to execute the RPC securely
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // Call the atomic process_payment RPC
    const { data, error } = await supabase.rpc('process_payment', {
      p_payment_id: paymentId,
      p_provider_reference: providerReference
    });

    if (error) {
      console.error('Webhook processing error:', error);
      return NextResponse.json({ error: 'Payment processing failed' }, { status: 500 });
    }

    return NextResponse.json({ success: true });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
