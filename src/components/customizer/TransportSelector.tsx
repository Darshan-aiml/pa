'use client';

import React, { useState } from 'react';
import { Transportation, TierType } from '@/types';
import { formatINR } from '@/lib/format';
import { Plane, Car, Train, Check, Ban, Sparkles } from 'lucide-react';

interface TransportSelectorProps {
  transportation: Transportation[];
  selectedTransportId: string;
  onSelectTransport: (transportId: string) => void;
}

export const TransportSelector: React.FC<TransportSelectorProps> = ({
  transportation,
  selectedTransportId,
  onSelectTransport,
}) => {
  const [selectedTierFilter, setSelectedTierFilter] = useState<'all' | 'budget' | 'standard' | 'luxury'>('all');

  const currentSelected = transportation.find((t) => t.id === selectedTransportId) || null;

  const filteredTransport = transportation.filter((t) => {
    if (selectedTierFilter === 'all') return true;
    return t.tier === selectedTierFilter;
  });

  const getIcon = (type: string) => {
    if (type.includes('flight')) return <Plane className="w-4 h-4 text-[#111212]" />;
    if (type.includes('train')) return <Train className="w-4 h-4 text-[#155e42]" />;
    return <Car className="w-4 h-4 text-[#111212]" />;
  };

  const getTierBadge = (tier?: TierType) => {
    switch (tier) {
      case 'budget':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#edf6f2] text-[#155e42] border border-[#155e42]/20">
            Budget Tier
          </span>
        );
      case 'luxury':
      case 'ultra':
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#111212] text-white">
            Luxury Tier
          </span>
        );
      case 'standard':
      default:
        return (
          <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#fafaf9] text-[#111212] border border-[#eaeae7]">
            Standard Tier
          </span>
        );
    }
  };

  return (
    <section aria-labelledby="transport-heading" className="space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-[#eaeae7]">
        <div>
          <h3 id="transport-heading" className="text-sm font-bold text-[#111212]">
            Transportation & Transfers
          </h3>
          <p className="text-xs text-[#595954]">
            Select between Budget, Standard, or Luxury transit, or unselect to self-drive.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1.5 text-xs text-[#111212] bg-[#fafaf9] px-3.5 py-1.5 rounded-full border border-[#eaeae7] font-medium">
            <span>Selected: {currentSelected ? `${currentSelected.name} (${currentSelected.tier || 'standard'})` : 'Self-Arranged (No Transit)'}</span>
          </div>
          {selectedTransportId && (
            <button
              type="button"
              onClick={() => onSelectTransport('')}
              className="text-xs text-[#595954] hover:text-[#111212] underline cursor-pointer"
            >
              Unselect
            </button>
          )}
        </div>
      </div>

      {/* Tier Filter Tabs (Budget / Standard / Luxury) */}
      <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
        {(['all', 'budget', 'standard', 'luxury'] as const).map((tierKey) => (
          <button
            key={tierKey}
            type="button"
            onClick={() => setSelectedTierFilter(tierKey)}
            className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all cursor-pointer ${
              selectedTierFilter === tierKey
                ? 'bg-[#111212] text-white shadow-xs'
                : 'bg-white border border-[#eaeae7] text-[#595954] hover:border-[#111212] hover:text-[#111212]'
            }`}
          >
            {tierKey === 'all'
              ? 'All Choices'
              : tierKey === 'budget'
              ? '🟢 Budget Choices'
              : tierKey === 'standard'
              ? '🔵 Standard Choices'
              : '🟣 Luxury Choices'}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {/* Option 0: No transport needed (Unselect) */}
        {selectedTierFilter === 'all' && (
          <button
            type="button"
            onClick={() => onSelectTransport('')}
            aria-pressed={!selectedTransportId}
            className={`text-left w-full rounded-2xl border p-5 transition-all bg-white flex flex-col justify-between cursor-pointer ${
              !selectedTransportId
                ? 'border-[#111212] ring-2 ring-[#111212]/10 shadow-sm bg-[#fafaf9]'
                : 'border-[#eaeae7] hover:border-[#111212] hover:shadow-2xs'
            }`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="w-10 h-10 rounded-full bg-[#fafaf9] border border-[#eaeae7] flex items-center justify-center text-[#111212]">
                  <Ban className="w-4 h-4 text-[#8c8c85]" />
                </div>
                {!selectedTransportId && (
                  <div className="w-5 h-5 rounded-full bg-[#111212] text-white flex items-center justify-center">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                )}
              </div>

              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#fafaf9] text-[#8c8c85] border border-[#eaeae7] inline-block mb-1">
                  Self-Transit
                </span>
                <h4 className="font-bold text-[#111212] text-xs sm:text-sm leading-snug">
                  No transport needed
                </h4>
                <p className="text-[11px] text-[#155e42] font-semibold mt-0.5">
                  Self-Drive / Local Metros / Arranging Own Cabs
                </p>
              </div>

              <p className="text-xs text-[#595954] leading-relaxed">
                Exclude flights, intercity trains, and private cabs. You arrange your own transit. Stays and booked tours remain coordinated.
              </p>
            </div>

            <div className="pt-3 border-t border-[#eaeae7] mt-5 flex items-center justify-between">
              <div>
                <span className="text-sm font-bold text-[#111212]">₹0</span>
                <span className="text-[10px] text-[#8c8c85] block">no transit fee</span>
              </div>
              <span
                className={`text-xs font-semibold px-3 py-1 rounded-full ${
                  !selectedTransportId
                    ? 'bg-[#111212] text-white'
                    : 'bg-[#fafaf9] border border-[#eaeae7] text-[#111212]'
                }`}
              >
                {!selectedTransportId ? 'Selected' : 'Choose This'}
              </span>
            </div>
          </button>
        )}

        {/* Transportation Options (Budget, Standard, Luxury) */}
        {filteredTransport.map((trans) => {
          const isSelected = trans.id === selectedTransportId;

          return (
            <button
              key={trans.id}
              type="button"
              onClick={() => onSelectTransport(isSelected ? '' : trans.id)}
              aria-pressed={isSelected}
              className={`text-left w-full rounded-2xl border p-5 transition-all bg-white flex flex-col justify-between cursor-pointer ${
                isSelected
                  ? 'border-[#111212] ring-2 ring-[#111212]/10 shadow-sm'
                  : 'border-[#eaeae7] hover:border-[#111212] hover:shadow-2xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="p-2.5 rounded-full bg-[#fafaf9] border border-[#eaeae7]">
                    {getIcon(trans.type)}
                  </div>
                  <div className="flex items-center gap-1.5">
                    {getTierBadge(trans.tier)}
                    {isSelected && (
                      <div className="w-5 h-5 rounded-full bg-[#111212] text-white flex items-center justify-center">
                        <Check className="w-3.5 h-3.5 stroke-[3]" />
                      </div>
                    )}
                  </div>
                </div>

                <div>
                  <h4 className="font-bold text-[#111212] text-xs sm:text-sm leading-snug">
                    {trans.name}
                  </h4>
                  <p className="text-[11px] text-[#155e42] font-semibold mt-0.5">
                    {trans.provider}
                  </p>
                </div>

                <p className="text-xs text-[#595954] leading-relaxed line-clamp-3">
                  {trans.description}
                </p>
              </div>

              <div className="pt-3 border-t border-[#eaeae7] mt-5 flex items-center justify-between">
                <div>
                  <span className="text-sm font-bold text-[#111212]">
                    {formatINR(trans.price)}
                  </span>
                  <span className="text-[10px] text-[#8c8c85] block">
                    {trans.is_per_person ? 'per traveler' : 'total vehicle cost'}
                  </span>
                </div>
                <span
                  className={`text-xs font-semibold px-3 py-1 rounded-full ${
                    isSelected
                      ? 'bg-[#111212] text-white'
                      : 'bg-[#fafaf9] border border-[#eaeae7] text-[#111212]'
                  }`}
                >
                  {isSelected ? '✓ Selected (Click to unselect)' : 'Choose Transit'}
                </span>
              </div>
            </button>
          );
        })}
      </div>
    </section>
  );
};
