import { NextResponse } from 'next/server';
import { createChatCompletion } from '../../../lib/groq';

export async function POST(req: Request) {
  console.log('\n📝 [Company Details API] Starting Analysis');
  console.time('company-details-api');

  try {
    const { companyBasic } = await req.json()
    console.log(`📍 [Company Details API] Analyzing details for company: ${companyBasic?.name || 'Unknown'}`);

    if (!companyBasic) {
      console.error('❌ [Company Details API] Error: Company basic information is required');
      return NextResponse.json(
        { error: 'Company basic information is required' },
        { status: 400 }
      )
    }

    const prompt = `Based on this company information:
    ${JSON.stringify(companyBasic, null, 2)}
    
    Provide the company's punchline, tagline, and specialties.
    Format the response as a JSON object with the following structure:
    {
      "companyDetails": {
        "punchline": "",
        "tagline": "",
        "specialties": []
      }
    }`

    console.log('🤖 [Company Details API] Sending request to Groq');
    const completion = await createChatCompletion({
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    if (!completion.choices[0]?.message?.content) {
      console.error('❌ [Company Details API] Error: No response from OpenAI');
      throw new Error('No response from OpenAI');
    }

    const data = JSON.parse(completion.choices[0].message.content);
    console.log('✅ [Company Details API] Successfully received company details');
    console.timeEnd('company-details-api');
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ [Company Details API] Error:', error);
    console.timeEnd('company-details-api');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze company details' },
      { status: 500 }
    );
  }
}
