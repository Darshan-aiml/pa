'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { BasePackage } from '@/types';
import { formatINR } from '@/lib/format';
import { ArrowRight, Star, Clock, Users, Check } from 'lucide-react';

interface PackagesGridProps {
  packages: BasePackage[];
  onSelectPackage: (pkg: BasePackage) => void;
}

const CATEGORIES = [
  'All',
  'Beaches',
  'Himalayas',
  'Backwaters',
  'Palaces',
  'Islands',
  'International',
];

export const PackagesGrid: React.FC<PackagesGridProps> = ({ packages, onSelectPackage }) => {
  const [activeCategory, setActiveCategory] = useState('All');

  const filteredPackages = packages.filter((pkg) => {
    if (activeCategory === 'All') return true;
    if (activeCategory === 'Beaches') return pkg.destination_id.includes('goa') || pkg.tags.some(t => t.toLowerCase().includes('beach'));
    if (activeCategory === 'Himalayas') return pkg.destination_id.includes('kashmir') || pkg.destination_id.includes('himachal') || pkg.destination_id.includes('uttarakhand');
    if (activeCategory === 'Backwaters') return pkg.destination_id.includes('kerala');
    if (activeCategory === 'Palaces') return pkg.destination_id.includes('rajasthan');
    if (activeCategory === 'Islands') return pkg.destination_id.includes('andaman');
    if (activeCategory === 'International') return pkg.destination_id.includes('dubai');
    return true;
  });

  return (
    <div className="space-y-8">
      {/* Category Pills (Hitchd aesthetic: rounded-full pills) */}
      <div className="flex items-center gap-2 overflow-x-auto pb-2 no-scrollbar">
        {CATEGORIES.map((cat) => {
          const isActive = activeCategory === cat;
          return (
            <button
              key={cat}
              type="button"
              onClick={() => setActiveCategory(cat)}
              className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#111212] text-white shadow-xs'
                  : 'bg-white border border-[#eaeae7] text-[#595954] hover:border-[#111212] hover:text-[#111212]'
              }`}
            >
              {cat}
            </button>
          );
        })}
      </div>

      {/* Packages Cards Grid (Hitchd Experience Cards) */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-7">
        {filteredPackages.map((pkg) => {
          return (
            <div
              key={pkg.id}
              className="group bg-white rounded-2xl border border-[#eaeae7] hover:border-[#111212] transition-all duration-300 overflow-hidden flex flex-col justify-between shadow-2xs hover:shadow-md"
            >
              <div>
                {/* Photo Header (Hitchd style: arched or rounded top, ratio 16:10) */}
                <div className="relative h-56 w-full overflow-hidden bg-[#fafaf9]">
                  <Image
                    src={pkg.image_url}
                    alt={pkg.title}
                    fill
                    className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  
                  {/* Top Tags */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between">
                    <span className="text-[10px] font-semibold tracking-wider uppercase px-3 py-1 rounded-full bg-white/95 text-[#111212] backdrop-blur-xs shadow-xs">
                      {pkg.destination?.name || 'India'}
                    </span>
                    <span className="text-[10px] font-semibold px-2.5 py-1 rounded-full bg-black/60 text-white backdrop-blur-xs flex items-center gap-1">
                      <Clock className="w-3 h-3" />
                      {pkg.default_nights}N / {pkg.default_nights + 1}D
                    </span>
                  </div>

                  {/* Bottom Image Overlay */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs">
                    <span className="font-medium drop-shadow-xs">
                      {pkg.default_travelers} Travelers
                    </span>
                    <span className="font-bold text-sm drop-shadow-xs">
                      Starting at ₹{(pkg.hotel?.price_per_night || 6500) * pkg.default_nights}
                    </span>
                  </div>
                </div>

                {/* Card Body */}
                <div className="p-5 space-y-3.5">
                  <div>
                    <h3 className="text-lg font-bold text-[#111212] tracking-tight group-hover:text-[#155e42] transition-colors line-clamp-1">
                      {pkg.title}
                    </h3>
                    <p className="text-xs text-[#595954] mt-1 line-clamp-2 leading-relaxed">
                      {pkg.description}
                    </p>
                  </div>

                  {/* Included Highlights */}
                  <div className="space-y-1.5 pt-1 text-xs text-[#595954]">
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#155e42] shrink-0" />
                      <span className="truncate">{pkg.hotel?.name || '4-Star Boutique Resort'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#155e42] shrink-0" />
                      <span className="truncate">{pkg.transport?.name || 'Private Dedicated AC Cab'}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Check className="w-3.5 h-3.5 text-[#155e42] shrink-0" />
                      <span>{pkg.default_activity_ids.length} Handpicked Experiences</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Footer */}
              <div className="px-5 pb-5 pt-2 border-t border-[#fafaf9]">
                <button
                  type="button"
                  onClick={() => onSelectPackage(pkg)}
                  className="w-full btn-hitchd-primary py-2.5 text-xs flex items-center justify-center gap-2 cursor-pointer group-hover:bg-[#155e42]"
                >
                  <span>Customize Itinerary</span>
                  <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
