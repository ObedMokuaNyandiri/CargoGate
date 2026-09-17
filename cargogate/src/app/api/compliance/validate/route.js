import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';
import { validateHsCode } from '../../hs/validate/route'; // We'll extract logic or duplicate for now
import { scanDescription } from '../../description/scan/route'; // We'll extract logic

export async function POST(req) {
  try {
    const { hsCode, description } = await req.json();

    if (!hsCode && !description) {
      return NextResponse.json({ error: 'Please provide HS Code or Description' }, { status: 400 });
    }

    const authHeader = req.headers.get('authorization');
    if (!authHeader) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    const { data: { user }, error: authError } = await supabase.auth.getUser(
      authHeader.replace('Bearer ', '')
    );

    if (authError || !user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get Organisation ID
    const { data: profile } = await supabase
      .from('profiles')
      .select('organisation_id')
      .eq('id', user.id)
      .single();
      
    if (!profile?.organisation_id) {
      return NextResponse.json({ error: 'Organisation not found' }, { status: 400 });
    }

    // 0. Check for recent exact matches to prevent duplicate charging
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    let cachedHsResult = null;
    let cachedDescResult = null;

    if (hsCode) {
      const { data: recentHs } = await supabase
        .from('validation_checks')
        .select('result_details, validation_sessions!inner(user_id)')
        .eq('check_type', 'HS_CODE')
        .eq('input_value', hsCode)
        .eq('validation_sessions.user_id', user.id)
        .gte('validated_at', twentyFourHoursAgo)
        .order('validated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (recentHs) cachedHsResult = recentHs.result_details;
    }

    if (description) {
      const { data: recentDesc } = await supabase
        .from('validation_checks')
        .select('result_details, validation_sessions!inner(user_id)')
        .eq('check_type', 'DESCRIPTION')
        .eq('input_value', description)
        .eq('validation_sessions.user_id', user.id)
        .gte('validated_at', twentyFourHoursAgo)
        .order('validated_at', { ascending: false })
        .limit(1)
        .maybeSingle();
      if (recentDesc) cachedDescResult = recentDesc.result_details;
    }

    // If everything they requested is cached, return it without consuming a credit!
    if ((!hsCode || cachedHsResult) && (!description || cachedDescResult)) {
      return NextResponse.json({
        hsResult: cachedHsResult,
        descResult: cachedDescResult,
        cached: true
      });
    }

    // 1. Create a single Validation Session
    const { data: session, error: sessionError } = await supabase
      .from('validation_sessions')
      .insert({
        user_id: user.id,
        organisation_id: profile.organisation_id,
        type: 'COMPLIANCE',
        status: 'PENDING',
      })
      .select('id')
      .single();

    if (sessionError) {
      return NextResponse.json({ error: 'Failed to create validation session' }, { status: 500 });
    }

    // 2. Consume exactly ONE credit atomically for the entire compliance check
    const { data: transactionId, error: rpcError } = await supabase.rpc('consume_credit', {
      p_user_id: user.id,
      p_session_id: session.id,
      p_type: 'COMPLIANCE'
    });

    if (rpcError || !transactionId) {
      // Mark session as failed
      await supabase.from('validation_sessions').update({ status: 'FAILED' }).eq('id', session.id);
      return NextResponse.json({ error: 'PAYMENT_REQUIRED', message: 'Insufficient credits' }, { status: 402 });
    }

    const results = { hsResult: null, descResult: null };

    // 3. Perform the checks
    
    // Fake HS Code logic (reusing same logic from before for simplicity)
    if (hsCode) {
      let isDeprecated = false;
      let hs2022Codes = [];
      let message = 'Valid HS Code.';
      
      const hsPrefix = hsCode.replace('.', '').slice(0, 4);
      if (hsPrefix === '8525') {
        isDeprecated = true;
        hs2022Codes = ['8524.11', '8524.91'];
        message = 'Warning: This HS code is deprecated in the 2022 nomenclature.';
      } else if (hsPrefix === '4401') {
        isDeprecated = true;
        hs2022Codes = ['4401.32', '4401.41'];
        message = 'Warning: This HS code is deprecated in the 2022 nomenclature.';
      }

      results.hsResult = { valid: true, isDeprecated, hs2022Codes, message };
      
      // Log check
      await supabase.from('validation_checks').insert({
        validation_session_id: session.id,
        check_type: 'HS_CODE',
        input_value: hsCode,
        result: isDeprecated ? 'DEPRECATED' : 'VALID',
        result_details: results.hsResult
      });
    }

    // Fake Description logic
    if (description) {
      const flagged = [];
      const lower = description.toLowerCase();
      
      const rules = [
        { term: 'electronics', suggestion: 'Provide specific item (e.g., "smartphones", "laptop computers")' },
        { term: 'parts', suggestion: 'Provide specific part name and what it is for (e.g., "steel brake pads for vehicles")' },
        { term: 'tools', suggestion: 'Specify the exact type of tool (e.g., "manual steel hammers")' },
        { term: 'equipment', suggestion: 'Specify exact equipment (e.g., "medical ultrasound machine")' },
        { term: 'clothes', suggestion: 'Specify type and material (e.g., "cotton t-shirts")' },
        { term: 'clothing', suggestion: 'Specify type and material (e.g., "cotton t-shirts")' },
      ];

      for (const rule of rules) {
        if (lower.includes(rule.term)) {
          flagged.push(rule);
        }
      }

      results.descResult = {
        valid: flagged.length === 0,
        message: flagged.length === 0 ? 'Description is specific enough.' : 'Generic terms found. Please be more specific for ICS2.',
        flaggedTerms: flagged,
      };

      // Log check
      await supabase.from('validation_checks').insert({
        validation_session_id: session.id,
        check_type: 'DESCRIPTION',
        input_value: description,
        result: flagged.length === 0 ? 'VALID' : 'INVALID',
        result_details: results.descResult
      });
    }

    return NextResponse.json(results);

  } catch (error) {
    console.error('Validation error:', error);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
