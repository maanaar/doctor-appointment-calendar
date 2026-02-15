import TimeColumn from "./TimeColumn";
import DayView from "./DayView";
import WeekView from "./WeekView";
import { useCalendarStore } from "../../store/calendarStore";

export default function CalendarLayout() {
  const view = useCalendarStore((s) => s.view);

  return (
    <div className="flex flex-1 bg-slate-50">
      {/* Shared scroll container so time labels and slots stay in sync */}
      <div className="flex flex-1">
        <TimeColumn />
        {view === "day" ? <DayView /> : <WeekView />}
      </div>
    </div>
  );
}
