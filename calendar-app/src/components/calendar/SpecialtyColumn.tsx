import { useRef, useState, useEffect } from "react";
import type { CalendarEvent } from "../../types/calendar";
import { GRID_SLOT_COUNT, SLOT_HEIGHT, SLOT_MINUTES, START_HOUR } from "../../utils/time";
import CalendarEventItem from "./CalenderEventItem";
import { useCalendarStore } from "../../store/calendarStore";
import { fetchAvailableSlots } from "../../api/odoo";

interface SpecialtyColumnProps {
  specialty: string;
  events?: CalendarEvent[];
}

export default function SpecialtyColumn({
  specialty,
  events: EVENTS,
}: SpecialtyColumnProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [dropIndicator, setDropIndicator] = useState<number | null>(null);

  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const updateEventTime = useCalendarStore((s) => s.updateEventTime);
  const openNewBooking = useCalendarStore((s) => s.openNewBooking);

  // Derive base cycle name (strip count suffix like "Retrieval (3)")
  const baseName = specialty.split(" (")[0];

  // Match Odoo JS logic: shouldUse20MinIntervals(doctor) => doctor.name includes "IUI"
  const upperName = baseName.toUpperCase();
  const use20MinIntervals = upperName.includes("IUI");
  const cycleSlotMinutes = use20MinIntervals ? 20 : 15;

  // With 5‑min base grid, 15 min => 3 slots, 20 min => 4 slots
  const stepSlots = Math.max(1, Math.round(cycleSlotMinutes / SLOT_MINUTES));

  // Available slots from Odoo (e.g. excludes blocked / reserved)
  const [availableSet, setAvailableSet] = useState<Set<string> | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetchAvailableSlots(selectedDate, undefined, baseName);
        if (cancelled) return;
        const set = new Set<string>((res.available || []) as string[]);
        setAvailableSet(set);
      } catch (e) {
        console.error("Failed to fetch available slots:", e);
        if (!cancelled) setAvailableSet(null);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, [selectedDate, baseName]);

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";

    if (gridRef.current) {
      const rect = gridRef.current.getBoundingClientRect();
      const y = e.clientY - rect.top;
      const slotIndex = Math.floor(y / SLOT_HEIGHT);
      setDropIndicator(slotIndex);
    }
  };

  const handleDragLeave = () => {
    setDropIndicator(null);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDropIndicator(null);

    const eventId = e.dataTransfer.getData("eventId");
    const duration = Number(e.dataTransfer.getData("duration"));

    if (!eventId || !gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const slotIndex = Math.floor(y / SLOT_HEIGHT);
    const minutesFromStart = slotIndex * SLOT_MINUTES;

    const newStartHour = START_HOUR + Math.floor(minutesFromStart / 60);
    const newStartMinute = minutesFromStart % 60;

    const newStart = new Date(selectedDate);
    newStart.setHours(newStartHour, newStartMinute, 0, 0);

    const newEnd = new Date(newStart.getTime() + duration * 60000);

    updateEventTime(eventId, newStart, newEnd);
  };

  // Click on empty cell to create new appointment
  const handleCellClick = (slotIndex: number, isBookable: boolean) => {
    if (!isBookable) return;

    const minutesFromStart = slotIndex * SLOT_MINUTES;
    const hour = START_HOUR + Math.floor(minutesFromStart / 60);
    const minute = minutesFromStart % 60;
    
    // Format date as YYYY-MM-DD
    const dateStr = 
      selectedDate.getFullYear() +
      "-" +
      String(selectedDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(selectedDate.getDate()).padStart(2, "0");
    
    // Format time as HH:MM:SS
    const timeStr = 
      String(hour).padStart(2, "0") + ":" +
      String(minute).padStart(2, "0") + ":00";
    
    openNewBooking(dateStr + "T" + timeStr, timeStr);
  };

  return (
    <div className="min-w-[260px] border-r relative bg-slate-50">
      <div className="sticky top-0 bg-white border-b p-2 z-10 h-10 flex items-center">
        <p className="text-sm font-semibold">{specialty}</p>
      </div>

      <div
        ref={gridRef}
        className="relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {Array.from({ length: GRID_SLOT_COUNT }, (_, i) => {
          const minutesFromStart = i * SLOT_MINUTES;
          const hour = START_HOUR + Math.floor(minutesFromStart / 60);
          const minute = minutesFromStart % 60;

          // 5‑min base grid; bookable only at 15/20‑min steps for this cycle
          const isStep = i % stepSlots === 0;

          // Convert to 12‑hour string like "08:00 AM" to match Python logic
          const displayHour = ((hour - 1) % 12) + 1;
          const ampm = hour < 12 ? "AM" : "PM";
          const time12 = `${displayHour.toString().padStart(2, "0")}:${minute
            .toString()
            .padStart(2, "0")} ${ampm}`;

          const isAvailable =
            !availableSet || availableSet.size === 0
              ? true
              : availableSet.has(time12);

          const clickable = isStep && isAvailable;

          return (
            <div
              key={i}
              style={{ height: SLOT_HEIGHT }}
              onClick={() => handleCellClick(i, clickable)}
              className={`border-b transition-colors ${
                clickable
                  ? "cursor-pointer hover:bg-blue-50"
                  : "cursor-default bg-slate-50"
              } ${dropIndicator === i ? "bg-emerald-100" : ""}`}
            />
          );
        })}

        {EVENTS?.map((event) => (
          <CalendarEventItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

