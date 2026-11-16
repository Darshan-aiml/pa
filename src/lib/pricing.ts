import {
  PricingBreakdown,
  BasePackage,
} from '@/types';
import { getHotelById, getTransportationById, getActivityById, getPackageById } from './db';

export interface PricingInput {
  hotel_id?: string | null;
  transport_id?: string | null;
  activity_ids?: string[];
  nights?: number;
  travelers?: number;
  package_id?: string;
}

/**
 * Deterministic Backend Dynamic Pricing Engine (INR Edition)
 * Calculates prices in Indian Rupees (₹) with 5% GST and seasonal/bundle rules.
 * Supports unselecting hotels, transport, or activities (₹0 when not selected).
 * Prevents AI hallucination of package costs.
 */
export function calculateDynamicPricing(input: PricingInput): PricingBreakdown {
  const travelers = Math.max(1, Math.min(20, Math.round(input.travelers || 1)));
  const nights = Math.max(1, Math.min(30, Math.round(input.nights || 1)));
  const rooms = Math.ceil(travelers / 2);

  // 1. Hotel pricing (in ₹ per night per room)
  // If unselected (empty string or null), hotelSubtotal is 0
  let hotelPricePerNight = 0;
  let hotelSubtotal = 0;
  if (input.hotel_id && input.hotel_id.trim() !== '') {
    const hotel = getHotelById(input.hotel_id);
    if (hotel) {
      hotelPricePerNight = hotel.price_per_night;
      hotelSubtotal = hotelPricePerNight * nights * rooms;
    }
  }

  // 2. Transport pricing (in ₹ per traveler or flat vehicle cost)
  // If unselected, transportSubtotal is 0
  let transportSubtotal = 0;
  if (input.transport_id && input.transport_id.trim() !== '') {
    const transport = getTransportationById(input.transport_id);
    if (transport) {
      transportSubtotal = transport.is_per_person
        ? transport.price * travelers
        : transport.price;
    }
  }

  // 3. Activities pricing (in ₹ per person)
  let activitiesSubtotal = 0;
  const validActivityIds = Array.isArray(input.activity_ids) ? input.activity_ids : [];
  let activitiesCount = 0;

  for (const actId of validActivityIds) {
    if (!actId) continue;
    const act = getActivityById(actId);
    if (act) {
      activitiesSubtotal += act.price_per_person * travelers;
      activitiesCount++;
    }
  }

  // 4. Raw subtotal in INR
  const rawSubtotal = hotelSubtotal + transportSubtotal + activitiesSubtotal;

  // 5. Dynamic Bundle Discount: 10% off activities when booking 3 or more activities
  let bundleDiscount = 0;
  if (activitiesCount >= 3) {
    bundleDiscount = Math.round(activitiesSubtotal * 0.1);
  }

  // 6. Taxes: 5% GST on tour packages in India
  const taxableAmount = Math.max(0, rawSubtotal - bundleDiscount);
  const taxAmount = Math.round(taxableAmount * 0.05);

  // Hospitality state tourism & eco-surcharge: ₹350 per room per night (only if hotel selected)
  const resortFee = hotelSubtotal > 0 ? 350 * nights * rooms : 0;

  // 7. Final Total in INR
  const finalTotal = Math.round(taxableAmount + taxAmount + resortFee);
  const pricePerTraveler = Math.round(finalTotal / travelers);

  // 8. Base package diff
  let originalBaseTotal: number | undefined;
  let savingsOrUpgradeDiff: number | undefined;

  if (input.package_id) {
    const basePkg = getPackageById(input.package_id);
    if (basePkg) {
      const baseCalc = calculateDynamicPricing({
        hotel_id: basePkg.default_hotel_id,
        transport_id: basePkg.default_transport_id,
        activity_ids: basePkg.default_activity_ids,
        nights: basePkg.default_nights,
        travelers: basePkg.default_travelers,
      });
      originalBaseTotal = baseCalc.final_total;
      savingsOrUpgradeDiff = finalTotal - originalBaseTotal;
    }
  }

  return {
    nights,
    travelers,
    rooms,
    hotel_price_per_night: hotelPricePerNight,
    hotel_subtotal: hotelSubtotal,
    transport_subtotal: transportSubtotal,
    activities_subtotal: activitiesSubtotal,
    activities_count: activitiesCount,
    raw_subtotal: rawSubtotal,
    bundle_discount: bundleDiscount,
    tax_amount: taxAmount,
    resort_fee: resortFee,
    final_total: finalTotal,
    price_per_traveler: pricePerTraveler,
    original_base_total: originalBaseTotal,
    savings_or_upgrade_diff: savingsOrUpgradeDiff,
  };
}
