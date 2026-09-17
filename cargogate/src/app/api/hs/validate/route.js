import { NextResponse } from 'next/server';
import { lookupHsCode } from '@/lib/csvLoader';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

export async function POST(request) {
  try {
    // 1. Authenticate user strictly
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const rawCode = (body.hsCode || '').trim();

    if (!rawCode) {
      return NextResponse.json(
        { error: 'HS Code is required.' },
        { status: 400 }
      );
    }

    // Strip dots/spaces for validation
    const digits = rawCode.replace(/[\s.]/g, '');
    if (!/^\d{4,6}$/.test(digits)) {
      return NextResponse.json(
        { error: 'Invalid HS Code format. Expected 4 to 6 digits (e.g., 8525.80 or 852580).' },
        { status: 400 }
      );
    }

    // Initialize Admin client for secure DB operations
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 2. Retrieve user's organisation and credit account
    const { data: profile } = await supabaseAdmin
      .from('profiles')
      .select('organisation_id')
      .eq('id', user.id)
      .single();

    if (!profile) {
      return NextResponse.json({ error: 'Profile not found.' }, { status: 404 });
    }

    const { data: creditAccount } = await supabaseAdmin
      .from('credit_accounts')
      .select('id, balance')
      .eq('user_id', user.id)
      .single();

    if (!creditAccount) {
      return NextResponse.json({ error: 'Credit account not found.' }, { status: 404 });
    }

    if (creditAccount.balance < 1) {
      return NextResponse.json({ error: 'PAYMENT_REQUIRED', message: 'You have 0 credits. Purchase credits to continue validating shipments.' }, { status: 402 });
    }

    // 3. Create Validation Session IN_PROGRESS
    const { data: sessionData, error: sessionError } = await supabaseAdmin
      .from('validation_sessions')
      .insert({
        user_id: user.id,
        organisation_id: profile.organisation_id,
        type: 'HS_CODE',
        status: 'IN_PROGRESS'
      })
      .select('id')
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return NextResponse.json({ error: 'Failed to create validation session.' }, { status: 500 });
    }

    const sessionId = sessionData.id;

    // 4. Perform Lookup
    const result = lookupHsCode(rawCode);

    if (result.error) {
      await supabaseAdmin.from('validation_sessions').update({ status: 'FAILED' }).eq('id', sessionId);
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    const finalResponse = {
      status: result.status,
      hsCode: result.hsCode,
      hs2022Codes: result.hs2022Codes,
      isDeprecated: result.isDeprecated,
      message: result.status === 'deprecated'
        ? `DEPRECATED: Code obsolete. Action Required: Replace ${result.hsCode} with updated code ${result.hs2022Codes.join(', ')}.`
        : `COMPLIANT: HS Code ${result.hsCode} validated for current shipping cycles.`,
    };

    // 5. Consume 1 credit atomically
    const { data: consumed, error: rpcError } = await supabaseAdmin.rpc('consume_credit', {
      p_user_id: user.id,
      p_session_id: sessionId,
      p_type: 'VALIDATION'
    });

    if (rpcError || !consumed) {
      await supabaseAdmin.from('validation_sessions').update({ status: 'FAILED' }).eq('id', sessionId);
      return NextResponse.json({ error: 'PAYMENT_REQUIRED', message: 'Insufficient credits.' }, { status: 402 });
    }

    // 6. Save Validation Result
    await supabaseAdmin
      .from('validation_results')
      .insert({
        validation_session_id: sessionId,
        user_id: user.id,
        input_data: { hsCode: rawCode },
        result_data: finalResponse,
        status: result.status === 'deprecated' ? 'INVALID' : 'VALID'
      });

    return NextResponse.json({ ...finalResponse, sessionId, balance: creditAccount.balance - 1 });
  } catch (err) {
    console.error('[HS Validate] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error during HS code validation.' },
      { status: 500 }
    );
  }
}
