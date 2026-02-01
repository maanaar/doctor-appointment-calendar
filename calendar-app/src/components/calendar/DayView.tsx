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

  let specialties = Array.from(
    new Set(visibleDoctors.map((d) => d.specialty || d.name || "").filter(Boolean))
  );
  if (specialties.length === 0 && visibleDoctors.length > 0) {
    specialties = visibleDoctors.map((d) => d.name || String(d.id));
  }

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
            const docSpecialty = doctor?.specialty || doctor?.name || "";
            return docSpecialty === specialty || String(doctor?.id) === specialty;
          })}
        />
      ))}
    </div>
  );
}
