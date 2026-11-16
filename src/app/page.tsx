'use client';

import React, { useState, useEffect } from 'react';
import { Navbar } from '@/components/Navbar';
import { HeroSection } from '@/components/HeroSection';
import { PackagesGrid } from '@/components/PackagesGrid';
import { PackageCustomizer } from '@/components/PackageCustomizer';
import { AiConciergeChat } from '@/components/AiConciergeChat';
import { BookingsDrawer } from '@/components/BookingsDrawer';
import { BookingModal } from '@/components/BookingModal';
import {
  Destination,
  BasePackage,
  Hotel,
  Transportation,
  Activity,
  PricingBreakdown,
  BookingRecord,
} from '@/types';
import { Loader2, Sparkles, SlidersHorizontal, MapPin, Compass, ShieldCheck, HeartHandshake, Star } from 'lucide-react';

export default function HomePage() {
  const [destinations, setDestinations] = useState<Destination[]>([]);
  const [packages, setPackages] = useState<BasePackage[]>([]);
  const [bookings, setBookings] = useState<BookingRecord[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Active Customizer State
  const [activePackage, setActivePackage] = useState<BasePackage | null>(null);
  const [activeDestination, setActiveDestination] = useState<Destination | null>(null);
  const [availableHotels, setAvailableHotels] = useState<Hotel[]>([]);
  const [availableActivities, setAvailableActivities] = useState<Activity[]>([]);
  const [availableTransport, setAvailableTransport] = useState<Transportation[]>([]);

  // AI external sync trigger
  const [aiUpdateTrigger, setAiUpdateTrigger] = useState<{
    hotel_id?: string;
    transport_id?: string;
    activity_ids?: string[];
    nights?: number;
    travelers?: number;
  } | null>(null);

  // Modals state
  const [isBookingsOpen, setIsBookingsOpen] = useState(false);
  const [bookingModalData, setBookingModalData] = useState<{
    hotel: Hotel | null;
    transport: Transportation | null;
    activities: Activity[];
    pricing: PricingBreakdown;
    nights: number;
    travelers: number;
  } | null>(null);

  // Initial Data Fetch
  useEffect(() => {
    async function loadInitialData() {
      try {
        setIsLoading(true);
        const [destRes, pkgRes, bookRes] = await Promise.all([
          fetch('/api/destinations'),
          fetch('/api/packages'),
          fetch('/api/bookings'),
        ]);

        const destData = await destRes.json();
        const pkgData = await pkgRes.json();
        const bookData = await bookRes.json();

        if (destData.success) setDestinations(destData.destinations);
        if (pkgData.success) setPackages(pkgData.packages);
        if (bookData.success) setBookings(bookData.bookings);

        // Pre-select first package as default customizer template
        if (pkgData.success && pkgData.packages.length > 0) {
          const firstPkg = pkgData.packages[0];
          loadDestinationComponents(firstPkg.destination_id, firstPkg);
        }
      } catch (err) {
        console.error('Initial data fetch error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    loadInitialData();
  }, []);

  // Fetch hotels, activities, transport for a destination
  const loadDestinationComponents = async (
    destinationId: string,
    pkg?: BasePackage,
    overrideNights?: number,
    overrideTravelers?: number
  ) => {
    try {
      const res = await fetch(`/api/components?destination_id=${destinationId}`);
      const data = await res.json();
      if (data.success) {
        setActiveDestination(data.destination);
        setAvailableHotels(data.hotels);
        setAvailableActivities(data.activities);
        setAvailableTransport(data.transportation);

        const effectiveNights = overrideNights || pkg?.default_nights || 4;
        const effectiveTravelers = overrideTravelers || pkg?.default_travelers || 2;

        if (pkg) {
          setActivePackage({
            ...pkg,
            default_nights: effectiveNights,
            default_travelers: effectiveTravelers,
          });
        } else {
          const defaultHotel = data.hotels[0];
          const defaultTransport = data.transportation[0];
          const defaultActivities = data.activities.slice(0, 2);
          setActivePackage({
            id: `custom_${destinationId}`,
            destination_id: destinationId,
            title: `Custom ${data.destination.name} Package`,
            subtitle: `Personalized ${data.destination.name} Holiday`,
            description: data.destination.description,
            default_nights: effectiveNights,
            default_travelers: effectiveTravelers,
            default_hotel_id: defaultHotel?.id || '',
            default_transport_id: defaultTransport?.id || '',
            image_url: data.destination.image_url,
            tags: ['Custom Created', 'Dynamic'],
            default_activity_ids: defaultActivities.map((a: Activity) => a.id),
          });
        }
      }
    } catch (err) {
      console.error('Error fetching components:', err);
    }
  };

  const handleSelectPackage = (pkg: BasePackage) => {
    loadDestinationComponents(pkg.destination_id, pkg);
    const customizerEl = document.getElementById('customizer');
    customizerEl?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleQuickSearch = (destinationId: string, preferredNights?: number, preferredGuests?: number) => {
    const foundPkg = packages.find((p) => p.destination_id === destinationId);
    loadDestinationComponents(destinationId, foundPkg, preferredNights, preferredGuests);
    const customizerEl = document.getElementById('customizer');
    customizerEl?.scrollIntoView({ behavior: 'smooth' });
  };

  const handleRefreshBookings = async () => {
    try {
      const res = await fetch('/api/bookings');
      const data = await res.json();
      if (data.success) setBookings(data.bookings);
    } catch (err) {
      console.error('Error refreshing bookings:', err);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-white text-[#111212]">
      {/* 1. Hitchd Minimalist Top Navigation */}
      <Navbar
        onOpenBookings={() => setIsBookingsOpen(true)}
        savedBookingsCount={bookings.length}
      />

      <main className="flex-1 space-y-24 pb-28">
        {/* 2. Hero Section with Signature Hitchd Typography & Search */}
        <HeroSection
          destinations={destinations}
          onSelectDestination={handleQuickSearch}
        />

        {/* 3. Hitchd Value Section: "How It Works" in 3 Steps */}
        <section id="how-it-works" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto space-y-3 mb-14">
            <span className="text-xs font-semibold uppercase tracking-wider text-[#8c8c85]">
              Seamless Customization
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold tracking-tight text-[#111212]">
              How PackagePro works
            </h2>
            <p className="text-sm text-[#595954] leading-relaxed">
              Plan, customize, and price your Indian holidays without juggling five different booking portals.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="p-8 rounded-2xl bg-[#fafaf9] border border-[#eaeae7] space-y-4 hover:border-[#111212] transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#111212] text-white flex items-center justify-center font-bold text-sm">
                1
              </div>
              <h3 className="text-lg font-bold text-[#111212]">Pick your canvas</h3>
              <p className="text-xs sm:text-sm text-[#595954] leading-relaxed">
                Choose from 8 curated regional starter itineraries spanning Goa beaches, Kashmir snow valleys, Kerala backwaters, and Rajasthan palaces.
              </p>
            </div>

            {/* Step 2 */}
            <div className="p-8 rounded-2xl bg-[#fafaf9] border border-[#eaeae7] space-y-4 hover:border-[#111212] transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#111212] text-white flex items-center justify-center font-bold text-sm">
                2
              </div>
              <h3 className="text-lg font-bold text-[#111212]">Tailor every detail</h3>
              <p className="text-xs sm:text-sm text-[#595954] leading-relaxed">
                Upgrade from standard hotels to private pool villas, pick dedicated Innova Crysta chauffeurs, and bundle 3+ activities for an automatic 10% discount.
              </p>
            </div>

            {/* Step 3 */}
            <div className="p-8 rounded-2xl bg-[#fafaf9] border border-[#eaeae7] space-y-4 hover:border-[#111212] transition-colors">
              <div className="w-10 h-10 rounded-full bg-[#111212] text-white flex items-center justify-center font-bold text-sm">
                3
              </div>
              <h3 className="text-lg font-bold text-[#111212]">Deterministic peace of mind</h3>
              <p className="text-xs sm:text-sm text-[#595954] leading-relaxed">
                Backend business logic calculates exact rupee pricing with 5% GST and zero AI math hallucinations. Generate vouchers with instant reference codes.
              </p>
            </div>
          </div>
        </section>

        {/* 4. Curated Packages Catalog (Hitchd Experience Grid) */}
        <section id="destinations" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#eaeae7] pb-6">
            <div>
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8c8c85]">
                Curated Itineraries
              </span>
              <h2 className="text-3xl font-bold tracking-tight text-[#111212] mt-1">
                A world of experiences across India
              </h2>
            </div>
            <p className="text-xs sm:text-sm text-[#595954] max-w-md sm:text-right">
              Select any package below to open the interactive studio and tweak stays, vehicles, and tours.
            </p>
          </div>

          {isLoading ? (
            <div className="py-24 text-center flex flex-col items-center justify-center">
              <Loader2 className="w-7 h-7 animate-spin text-[#111212] mb-3" />
              <p className="text-xs text-[#595954]">Loading verified regional itineraries in ₹ (INR)...</p>
            </div>
          ) : (
            <PackagesGrid packages={packages} onSelectPackage={handleSelectPackage} />
          )}
        </section>

        {/* 5. Dynamic Customizer Studio */}
        {activeDestination && activePackage && availableHotels.length > 0 && (
          <section id="customizer" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-8 pt-6">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-[#eaeae7] pb-6">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#155e42] flex items-center gap-1.5">
                  <SlidersHorizontal className="w-3.5 h-3.5" />
                  Interactive Studio
                </span>
                <h2 className="text-3xl font-bold tracking-tight text-[#111212] mt-1">
                  Customize Itinerary: {activeDestination.name}
                </h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-[#595954]">Active Template:</span>
                <span className="text-xs font-semibold px-3 py-1 bg-[#fafaf9] border border-[#eaeae7] rounded-full text-[#111212]">
                  {activePackage.title}
                </span>
              </div>
            </div>

            <PackageCustomizer
              destination={activeDestination}
              hotels={availableHotels}
              activities={availableActivities}
              transportation={availableTransport}
              initialHotelId={activePackage.default_hotel_id}
              initialTransportId={activePackage.default_transport_id}
              initialActivityIds={activePackage.default_activity_ids}
              initialNights={activePackage.default_nights}
              initialTravelers={activePackage.default_travelers}
              packageId={activePackage.id}
              externalUpdateTrigger={aiUpdateTrigger}
              onOpenBookingModal={(data) => setBookingModalData(data)}
            />
          </section>
        )}

        {/* 6. AI Concierge Console */}
        {activeDestination && activePackage && (
          <section id="concierge" className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6 pt-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-[#eaeae7] pb-4">
              <div>
                <span className="text-xs font-semibold uppercase tracking-wider text-[#155e42] flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-[#155e42]" />
                  AI Travel Concierge
                </span>
                <h2 className="text-2xl font-bold tracking-tight text-[#111212] mt-1">
                  Ask questions or customize with Gemini
                </h2>
              </div>
              <span className="text-xs font-semibold px-3.5 py-1.5 bg-[#fafaf9] text-[#111212] rounded-full border border-[#eaeae7]">
                Destination: {activeDestination.name}
              </span>
            </div>

            <AiConciergeChat
              destinationName={activeDestination.name}
              currentPackageState={{
                package_id: activePackage.id,
                destination_id: activeDestination.id,
                hotel_id: activePackage.default_hotel_id,
                transport_id: activePackage.default_transport_id,
                activity_ids: activePackage.default_activity_ids,
                nights: activePackage.default_nights,
                travelers: activePackage.default_travelers,
              }}
              onApplyPackageUpdate={(update) => {
                setAiUpdateTrigger(update);
                const customizerEl = document.getElementById('customizer');
                customizerEl?.scrollIntoView({ behavior: 'smooth' });
              }}
            />
          </section>
        )}

        {/* 7. Hitchd Social Proof: "Real Travelers" */}
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="p-10 sm:p-14 rounded-3xl bg-[#fafaf9] border border-[#eaeae7] space-y-10">
            <div className="text-center max-w-xl mx-auto space-y-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-[#8c8c85]">
                Real Stories
              </span>
              <h2 className="text-2xl sm:text-3xl font-bold text-[#111212]">
                Loved by travelers across India
              </h2>
              <p className="text-xs sm:text-sm text-[#595954]">
                See how Indian travelers design custom holidays with transparent rupee pricing.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-6 rounded-2xl bg-white border border-[#eaeae7] space-y-3">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-[#595954] leading-relaxed">
                  &ldquo;We upgraded to the Taj Fort Aguada in Goa and swapped the cab for an Innova Crysta. Seeing the price recalculate instantly with GST gave us total confidence.&rdquo;
                </p>
                <div className="pt-2 border-t border-[#fafaf9]">
                  <p className="font-bold text-xs text-[#111212]">Rohit & Priya Sharma</p>
                  <p className="text-[10px] text-[#8c8c85]">Customized 4N Goa Holiday</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#eaeae7] space-y-3">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-[#595954] leading-relaxed">
                  &ldquo;The AI Concierge understood our request for pure vegetarian Jain food and added the Kolukkumalai tea safari in Munnar. Booking took under 2 minutes.&rdquo;
                </p>
                <div className="pt-2 border-t border-[#fafaf9]">
                  <p className="font-bold text-xs text-[#111212]">Ananya & Devendra Jain</p>
                  <p className="text-[10px] text-[#8c8c85]">Customized 5N Kerala Backwaters</p>
                </div>
              </div>

              <div className="p-6 rounded-2xl bg-white border border-[#eaeae7] space-y-3">
                <div className="flex gap-1 text-amber-400">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                  ))}
                </div>
                <p className="text-xs text-[#595954] leading-relaxed">
                  &ldquo;Adding three activities unlocked an automatic 10% discount on the tours! The PNR booking receipt was ready right away with zero prepayment.&rdquo;
                </p>
                <div className="pt-2 border-t border-[#fafaf9]">
                  <p className="font-bold text-xs text-[#111212]">Vikramaditya Rathore</p>
                  <p className="text-[10px] text-[#8c8c85]">Customized 4N Rajasthan Royal Tour</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* 8. Hitchd Minimalist Footer with Four-Tier Architecture Blueprint */}
      <footer className="border-t border-[#eaeae7] bg-[#fafaf9] py-18 text-[#595954]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-14">
          {/* Engineering Blueprint (Hitchd Clean Numbered Blocks) */}
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-[#eaeae7] pb-4">
              <div>
                <span className="text-[11px] font-semibold text-[#155e42] uppercase tracking-wider">
                  System Architecture
                </span>
                <h3 className="text-lg font-bold text-[#111212] mt-0.5">
                  Four-Tier Decoupled Engineering Model
                </h3>
              </div>
              <p className="text-xs text-[#595954] max-w-md sm:text-right">
                Deterministic dynamic pricing logic & Gemini function calling integrated without calculation hallucinations.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Tier 1 */}
              <div className="p-5 rounded-2xl bg-white border border-[#eaeae7] space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#111212] text-white text-[11px] font-bold flex items-center justify-center">
                    1
                  </span>
                  <h4 className="font-bold text-xs text-[#111212]">Presentation Layer</h4>
                </div>
                <p className="text-[11px] leading-relaxed text-[#595954]">
                  Next.js App Router, React 19, Tailwind CSS, Hitchd editorial minimalist design system, and full INR (₹) formatting.
                </p>
              </div>

              {/* Tier 2 */}
              <div className="p-5 rounded-2xl bg-white border border-[#eaeae7] space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#111212] text-white text-[11px] font-bold flex items-center justify-center">
                    2
                  </span>
                  <h4 className="font-bold text-xs text-[#111212]">Application Layer</h4>
                </div>
                <p className="text-[11px] leading-relaxed text-[#595954]">
                  Next.js API route handlers dispatching Google Gemini function calling for natural language travel customization.
                </p>
              </div>

              {/* Tier 3 */}
              <div className="p-5 rounded-2xl bg-white border border-[#eaeae7] space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#111212] text-white text-[11px] font-bold flex items-center justify-center">
                    3
                  </span>
                  <h4 className="font-bold text-xs text-[#111212]">Business Logic Layer</h4>
                </div>
                <p className="text-[11px] leading-relaxed text-[#595954]">
                  Deterministic dynamic pricing with room calculation <code className="text-[10px] bg-[#fafaf9] px-1 rounded">ceil(pax/2)</code>, 10% 3+ activity bundle discount, and 5% GST.
                </p>
              </div>

              {/* Tier 4 */}
              <div className="p-5 rounded-2xl bg-white border border-[#eaeae7] space-y-2">
                <div className="flex items-center gap-2.5">
                  <span className="w-6 h-6 rounded-full bg-[#111212] text-white text-[11px] font-bold flex items-center justify-center">
                    4
                  </span>
                  <h4 className="font-bold text-xs text-[#111212]">Database Layer</h4>
                </div>
                <p className="text-[11px] leading-relaxed text-[#595954]">
                  Relational SQLite storage with foreign key constraints, 24 verified activities, and immutable booking confirmation records.
                </p>
              </div>
            </div>
          </div>

          {/* Bottom Copyright & Currency Note */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-[#eaeae7] text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-[#111212]">PackagePro</span>
              <span>·</span>
              <span>AI-Powered Dynamic Travel Package Customization</span>
            </div>
            <div className="flex items-center gap-4 text-[#8c8c85]">
              <span>All fares in Indian Rupees (₹ / INR)</span>
              <span>·</span>
              <span>5% GST Included</span>
            </div>
          </div>
        </div>
      </footer>

      {/* Bookings Drawer */}
      <BookingsDrawer
        isOpen={isBookingsOpen}
        onClose={() => setIsBookingsOpen(false)}
        bookings={bookings}
      />

      {/* Booking Confirmation & Voucher Generation Modal */}
      {bookingModalData && activeDestination && (
        <BookingModal
          isOpen={true}
          onClose={() => setBookingModalData(null)}
          destinationName={activeDestination.name}
          destinationId={activeDestination.id}
          hotel={bookingModalData.hotel}
          transport={bookingModalData.transport}
          activities={bookingModalData.activities}
          pricing={bookingModalData.pricing}
          packageId={activePackage?.id}
          onBookingSuccess={() => {
            handleRefreshBookings();
          }}
        />
      )}
    </div>
  );
}
