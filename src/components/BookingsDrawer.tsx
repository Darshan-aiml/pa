'use client';

import React from 'react';
import { X, Calendar, Users, MapPin, CheckCircle, Bookmark, Hotel, Plane } from 'lucide-react';
import { BookingRecord } from '@/types';
import { formatINR } from '@/lib/format';

interface BookingsDrawerProps {
  isOpen: boolean;
  onClose: () => void;
  bookings: BookingRecord[];
}

export const BookingsDrawer: React.FC<BookingsDrawerProps> = ({
  isOpen,
  onClose,
  bookings,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="absolute inset-y-0 right-0 max-w-full flex pl-8">
        <div className="w-screen max-w-md bg-white shadow-2xl flex flex-col border-l border-[#eaeae7]">
          {/* Header */}
          <div className="p-5 border-b border-[#eaeae7] flex items-center justify-between bg-[#fafaf9]">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-full bg-[#111212] text-white flex items-center justify-center">
                <Bookmark className="w-4 h-4 text-white" />
              </div>
              <h2 className="text-base font-bold text-[#111212]">My Reserved Itineraries</h2>
            </div>
            <button
              type="button"
              onClick={onClose}
              aria-label="Close drawer"
              className="p-2 rounded-full text-[#595954] hover:text-[#111212] hover:bg-[#eaeae7] transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Bookings Feed */}
          <div className="flex-1 overflow-y-auto p-5 space-y-4">
            {bookings.length === 0 ? (
              <div className="text-center py-16 text-[#595954]">
                <Bookmark className="w-10 h-10 mx-auto stroke-1 mb-3 text-[#d6d6d1]" />
                <p className="text-sm font-semibold text-[#111212]">No saved reservations yet</p>
                <p className="text-xs text-[#8c8c85] mt-1 max-w-xs mx-auto">
                  Customize any package and click &apos;Reserve Custom Journey&apos; to view it here.
                </p>
              </div>
            ) : (
              bookings.map((b) => {
                let parsedActivities: string[] = [];
                try {
                  parsedActivities = JSON.parse(b.activities_list);
                } catch {
                  parsedActivities = [];
                }

                return (
                  <div
                    key={b.id}
                    className="p-5 rounded-2xl border border-[#eaeae7] bg-[#fafaf9] space-y-3 shadow-2xs hover:border-[#111212] transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div>
                        <span className="text-[10px] font-mono font-bold px-2.5 py-1 rounded-full bg-white text-[#111212] border border-[#eaeae7]">
                          {b.booking_code}
                        </span>
                        <h3 className="font-bold text-[#111212] text-sm mt-1.5 flex items-center gap-1.5">
                          <MapPin className="w-3.5 h-3.5 text-[#155e42]" />
                          {b.destination_name}
                        </h3>
                      </div>
                      <span className="text-[10px] font-semibold text-[#155e42] bg-[#edf6f2] px-2.5 py-1 rounded-full border border-[#155e42]/20 flex items-center gap-1">
                        <CheckCircle className="w-3 h-3 text-[#155e42]" />
                        Confirmed
                      </span>
                    </div>

                    <div className="text-xs text-[#595954] space-y-1.5">
                      <div className="flex items-center gap-3 text-[11px]">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-3 h-3 text-[#8c8c85]" />
                          {b.nights} nights ({b.start_date})
                        </span>
                        <span className="flex items-center gap-1">
                          <Users className="w-3 h-3 text-[#8c8c85]" />
                          {b.travelers} guests
                        </span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#111212] font-medium">
                        <Hotel className="w-3 h-3 text-[#155e42] shrink-0" />
                        <span className="truncate">{b.hotel_name}</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-[#595954]">
                        <Plane className="w-3 h-3 text-[#111212] shrink-0" />
                        <span className="truncate">{b.transport_name}</span>
                      </div>
                    </div>

                    {parsedActivities.length > 0 && (
                      <div className="pt-2 border-t border-[#eaeae7] flex flex-wrap gap-1">
                        {parsedActivities.map((actName, idx) => (
                          <span
                            key={idx}
                            className="text-[10px] bg-white text-[#595954] border border-[#eaeae7] px-2 py-0.5 rounded-full"
                          >
                            {actName}
                          </span>
                        ))}
                      </div>
                    )}

                    <div className="pt-2.5 border-t border-[#eaeae7] flex items-center justify-between text-xs">
                      <span className="text-[#8c8c85]">Total Fares (INR):</span>
                      <span className="font-bold text-[#111212] text-sm">{formatINR(b.final_total)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
