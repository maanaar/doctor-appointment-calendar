import { useCalendarStore } from "../../store/calendarStore";

export default function CalendarHeader() {
  const view = useCalendarStore((s) => s.view);
  const setView = useCalendarStore((s) => s.setView);
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const setDate = useCalendarStore((s) => s.setDate); // ✅ FIXED: Your store uses setDate, not setSelectedDate
  const loadData = useCalendarStore((s) => s.loadData);
  const loadWeek = useCalendarStore((s) => s.loadWeek);

  // ✅ Navigate to previous day/week
  const handlePrevious = () => {
    if (!selectedDate) return;

    const newDate = new Date(selectedDate);
    
    if (view === "week") {
      newDate.setDate(newDate.getDate() - 7);
    } else {
      newDate.setDate(newDate.getDate() - 1);
    }

    setDate(newDate); // ✅ FIXED
    
    if (view === "week") {
      loadWeek(newDate);
    } else {
      loadData({ date: newDate });
    }
  };

  // ✅ Navigate to next day/week
  const handleNext = () => {
    if (!selectedDate) return;

    const newDate = new Date(selectedDate);
    
    if (view === "week") {
      newDate.setDate(newDate.getDate() + 7);
    } else {
      newDate.setDate(newDate.getDate() + 1);
    }

    setDate(newDate); // ✅ FIXED
    
    if (view === "week") {
      loadWeek(newDate);
    } else {
      loadData({ date: newDate });
    }
  };

  // ✅ Go to today
  const handleToday = () => {
    const today = new Date();
    setDate(today); // ✅ FIXED
    
    if (view === "week") {
      loadWeek(today);
    } else {
      loadData({ date: today });
    }
  };

  // ✅ Switch view and reload data
  const handleViewChange = (newView: "day" | "week") => {
    setView(newView);
    
    if (newView === "week") {
      loadWeek(selectedDate || new Date());
    } else {
      loadData({ date: selectedDate || new Date() });
    }
  };

  // ✅ Format the date display based on view (with day name for day view)
  const getDateDisplay = () => {
    if (!selectedDate) return "This Week";

    const date = new Date(selectedDate);

    if (view === "week") {
      const weekStart = new Date(date);
      weekStart.setDate(date.getDate() - date.getDay());
      
      const weekEnd = new Date(weekStart);
      weekEnd.setDate(weekStart.getDate() + 6);

      const formatDate = (d: Date) => {
        const month = d.toLocaleDateString('en-US', { month: 'short' });
        const day = d.getDate();
        return `${month} ${day}`;
      };

      const year = weekEnd.getFullYear();
      
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        return `${formatDate(weekStart)} - ${weekEnd.getDate()}, ${year}`;
      }
      
      return `${formatDate(weekStart)} - ${formatDate(weekEnd)}, ${year}`;
    } else {
      const dayName = date.toLocaleDateString('en-US', { weekday: 'long' });
      const fullDate = date.toLocaleDateString('en-US', { 
        month: 'long', 
        day: 'numeric', 
        year: 'numeric' 
      });
      return `${dayName}, ${fullDate}`;
    }
  };

  return (
    <div className="flex justify-between items-center px-6 py-3 border-b bg-white">
      <div className="flex items-center gap-4">
        <h2 className="text-lg font-semibold text-gray-800">Calendar</h2>
        
        {/* ✅ Navigation arrows and date display */}
        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            className="p-1 hover:bg-gray-100 rounded transition"
            title={view === "week" ? "Previous week" : "Previous day"}
          >
            <svg 
              className="w-5 h-5 text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
          </button>

          <span className="text-xs px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100 min-w-[250px] text-center">
            {getDateDisplay()}
          </span>

          <button
            onClick={handleNext}
            className="p-1 hover:bg-gray-100 rounded transition"
            title={view === "week" ? "Next week" : "Next day"}
          >
            <svg 
              className="w-5 h-5 text-gray-600" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          <button
            onClick={handleToday}
            className="ml-2 px-3 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded transition"
          >
            Today
          </button>
        </div>
      </div>

      {/* View switcher buttons */}
      <div className="flex items-center gap-2 text-sm">
        <button
          onClick={() => handleViewChange("day")}
          className={`px-3 py-1.5 rounded-full border text-sm transition ${
            view === "day"
              ? "bg-emerald-500 border-emerald-500 text-white"
              : "border-gray-300 text-gray-700 hover:bg-gray-100"
          }`}
        >
          Day
        </button>
        <button
          onClick={() => handleViewChange("week")}
          className={`px-3 py-1.5 rounded-full border text-sm transition ${
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