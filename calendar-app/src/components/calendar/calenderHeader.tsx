import { useCalendarStore } from "../../store/calendarStore";

export default function CalendarHeader() {
  const view = useCalendarStore((s) => s.view);
  const setView = useCalendarStore((s) => s.setView);
  const selectedDate = useCalendarStore((s) => s.selectedDate);

  // ✅ Format the date display based on view
  const getDateDisplay = () => {
    if (!selectedDate) return "This Week";

    const date = new Date(selectedDate);

    if (view === "week") {
      // Show week range (e.g., "Feb 10 - Feb 16, 2026")
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay()); // Start of week (Sunday)
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6); // End of week (Saturday)

      const formatDate = (d: Date) => {
        const month = d.toLocaleDateString('en-US', { month: 'short' });
        const day = d.getDate();
        return `${month} ${day}`;
      };

      const year = weekEnd.getFullYear();
      
      // If same month
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${formatDate(weekStart)} - ${weekEnd.getDate()}, ${year}`;
      }
      
      // Different months
      return `${formatDate(weekStart)} - ${formatDate(weekEnd)}, ${year}`;
    } else {
      // Show single date (e.g., "February 10, 2026")
      return date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
    }
  };


  return (
    <div className="flex justify-between items-center px-6 py-3 border-b bg-white">
      <div className="flex items-center gap-3">
        <h2 className="text-lg font-semibold text-gray-800">Calendar</h2>
        <span className="text-xs px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">
          {getDateDisplay()}
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
