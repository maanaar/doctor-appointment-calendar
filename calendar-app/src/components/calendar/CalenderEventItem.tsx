import type { CalendarEvent } from "../../types/calendar";
import {
  SLOT_HEIGHT,
  SLOT_MINUTES,
  START_HOUR,
  GRID_SLOT_COUNT,
} from "../../utils/time";

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

export default function CalendarEventItem({ event }: { event: CalendarEvent }) {
  const start = new Date(event.start);
  const end = new Date(event.end);

  const minutesFromStart =
    start.getHours() * 60 + start.getMinutes() - START_HOUR * 60;

  const duration = (end.getTime() - start.getTime()) / 60000;

  const topPx = (minutesFromStart / SLOT_MINUTES) * SLOT_HEIGHT;
  const heightPx = (duration / SLOT_MINUTES) * SLOT_HEIGHT;
  const top = Math.max(0, Math.min(topPx, GRID_HEIGHT - 2));
  const height = Math.max(8, Math.min(heightPx, GRID_HEIGHT - top));

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("eventId", event.id);
    e.dataTransfer.setData("duration", String(duration));
    e.dataTransfer.effectAllowed = "move";
  };

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      className={`absolute left-1 right-1 rounded text-xs text-white p-1 cursor-grab active:cursor-grabbing shadow-sm hover:shadow-md transition-shadow ${
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
