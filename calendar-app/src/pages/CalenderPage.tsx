
import MiniDatePicker from "../components/sidebar/MiniDatePicker";
import StatusFilter from "../components/sidebar/StatusFilter";
import DoctorFilter from "../components/sidebar/DoctorFilter";
import CalendarHeader from "../components/calendar/calenderHeader";
import CalendarLayout from "../components/calendar/calenderLayout";

export default function CalendarPage() {
  return (
    <div className="flex h-screen">
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
  );
}
