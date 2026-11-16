'use client';

import React from 'react';
import Image from 'next/image';
import { Activity } from '@/types';
import { formatINR } from '@/lib/format';
import { Star, Check, Plus, Clock, Tag } from 'lucide-react';

interface ActivitySelectorProps {
  activities: Activity[];
  selectedActivityIds: string[];
  onToggleActivity: (activityId: string) => void;
}

export const ActivitySelector: React.FC<ActivitySelectorProps> = ({
  activities,
  selectedActivityIds,
  onToggleActivity,
}) => {
  const isBundleUnlocked = selectedActivityIds.length >= 3;

  return (
    <section aria-labelledby="activities-heading" className="space-y-4">
      {/* Bundle Offer Banner (Hitchd perk style) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 p-4 rounded-2xl border border-[#eaeae7] bg-[#fafaf9] text-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-full bg-[#155e42]/10 text-[#155e42] flex items-center justify-center shrink-0">
            <Tag className="w-4 h-4" />
          </div>
          <span className="text-[#111212] font-medium leading-relaxed">
            <strong>Experience Bundle:</strong> Select 3 or more activities to unlock an automatic{' '}
            <strong className="text-[#155e42]">10% tour savings</strong> on all selected excursions!
          </span>
        </div>
        <span
          className={`font-semibold px-3 py-1 rounded-full text-[11px] self-start sm:self-auto shrink-0 ${
            isBundleUnlocked
              ? 'bg-[#155e42] text-white'
              : 'bg-white border border-[#eaeae7] text-[#111212]'
          }`}
        >
          {isBundleUnlocked
            ? '✓ 10% Discount Applied'
            : `Add ${3 - selectedActivityIds.length} more to unlock`}
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {activities.map((act) => {
          const isSelected = selectedActivityIds.includes(act.id);

          return (
            <button
              key={act.id}
              type="button"
              onClick={() => onToggleActivity(act.id)}
              aria-pressed={isSelected}
              className={`text-left w-full rounded-2xl border transition-all overflow-hidden bg-white cursor-pointer ${
                isSelected
                  ? 'border-[#111212] ring-2 ring-[#111212]/10 shadow-sm'
                  : 'border-[#eaeae7] hover:border-[#111212] hover:shadow-2xs'
              }`}
            >
              <div className="relative h-36 w-full bg-[#fafaf9]">
                <Image
                  src={act.image_url}
                  alt={act.name}
                  fill
                  className="object-cover"
                  sizes="(max-width: 768px) 100vw, 50vw"
                />
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="text-[10px] font-semibold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-black/75 text-white">
                    {act.category}
                  </span>
                  <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full bg-amber-400 text-[#111212] flex items-center gap-0.5">
                    <Star className="w-2.5 h-2.5 fill-[#111212]" />
                    {act.rating}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  {isSelected ? (
                    <div className="bg-[#111212] text-white p-1 rounded-full shadow-sm">
                      <Check className="w-3.5 h-3.5 stroke-[3]" />
                    </div>
                  ) : (
                    <div className="bg-white/95 text-[#111212] p-1 rounded-full border border-[#eaeae7] shadow-xs">
                      <Plus className="w-3.5 h-3.5" />
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 space-y-2.5">
                <div className="flex justify-between items-start gap-2">
                  <h4 className="font-bold text-[#111212] text-xs sm:text-sm line-clamp-1">
                    {act.name}
                  </h4>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-bold text-[#111212]">
                      {formatINR(act.price_per_person)}
                    </span>
                    <span className="text-[10px] text-[#8c8c85] block">/ guest</span>
                  </div>
                </div>

                <p className="text-xs text-[#595954] line-clamp-2 leading-relaxed">
                  {act.description}
                </p>

                <div className="flex items-center gap-2 text-[11px] text-[#8c8c85]">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3 text-[#8c8c85]" />
                    {act.duration_hours} hrs
                  </span>
                  <span>·</span>
                  <span className="truncate">{act.included_items.length} inclusions</span>
                </div>

                <div className="pt-2 border-t border-[#eaeae7] flex items-center justify-between text-[11px]">
                  <span className="text-[#8c8c85] truncate max-w-[200px]">
                    Includes: {act.included_items.join(', ')}
                  </span>
                  <span
                    className={`font-semibold px-3 py-1 rounded-full ${
                      isSelected
                        ? 'bg-[#111212] text-white'
                        : 'bg-[#fafaf9] border border-[#eaeae7] text-[#111212]'
                    }`}
                  >
                    {isSelected ? '✓ Added' : '+ Add to Trip'}
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
