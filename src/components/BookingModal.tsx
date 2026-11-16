'use client';

import React, { useState } from 'react';
import { X, CheckCircle, ShieldCheck } from 'lucide-react';
import { PricingBreakdown, Hotel, Transportation, Activity } from '@/types';
import { formatINR } from '@/lib/format';

interface BookingModalProps {
  isOpen: boolean;
  onClose: () => void;
  destinationName: string;
  destinationId: string;
  hotel: Hotel | null;
  transport: Transportation | null;
  activities: Activity[];
  pricing: PricingBreakdown;
  packageId?: string;
  onBookingSuccess: () => void;
}

export const BookingModal: React.FC<BookingModalProps> = ({
  isOpen,
  onClose,
  destinationName,
  destinationId,
  hotel,
  transport,
  activities,
  pricing,
  packageId,
  onBookingSuccess,
}) => {
  const [name, setName] = useState('Aarav Mehta');
  const [email, setEmail] = useState('aarav.mehta@example.com');
  const [phone, setPhone] = useState('+91 98765 43210');
  const [mealPreference, setMealPreference] = useState('Pure Vegetarian');
  const [startDate, setStartDate] = useState('2026-12-25');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedBookingCode, setConfirmedBookingCode] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleConfirm = async (e: React.FormEvent) => {
    e.preventDefault();

    setIsSubmitting(true);
    try {
      const res = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          package_id: packageId,
          destination_id: destinationId,
          hotel_id: hotel?.id || null,
          transport_id: transport?.id || null,
          activity_ids: activities.map((a) => a.id),
          nights: pricing.nights,
          travelers: pricing.travelers,
          traveler_name: `${name} (${mealPreference})`,
          traveler_email: email,
          start_date: startDate,
        }),
      });

      const data = await res.json();
      if (data.success && data.booking) {
        setConfirmedBookingCode(data.booking.booking_code);
        onBookingSuccess();
      } else {
        alert(data.error || 'Failed to save booking');
      }
    } catch {
      alert('Network error while saving booking');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-[#eaeae7] overflow-hidden">
        {/* Header (Hitchd aesthetic) */}
        <div className="p-6 bg-[#111212] text-white flex items-center justify-between">
          <div>
            <span className="text-[10px] font-semibold uppercase tracking-wider text-[#a7f3d0]">
              PackagePro India Confirmation
            </span>
            <h2 className="text-lg font-bold mt-1">
              {confirmedBookingCode ? 'Reservation Confirmed!' : `Reserve ${destinationName} Itinerary`}
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close modal"
            className="p-2 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {confirmedBookingCode ? (
          <div className="p-8 text-center space-y-5">
            <div className="w-14 h-14 rounded-full bg-[#155e42]/10 text-[#155e42] flex items-center justify-center mx-auto">
              <CheckCircle className="w-8 h-8" />
            </div>

            <div>
              <p className="text-xs text-[#8c8c85] uppercase tracking-wider font-semibold">
                Your Booking Reference PNR
              </p>
              <h3 className="text-2xl font-mono font-bold text-[#111212] mt-1">
                {confirmedBookingCode}
              </h3>
              <p className="text-xs text-[#595954] mt-2 leading-relaxed">
                Your reservation has been recorded in the SQLite database with 5% GST tax itemization. Free cancellation up to 48 hours before departure.
              </p>
            </div>

            <div className="bg-[#fafaf9] p-4 rounded-2xl text-left text-xs space-y-2 border border-[#eaeae7]">
              <div className="flex justify-between">
                <span className="text-[#8c8c85]">Destination:</span>
                <span className="font-semibold text-[#111212]">{destinationName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c8c85]">Stay & Vehicle:</span>
                <span className="font-semibold text-[#111212] truncate max-w-[220px]">
                  {hotel ? hotel.name : 'Self-Arranged Stay'} · {transport ? transport.name : 'Self-Arranged Transit'}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-[#8c8c85]">Guests & Duration:</span>
                <span className="font-semibold text-[#111212]">
                  {pricing.travelers} Guests · {pricing.nights} Nights
                </span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#eaeae7] font-bold text-sm">
                <span className="text-[#111212]">Final Total:</span>
                <span className="text-[#155e42]">{formatINR(pricing.final_total)}</span>
              </div>
            </div>

            <button
              type="button"
              onClick={onClose}
              className="w-full btn-hitchd-primary py-3 text-xs sm:text-sm cursor-pointer"
            >
              Done & Return to Studio
            </button>
          </div>
        ) : (
          <form onSubmit={handleConfirm} className="p-6 space-y-4">
            {/* Quick Summary */}
            <div className="bg-[#fafaf9] p-4 rounded-2xl border border-[#eaeae7] text-xs space-y-1.5">
              <div className="flex justify-between font-semibold text-[#111212]">
                <span>{hotel ? hotel.name : 'Accommodation (Self-arranged)'}</span>
                <span>{formatINR(pricing.hotel_subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#595954]">
                <span>{transport ? transport.name : 'Transportation (Self-arranged)'}</span>
                <span>{formatINR(pricing.transport_subtotal)}</span>
              </div>
              <div className="flex justify-between text-[#595954]">
                <span>Experiences ({activities.length} tours)</span>
                <span>{formatINR(pricing.activities_subtotal)}</span>
              </div>
              {pricing.bundle_discount > 0 && (
                <div className="flex justify-between text-[#155e42] font-semibold">
                  <span>10% Activity Bundle Discount</span>
                  <span>-{formatINR(pricing.bundle_discount)}</span>
                </div>
              )}
              <div className="flex justify-between text-[#595954]">
                <span>Tour Package GST (5%)</span>
                <span>{formatINR(pricing.tax_amount)}</span>
              </div>
              <div className="flex justify-between pt-2 border-t border-[#eaeae7] font-bold text-sm text-[#111212]">
                <span>Grand Total (INR)</span>
                <span className="text-[#155e42] text-base">{formatINR(pricing.final_total)}</span>
              </div>
            </div>

            {/* Form Fields */}
            <div className="space-y-3">
              <div>
                <label className="text-[11px] font-semibold text-[#111212] block mb-1">
                  Primary Traveler Name
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full text-xs px-3.5 py-2.5 rounded-full border border-[#eaeae7] bg-[#fafaf9] focus:outline-none focus:border-[#111212]"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#111212] block mb-1">
                    Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-full border border-[#eaeae7] bg-[#fafaf9] focus:outline-none focus:border-[#111212]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#111212] block mb-1">
                    Phone (WhatsApp)
                  </label>
                  <input
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-full border border-[#eaeae7] bg-[#fafaf9] focus:outline-none focus:border-[#111212]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="text-[11px] font-semibold text-[#111212] block mb-1">
                    Trip Start Date
                  </label>
                  <input
                    type="date"
                    required
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-full border border-[#eaeae7] bg-[#fafaf9] focus:outline-none focus:border-[#111212]"
                  />
                </div>
                <div>
                  <label className="text-[11px] font-semibold text-[#111212] block mb-1">
                    Dietary Preference
                  </label>
                  <select
                    value={mealPreference}
                    onChange={(e) => setMealPreference(e.target.value)}
                    className="w-full text-xs px-3.5 py-2.5 rounded-full border border-[#eaeae7] bg-[#fafaf9] focus:outline-none focus:border-[#111212]"
                  >
                    <option value="Pure Vegetarian">Pure Vegetarian</option>
                    <option value="Jain (No Onion/Garlic)">Jain (No Onion/Garlic)</option>
                    <option value="Regular / Non-Veg">Regular / Non-Veg</option>
                  </select>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-2 text-[11px] text-[#595954] pt-1">
              <ShieldCheck className="w-3.5 h-3.5 text-[#155e42] shrink-0" />
              <span>Free cancellation up to 48 hours before departure.</span>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                type="button"
                onClick={onClose}
                className="w-1/3 btn-hitchd-secondary py-3 text-xs cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-2/3 btn-hitchd-primary py-3 text-xs sm:text-sm cursor-pointer disabled:opacity-50"
              >
                {isSubmitting ? 'Confirming...' : `Confirm & Reserve (${formatINR(pricing.final_total)})`}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};
