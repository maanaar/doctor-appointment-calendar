import SpecialtyColumn from "./SpecialtyColumn";
import { useCalendarStore } from "../../store/calendarStore";

function isSameDayString(eventStart: string, selectedDate: Date): boolean {
  const eventDatePart = eventStart.slice(0, 10);
  const selectedDatePart =
    selectedDate.getFullYear() +
    "-" +
    String(selectedDate.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(selectedDate.getDate()).padStart(2, "0");
  return eventDatePart === selectedDatePart;
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
    const doctorMatch = activeDoctorIds.includes(e.doctorId);
    const statusMatch = activeStatuses.includes(e.status);
    const dateMatch = isSameDayString(e.start, selectedDate);
    return doctorMatch && statusMatch && dateMatch;
  });

  // If no specialties but we have events, show events directly
  if (specialties.length === 0 && events.length > 0) {
    specialties = ["All Events"];
  }

  return (
    <div className="flex flex-1 overflow-auto relative">
      {specialties.length === 0 && (
        <div className="p-4 text-gray-500">
          No specialties/columns to show. Doctors: {doctors.length}, Events: {events.length}
        </div>
      )}
      {specialties.map((specialty) => {
        const colEvents = specialty === "All Events" 
          ? visibleEvents
          : visibleEvents.filter((e) => {
              const doctor = doctorById.get(e.doctorId);
              const docSpecialty = doctor?.specialty || doctor?.name || "";
              return docSpecialty === specialty || String(doctor?.id) === specialty;
            });
        return (
          <SpecialtyColumn
            key={specialty}
            specialty={specialty + ` (${colEvents.length})`}
            events={colEvents}
          />
        );
      })}
    </div>
  );
}
