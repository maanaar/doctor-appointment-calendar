import { useCalendarStore } from "../../store/calendarStore";
import { getWeekDays } from "../../utils/date";
import { TIME_SLOTS, SLOT_HEIGHT } from "../../utils/time";
import CalendarEventItem from "./CalenderEventItem";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function WeekView() {
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const events = useCalendarStore((s) => s.events);
  const activeDoctorIds = useCalendarStore((s) => s.activeDoctorIds);
  const activeStatuses = useCalendarStore((s) => s.activeStatuses);

  const weekDays = getWeekDays(selectedDate);

  const visibleEvents = events.filter(
    (e) =>
      activeDoctorIds.includes(e.doctorId) &&
      activeStatuses.includes(e.status)
  );

  return (
    <div className="flex flex-1">
      {weekDays.map((day) => {
        const dayEvents = visibleEvents.filter((e) =>
          isSameDay(new Date(e.start), day)
        );

        const label = day.toLocaleDateString(undefined, {
          weekday: "short",
          day: "numeric",
          month: "short",
        });

        return (
          <div
            key={day.toISOString()}
            className="min-w-[180px] border-r relative bg-slate-50"
          >
            <div className="sticky top-0 h-10 flex flex-col justify-center bg-white border-b px-2 z-10">
              <span className="text-xs font-semibold text-gray-800">
                {label.split(" ")[0]}
              </span>
              <span className="text-[11px] text-gray-500">
                {label.split(" ").slice(1).join(" ")}
              </span>
            </div>

            <div className="relative">
              {TIME_SLOTS.map((_, i) => (
                <div
                  key={i}
                  style={{ height: SLOT_HEIGHT }}
                  className="border-b"
                />
              ))}

              {dayEvents.map((event) => (
                <CalendarEventItem key={event.id} event={event} />
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}
