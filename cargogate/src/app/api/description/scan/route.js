import { NextResponse } from 'next/server';
import { scanDescription } from '@/lib/csvLoader';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize Gemini if key exists
const genAI = process.env.GEMINI_API_KEY ? new GoogleGenerativeAI(process.env.GEMINI_API_KEY) : null;
const model = genAI ? genAI.getGenerativeModel({ model: "gemini-1.5-flash" }) : null;

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

    // 1. Blazing fast local NLP scan
    const result = scanDescription(description);

    if (result.error) {
      return NextResponse.json({ error: result.error }, { status: 400 });
    }

    // 2. If valid, or if no Gemini key is provided, return immediately
    if (result.valid || !model || !result.flaggedTerms.length) {
      return NextResponse.json({
        valid: result.valid,
        flaggedTerms: result.flaggedTerms,
        message: result.valid
          ? 'VALID: Description meets specificity requirements.'
          : `NON-COMPLIANT: Ambiguous terminology detected (e.g., '${result.flaggedTerms[0]?.term}'). Specify with precise product identifiers.`,
      });
    }

    // 3. If invalid AND we have Gemini, use AI to generate highly specific recommendations
    try {
      const termsList = result.flaggedTerms.map(t => t.term).join(", ");
      
      const prompt = `
You are an expert EU Customs ICS2 compliance officer. 
The user entered the following goods description which was flagged as too vague or containing placeholder terms:
"${description}"

The following specific terms were flagged: [${termsList}]

For each flagged term, provide a highly specific, real-world ICS2-compliant example of what the user should write instead. 
Return ONLY a valid JSON array of objects, with no markdown formatting or backticks.
Format: [{"term": "the flagged term", "suggestion": "Your highly specific AI suggestion"}]
`;

      const aiResult = await model.generateContent(prompt);
      const responseText = aiResult.response.text().replace(/```json/g, '').replace(/```/g, '').trim();
      
      const aiSuggestions = JSON.parse(responseText);
      
      // Merge AI suggestions with our flagged terms
      const enhancedFlaggedTerms = result.flaggedTerms.map(localTerm => {
        const aiMatch = aiSuggestions.find(ai => ai.term.toLowerCase() === localTerm.term.toLowerCase());
        if (aiMatch && aiMatch.suggestion) {
          return { ...localTerm, suggestion: `✨ AI Suggestion: ${aiMatch.suggestion}` };
        }
        return localTerm; // Fallback to local dictionary suggestion
      });

      return NextResponse.json({
        valid: result.valid,
        flaggedTerms: enhancedFlaggedTerms,
        message: `NON-COMPLIANT: Ambiguous terminology detected (e.g., '${enhancedFlaggedTerms[0]?.term}'). Specify with precise product identifiers.`,
      });
      
    } catch (aiError) {
      console.error('[Gemini AI] Error enhancing recommendations:', aiError);
      // Silently fall back to local dictionary suggestions if AI fails
      return NextResponse.json({
        valid: result.valid,
        flaggedTerms: result.flaggedTerms,
        message: `NON-COMPLIANT: Ambiguous terminology detected (e.g., '${result.flaggedTerms[0]?.term}'). Specify with precise product identifiers.`,
      });
    }

  } catch (err) {
    console.error('[Description Scan] Unexpected error:', err);
    return NextResponse.json(
      { error: 'Internal server error during description scan.' },
      { status: 500 }
    );
  }
}
