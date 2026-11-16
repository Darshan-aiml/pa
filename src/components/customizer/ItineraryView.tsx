'use client';

import React from 'react';
import { Hotel, Activity, Transportation, Destination } from '@/types';
import { Utensils, CheckCircle2 } from 'lucide-react';

interface ItineraryViewProps {
  destination: Destination;
  nights: number;
  hotel: Hotel | null;
  transport: Transportation | null;
  activities: Activity[];
}

export const ItineraryView: React.FC<ItineraryViewProps> = ({
  destination,
  nights,
  hotel,
  transport,
  activities,
}) => {
  return (
    <section aria-labelledby="itinerary-heading" className="bg-white p-6 rounded-2xl border border-[#eaeae7] space-y-6 shadow-2xs">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-4 border-b border-[#eaeae7] gap-2">
        <div>
          <h3 id="itinerary-heading" className="text-base font-bold text-[#111212]">
            {nights}-Day Curated Schedule for {destination.name}
          </h3>
          <p className="text-xs text-[#595954]">
            Tailored to your selected stay, {activities.length} tours, and transit mode.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-[11px] font-semibold px-3 py-1 rounded-full bg-[#fafaf9] text-[#111212] border border-[#eaeae7]">
            Pure Veg & Jain Options Available
          </span>
        </div>
      </div>

      <div className="space-y-4">
        {/* Day 1: Arrival & Check-in */}
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-[#fafaf9] text-[#111212] font-bold flex flex-col items-center justify-center shrink-0 text-xs border border-[#eaeae7]">
            <span className="text-[9px] uppercase tracking-wider text-[#8c8c85]">Day</span>
            <span className="leading-none font-bold">1</span>
          </div>
          <div className="flex-1 bg-[#fafaf9] p-4 rounded-2xl border border-[#eaeae7] space-y-1.5">
            <h4 className="font-bold text-xs sm:text-sm text-[#111212]">
              Arrival in {destination.name} & Check-in at {hotel?.name}
            </h4>
            <p className="text-xs text-[#595954] leading-relaxed">
              Meet your private chauffeur transfer with {transport?.name}. Check into your {hotel?.room_type}. Evening at leisure enjoying authentic local cuisine and sunset walks.
            </p>
          </div>
        </div>

        {/* Dynamic Activity Days */}
        {activities.map((act, idx) => (
          <div key={act.id} className="flex gap-4 items-start">
            <div className="w-10 h-10 rounded-full bg-[#fafaf9] text-[#111212] font-bold flex flex-col items-center justify-center shrink-0 text-xs border border-[#eaeae7]">
              <span className="text-[9px] uppercase tracking-wider text-[#8c8c85]">Day</span>
              <span className="leading-none font-bold">{idx + 2}</span>
            </div>
            <div className="flex-1 bg-[#fafaf9] p-4 rounded-2xl border border-[#eaeae7] space-y-1.5">
              <div className="flex items-center justify-between gap-2">
                <h4 className="font-bold text-xs sm:text-sm text-[#111212]">{act.name}</h4>
                <span className="text-[10px] font-semibold px-2.5 py-0.5 rounded-full bg-white text-[#595954] border border-[#eaeae7]">
                  {act.category} · {act.duration_hours}h
                </span>
              </div>
              <p className="text-xs text-[#595954] leading-relaxed">{act.description}</p>
              <div className="pt-1 flex items-center gap-2 text-[11px] text-[#8c8c85]">
                <Utensils className="w-3 h-3 text-[#8c8c85]" />
                <span>Inclusions: {act.included_items.join(', ')}</span>
              </div>
            </div>
          </div>
        ))}

        {/* Departure Day */}
        <div className="flex gap-4 items-start">
          <div className="w-10 h-10 rounded-full bg-[#fafaf9] text-[#111212] font-bold flex flex-col items-center justify-center shrink-0 text-xs border border-[#eaeae7]">
            <span className="text-[9px] uppercase tracking-wider text-[#8c8c85]">Day</span>
            <span className="leading-none font-bold">{nights}</span>
          </div>
          <div className="flex-1 bg-[#fafaf9] p-4 rounded-2xl border border-[#eaeae7] space-y-1.5">
            <h4 className="font-bold text-xs sm:text-sm text-[#111212]">
              Morning Souvenir Exploration & Departure Transfer
            </h4>
            <p className="text-xs text-[#595954] leading-relaxed">
              Enjoy breakfast at {hotel?.name}. Check-out and private transfer to airport or station via {transport?.provider}.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
};
