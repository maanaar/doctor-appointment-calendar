import { useCalendarStore } from "../../store/calendarStore";

const WEEK_DAYS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

function startOfMonth(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function addMonths(date: Date, amount: number) {
  return new Date(date.getFullYear(), date.getMonth() + amount, 1);
}

export default function MiniDatePicker() {
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const setDate = useCalendarStore((s) => s.setDate);
  const loadData = useCalendarStore((s) => s.loadData);

  const monthStart = startOfMonth(selectedDate);
  const monthLabel = monthStart.toLocaleDateString(undefined, {
    month: "long",
    year: "numeric",
  });

  const startWeekday = (monthStart.getDay() + 6) % 7; // make Monday=0
  const daysInMonth = new Date(
    monthStart.getFullYear(),
    monthStart.getMonth() + 1,
    0
  ).getDate();

  const cells: (number | null)[] = [
    ...Array(startWeekday).fill(null),
    ...Array.from({ length: daysInMonth }, (_, i) => i + 1),
  ];

  const today = new Date();

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between mb-3">
        <button
          className="rounded-full px-2 py-1 text-xs border text-gray-600 hover:bg-gray-100"
          onClick={() => loadData({ date: new Date() })}
        >
          Today
        </button>
        <div className="flex items-center gap-1 text-sm font-medium">
          {monthLabel}
        </div>
        <div className="flex gap-1">
          <button
            className="w-6 h-6 rounded-full border text-xs text-gray-600 hover:bg-gray-100"
            onClick={() => setDate(addMonths(selectedDate, -1))}
          >
            ‹
          </button>
          <button
            className="w-6 h-6 rounded-full border text-xs text-gray-600 hover:bg-gray-100"
            onClick={() => setDate(addMonths(selectedDate, 1))}
          >
            ›
          </button>
        </div>
      </div>

      <div className="grid grid-cols-7 text-center text-[11px] text-gray-400 mb-1">
        {WEEK_DAYS.map((d) => (
          <div key={d}>{d}</div>
        ))}
      </div>

      <div className="grid grid-cols-7 gap-1 text-xs">
        {cells.map((day, idx) => {
          if (!day) {
            return <div key={idx} />;
          }

          const cellDate = new Date(
            monthStart.getFullYear(),
            monthStart.getMonth(),
            day
          );

          const isToday = isSameDay(cellDate, today);
          const isSelected = isSameDay(cellDate, selectedDate);

          return (
            <button
              key={idx}
              className={[
                "w-7 h-7 rounded-full flex items-center justify-center",
                isSelected
                  ? "bg-emerald-500 text-white"
                  : isToday
                  ? "border border-emerald-400 text-emerald-600"
                  : "text-gray-700 hover:bg-gray-100",
              ].join(" ")}
              onClick={() => loadData({ date: cellDate })}
            >
              {day}
            </button>
          );
        })}
      </div>
    </div>
  );
}
