import type { CalendarEvent } from "../../types/calendar";
import {
  SLOT_HEIGHT,
  SLOT_MINUTES,
  START_HOUR,
  GRID_SLOT_COUNT,
} from "../../utils/time";
import { useCalendarStore } from "../../store/calendarStore";

const statusColor: Record<string, string> = {
  ON_THE_FLY: "bg-sky-400",
  CONFIRMED: "bg-emerald-500",
  ARRIVED: "bg-blue-500",
  IN_CHAIR: "bg-violet-500",
  IN_PAYMENT: "bg-orange-500",
  PAID: "bg-green-600",
  CLOSED: "bg-rose-500",
};

const GRID_HEIGHT = GRID_SLOT_COUNT * SLOT_HEIGHT;

function parseTimeFromString(timeStr: string): { hours: number; minutes: number } {
  // Extract time directly from ISO string to avoid timezone issues
  // Format: "2026-01-28T08:00:00" or "2026-01-28T08:00:00.000Z"
  const timePart = timeStr.slice(11, 16); // "08:00"
  const [h, m] = timePart.split(":").map(Number);
  return { hours: h || 0, minutes: m || 0 };
}

export default function CalendarEventItem({ event }: { event: CalendarEvent }) {
  const openEventPopup = useCalendarStore((s) => s.openEventPopup);

  // Parse times directly from strings to avoid timezone conversion issues
  const startTime = parseTimeFromString(event.start);
  const endTime = parseTimeFromString(event.end);

  const minutesFromStart =
    startTime.hours * 60 + startTime.minutes - START_HOUR * 60;

  const durationMinutes =
    (endTime.hours * 60 + endTime.minutes) - (startTime.hours * 60 + startTime.minutes);
  const duration = durationMinutes > 0 ? durationMinutes : 15; // fallback to 15 min

  const topPx = (minutesFromStart / SLOT_MINUTES) * SLOT_HEIGHT;
  const heightPx = (duration / SLOT_MINUTES) * SLOT_HEIGHT;
  const top = Math.max(0, Math.min(topPx, GRID_HEIGHT - 2));
  const height = Math.max(8, Math.min(heightPx, GRID_HEIGHT - top));

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("eventId", event.id);
    e.dataTransfer.setData("duration", String(duration));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openEventPopup(event);
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      className={`absolute left-1 right-1 rounded text-xs text-white p-1 cursor-pointer hover:brightness-110 shadow-sm hover:shadow-md transition-all ${
        statusColor[event.status] ?? "bg-gray-400"
      }`}
      style={{
        top,
        height,
      }}
    >
      {event.patientName}
    </div>
  );
}
