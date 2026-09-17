import { NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';
import { createClient } from '@/utils/supabase/server';
import { createClient as createSupabaseAdmin } from '@supabase/supabase-js';

const SOAP_ENDPOINT = 'https://ec.europa.eu/taxation_customs/dds2/eos/validation/services/validation';
const SOAP_NAMESPACE = 'http://eori.ws.eos.dds.s/';

// LRU Cache for valid/invalid EORI checks
const eoriCache = new LRUCache({
  max: 10000,
  ttl: 1000 * 60 * 60 * 24,
});

const rateLimitMap = new Map();
const RATE_LIMIT = 10;
const RATE_WINDOW_MS = 60_000;

function checkRateLimit(ip) {
  const now = Date.now();
  const entry = rateLimitMap.get(ip);
  if (!entry) {
    rateLimitMap.set(ip, { count: 1, windowStart: now });
    return true;
  }
  if (now - entry.windowStart > RATE_WINDOW_MS) {
    entry.count = 1;
    entry.windowStart = now;
    return true;
  }
  if (entry.count >= RATE_LIMIT) {
    return false;
  }
  entry.count++;
  return true;
}

function isValidEoriFormat(eori) {
  return /^[A-Z]{2}[A-Z0-9]{1,15}$/i.test(eori);
}

function buildSoapEnvelope(eoriNumber) {
  return `<?xml version="1.0" encoding="UTF-8"?>
<soapenv:Envelope xmlns:soapenv="http://schemas.xmlsoap.org/soap/envelope/"
                  xmlns:s="${SOAP_NAMESPACE}">
  <soapenv:Header/>
  <soapenv:Body>
    <s:validateEORI>
      <s:eori>${escapeXml(eoriNumber)}</s:eori>
    </s:validateEORI>
  </soapenv:Body>
</soapenv:Envelope>`;
}

function escapeXml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function parseSoapResponse(xml) {
  const extract = (tag) => {
    const regex = new RegExp(`<(?:[\\w]+:)?${tag}>([^<]*)<\\/(?:[\\w]+:)?${tag}>`, 'i');
    const match = xml.match(regex);
    return match ? match[1].trim() : null;
  };

  const faultString = extract('faultstring');
  if (faultString) return { error: true, message: faultString };

  const eori = extract('eori');
  const status = extract('status');
  const statusDescr = extract('statusDescr');
  const name = extract('name');
  const address = extract('address');
  const street = extract('street');
  const postalCode = extract('postalCode');
  const city = extract('city');
  const country = extract('country');
  const requestDate = extract('requestDate');
  const errorDescription = extract('errorDescription');

  if (!eori && !status && errorDescription) {
    return { error: true, message: errorDescription };
  }

  return {
    error: false,
    eori,
    status: parseInt(status, 10),
    statusDescription: statusDescr || '',
    entityName: name || null,
    address: address || null,
    street: street || null,
    postalCode: postalCode || null,
    city: city || null,
    country: country || null,
    requestDate: requestDate || null,
  };
}

const delay = (ms) => new Promise(res => setTimeout(res, ms));

export async function POST(request) {
  try {
    // 1. Authenticate user strictly
    const supabase = await createClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // 2. Check Rate Limit
    const ip = request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown';
    if (!checkRateLimit(ip)) {
      return NextResponse.json(
        { error: 'Rate limit exceeded.' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const eori = (body.eori || '').trim().toUpperCase();

    if (!eori) {
      return NextResponse.json({ error: 'EORI number is required.' }, { status: 400 });
    }

    if (!isValidEoriFormat(eori)) {
      return NextResponse.json(
        { error: 'Invalid EORI format.' },
        { status: 400 }
      );
    }

    // Initialize Admin client for secure DB operations
    const supabaseAdmin = createSupabaseAdmin(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.SUPABASE_SERVICE_ROLE_KEY
    );

    // 3. Retrieve user's organisation and credit account
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

    // 3.5 Check for exact match in DB in the last 24 hours to prevent duplicate charging
    const twentyFourHoursAgo = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
    const { data: recentCheck } = await supabaseAdmin
      .from('validation_checks')
      .select('result_details, validation_sessions!inner(user_id)')
      .eq('check_type', 'EORI')
      .eq('input_value', eori)
      .eq('validation_sessions.user_id', user.id)
      .gte('validated_at', twentyFourHoursAgo)
      .order('validated_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (recentCheck) {
      return NextResponse.json({ 
        ...recentCheck.result_details, 
        cached: true, 
        balance: creditAccount.balance 
      });
    }

    // 4. Create Validation Session IN_PROGRESS
    const { data: sessionData, error: sessionError } = await supabaseAdmin
      .from('validation_sessions')
      .insert({
        user_id: user.id,
        organisation_id: profile.organisation_id,
        type: 'EORI',
        status: 'IN_PROGRESS'
      })
      .select('id')
      .single();

    if (sessionError) {
      console.error('Session creation error:', sessionError);
      return NextResponse.json({ error: 'Failed to create validation session.' }, { status: 500 });
    }

    const sessionId = sessionData.id;
    let finalResponse;

    // 5. Check LRU Cache or Fetch from SOAP
    const cachedResponse = eoriCache.get(eori);
    if (cachedResponse) {
      finalResponse = { ...cachedResponse, cached: true };
    } else {
      const soapBody = buildSoapEnvelope(eori);
      let xmlText = null;
      let fetchError = null;
      const MAX_RETRIES = 3;
      
      for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
        try {
          const controller = new AbortController();
          const timeout = setTimeout(() => controller.abort(), 10000);
          
          const response = await fetch(SOAP_ENDPOINT, {
            method: 'POST',
            headers: {
              'Content-Type': 'text/xml; charset=utf-8',
              'SOAPAction': '',
            },
            body: soapBody,
            signal: controller.signal,
          });
          
          clearTimeout(timeout);
          
          if (response.ok) {
            xmlText = await response.text();
            break;
          } else {
            throw new Error(`HTTP ${response.status}`);
          }
        } catch (err) {
          fetchError = err;
          if (attempt < MAX_RETRIES - 1) {
            const waitTime = Math.pow(2, attempt) * 1000 + Math.random() * 500;
            await delay(waitTime);
          }
        }
      }

      if (!xmlText) {
        await supabaseAdmin.from('validation_sessions').update({ status: 'FAILED' }).eq('id', sessionId);
        return NextResponse.json({ error: 'Unable to reach the EU EOS validation service.' }, { status: 502 });
      }

      const result = parseSoapResponse(xmlText);

      if (result.error) {
        await supabaseAdmin.from('validation_sessions').update({ status: 'FAILED' }).eq('id', sessionId);
        return NextResponse.json({ error: result.message }, { status: 502 });
      }

      const isValid = result.status === 0;
      finalResponse = {
        valid: isValid,
        eori: result.eori || eori,
        status: result.status,
        statusDescription: result.statusDescription,
        entityName: result.entityName,
        address: result.address,
        street: result.street,
        postalCode: result.postalCode,
        city: result.city,
        country: result.country,
        requestDate: result.requestDate,
        message: isValid
          ? 'VALID: Active Entity (Verified via EU EOS Database).'
          : 'INVALID: EORI Number is unregistered or expired.',
        cached: false,
      };

      eoriCache.set(eori, finalResponse);
    }

    // 6. Consume 1 credit atomically
    const { data: transactionId, error: rpcError } = await supabaseAdmin.rpc('consume_credit', {
      p_user_id: user.id,
      p_session_id: sessionId,
      p_type: 'VALIDATION'
    });

    if (rpcError || !transactionId) {
      await supabaseAdmin.from('validation_sessions').update({ status: 'FAILED' }).eq('id', sessionId);
      return NextResponse.json({ error: 'PAYMENT_REQUIRED', message: 'Insufficient credits.' }, { status: 402 });
    }

    // 7. Save Validation Result in validation_checks
    await supabaseAdmin
      .from('validation_checks')
      .insert({
        validation_session_id: sessionId,
        check_type: 'EORI',
        input_value: eori,
        result: finalResponse.valid ? 'VALID' : 'INVALID',
        result_details: finalResponse
      });

    return NextResponse.json({ ...finalResponse, sessionId, balance: creditAccount.balance - 1 });

  } catch (err) {
    console.error('[EORI Validate] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error during EORI validation.' },
      { status: 500 }
    );
  }
}
