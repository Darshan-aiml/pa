'use client';

import React from 'react';
import Image from 'next/image';
import { Hotel } from '@/types';
import { formatINR } from '@/lib/format';
import { Star, Check, Building2, MapPin, Home, X } from 'lucide-react';

interface HotelSelectorProps {
  hotels: Hotel[];
  selectedHotelId: string;
  onSelectHotel: (hotelId: string) => void;
}

export const HotelSelector: React.FC<HotelSelectorProps> = ({
  hotels,
  selectedHotelId,
  onSelectHotel,
}) => {
  const currentSelected = hotels.find((h) => h.id === selectedHotelId) || null;

  return (
    <section aria-labelledby="hotels-heading" className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#eaeae7]">
        <div>
          <h3 id="hotels-heading" className="text-sm font-bold text-[#111212]">
            Accommodations & Stays
          </h3>
          <p className="text-xs text-[#595954]">
            Select a stay or unselect to arrange your own lodging / homestay.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#111212] bg-[#fafaf9] px-3.5 py-1.5 rounded-full border border-[#eaeae7] font-medium">
            <Building2 className="w-3.5 h-3.5 text-[#155e42]" />
            <span>Active: {currentSelected ? currentSelected.name : 'Self-Arranged (No Stay)'}</span>
          </div>
          {selectedHotelId && (
            <button
              type="button"
              onClick={() => onSelectHotel('')}
              className="text-xs text-[#595954] hover:text-[#111212] underline cursor-pointer"
            >
              Unselect Stay
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Option 0: No accommodation needed (Unselect) */}
        <button
          type="button"
          onClick={() => onSelectHotel('')}
          aria-pressed={!selectedHotelId}
          className={`text-left w-full rounded-2xl border p-5 transition-all bg-white cursor-pointer flex flex-col justify-between ${
            !selectedHotelId
              ? 'border-[#111212] ring-2 ring-[#111212]/10 shadow-sm bg-[#fafaf9]'
              : 'border-[#eaeae7] hover:border-[#111212] hover:shadow-2xs'
          }`}
        >
          <div className="space-y-2.5">
            <div className="flex items-center justify-between">
              <div className="w-10 h-10 rounded-full bg-[#fafaf9] border border-[#eaeae7] flex items-center justify-center text-[#111212]">
                <Home className="w-5 h-5 text-[#595954]" />
              </div>
              {!selectedHotelId && (
                <div className="w-5 h-5 rounded-full bg-[#111212] text-white flex items-center justify-center">
                  <Check className="w-3.5 h-3.5 stroke-[3]" />
                </div>
              )}
            </div>

            <div>
              <h4 className="font-bold text-[#111212] text-sm">
                No accommodation needed
              </h4>
              <p className="text-[11px] text-[#155e42] font-semibold mt-0.5">
                Self-Arranged / Homestay / Friends & Family
              </p>
            </div>

            <p className="text-xs text-[#595954] leading-relaxed">
              Exclude hotel bookings from this package. You arrange your own lodging; transit and activities will remain seamlessly coordinated.
            </p>
          </div>

          <div className="pt-3 border-t border-[#eaeae7] mt-4 flex items-center justify-between">
            <div>
              <span className="text-sm font-bold text-[#111212]">₹0</span>
              <span className="text-[10px] text-[#8c8c85] block">no hotel fee</span>
            </div>
            <span
              className={`text-xs font-semibold px-3 py-1 rounded-full ${
                !selectedHotelId
                  ? 'bg-[#111212] text-white'
                  : 'bg-[#fafaf9] border border-[#eaeae7] text-[#111212]'
              }`}
            >
              {!selectedHotelId ? 'Selected' : 'Choose This'}
            </span>
          </div>
        </button>

        {/* Verified Hotel Options */}
        {hotels.map((hotel) => {
          const isSelected = hotel.id === selectedHotelId;

          return (
            <button
              key={hotel.id}
              type="button"
              onClick={() => onSelectHotel(isSelected ? '' : hotel.id)}
              aria-pressed={isSelected}
              className={`text-left w-full rounded-2xl border transition-all overflow-hidden bg-white cursor-pointer ${
                isSelected
                  ? 'border-[#111212] ring-2 ring-[#111212]/10 shadow-sm'
                  : 'border-[#eaeae7] hover:border-[#111212] hover:shadow-2xs'
              }`}
            >
              {/* Image Banner (Hitchd 16:9 ratio) */}
              <div className="relative h-40 w-full bg-[#fafaf9]">
                <Image
                  src={hotel.image_url}
                  alt={hotel.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/75 text-white backdrop-blur-xs">
                    {hotel.tier}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400 text-[#111212] flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-[#111212]" />
                    {hotel.rating}
                  </span>
                </div>

                <div className="absolute top-3 right-3 flex items-center gap-1">
                  {isSelected && (
                    <div className="bg-[#111212] text-white p-1 rounded-full shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  )}
                </div>
              </div>

              {/* Body */}
              <div className="p-4 space-y-2.5">
                <div className="flex items-start justify-between gap-2">
                  <div>
                    <h4 className="font-bold text-[#111212] text-xs sm:text-sm line-clamp-1">
                      {hotel.name}
                    </h4>
                    <p className="text-[11px] text-[#155e42] font-semibold mt-0.5">
                      {hotel.room_type}
                    </p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-[#111212]">
                      {formatINR(hotel.price_per_night)}
                    </span>
                    <span className="text-[10px] text-[#8c8c85] block">/ night</span>
                  </div>
                </div>

                {/* Amenities */}
                <div className="flex flex-wrap gap-1">
                  {hotel.amenities.slice(0, 3).map((amenity, idx) => (
                    <span
                      key={idx}
                      className="text-[10px] bg-[#fafaf9] text-[#595954] border border-[#eaeae7] px-2 py-0.5 rounded-full"
                    >
                      {amenity}
                    </span>
                  ))}
                </div>

                {/* Footer address & status */}
                <div className="pt-2 border-t border-[#eaeae7] flex items-center justify-between text-[11px]">
                  <span className="text-[#8c8c85] flex items-center gap-1 truncate max-w-[170px]">
                    <MapPin className="w-3 h-3 text-[#8c8c85] shrink-0" />
                    {hotel.address}
                  </span>
                  <span
                    className={`font-semibold px-2.5 py-0.5 rounded-full ${
                      isSelected
                        ? 'bg-[#111212] text-white'
                        : 'bg-[#fafaf9] border border-[#eaeae7] text-[#111212]'
                    }`}
                  >
                    {isSelected ? '✓ Selected (Click to unselect)' : 'Choose Stay'}
                  </span>
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
