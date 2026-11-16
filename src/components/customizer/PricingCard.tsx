'use client';

import React from 'react';
import { PricingBreakdown, Hotel, Transportation } from '@/types';
import { formatINR } from '@/lib/format';
import { ShieldCheck, ArrowRight, Tag, TrendingDown, TrendingUp, CheckCircle2 } from 'lucide-react';

interface PricingCardProps {
  pricing: PricingBreakdown | null;
  isRecalculating: boolean;
  hotel: Hotel | null;
  transport: Transportation | null;
  activitiesCount: number;
  nights: number;
  travelers: number;
  onBookNow: () => void;
}

export const PricingCard: React.FC<PricingCardProps> = ({
  pricing,
  isRecalculating,
  hotel,
  transport,
  activitiesCount,
  nights,
  travelers,
  onBookNow,
}) => {
  return (
    <div className="bg-white rounded-2xl border border-[#eaeae7] overflow-hidden sticky top-24 shadow-sm space-y-0">
      {/* Top Total Header (Hitchd dark card accent) */}
      <div className="p-5 bg-[#111212] text-white">
        <div className="flex items-center justify-between text-xs">
          <span className="font-medium text-white/70">Estimated Trip Total</span>
          <span className="text-[10px] text-[#a7f3d0] font-medium flex items-center gap-1">
            <ShieldCheck className="w-3 h-3" />
            Deterministic Math
          </span>
        </div>

        <div className="mt-3 flex items-baseline justify-between">
          <div>
            <div className="text-3xl font-bold tracking-tight text-white flex items-center gap-2">
              {pricing ? formatINR(pricing.final_total) : '...'}
              {isRecalculating && (
                <span className="text-xs text-[#a7f3d0] animate-pulse font-normal">
                  Updating...
                </span>
              )}
            </div>
            <p className="text-[11px] text-white/60 mt-0.5">
              {pricing?.tax_amount ? '5% GST & taxes included' : 'No taxes on ₹0 booking'}
            </p>
          </div>
          <div className="text-right">
            <span className="text-[10px] text-white/60 block">Per Guest</span>
            <span className="text-sm font-semibold text-[#a7f3d0]">
              {pricing ? formatINR(pricing.price_per_traveler) : '...'}
            </span>
          </div>
        </div>

        {/* Upgrade / Savings Diff */}
        {pricing && pricing.savings_or_upgrade_diff !== undefined && (
          <div className="mt-3 pt-2.5 border-t border-white/10 flex items-center justify-between text-xs">
            <span className="text-white/70">Customization difference:</span>
            {pricing.savings_or_upgrade_diff > 0 ? (
              <span className="text-[#fde68a] font-medium flex items-center gap-1">
                <TrendingUp className="w-3.5 h-3.5" />
                +{formatINR(pricing.savings_or_upgrade_diff)}
              </span>
            ) : pricing.savings_or_upgrade_diff < 0 ? (
              <span className="text-[#a7f3d0] font-medium flex items-center gap-1">
                <TrendingDown className="w-3.5 h-3.5" />
                -{formatINR(Math.abs(pricing.savings_or_upgrade_diff))} saved
              </span>
            ) : (
              <span className="text-white/60">Standard base rate</span>
            )}
          </div>
        )}
      </div>

      {/* Itemized Financial Ledger */}
      <div className="p-5 space-y-4 text-xs text-[#111212]">
        <div className="flex items-center justify-between pb-2 border-b border-[#eaeae7]">
          <span className="font-bold text-xs uppercase tracking-wider text-[#8c8c85]">
            Trip Summary
          </span>
          <span className="text-[11px] font-semibold text-[#595954]">
            {nights} Nights · {travelers} Guests
          </span>
        </div>

        {/* Accommodation */}
        <div className="flex justify-between items-start gap-2">
          <div>
            <span className="font-semibold block text-[#111212]">
              {hotel ? `Stays (${nights} nights)` : 'Accommodation'}
            </span>
            <span className="text-[11px] text-[#595954] truncate block max-w-[200px]">
              {hotel ? hotel.name : 'Self-arranged / No hotel selected'}
            </span>
          </div>
          <span className="font-semibold text-[#111212] shrink-0">
            {hotel && pricing ? formatINR(pricing.hotel_subtotal) : '₹0'}
          </span>
        </div>

        {/* Transit */}
        <div className="flex justify-between items-start gap-2">
          <div>
            <span className="font-semibold block text-[#111212]">Transit & Transfers</span>
            <span className="text-[11px] text-[#595954] truncate block max-w-[200px]">
              {transport ? `${transport.name} (${transport.tier || 'standard'})` : 'Self-arranged / No transit selected'}
            </span>
          </div>
          <span className="font-semibold text-[#111212] shrink-0">
            {transport && pricing ? formatINR(pricing.transport_subtotal) : '₹0'}
          </span>
        </div>

        {/* Activities */}
        <div className="flex justify-between items-start gap-2">
          <div>
            <span className="font-semibold block text-[#111212]">
              Tours & Experiences ({activitiesCount})
            </span>
            <span className="text-[11px] text-[#595954]">
              {activitiesCount >= 3 ? '10% bundle applied' : activitiesCount > 0 ? 'Add 3+ for 10% off' : 'No activities selected'}
            </span>
          </div>
          <span className="font-semibold text-[#111212] shrink-0">
            {pricing ? formatINR(pricing.activities_subtotal) : '₹0'}
          </span>
        </div>

        {/* Bundle Discount */}
        {pricing && pricing.bundle_discount > 0 && (
          <div className="p-2.5 rounded-lg bg-[#edf6f2] border border-[#155e42]/20 flex justify-between items-center text-[#155e42]">
            <span className="font-semibold flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5" />
              10% Activity Bundle Savings
            </span>
            <span className="font-bold">-{formatINR(pricing.bundle_discount)}</span>
          </div>
        )}

        {/* Taxes & Fees */}
        <div className="pt-2 border-t border-[#eaeae7] space-y-1.5 text-[#595954] text-[11px]">
          <div className="flex justify-between">
            <span>Tour Package GST (5%)</span>
            <span>{pricing ? formatINR(pricing.tax_amount) : '₹0'}</span>
          </div>
          {pricing && pricing.resort_fee > 0 && (
            <div className="flex justify-between">
              <span>Eco Fee ({Math.ceil(travelers / 2)} room/s)</span>
              <span>{formatINR(pricing.resort_fee)}</span>
            </div>
          )}
        </div>

        {/* Final Grand Total */}
        <div className="pt-3 border-t border-[#eaeae7] flex justify-between items-baseline font-bold text-sm text-[#111212]">
          <span>Grand Total (INR)</span>
          <span className="text-base text-[#111212]">
            {pricing ? formatINR(pricing.final_total) : '...'}
          </span>
        </div>

        {/* Booking CTA Button (Hitchd signature rounded pill) */}
        <div className="pt-2">
          <button
            type="button"
            onClick={onBookNow}
            disabled={!pricing || isRecalculating}
            className="w-full btn-hitchd-primary py-3.5 text-xs sm:text-sm flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-sm"
          >
            <span>Reserve Custom Journey</span>
            <ArrowRight className="w-4 h-4 text-white" />
          </button>
        </div>

        <div className="pt-1 flex items-center justify-center gap-1.5 text-[11px] text-[#8c8c85]">
          <CheckCircle2 className="w-3.5 h-3.5 text-[#155e42]" />
          <span>Zero prepayment required today</span>
        </div>
      </div>
    </div>
  );
};
