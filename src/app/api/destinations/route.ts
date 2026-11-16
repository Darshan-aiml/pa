import { NextResponse } from 'next/server';
import { getAllDestinations } from '@/lib/db';

export async function GET() {
  try {
    const destinations = getAllDestinations();
    return NextResponse.json({ success: true, destinations });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch destinations';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
