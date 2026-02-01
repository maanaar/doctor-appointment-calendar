// 8 AM–3 PM; 5‑min grid so 15‑min and 20‑min cycles align; 10px per 5‑min slot
export const START_HOUR = 8;
export const END_HOUR = 15;
export const SLOT_MINUTES = 5;
export const SLOT_HEIGHT = 10;
export const GRID_SLOT_COUNT =
  ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES;

// Labels every 15 min to avoid clutter (8:00, 8:15, …)
export const TIME_SLOTS = Array.from(
  { length: ((END_HOUR - START_HOUR) * 60) / 15 },
  (_, i) => {
    const total = START_HOUR * 60 + i * 15;
    const h = Math.floor(total / 60);
    const m = total % 60;
    const displayH = h % 12 || 12;
    const ampm = h < 12 ? "AM" : "PM";
    return `${displayH.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
  }
);
