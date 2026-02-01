import { useEffect } from "react";
import MiniDatePicker from "../components/sidebar/MiniDatePicker";
import StatusFilter from "../components/sidebar/StatusFilter";
import DoctorFilter from "../components/sidebar/DoctorFilter";
import CalendarHeader from "../components/calendar/calenderHeader";
import CalendarLayout from "../components/calendar/calenderLayout";
import { useCalendarStore } from "../store/calendarStore";

export default function CalendarPage() {
  const loadData = useCalendarStore((s) => s.loadData);
  const loading = useCalendarStore((s) => s.loading);
  const loadError = useCalendarStore((s) => s.loadError);

  useEffect(() => {
    loadData({ useDefaultDate: true });
  }, [loadData]);

  return (
    <div className="flex h-screen flex-col">
      {loading && (
        <div className="bg-emerald-50 px-4 py-2 text-center text-sm text-emerald-800">
          Loading appointments from Odoo...
        </div>
      )}
      {loadError && !loading && (
        <div className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
          {loadError} — Using demo data. Ensure Odoo is running and you are logged in.
        </div>
      )}
      <div className="flex flex-1">
        <div className="flex-1 flex flex-col">
          <CalendarHeader />
          <CalendarLayout />
        </div>

        <div className="w-64 border-l bg-white">
          <MiniDatePicker />
          <StatusFilter />
          <DoctorFilter />
        </div>
      </div>
    </div>
  );
}
