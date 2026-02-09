import { TIME_SLOTS, SLOT_HEIGHT, GRID_SLOT_COUNT } from "../../utils/time";

export default function TimeColumn() {
  return (
    <div className="w-20 border-r bg-white">
      {/* Spacer to align with specialty header height (h-10 = 40px) */}
      <div className="h-10 border-b bg-white sticky top-0 z-10" />
      {Array.from({ length: GRID_SLOT_COUNT }, (_, i) => (
        <div
          key={i}
          style={{ height: SLOT_HEIGHT }}
          className="text-[11px] text-gray-600 px-2 border-b flex items-start pt-0.5"
        >
          {TIME_SLOTS[i]}
        </div>
      ))}
    </div>
  );
}