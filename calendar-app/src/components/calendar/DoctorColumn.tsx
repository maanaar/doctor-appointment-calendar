import type { CalendarEvent, Doctor } from "../../types/calendar";
import { TIME_SLOTS, SLOT_HEIGHT } from "../../utils/time";
import CalendarEventItem from "./CalenderEventItem";

interface DoctorColumnProps {
  doctor: Doctor;
  events?: CalendarEvent[];
}

export default function DoctorColumn({ doctor, events }: DoctorColumnProps) {
  return (
    <div className="min-w-[260px] border-r relative bg-slate-50">
      <div className="sticky top-0 bg-white border-b p-2 z-10">
        <p className="text-sm font-semibold">{doctor.name}</p>
        <p className="text-xs text-gray-500">{doctor.specialty}</p>
      </div>

      <div className="relative">
        {TIME_SLOTS.map((_, i) => (
          <div
            key={i}
            style={{ height: SLOT_HEIGHT }}
            className="border-b"
          />
        ))}

        {events?.map((event) => (
          <CalendarEventItem key={event.id} event={event} />
        ))}
      </div>
    </div>
  );
}

