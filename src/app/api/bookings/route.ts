import { NextRequest, NextResponse } from 'next/server';
import { getBookings, saveBooking, getDestinationById, getHotelById, getTransportationById, getActivityById } from '@/lib/db';
import { calculateDynamicPricing } from '@/lib/pricing';
import { BookingRecord } from '@/types';

export async function GET() {
  try {
    const bookings = getBookings();
    return NextResponse.json({ success: true, bookings });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Failed to fetch bookings';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      package_id,
      destination_id,
      hotel_id,
      transport_id,
      activity_ids,
      nights,
      travelers,
      traveler_name,
      traveler_email,
      start_date,
    } = body;

    if (!destination_id || !traveler_name || !traveler_email) {
      return NextResponse.json(
        { success: false, error: 'Missing required booking fields (destination, traveler name, email)' },
        { status: 400 }
      );
    }

    const destination = getDestinationById(destination_id);
    const hotel = hotel_id ? getHotelById(hotel_id) : null;
    const transport = transport_id ? getTransportationById(transport_id) : null;

    const pricing = calculateDynamicPricing({
      hotel_id: hotel_id || '',
      transport_id: transport_id || '',
      activity_ids: Array.isArray(activity_ids) ? activity_ids : [],
      nights: Number(nights || 5),
      travelers: Number(travelers || 2),
      package_id,
    });

    const actNames = (Array.isArray(activity_ids) ? activity_ids : [])
      .map((aid: string) => getActivityById(aid)?.name)
      .filter(Boolean) as string[];

    const randomSuffix = Math.floor(10000 + Math.random() * 90000);
    const bookingCode = `PKG-${destination?.name.substring(0, 3).toUpperCase() || 'TRV'}-${randomSuffix}`;

    const newBooking: BookingRecord = {
      id: `book_${Date.now()}_${randomSuffix}`,
      booking_code: bookingCode,
      package_id: package_id || null,
      destination_name: destination?.name || 'Custom Destination',
      traveler_name,
      traveler_email,
      travelers: Number(travelers || 2),
      nights: Number(nights || 5),
      start_date: start_date || new Date(Date.now() + 14 * 86400000).toISOString().split('T')[0],
      hotel_name: hotel ? hotel.name : 'Self-Arranged Stay',
      hotel_tier: hotel ? hotel.tier : 'budget',
      transport_name: transport ? transport.name : 'Self-Arranged Transit',
      activities_list: JSON.stringify(actNames),
      final_total: pricing.final_total,
      price_per_traveler: pricing.price_per_traveler,
      status: 'confirmed',
      created_at: new Date().toISOString(),
    };

    saveBooking(newBooking);

    return NextResponse.json({
      success: true,
      booking: newBooking,
      pricing,
    });
  } catch (err: unknown) {
    const message = err instanceof Error ? err.message : 'Booking creation failed';
    return NextResponse.json({ success: false, error: message }, { status: 500 });
  }
}
