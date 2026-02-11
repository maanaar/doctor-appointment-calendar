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
  const timePart = timeStr.slice(11, 16);
  const [h, m] = timePart.split(":").map(Number);
  return { hours: h || 0, minutes: m || 0 };
}

function formatTime12Hour(timeStr: string): string {
  const { hours, minutes } = parseTimeFromString(timeStr);
  const hour12 = hours % 12 || 12;
  const ampm = hours < 12 ? "AM" : "PM";
  return `${hour12.toString().padStart(2, "0")}:${minutes.toString().padStart(2, "0")} ${ampm}`;
}

function formatDateTime(dateStr: string): string {
  if (!dateStr || dateStr === "N/A") return "N/A";
  try {
    const date = new Date(dateStr);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    });
  } catch {
    return "N/A";
  }
}

export default function CalendarEventItem({ event }: { event: CalendarEvent }) {
  const openEventPopup = useCalendarStore((s) => s.openEventPopup);
  const view = useCalendarStore((s) => s.view);
  const [showTooltip, setShowTooltip] = useState(false);

  const startTime = parseTimeFromString(event.start);

  const minutesFromStart =
    startTime.hours * 60 + startTime.minutes - START_HOUR * 60;

  const topPx = (minutesFromStart / SLOT_MINUTES) * SLOT_HEIGHT;
  const top = Math.max(0, Math.min(topPx, GRID_HEIGHT - SLOT_HEIGHT));
  const height = SLOT_HEIGHT;

  const isDraggable = view === "day";

  const handleDragStart = (e: React.DragEvent) => {
    if (!isDraggable) {
      e.preventDefault();
      return;
    }

    e.dataTransfer.setData("eventId", event.id);
    e.dataTransfer.setData("originalDoctorId", event.doctorId);
    e.dataTransfer.setData("duration", String(SLOT_MINUTES));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    openEventPopup(event);
  };

  const rawData = (event as any)._raw || {};
  
  const oocytes = rawData.no_of_oocytes || rawData.oocyte || rawData.ooc || "";
  const couple = rawData.couple || "";
  const doctor = rawData.doctor || "";
  const triggerDate = rawData.trigger_date || rawData.actual_trigger_date || "";
  const service = rawData.service || "";
  const service2 = rawData.service2 || "";
  const day = rawData.day || "";
  const biopsy = rawData.biopsy || "";
  const semenSource = rawData.semen_source || "";
  const isConfirmed = rawData.wl_undo_id ? true : false;

  const allServices = [service, service2].filter(Boolean).join(", ");

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      onClick={handleClick}
      onMouseEnter={() => setShowTooltip(true)}
      onMouseLeave={() => setShowTooltip(false)}
      className={`group absolute left-1 right-1 z-30 rounded text-xs text-white px-2 py-1 ${
        isDraggable ? 'cursor-move' : 'cursor-pointer'
      } hover:brightness-110 shadow-sm hover:shadow-md transition-all ${
        statusColor[event.status] ?? "bg-gray-400"
      }`}
      style={{
        top,
        height,
      }}
    >
      {/* ✅ REMOVED: Egg icon from event label - just show patient name */}
      <div className="truncate font-medium">
        {event.patientName}
      </div>
  
      {/* Tooltip */}
      {showTooltip && (
        <div
          className="
            absolute
            left-full
            ml-3
            top-1/2
            -translate-y-1/2
            w-72
            z-[9999]
            pointer-events-none
          "
        >
          <div className="relative bg-gray-900 text-white text-xs rounded-lg shadow-2xl p-3 border border-gray-700">
            
            <div className="absolute -left-2 top-1/2 -translate-y-1/2 w-0 h-0 border-t-8 border-b-8 border-r-8 border-transparent border-r-gray-900" />
  
            <div className="space-y-1.5">
              <div className="border-b border-gray-700 pb-2 mb-2">
                <div className="font-semibold text-sm">
                  {event.patientName}
                </div>
                <div className="text-gray-400 text-xs mt-0.5">
                  {doctor || "No doctor assigned"}
                </div>
              </div>
  
              <div className="space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-gray-400">Time:</span>
                  <span className="font-medium">
                    {formatTime12Hour(event.start)}
                  </span>
                </div>

                <div className="flex justify-between">
                  <span className="text-gray-400">Status:</span>
                  <span className="capitalize font-medium">
                    {event.status.toLowerCase().replace(/_/g, " ")}
                  </span>
                </div>

                {couple && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Couple:</span>
                    <span>{couple}</span>
                  </div>
                )}

                {allServices && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Services:</span>
                    <span className="text-right">{allServices}</span>
                  </div>
                )}

                {/* ✅ UPDATED: Oocytes without emoji, less prominent */}
                {oocytes && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Oocytes:</span>
                    <span className="font-medium">
                      {oocytes}
                    </span>
                  </div>
                )}

                {semenSource && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Semen Source:</span>
                    <span className="capitalize">
                      {semenSource.replace(/_/g, " ")}
                    </span>
                  </div>
                )}

                {day && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Day:</span>
                    <span>Day {day}</span>
                  </div>
                )}

                {biopsy && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Biopsy:</span>
                    <span>{biopsy}</span>
                  </div>
                )}

                {triggerDate && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Trigger:</span>
                    <span className="text-right">
                      {formatDateTime(triggerDate)}
                    </span>
                  </div>
                )}

                {isConfirmed && (
                  <div className="flex items-center gap-1 text-green-400 bg-green-900/30 -mx-2 px-2 py-1.5 rounded mt-2">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs font-medium">Day handling confirmed</span>
                  </div>
                )}
              </div>

              <div className="text-center pt-2 mt-2 border-t border-gray-700">
                <span className="text-gray-500 text-[10px]">
                  {isDraggable ? 'Click to edit • Drag to move' : 'Click to edit appointment'}
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
  
}