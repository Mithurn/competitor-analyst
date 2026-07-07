import { NextResponse } from 'next/server';
import { createChatCompletion } from '../../../lib/groq';

export async function POST(req: Request) {
  console.log('\n🔍 [Company Basic API] Starting Analysis');
  console.time('company-basic-api');
  
  try {
    const { domain } = await req.json()
    console.log(`📍 [Company Basic API] Analyzing domain: ${domain}`);

    if (!domain) {
      console.error('❌ [Company Basic API] Error: Domain is required');
      return NextResponse.json(
        { error: 'Domain is required' },
        { status: 400 }
      )
    }

    if (!process.env.GROQ_API_KEY) {
      console.error('❌ [Company Basic API] Error: Groq API key is not configured');
      return NextResponse.json(
        { error: 'Groq API key is not configured' },
        { status: 500 }
      )
    }

    const prompt = `Analyze the company with domain ${domain}. Provide basic company information.
    Format the response as a JSON object with the following structure:
    {
      "companyBasic": {
        "name": "",
        "website": "${domain}",
        "industry": "",
        "location": "",
        "employees": "",
        "foundingYear": "",
        "companyType": ""
      }
    }`

    console.log('🤖 [Company Basic API] Sending request to Groq');
    const completion = await createChatCompletion({
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    if (!completion.choices[0]?.message?.content) {
      console.error('❌ [Company Basic API] Error: No response from OpenAI');
      throw new Error('No response from OpenAI');
    }

    const data = JSON.parse(completion.choices[0].message.content);
    console.log('✅ [Company Basic API] Successfully received company data');
    console.timeEnd('company-basic-api');
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ [Company Basic API] Error:', error);
    console.timeEnd('company-basic-api');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to analyze company basic info' },
      { status: 500 }
    );
  }
}
