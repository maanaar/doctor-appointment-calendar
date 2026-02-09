// 8 AM–3 PM; 5‑min grid so 15‑min and 20‑min cycles align
export const START_HOUR = 8;
export const END_HOUR = 15;
export const SLOT_MINUTES = 5;
export const SLOT_HEIGHT = 24; // Increased from 12 to 24 for better spacing
export const GRID_SLOT_COUNT =
  ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES;

// Display ALL time slots (every 5 minutes: 8:00, 8:05, 8:10, 8:15, etc.)
export const TIME_SLOTS = Array.from(
  { length: GRID_SLOT_COUNT },
  (_, i) => {
    const total = START_HOUR * 60 + i * SLOT_MINUTES;
    const h = Math.floor(total / 60);
    const m = total % 60;
    const displayH = h % 12 || 12;
    const ampm = h < 12 ? "AM" : "PM";
    return `${displayH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
  }
);