import { useRef, useState } from "react";
import type { CalendarEvent } from "../../types/calendar";
import { GRID_SLOT_COUNT, SLOT_HEIGHT, SLOT_MINUTES, START_HOUR } from "../../utils/time";
import CalendarEventItem from "./CalenderEventItem";
import { useCalendarStore } from "../../store/calendarStore";

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
  const handleCellClick = (slotIndex: number) => {
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
        {Array.from({ length: GRID_SLOT_COUNT }, (_, i) => (
          <div
            key={i}
            style={{ height: SLOT_HEIGHT }}
            onClick={() => handleCellClick(i)}
            className={`border-b transition-colors cursor-pointer hover:bg-blue-50 ${
              dropIndicator === i ? "bg-emerald-100" : ""
            }`}
          />
        ))}

        {EVENTS?.map((event) => (
          <CalendarEventItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

