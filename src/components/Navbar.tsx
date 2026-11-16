'use client';

import React from 'react';
import { Sparkles, Bookmark, Compass } from 'lucide-react';

interface NavbarProps {
  onOpenBookings: () => void;
  savedBookingsCount: number;
}

export const Navbar: React.FC<NavbarProps> = ({
  onOpenBookings,
  savedBookingsCount,
}) => {
  return (
    <header className="sticky top-0 z-40 w-full bg-white/90 backdrop-blur-md border-b border-[#eaeae7] transition-all">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand Wordmark (Hitchd clean modern typographic style) */}
        <a href="#" className="flex items-center gap-2.5 group">
          <div className="w-8 h-8 rounded-full bg-[#111212] text-white flex items-center justify-center transition-transform group-hover:scale-105">
            <Compass className="w-4 h-4 text-white" />
          </div>
          <span className="text-lg font-bold tracking-tight text-[#111212]">
            Package<span className="font-normal text-[#595954]">Pro</span>
          </span>
        </a>

        {/* Center Links */}
        <nav aria-label="Main Navigation" className="hidden md:flex items-center gap-8 text-[13px] font-medium text-[#595954]">
          <a href="#how-it-works" className="hover:text-[#111212] transition-colors">
            How It Works
          </a>
          <a href="#destinations" className="hover:text-[#111212] transition-colors">
            Destinations
          </a>
          <a href="#customizer" className="hover:text-[#111212] transition-colors">
            Trip Studio
          </a>
          <a href="#concierge" className="hover:text-[#111212] transition-colors flex items-center gap-1.5 text-[#155e42]">
            <Sparkles className="w-3.5 h-3.5 text-[#155e42]" />
            <span>AI Concierge</span>
          </a>
        </nav>

        {/* Right Actions */}
        <div className="flex items-center gap-3">
          <span className="hidden sm:inline-flex items-center text-xs font-medium text-[#595954] bg-[#fafaf9] px-3 py-1.5 rounded-full border border-[#eaeae7]">
            Fares in ₹ (INR)
          </span>

          <button
            type="button"
            onClick={onOpenBookings}
            className="btn-hitchd-primary px-4 py-2 text-xs flex items-center gap-2 shadow-xs cursor-pointer"
          >
            <Bookmark className="w-3.5 h-3.5 text-white/80" />
            <span>My Bookings</span>
            {savedBookingsCount > 0 && (
              <span className="w-4 h-4 flex items-center justify-center rounded-full bg-white text-[#111212] text-[10px] font-bold">
                {savedBookingsCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
};
