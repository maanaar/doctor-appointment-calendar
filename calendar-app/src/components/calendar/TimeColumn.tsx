import { TIME_SLOTS, SLOT_HEIGHT } from "../../utils/time";

export default function TimeColumn() {
  return (
    <div className="w-20 border-r bg-white">
      {/* Spacer to align with specialty header height */}
      <div
        style={{ height: 40 }}
        className="border-b bg-white"
      />
      {TIME_SLOTS.map((time) => (
        <div
          key={time}
          style={{ height: SLOT_HEIGHT }}
          className="text-xs text-gray-500 px-2 border-b"
        >
          {time}
        </div>
      ))}
    </div>
  );
}
