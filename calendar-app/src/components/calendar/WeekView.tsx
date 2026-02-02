import { useCalendarStore } from "../../store/calendarStore";
import { getWeekDays, toLocalDateString } from "../../utils/date";
import DayColumn from "./DayColumn";

function isSameDayString(eventStart: string, day: Date): boolean {
  // Extract YYYY-MM-DD from the event start string directly (avoids timezone issues)
  const eventDatePart = eventStart.slice(0, 10);
  const dayDatePart = toLocalDateString(day);
  return eventDatePart === dayDatePart;
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

  console.log("WeekView debug:", {
    selectedDate: toLocalDateString(selectedDate),
    weekDays: weekDays.map(d => toLocalDateString(d)),
    totalEvents: events.length,
    visibleEvents: visibleEvents.length,
  });

  return (
    <div className="flex flex-1">
      {weekDays.map((day) => {
        const dayEvents = visibleEvents.filter((e) =>
          isSameDayString(e.start, day)
        );

        return (
          <DayColumn key={day.toISOString()} day={day} events={dayEvents} />
        );
      })}
    </div>
  );
}
