import { NextResponse } from 'next/server';
import { LRUCache } from 'lru-cache';

const SOAP_ENDPOINT = 'https://ec.europa.eu/taxation_customs/dds2/eos/validation/services/validation';
const SOAP_NAMESPACE = 'http://eori.ws.eos.dds.s/';

// LRU Cache for valid/invalid EORI checks
const eoriCache = new LRUCache({
  max: 10000,
  ttl: 1000 * 60 * 60 * 24, // 24 hours
});

const rateLimitMap = new Map();
const RATE_LIMIT = 30; // Increased limit for free tool
const RATE_WINDOW_MS = 60_000; // 1 minute

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

    const cachedResponse = eoriCache.get(eori);
    if (cachedResponse) {
      return NextResponse.json({ ...cachedResponse, cached: true });
    }

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
      return NextResponse.json({ error: 'Unable to reach the EU EOS validation service.' }, { status: 502 });
    }

    const result = parseSoapResponse(xmlText);

    if (result.error) {
      return NextResponse.json({ error: result.message }, { status: 502 });
    }

    const isValid = result.status === 0;
    const finalResponse = {
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

    return NextResponse.json(finalResponse);

  } catch (err) {
    console.error('[EORI Validate] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error during EORI validation.' },
      { status: 500 }
    );
  }
}
