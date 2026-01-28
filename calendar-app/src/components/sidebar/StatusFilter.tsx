import { useCalendarStore } from "../../store/calendarStore";

const STATUS_LABELS: Record<string, string> = {
  ON_THE_FLY: "On The Fly",
  CONFIRMED: "Confirmed",
  ARRIVED: "Arrived",
  IN_CHAIR: "In Chair",
  IN_PAYMENT: "In Payment",
  PAID: "Paid",
  CLOSED: "Closed",
};

const STATUS_COLORS: Record<string, string> = {
  ON_THE_FLY: "bg-sky-400",
  CONFIRMED: "bg-emerald-500",
  ARRIVED: "bg-blue-500",
  IN_CHAIR: "bg-violet-500",
  IN_PAYMENT: "bg-orange-500",
  PAID: "bg-green-600",
  CLOSED: "bg-rose-500",
};

export default function StatusFilter() {
  const statuses = useCalendarStore((s) => s.statuses);
  const activeStatuses = useCalendarStore((s) => s.activeStatuses);
  const toggleStatus = useCalendarStore((s) => s.toggleStatus);
  const selectAllStatuses = useCalendarStore((s) => s.selectAllStatuses);
  const clearAllStatuses = useCalendarStore((s) => s.clearAllStatuses);

  const allSelected = activeStatuses.length === statuses.length;

  return (
    <div className="p-4 border-b">
      <div className="flex items-center justify-between mb-3 text-xs font-semibold text-gray-600 uppercase tracking-wide">
        <span>Status Filters</span>
        <button
          className="text-emerald-600 hover:underline"
          onClick={allSelected ? clearAllStatuses : selectAllStatuses}
        >
          {allSelected ? "Unselect All" : "Select All"}
        </button>
      </div>

      <div className="space-y-2 text-xs">
        {statuses.map((status) => {
          const label = STATUS_LABELS[status] ?? status;
          const color = STATUS_COLORS[status] ?? "bg-gray-400";
          const checked = activeStatuses.includes(status);

          return (
            <label
              key={status}
              className="flex items-center gap-2 cursor-pointer text-gray-700"
            >
              <input
                type="checkbox"
                className="h-3 w-3 rounded border-gray-300 text-emerald-500 focus:ring-emerald-500"
                checked={checked}
                onChange={() => toggleStatus(status)}
              />
              <span
                className={`inline-block w-2 h-2 rounded-full ${color}`}
              />
              <span>{label}</span>
            </label>
          );
        })}
      </div>
    </div>
  );
}
