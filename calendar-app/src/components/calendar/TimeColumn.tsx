import { TIME_SLOTS, SLOT_HEIGHT, GRID_SLOT_COUNT } from "../../utils/time";

export default function TimeColumn() {
  return (
    <div className="w-20 border-r bg-white">
      {/* Spacer to align with specialty header height */}
      <div
        style={{ height: 40 }}
        className="border-b bg-white"
      />
      {Array.from({ length: GRID_SLOT_COUNT }, (_, i) => (
        <div
          key={i}
          style={{ height: SLOT_HEIGHT }}
          className="text-xs text-gray-500 px-2 border-b"
        >
          {i % 3 === 0 ? TIME_SLOTS[Math.floor(i / 3)] : ""}
        </div>
      ))}
    </div>
  );
}
