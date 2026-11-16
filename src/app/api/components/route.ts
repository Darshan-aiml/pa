import { NextRequest, NextResponse } from 'next/server';
import {
  getHotelsForDestination,
  getActivitiesForDestination,
  getTransportationForDestination,
  getDestinationById,
} from '@/lib/db';

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const destinationId = searchParams.get('destination_id');

    if (!destinationId) {
      return NextResponse.json(
        { success: false, error: 'destination_id query parameter is required' },
        { status: 400 }
      );
    }

    const destination = getDestinationById(destinationId);
    if (!destination) {
      return NextResponse.json(
        { success: false, error: 'Destination not found' },
        { status: 404 }
      );
    }

    const hotels = getHotelsForDestination(destinationId);
    const activities = getActivitiesForDestination(destinationId);
    const transportation = getTransportationForDestination(destinationId);

    return NextResponse.json({
      success: true,
      destination,
      hotels,
      activities,
      transportation,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch destination components';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
