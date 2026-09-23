import { NextResponse } from 'next/server';
import { lookupHsCode } from '@/lib/csvLoader';

export async function POST(request) {
  try {
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

    // Perform Lookup
    const result = lookupHsCode(rawCode);

    if (result.error) {
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

    return NextResponse.json(finalResponse);
  } catch (err) {
    console.error('[HS Validate] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error during HS code validation.' },
      { status: 500 }
    );
  }
}
