import { NextRequest, NextResponse } from 'next/server';
import { calculateDynamicPricing, PricingInput } from '@/lib/pricing';

export async function POST(request: NextRequest) {
  try {
    const body = (await request.json()) as PricingInput;

    const pricing = calculateDynamicPricing({
      hotel_id: body.hotel_id || '',
      transport_id: body.transport_id || '',
      activity_ids: Array.isArray(body.activity_ids) ? body.activity_ids : [],
      nights: Number(body.nights || 1),
      travelers: Number(body.travelers || 1),
      package_id: body.package_id,
    });

    return NextResponse.json({ success: true, pricing });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Pricing calculation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
