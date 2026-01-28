import type { CalendarEvent } from "../../types/calendar";
import { TIME_SLOTS, SLOT_HEIGHT } from "../../utils/time";
import CalendarEventItem from "./CalenderEventItem";

interface SpecialtyColumnProps {
  specialty: string;
  events?: CalendarEvent[];
}

export default function SpecialtyColumn({
  specialty,
  events: EVENTS,
}: SpecialtyColumnProps) {
  return (
    <div className="min-w-[260px] border-r relative bg-slate-50">
      <div className="sticky top-0 bg-white border-b p-2 z-10">
        <p className="text-sm font-semibold">{specialty}</p>
      </div>

      <div className="relative">
        {TIME_SLOTS.map((_, i) => (
          <div
            key={i}
            style={{ height: SLOT_HEIGHT }}
            className="border-b"
          />
        ))}

        {EVENTS?.map((event) => (
          <CalendarEventItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

