import { useRef, useState } from "react";
import type { CalendarEvent } from "../../types/calendar";
import { GRID_SLOT_COUNT, SLOT_HEIGHT, SLOT_MINUTES, START_HOUR } from "../../utils/time";
import CalendarEventItem from "./CalenderEventItem";
import { useCalendarStore } from "../../store/calendarStore";

interface DayColumnProps {
  day: Date;
  events: CalendarEvent[];
}

export default function DayColumn({ day, events }: DayColumnProps) {
  const gridRef = useRef<HTMLDivElement>(null);
  const [dropIndicator, setDropIndicator] = useState<number | null>(null);

  const updateEventTime = useCalendarStore((s) => s.updateEventTime);

  const label = day.toLocaleDateString(undefined, {
    weekday: "short",
    day: "numeric",
    month: "short",
  });

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

    if (!eventId || !gridRef.current) return;

    const rect = gridRef.current.getBoundingClientRect();
    const y = e.clientY - rect.top;
    const slotIndex = Math.floor(y / SLOT_HEIGHT);
    const minutesFromStart = slotIndex * SLOT_MINUTES;

    const newStartHour = START_HOUR + Math.floor(minutesFromStart / 60);
    const newStartMinute = minutesFromStart % 60;

    const newStart = new Date(day);
    newStart.setHours(newStartHour, newStartMinute, 0, 0);

    // End time is same as start time (single slot)
    const newEnd = new Date(newStart);

    updateEventTime(eventId, newStart, newEnd);
  };

  return (
    <div className="min-w-[180px] border-r relative bg-slate-50">
      {/* Fixed height header (h-10 = 40px) to match TimeColumn */}
      <div className="sticky top-0 h-10 flex items-center justify-center bg-white border-b px-2 z-10">
        <div className="text-center">
          <div className="text-xs font-semibold text-gray-800">
            {label.split(" ")[0]}
          </div>
          <div className="text-[11px] text-gray-500">
            {label.split(" ").slice(1).join(" ")}
          </div>
        </div>
      </div>

      <div
        ref={gridRef}
        className="relative"
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
      >
        {Array.from({ length: GRID_SLOT_COUNT }, (_, i) => (
          <div
            key={i}
            style={{ height: SLOT_HEIGHT }}
            className={`border-b transition-colors ${
              dropIndicator === i ? "bg-emerald-100" : ""
            }`}
          />
        ))}

        {events.map((event) => (
          <CalendarEventItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}