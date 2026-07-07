import { NextResponse } from 'next/server';
import { createChatCompletion } from '../../../lib/groq';

export async function POST(req: Request) {
  console.log('\n🔍 [Competitor Names API] Starting Analysis');
  console.time('competitor-names-api');

  try {
    const { companyInfo } = await req.json()
    console.log(`📍 [Competitor Names API] Finding competitors for: ${companyInfo?.name || 'Unknown Company'}`);

    if (!companyInfo) {
      console.error('❌ [Competitor Names API] Error: Company information is required');
      return NextResponse.json(
        { error: 'Company information is required' },
        { status: 400 }
      )
    }

    const prompt = `Based on this company information:
    ${JSON.stringify(companyInfo, null, 2)}
    
    List the top 5 competitors names only.
    Format the response as a JSON object with the following structure:
    {
      "competitors": [
        {
          "name": ""
        }
      ]
    }`

    console.log('🤖 [Competitor Names API] Sending request to Groq');
    const completion = await createChatCompletion({
      messages: [{ role: "user", content: prompt }],
      response_format: { type: "json_object" },
    });

    if (!completion.choices[0]?.message?.content) {
      console.error('❌ [Competitor Names API] Error: No response from OpenAI');
      throw new Error('No response from OpenAI');
    }

    const data = JSON.parse(completion.choices[0].message.content);
    console.log('✅ [Competitor Names API] Successfully received competitor names:', 
      data.competitors.map((c: { name: string }) => c.name).join(', '));
    console.timeEnd('competitor-names-api');
    return NextResponse.json(data);

  } catch (error) {
    console.error('❌ [Competitor Names API] Error:', error);
    console.timeEnd('competitor-names-api');
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to get competitor names' },
      { status: 500 }
    );
  }
}
