import { useCalendarStore } from "../../store/calendarStore";

export default function CalendarHeader() {
  const view = useCalendarStore((s) => s.view);
  const setView = useCalendarStore((s) => s.setView);

  return (
    <div className="flex justify-between items-center px-6 py-3 border-b bg-white">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-800">Calendar</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
          This Week
        </span>
      </div>

      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => setView("day")}
          className={`px-3 py-1.5 rounded-full border text-sm ${
            view === "day"
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Day
        </button>
        <button
          onClick={() => setView("week")}
          className={`px-3 py-1.5 rounded-full border text-sm ${
            view === "week"
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Week
        </button>
      </div>
    </div>
  );
}
