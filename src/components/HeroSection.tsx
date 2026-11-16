'use client';

import React, { useState } from 'react';
import { Search, ArrowUpRight, Sparkles, ShieldCheck } from 'lucide-react';
import { Destination } from '@/types';

interface HeroSectionProps {
  destinations: Destination[];
  onSelectDestination: (destinationId: string, preferredNights?: number, preferredGuests?: number) => void;
}

export const HeroSection: React.FC<HeroSectionProps> = ({
  destinations,
  onSelectDestination,
}) => {
  const [selectedDestId, setSelectedDestId] = useState(destinations[0]?.id || 'dest_goa');
  const [nights, setNights] = useState('4');
  const [guests, setGuests] = useState('2');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSelectDestination(selectedDestId, Number(nights), Number(guests));
  };

  return (
    <section className="relative pt-16 pb-20 md:pt-24 md:pb-28 px-4 sm:px-6 lg:px-8 bg-gradient-to-b from-[#fafaf9] via-white to-white border-b border-[#eaeae7]">
      <div className="max-w-5xl mx-auto text-center space-y-6">
        {/* Subtle pill badge (Hitchd aesthetic) */}
        <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-white border border-[#eaeae7] text-xs font-medium text-[#595954] shadow-2xs">
          <span className="w-2 h-2 rounded-full bg-[#155e42]" />
          <span>Dynamic Travel Customization for India</span>
        </div>

        {/* Hitchd Signature Headline */}
        <h1 className="text-4xl sm:text-6xl md:text-7xl font-bold tracking-tight text-[#111212] leading-[1.08] max-w-4xl mx-auto">
          Custom journeys, <br className="hidden sm:inline" />
          <span className="hitchd-serif font-normal italic">without</span> the compromise.
        </h1>

        {/* Narrative Subtitle */}
        <p className="text-base sm:text-lg text-[#595954] max-w-2xl mx-auto leading-relaxed">
          Say goodbye to rigid pre-packaged tours. Swap luxury villas, book private chauffeur transfers, and curate handpicked experiences in Indian Rupees.
        </p>

        {/* CTA Buttons Row */}
        <div className="flex flex-wrap items-center justify-center gap-3 pt-2">
          <a
            href="#destinations"
            className="btn-hitchd-primary px-7 py-3 text-sm flex items-center gap-2 cursor-pointer"
          >
            <span>Explore Curated Packages</span>
          </a>
          <a
            href="#customizer"
            className="btn-hitchd-secondary px-6 py-3 text-sm flex items-center gap-1.5 cursor-pointer"
          >
            <span>Open Customizer Studio</span>
            <ArrowUpRight className="w-4 h-4 text-[#595954]" />
          </a>
        </div>

        {/* Hitchd Floating Interactive Search Bar */}
        <div className="pt-8 max-w-3xl mx-auto">
          <form
            onSubmit={handleSubmit}
            className="p-3 sm:p-2 bg-white rounded-2xl sm:rounded-full border border-[#d6d6d1] shadow-sm flex flex-col sm:flex-row items-stretch sm:items-center gap-2 text-left"
          >
            {/* Destination Selector */}
            <div className="flex-1 px-4 py-2 sm:py-1">
              <label htmlFor="destination-select" className="block text-[10px] font-semibold uppercase tracking-wider text-[#8c8c85]">
                Where To
              </label>
              <select
                id="destination-select"
                value={selectedDestId}
                onChange={(e) => setSelectedDestId(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold text-[#111212] bg-transparent focus:outline-none cursor-pointer mt-0.5"
              >
                {destinations.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name} ({d.region})
                  </option>
                ))}
              </select>
            </div>

            <div className="w-px h-8 bg-[#eaeae7] hidden sm:block" />

            {/* Duration Selector */}
            <div className="w-full sm:w-32 px-4 py-2 sm:py-1">
              <label htmlFor="duration-select" className="block text-[10px] font-semibold uppercase tracking-wider text-[#8c8c85]">
                Duration
              </label>
              <select
                id="duration-select"
                value={nights}
                onChange={(e) => setNights(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold text-[#111212] bg-transparent focus:outline-none cursor-pointer mt-0.5"
              >
                <option value="3">3 Nights</option>
                <option value="4">4 Nights</option>
                <option value="5">5 Nights</option>
                <option value="7">7 Nights</option>
              </select>
            </div>

            <div className="w-px h-8 bg-[#eaeae7] hidden sm:block" />

            {/* Travelers Selector */}
            <div className="w-full sm:w-32 px-4 py-2 sm:py-1">
              <label htmlFor="guests-select" className="block text-[10px] font-semibold uppercase tracking-wider text-[#8c8c85]">
                Travelers
              </label>
              <select
                id="guests-select"
                value={guests}
                onChange={(e) => setGuests(e.target.value)}
                className="w-full text-xs sm:text-sm font-semibold text-[#111212] bg-transparent focus:outline-none cursor-pointer mt-0.5"
              >
                <option value="1">1 Guest</option>
                <option value="2">2 Guests</option>
                <option value="4">4 Guests</option>
                <option value="6">6 Guests</option>
              </select>
            </div>

            {/* Submit Action */}
            <button
              type="submit"
              className="btn-hitchd-primary px-6 py-3 text-xs sm:text-sm flex items-center justify-center gap-2 shrink-0 cursor-pointer"
            >
              <Search className="w-4 h-4 text-white" />
              <span>Customize</span>
            </button>
          </form>

          {/* Trust points underneath */}
          <div className="flex flex-wrap items-center justify-center gap-6 pt-5 text-xs text-[#595954]">
            <span className="flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-[#155e42]" />
              Deterministic pricing in ₹ (INR)
            </span>
            <span className="hidden sm:inline text-[#d6d6d1]">·</span>
            <span>24 Verified Activities & Transfers</span>
            <span className="hidden sm:inline text-[#d6d6d1]">·</span>
            <span>5% GST Included</span>
          </div>
        </div>
      </div>
    </section>
  );
};
