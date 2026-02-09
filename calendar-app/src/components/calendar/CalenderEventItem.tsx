import { useState } from "react";
import type { CalendarEvent } from "../../types/calendar";
import {
  SLOT_HEIGHT,
  SLOT_MINUTES,
  START_HOUR,
  GRID_SLOT_COUNT,
} from "../../utils/time";
import { useCalendarStore } from "../../store/calendarStore";

const statusColor: Record<string, string> = {
  ON_THE_FLY: "bg-sky-400",
  CONFIRMED: "bg-emerald-500",
  ARRIVED: "bg-blue-500",
  IN_CHAIR: "bg-violet-500",
  IN_PAYMENT: "bg-orange-500",
  PAID: "bg-green-600",
  CLOSED: "bg-rose-500",
};

const GRID_HEIGHT = GRID_SLOT_COUNT * SLOT_HEIGHT;

function parseTimeFromString(timeStr: string): { hours: number; minutes: number } {
  // Extract time directly from ISO string to avoid timezone issues
  // Format: "2026-01-28T08:00:00" or "2026-01-28T08:00:00.000Z"
  const timePart = timeStr.slice(11, 16); // "08:00"
  const [h, m] = timePart.split(":").map(Number);
  return { hours: h || 0, minutes: m || 0 };
}

function formatTime12Hour(timeStr: string): string {
  const { hours, minutes } = parseTimeFromString(timeStr);
  const hour12 = hours % 12 || 12;
  const ampm = hours < 12 ? "AM" : "PM";
  return `${hour12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

export default function CalendarEventItem({ event }: { event: CalendarEvent }) {
  const openEventPopup = useCalendarStore((s) => s.openEventPopup);
  const [showTooltip, setShowTooltip] = useState(false);

  // Parse start time only (ignore end time, events occupy one slot)
  const startTime = parseTimeFromString(event.start);

  const minutesFromStart =
    startTime.hours * 60 + startTime.minutes - START_HOUR * 60;

  // Event occupies exactly one slot (SLOT_HEIGHT)
  const topPx = (minutesFromStart / SLOT_MINUTES) * SLOT_HEIGHT;
  const top = Math.max(0, Math.min(topPx, GRID_HEIGHT - SLOT_HEIGHT));
  const height = SLOT_HEIGHT;

  const handleDragStart = (e: React.DragEvent) => {
    e.dataTransfer.setData("eventId", event.id);
    e.dataTransfer.setData("originalDoctorId", event.doctorId);
    e.dataTransfer.setData("duration", String(SLOT_MINUTES)); // Always 5 min duration
    e.dataTransfer.effectAllowed = "move";
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openEventPopup(event);
  };

  // Extract additional data from _raw if available
  const rawData = (event as any)._raw || {};
  const oocytes = rawData.oocyte || "N/A";
  const doctor = rawData.doctor || "N/A";
  const triggerDate = rawData.trigger_date || "N/A";
  const service = rawData.service || rawData.service2 || "N/A";
  const day = rawData.day || "N/A";
  const biopsy = rawData.biopsy || "N/A";

  return (
    <div
      draggable
      onDragStart={handleDragStart}
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`group absolute left-1 right-1 z-30 rounded text-xs text-white px-2 py-1 cursor-pointer hover:brightness-110 shadow-sm hover:shadow-md transition-all ${
        statusColor[event.status] ?? "bg-gray-400"
      }`}
      style={{
        top,
        height,
      }}
    >
      {/* Event label */}
      <div className="truncate font-medium">
        {event.patientName}
      </div>
  
      {/* 🔥 Tooltip */}
      {showTooltip && (
        <div
          className="
            absolute
            left-full
            ml-3
            top-1/2
            -translate-y-1/2
            w-64
            z-[9999]
            pointer-events-none
          "
        >
          <div className="relative bg-gray-900 text-white text-xs rounded-lg shadow-2xl p-3 border border-gray-700">
            
            {/* Arrow */}
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-gray-900" />
  
            <div className="space-y-1.5">
              <div className="font-semibold text-sm border-b border-gray-700 pb-1 mb-2">
                {event.patientName}
              </div>
  
              <div className="grid grid-cols-[90px_1fr] gap-x-2 gap-y-1">
                <span className="text-gray-400">Time:</span>
                <span className="font-medium">
                  {formatTime12Hour(event.start)}
                </span>
  
                <span className="text-gray-400">Doctor:</span>
                <span>{doctor}</span>
  
                <span className="text-gray-400">Oocytes:</span>
                <span>{oocytes}</span>
  
                <span className="text-gray-400">Trigger:</span>
                <span>{triggerDate}</span>
  
                <span className="text-gray-400">Day:</span>
                <span>{day}</span>
  
                {service !== "N/A" && (
                  <>
                    <span className="text-gray-400">Service:</span>
                    <span>{service}</span>
                  </>
                )}
  
                {biopsy !== "N/A" && (
                  <>
                    <span className="text-gray-400">Biopsy:</span>
                    <span>{biopsy}</span>
                  </>
                )}
  
                <span className="text-gray-400">Status:</span>
                <span className="capitalize">
                  {event.status
                    .toLowerCase()
                    .replace(/_/g, " ")}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
}