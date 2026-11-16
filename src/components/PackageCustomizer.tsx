'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import {
  Hotel as HotelIcon,
  Plane,
  Compass,
  Calendar,
  Users,
} from 'lucide-react';
import {
  Hotel,
  Activity,
  Transportation,
  PricingBreakdown,
  Destination,
} from '@/types';
import { HotelSelector } from './customizer/HotelSelector';
import { ActivitySelector } from './customizer/ActivitySelector';
import { TransportSelector } from './customizer/TransportSelector';
import { ItineraryView } from './customizer/ItineraryView';
import { PricingCard } from './customizer/PricingCard';

interface PackageCustomizerProps {
  destination: Destination;
  hotels: Hotel[];
  activities: Activity[];
  transportation: Transportation[];
  initialHotelId: string;
  initialTransportId: string;
  initialActivityIds: string[];
  initialNights: number;
  initialTravelers: number;
  packageId?: string;
  onOpenBookingModal: (data: {
    hotel: Hotel | null;
    transport: Transportation | null;
    activities: Activity[];
    pricing: PricingBreakdown;
    nights: number;
    travelers: number;
  }) => void;
  externalUpdateTrigger?: {
    hotel_id?: string;
    transport_id?: string;
    activity_ids?: string[];
    nights?: number;
    travelers?: number;
  } | null;
}

