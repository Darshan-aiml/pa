import { NextRequest, NextResponse } from 'next/server';
import { processAiTravelConcierge, ChatRequestPayload } from '@/lib/gemini';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as ChatRequestPayload;

    if (!body.message || !body.currentPackageState) {
      return NextResponse.json(
        { success: false, error: 'message and currentPackageState are required' },
        { status: 400 }
      );
    }

    const result = await processAiTravelConcierge(body);

    return NextResponse.json({
      success: true,
      reply: result.reply,
      toolCalls: result.toolCalls,
      updatedPackageState: result.updatedPackageState,
      pricing: result.pricing,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'AI concierge processing failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
