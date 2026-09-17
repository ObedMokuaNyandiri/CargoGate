import { NextResponse } from 'next/server';
import { scanDescription } from '@/lib/csvLoader';

export async function POST(request) {
  try {
    const body = await request.json();
    const description = (body.description || '').trim();

    if (!description) {
      return NextResponse.json(
        { error: 'Goods description is required.' },
        { status: 400 }
      );
    }

    if (description.length > 2000) {
      return NextResponse.json(
        { error: 'Description exceeds maximum length of 2000 characters.' },
        { status: 400 }
      );
    }

    const result = scanDescription(description);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    return NextResponse.json({
      valid: result.valid,
      flaggedTerms: result.flaggedTerms,
      message: result.valid
        ? 'VALID: Description meets specificity requirements.'
        : `NON-COMPLIANT: Ambiguous terminology detected (e.g., '${result.flaggedTerms[0]?.term}'). Specify with precise product identifiers.`,
    });
  } catch (err) {
    console.error('[Description Scan] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error during description scan.' },
      { status: 500 }
    );
  }
}