export const PackageCustomizer: React.FC<PackageCustomizerProps> = ({
  destination,
  hotels,
  activities,
  transportation,
  initialHotelId,
  initialTransportId,
  initialActivityIds,
  initialNights,
  initialTravelers,
  packageId,
  onOpenBookingModal,
  externalUpdateTrigger,
}) => {
  const [selectedHotelId, setSelectedHotelId] = useState<string>(initialHotelId);
  const [selectedTransportId, setSelectedTransportId] = useState<string>(initialTransportId);
  const [selectedActivityIds, setSelectedActivityIds] = useState<string[]>(initialActivityIds);
  const [nights, setNights] = useState<number>(initialNights);
  const [travelers, setTravelers] = useState<number>(initialTravelers);
  const [pricing, setPricing] = useState<PricingBreakdown | null>(null);
  const [isRecalculating, setIsRecalculating] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'hotel' | 'activities' | 'transport' | 'itinerary'>('hotel');

  // Sync state whenever props change from parent (such as selecting a different package or search bar override)
  useEffect(() => {
    setSelectedHotelId(initialHotelId);
  }, [initialHotelId]);

  useEffect(() => {
    setSelectedTransportId(initialTransportId);
  }, [initialTransportId]);

  useEffect(() => {
    setSelectedActivityIds(initialActivityIds);
  }, [initialActivityIds]);

  useEffect(() => {
    setNights(initialNights);
  }, [initialNights]);

  useEffect(() => {
    setTravelers(initialTravelers);
  }, [initialTravelers]);

  // External sync from Gemini Concierge tool calls
  useEffect(() => {
    if (externalUpdateTrigger) {
      if (externalUpdateTrigger.hotel_id !== undefined) setSelectedHotelId(externalUpdateTrigger.hotel_id);
      if (externalUpdateTrigger.transport_id !== undefined) setSelectedTransportId(externalUpdateTrigger.transport_id);
      if (externalUpdateTrigger.activity_ids !== undefined) setSelectedActivityIds(externalUpdateTrigger.activity_ids);
      if (externalUpdateTrigger.nights !== undefined) setNights(externalUpdateTrigger.nights);
      if (externalUpdateTrigger.travelers !== undefined) setTravelers(externalUpdateTrigger.travelers);
    }
  }, [externalUpdateTrigger]);

  // Recalculate dynamic pricing via backend on any change (including unselecting to empty)
  useEffect(() => {
    let isCancelled = false;

    async function recalculate() {
      setIsRecalculating(true);
      try {
        const res = await fetch('/api/pricing/calculate', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            hotel_id: selectedHotelId || '',
            transport_id: selectedTransportId || '',
            activity_ids: selectedActivityIds,
            nights,
            travelers,
            package_id: packageId,
          }),
        });
        const data = await res.json();
        if (!isCancelled && data.success && data.pricing) {
          setPricing(data.pricing);
        }
      } catch (err) {
        console.error('Pricing calculation error:', err);
      } finally {
        if (!isCancelled) setIsRecalculating(false);
      }
    }

    recalculate();
    return () => {
      isCancelled = true;
    };
  }, [selectedHotelId, selectedTransportId, selectedActivityIds, nights, travelers, packageId]);

  const toggleActivity = (id: string) => {
    setSelectedActivityIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectHotel = (id: string) => {
    // If clicking the currently selected hotel, toggle it off (unselect)
    setSelectedHotelId((prev) => (prev === id ? '' : id));
  };

  const handleSelectTransport = (id: string) => {
    // If clicking the currently selected transport, toggle it off (unselect)
    setSelectedTransportId((prev) => (prev === id ? '' : id));
  };

  const selectedHotel = hotels.find((h) => h.id === selectedHotelId) || null;
  const selectedTransport = transportation.find((t) => t.id === selectedTransportId) || null;
  const selectedActivitiesList = activities.filter((a) => selectedActivityIds.includes(a.id));

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
      {/* Main Workspace (8 columns) */}
      <div className="lg:col-span-8 space-y-6">
        {/* Destination Header Banner (Hitchd 24px rounded cover) */}
        <div className="relative rounded-2xl overflow-hidden border border-[#eaeae7] bg-[#111212] shadow-xs">
          <div className="relative h-56 sm:h-64 w-full">
            <Image
              src={destination.image_url}
              alt={destination.name}
              fill
              className="object-cover opacity-85"
              priority
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
            <div className="absolute bottom-6 left-6 right-6 flex items-end justify-between">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-wider px-3 py-1 rounded-full bg-white/95 text-[#111212] backdrop-blur-xs">
                  {destination.region} · Popular Season: {destination.popular_season}
                </span>
                <h2 className="text-2xl sm:text-3xl font-bold text-white mt-2 tracking-tight">
                  {destination.name} Studio
                </h2>
                <p className="text-xs sm:text-sm text-white/80 mt-1 line-clamp-1 max-w-xl">
                  {destination.description}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Global Controls: Nights & Travelers */}
        <div className="p-4 rounded-2xl bg-white border border-[#eaeae7] shadow-2xs flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6 sm:gap-10">
            {/* Duration */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#fafaf9] border border-[#eaeae7] flex items-center justify-center text-[#111212]">
                <Calendar className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8c8c85] block">
                  Duration
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <button
                    type="button"
                    aria-label="Decrease nights"
                    onClick={() => setNights((n) => Math.max(1, n - 1))}
                    className="w-7 h-7 rounded-full bg-[#fafaf9] hover:bg-[#eaeae7] font-bold text-[#111212] flex items-center justify-center text-xs transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold text-xs sm:text-sm text-[#111212] min-w-16 text-center">
                    {nights} Nights
                  </span>
                  <button
                    type="button"
                    aria-label="Increase nights"
                    onClick={() => setNights((n) => Math.min(21, n + 1))}
                    className="w-7 h-7 rounded-full bg-[#fafaf9] hover:bg-[#eaeae7] font-bold text-[#111212] flex items-center justify-center text-xs transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>

            {/* Travelers */}
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-full bg-[#fafaf9] border border-[#eaeae7] flex items-center justify-center text-[#111212]">
                <Users className="w-4 h-4" />
              </div>
              <div>
                <span className="text-[10px] font-semibold uppercase tracking-wider text-[#8c8c85] block">
                  Travelers
                </span>
                <div className="flex items-center gap-2 mt-0.5">
                  <button
                    type="button"
                    aria-label="Decrease travelers"
                    onClick={() => setTravelers((t) => Math.max(1, t - 1))}
                    className="w-7 h-7 rounded-full bg-[#fafaf9] hover:bg-[#eaeae7] font-bold text-[#111212] flex items-center justify-center text-xs transition-colors cursor-pointer"
                  >
                    -
                  </button>
                  <span className="font-bold text-xs sm:text-sm text-[#111212] min-w-16 text-center">
                    {travelers} Guests
                  </span>
                  <button
                    type="button"
                    aria-label="Increase travelers"
                    onClick={() => setTravelers((t) => Math.min(12, t + 1))}
                    className="w-7 h-7 rounded-full bg-[#fafaf9] hover:bg-[#eaeae7] font-bold text-[#111212] flex items-center justify-center text-xs transition-colors cursor-pointer"
                  >
                    +
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-[#8c8c85] block uppercase font-semibold tracking-wider">
              {selectedHotel ? 'Calculated Rooms' : 'Accommodation Status'}
            </span>
            <p className="text-xs font-bold text-[#111212] mt-0.5">
              {selectedHotel ? `${Math.ceil(travelers / 2)} Room(s)` : 'Self-Arranged (₹0)'}
            </p>
          </div>
        </div>

        {/* Tab Navigation (Hitchd segment pill bar) */}
        <div className="p-1.5 rounded-full bg-[#fafaf9] border border-[#eaeae7] flex items-center gap-1 overflow-x-auto no-scrollbar">
          <button
            type="button"
            onClick={() => setActiveTab('hotel')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'hotel'
                ? 'bg-[#111212] text-white shadow-xs'
                : 'text-[#595954] hover:text-[#111212]'
            }`}
          >
            <HotelIcon className="w-3.5 h-3.5" />
            <span>Stays ({selectedHotel ? '1 Selected' : 'Unselected'})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('activities')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'activities'
                ? 'bg-[#111212] text-white shadow-xs'
                : 'text-[#595954] hover:text-[#111212]'
            }`}
          >
            <Compass className="w-3.5 h-3.5" />
            <span>
              Experiences ({selectedActivityIds.length}/{activities.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('transport')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'transport'
                ? 'bg-[#111212] text-white shadow-xs'
                : 'text-[#595954] hover:text-[#111212]'
            }`}
          >
            <Plane className="w-3.5 h-3.5" />
            <span>Transfers ({selectedTransport ? selectedTransport.tier || 'Selected' : 'Unselected'})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('itinerary')}
            className={`flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all whitespace-nowrap cursor-pointer ${
              activeTab === 'itinerary'
                ? 'bg-[#111212] text-white shadow-xs'
                : 'text-[#595954] hover:text-[#111212]'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            <span>Itinerary Schedule</span>
          </button>
        </div>

        {/* Tab Panels */}
        {activeTab === 'hotel' && (
          <HotelSelector
            hotels={hotels}
            selectedHotelId={selectedHotelId}
            onSelectHotel={handleSelectHotel}
          />
        )}

        {activeTab === 'activities' && (
          <ActivitySelector
            activities={activities}
            selectedActivityIds={selectedActivityIds}
            onToggleActivity={toggleActivity}
          />
        )}

        {activeTab === 'transport' && (
          <TransportSelector
            transportation={transportation}
            selectedTransportId={selectedTransportId}
            onSelectTransport={handleSelectTransport}
          />
        )}

        {activeTab === 'itinerary' && (
          <ItineraryView
            destination={destination}
            nights={nights}
            hotel={selectedHotel}
            transport={selectedTransport}
            activities={selectedActivitiesList}
          />
        )}
      </div>

      {/* Pricing Card (4 columns) */}
      <div className="lg:col-span-4 sticky top-24">
        <PricingCard
          pricing={pricing}
          isRecalculating={isRecalculating}
          hotel={selectedHotel}
          transport={selectedTransport}
          activitiesCount={selectedActivityIds.length}
          nights={nights}
          travelers={travelers}
          onBookNow={() => {
            if (pricing) {
              onOpenBookingModal({
                hotel: selectedHotel,
                transport: selectedTransport,
                activities: selectedActivitiesList,
                pricing,
                nights,
                travelers,
              });
            }
          }}
        />
      </div>
    </div>
  );
};
