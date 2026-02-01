import { useCalendarStore } from "../../store/calendarStore";
import { getWeekDays } from "../../utils/date";
import DayColumn from "./DayColumn";

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

        return (
          <DayColumn key={day.toISOString()} day={day} events={dayEvents} />
        );
      })}
    </div>
  );
}
