import React, { useState, useEffect, useMemo } from 'react';
import {
  Calendar as CalendarIcon,
  CheckCircle2,
  AlertCircle,
  Clock,
  Info,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { api } from '../../services/api';

export default function AvailabilityCalendar({
  productId,
  duration = '3_days',
  onDatesChange
}) {
  const today = useMemo(() => new Date(), []);
  const [currentMonthDate, setCurrentMonthDate] = useState(() => new Date());

  const [selectedStartDate, setSelectedStartDate] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() + 2); // Default 2 days in advance
    return d.toISOString().split('T')[0];
  });

  const [selectedEndDate, setSelectedEndDate] = useState('');
  const [bookedRanges, setBookedRanges] = useState([]);
  const [hostBlocks, setHostBlocks] = useState([]);
  const [isChecking, setIsChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState(true);
  const [conflict, setConflict] = useState(null);

  // Helper: map duration string to number of days
  const getDurationDays = (dur) => {
    switch (dur) {
      case '3_hours': return 0;
      case '1_day': return 1;
      case '3_days': return 3;
      case '5_days': return 5;
      case '7_days': return 7;
      default: return 3;
    }
  };

  // Recalculate end date whenever startDate or duration changes
  useEffect(() => {
    if (!selectedStartDate) return;
    const start = new Date(selectedStartDate);
    const end = new Date(start);
    const days = getDurationDays(duration);
    if (days > 0) {
      end.setDate(end.getDate() + days);
    }
    const endStr = end.toISOString().split('T')[0];
    setSelectedEndDate(endStr);
  }, [selectedStartDate, duration]);

  // Query backend checkAvailability
  useEffect(() => {
    if (!productId || !selectedStartDate || !selectedEndDate) return;

    let active = true;
    setIsChecking(true);

    api.products.checkAvailability(productId, selectedStartDate, selectedEndDate)
      .then((data) => {
        if (!active) return;
        setIsAvailable(data.isAvailable);
        setConflict(data.conflict);
        setBookedRanges(data.bookedRanges || []);
        setHostBlocks(data.hostBlocks || []);

        if (onDatesChange) {
          onDatesChange({
            startDate: selectedStartDate,
            endDate: selectedEndDate,
            isAvailable: data.isAvailable
          });
        }
      })
      .catch((err) => {
        console.error('Availability check failed:', err);
      })
      .finally(() => {
        if (active) setIsChecking(false);
      });

    return () => {
      active = false;
    };
  }, [productId, selectedStartDate, selectedEndDate, duration]);

  // Check if a given date string is booked or in host blackout
  const isDateBlocked = (dateStr) => {
    const target = new Date(dateStr).getTime();
    
    // Check customer bookings
    const isBooked = bookedRanges.some((range) => {
      const s = new Date(new Date(range.startDate).toISOString().split('T')[0]).getTime();
      const e = new Date(new Date(range.endDate).toISOString().split('T')[0]).getTime();
      return target >= s && target <= e;
    });

    if (isBooked) return { blocked: true, reason: 'Reserved by client' };

    // Check host blackout
    const isHostBlocked = hostBlocks.some((block) => {
      const s = new Date(new Date(block.startDate).toISOString().split('T')[0]).getTime();
      const e = new Date(new Date(block.endDate).toISOString().split('T')[0]).getTime();
      return target >= s && target <= e;
    });

    if (isHostBlocked) return { blocked: true, reason: 'Boutique maintenance' };

    return { blocked: false };
  };

  // Check if date falls in selected range
  const isDateInSelectedRange = (dateStr) => {
    if (!selectedStartDate || !selectedEndDate) return false;
    const target = new Date(dateStr).getTime();
    const s = new Date(selectedStartDate).getTime();
    const e = new Date(selectedEndDate).getTime();
    return target >= s && target <= e;
  };

  // Month navigation
  const prevMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() - 1, 1));
  };

  const nextMonth = () => {
    setCurrentMonthDate(new Date(currentMonthDate.getFullYear(), currentMonthDate.getMonth() + 1, 1));
  };

  // Build calendar matrix
  const year = currentMonthDate.getFullYear();
  const month = currentMonthDate.getMonth();
  const firstDayIndex = new Date(year, month, 1).getDay();
  const totalDaysInMonth = new Date(year, month + 1, 0).getDate();

  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  const handleDayClick = (dayNum) => {
    const d = new Date(year, month, dayNum);
    // Prevent past dates
    const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
    if (d < todayZero) return;

    const dateStr = d.toISOString().split('T')[0];
    const { blocked } = isDateBlocked(dateStr);
    if (blocked) return;

    setSelectedStartDate(dateStr);
  };

  // Quick preset shortcuts
  const selectWeekend = (weeksAhead = 0) => {
    const d = new Date();
    const dayOfWeek = d.getDay(); // 0 is Sun, 6 is Sat
    const daysUntilFriday = ((5 - dayOfWeek + 7) % 7) + (weeksAhead * 7);
    d.setDate(d.getDate() + (daysUntilFriday === 0 ? 7 : daysUntilFriday));
    setSelectedStartDate(d.toISOString().split('T')[0]);
  };

  return (
    <div className="bg-white rounded-3xl p-5 sm:p-6 border border-black/10 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-black/5 pb-3">
        <div className="flex items-center gap-2">
          <div className="w-7 h-7 rounded-lg bg-noir text-emeraldRent flex items-center justify-center">
            <CalendarIcon className="w-3.5 h-3.5" />
          </div>
          <div>
            <h4 className="font-display text-xs sm:text-sm font-extrabold text-noir uppercase tracking-wider">
              Occasion Rental Calendar
            </h4>
            <p className="text-[10px] text-ash">
              Select your event date. The outfit is held exclusively for your booking duration.
            </p>
          </div>
        </div>

        {/* Quick Date Presets */}
        <div className="flex items-center gap-1 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => selectWeekend(0)}
            className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-noir text-[10px] font-bold border border-black/5 transition-colors"
          >
            This Weekend
          </button>
          <button
            type="button"
            onClick={() => selectWeekend(1)}
            className="px-2.5 py-1 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-noir text-[10px] font-bold border border-black/5 transition-colors"
          >
            Next Weekend
          </button>
        </div>
      </div>

      {/* Mini Calendar Grid View */}
      <div className="bg-neutral-50/60 rounded-2xl p-4 border border-black/5 space-y-3">
        {/* Month Title & Nav */}
        <div className="flex items-center justify-between">
          <span className="font-display text-xs font-bold text-noir">
            {monthNames[month]} {year}
          </span>
          <div className="flex items-center gap-1">
            <button
              type="button"
              onClick={prevMonth}
              className="p-1 rounded-lg bg-white border border-black/10 text-noir hover:bg-neutral-100 transition-colors"
            >
              <ChevronLeft className="w-3.5 h-3.5" />
            </button>
            <button
              type="button"
              onClick={nextMonth}
              className="p-1 rounded-lg bg-white border border-black/10 text-noir hover:bg-neutral-100 transition-colors"
            >
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Day of Week Headers */}
        <div className="grid grid-cols-7 text-center text-[10px] font-bold text-ash uppercase tracking-wider">
          <span>Su</span>
          <span>Mo</span>
          <span>Tu</span>
          <span>We</span>
          <span>Th</span>
          <span>Fr</span>
          <span>Sa</span>
        </div>

        {/* Days Matrix */}
        <div className="grid grid-cols-7 gap-1">
          {/* Leading empty cells */}
          {Array.from({ length: firstDayIndex }).map((_, i) => (
            <div key={`empty-${i}`} className="h-8" />
          ))}

          {/* Month Days */}
          {Array.from({ length: totalDaysInMonth }).map((_, i) => {
            const dayNum = i + 1;
            const dateObj = new Date(year, month, dayNum);
            const dateStr = dateObj.toISOString().split('T')[0];

            const todayZero = new Date(today.getFullYear(), today.getMonth(), today.getDate());
            const isPast = dateObj < todayZero;

            const { blocked } = isDateBlocked(dateStr);
            const isStart = selectedStartDate === dateStr;
            const isEnd = selectedEndDate === dateStr;
            const inRange = isDateInSelectedRange(dateStr);

            let dayStyle = 'bg-white text-noir hover:bg-emerald-50 hover:border-emerald-300 border border-black/5';

            if (isPast) {
              dayStyle = 'text-ash/30 cursor-not-allowed bg-transparent';
            } else if (blocked) {
              dayStyle = 'bg-red-50 text-red-500 border border-red-200 line-through cursor-not-allowed opacity-60';
            } else if (isStart || isEnd) {
              dayStyle = 'bg-noir text-white font-extrabold shadow-sm ring-2 ring-emerald-500/50 scale-105';
            } else if (inRange) {
              dayStyle = 'bg-emerald-100 text-emerald-950 font-bold border border-emerald-300';
            }

            return (
              <button
                key={dayNum}
                type="button"
                disabled={isPast || blocked}
                onClick={() => handleDayClick(dayNum)}
                title={blocked ? 'Booked for another client event' : `Select ${dateStr}`}
                className={`h-8 rounded-lg text-xs font-semibold flex flex-col items-center justify-center transition-all relative ${dayStyle}`}
              >
                <span>{dayNum}</span>
              </button>
            );
          })}
        </div>

        {/* Legend */}
        <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-black/5 text-[10px] text-ash">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-noir inline-block" />
            <span>Selected Range</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-red-100 border border-red-300 inline-block" />
            <span>Reserved Slot</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded bg-white border border-black/15 inline-block" />
            <span>Available</span>
          </div>
        </div>
      </div>

      {/* Selected Date Summary & Availability Guard Status */}
      <div className="space-y-2">
        <div className="grid grid-cols-2 gap-2">
          <div className="p-3 rounded-2xl bg-neutral-50 border border-black/5">
            <span className="text-[10px] font-bold text-ash uppercase tracking-wider block">
              Delivery / Start Date
            </span>
            <input
              type="date"
              value={selectedStartDate}
              onChange={(e) => setSelectedStartDate(e.target.value)}
              className="w-full bg-transparent font-mono text-xs font-bold text-noir outline-none mt-0.5"
            />
          </div>

          <div className="p-3 rounded-2xl bg-neutral-50 border border-black/5">
            <span className="text-[10px] font-bold text-ash uppercase tracking-wider block">
              Return Pickup Date
            </span>
            <span className="font-mono text-xs font-bold text-noir block mt-0.5">
              {selectedEndDate || '—'}
            </span>
          </div>
        </div>

        {/* Real-time Status Alert */}
        {isChecking ? (
          <div className="p-2.5 rounded-xl bg-neutral-50 border border-black/5 text-[11px] text-ash flex items-center gap-2">
            <Clock className="w-3.5 h-3.5 animate-spin text-noir" />
            <span>Checking real-time vault slot availability...</span>
          </div>
        ) : isAvailable ? (
          <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-medium flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-700 shrink-0" />
            <span>
              <strong>Dates Available!</strong> Outfit is open for rental from <strong>{selectedStartDate}</strong> to <strong>{selectedEndDate}</strong> ({duration.replace('_', ' ')}).
            </span>
          </div>
        ) : (
          <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-800 text-xs font-medium flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-600 shrink-0" />
            <div>
              <strong>Dates Already Reserved:</strong> This outfit is currently booked for another client during this period. Please choose another date or weekend above.
            </div>
          </div>
        )}
      </div>

      {/* Bookings Transparency Notice */}
      {(bookedRanges.length > 0 || hostBlocks.length > 0) && (
        <div className="p-2.5 rounded-xl bg-sand/40 border border-black/5 flex items-start gap-2 text-[10px] text-ash">
          <Info className="w-3.5 h-3.5 text-noir shrink-0 mt-0.5" />
          <span>
            {bookedRanges.length + hostBlocks.length} scheduled reservation(s) active on this outfit. Only non-overlapping dates can be reserved to guarantee on-time delivery.
          </span>
        </div>
      )}
    </div>
  );
}
