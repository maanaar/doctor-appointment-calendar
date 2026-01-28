export const START_HOUR = 9;
export const END_HOUR = 17;
export const SLOT_MINUTES = 15;
export const SLOT_HEIGHT = 64;

export const TIME_SLOTS = Array.from(
  { length: ((END_HOUR - START_HOUR) * 60) / SLOT_MINUTES },
  (_, i) => {
    const total = START_HOUR * 60 + i * SLOT_MINUTES;
    const h = Math.floor(total / 60);
    const m = total % 60;
    return `${h}:${m.toString().padStart(2, "0")}`;
  }
);
