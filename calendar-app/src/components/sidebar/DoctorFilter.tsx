import { useCalendarStore } from "../../store/calendarStore";

export default function DoctorFilter() {
  const doctors = useCalendarStore((s) => s.doctors);
  const activeDoctorIds = useCalendarStore((s) => s.activeDoctorIds);
  const toggleDoctor = useCalendarStore((s) => s.toggleDoctor);
  const selectAllDoctors = useCalendarStore((s) => s.selectAllDoctors);
  const clearAllDoctors = useCalendarStore((s) => s.clearAllDoctors);

  const allSelected = activeDoctorIds.length === doctors.length;

  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
        <span>Doctors</span>
        <button
          className="text-emerald-600 hover:underline"
          onClick={allSelected ? clearAllDoctors : selectAllDoctors}
        >
          {allSelected ? "Unselect All" : "Select All"}
        </button>
      </div>

      <div className="space-y-2 text-xs text-gray-700">
        {doctors.map((doctor) => (
          <label
            key={doctor.id}
            className="flex items-center gap-2 cursor-pointer"
          >
            <input
              type="checkbox"
              className="h-3 w-3 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
              checked={activeDoctorIds.includes(doctor.id)}
              onChange={() => toggleDoctor(doctor.id)}
            />
            <span>{doctor.name}</span>
          </label>
        ))}
      </div>
    </div>
  );
}
