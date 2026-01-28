import type { CalendarEvent } from "../../types/calendar";
import { SLOT_HEIGHT, SLOT_MINUTES, START_HOUR } from "../../utils/time";

const statusColor: Record<string, string> = {
  CONFIRMED: "bg-emerald-500 opacity-50",
  ARRIVED: "bg-blue-500 opacity-50",
  IN_PAYMENT: "bg-orange-500 opacity-50",
  PAID: "bg-green-600 opacity-50",
};

export default function CalendarEventItem({ event }: { event: CalendarEvent }) {
  const start = new Date(event.start);
  const end = new Date(event.end);

  const minutesFromStart =
    start.getHours() * 60 + start.getMinutes() - START_HOUR * 60;

  const duration =
    (end.getTime() - start.getTime()) / 60000;

  return (
    <div
      className={`absolute left-1 right-1 rounded text-xs text-white p-1 ${
        statusColor[event.status]
      }`}
      style={{
        top: (minutesFromStart / SLOT_MINUTES) * SLOT_HEIGHT,
        height: (duration / SLOT_MINUTES) * SLOT_HEIGHT,
      }}
    >
      {event.patientName}
    </div>
  );
}
