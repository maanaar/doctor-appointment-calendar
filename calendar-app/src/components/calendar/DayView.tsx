import SpecialtyColumn from "./SpecialtyColumn";
import { useCalendarStore } from "../../store/calendarStore";

function isSameDay(a: Date, b: Date) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}

export default function DayView() {
  const doctors = useCalendarStore((s) => s.doctors);
  const events = useCalendarStore((s) => s.events);
  const activeDoctorIds = useCalendarStore((s) => s.activeDoctorIds);
  const activeStatuses = useCalendarStore((s) => s.activeStatuses);
  const selectedDate = useCalendarStore((s) => s.selectedDate);

  const visibleDoctors = doctors.filter((d) =>
    activeDoctorIds.includes(d.id)
  );

  const doctorById = new Map(visibleDoctors.map((d) => [d.id, d]));

  const specialties = Array.from(
    new Set(visibleDoctors.map((d) => d.specialty))
  );

  const visibleEvents = events.filter((e) => {
    const eventStart = new Date(e.start);
    return (
      activeDoctorIds.includes(e.doctorId) &&
      activeStatuses.includes(e.status) &&
      isSameDay(eventStart, selectedDate)
    );
  });

  return (
    <div className="flex flex-1">
      {specialties.map((specialty) => (
        <SpecialtyColumn
          key={specialty}
          specialty={specialty}
          events={visibleEvents.filter((e) => {
            const doctor = doctorById.get(e.doctorId);
            return doctor?.specialty === specialty;
          })}
        />
      ))}
    </div>
  );
}
