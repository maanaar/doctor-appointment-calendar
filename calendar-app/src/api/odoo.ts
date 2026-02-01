/**
 * Odoo 17 calendar API integration.
 * Fetches appointments from /agial/calendar/appointments (same data as modified_calendar.js).
 *
 * Setup:
 * - If React runs on same origin as Odoo: use baseUrl = "" (default).
 * - If React runs separately: set VITE_ODOO_URL in .env (e.g. http://localhost:8069)
 *   and configure CORS on Odoo, or use Vite proxy in vite.config.ts.
 */

import type {
  AppointmentStatus,
  CalendarEvent,
  Doctor,
} from "../types/calendar";

const baseUrl = import.meta.env.VITE_ODOO_URL ?? "";

export interface OdooCalendarResponse {
  doctors?: Array<{ id?: string | number; name?: string; specialty?: string }>;
  events?: Array<{
    id?: string | number;
    patientName?: string;
    patient_name?: string;
    doctorId?: string | number;
    doctor_id?: string | number;
    start?: string;
    end?: string;
    status?: string;
  }>;
  error?: string;
}

export interface OdooDefaultDateResponse {
  day: string;
}

async function fetchJson<T>(url: string): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json" },
  });
  if (!res.ok) {
    throw new Error(`Odoo API error: ${res.status} ${res.statusText}`);
  }
  return res.json();
}

/**
 * Fetch default calendar date from Odoo (same as get_calendar_day).
 */
export async function fetchDefaultDate(): Promise<Date> {
  const url = `${baseUrl}/agial/calendar/default-date`;
  const raw = await fetchJson<OdooDefaultDateResponse | { result?: OdooDefaultDateResponse }>(url);
  const data = unwrapOdooResponse(raw) as OdooDefaultDateResponse;
  const dayStr = data?.day;
  if (!dayStr) return new Date();
  const datePart = String(dayStr).slice(0, 10);
  const parsed = new Date(datePart + "T12:00:00");
  return isNaN(parsed.getTime()) ? new Date() : parsed;
}

function unwrapOdooResponse<T>(raw: T | { result?: T }): T {
  if (raw && typeof raw === "object" && "result" in raw) {
    return (raw as { result: T }).result as T;
  }
  return raw as T;
}

/**
 * Fetch appointments for a date from Odoo (same as get_appointments_for_calendar).
 * Uses local date so the requested day matches the user's calendar.
 */
export async function fetchAppointments(date: Date): Promise<{
  doctors: Doctor[];
  events: CalendarEvent[];
}> {
  const dateStr =
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0");
  const url = `${baseUrl}/agial/calendar/appointments?date=${encodeURIComponent(dateStr)}`;
  const raw = await fetchJson<OdooCalendarResponse | { result?: OdooCalendarResponse }>(url);
  const data = (unwrapOdooResponse(raw) as OdooCalendarResponse) ?? {};

  if (data.error) {
    throw new Error(data.error);
  }

  const doctors: Doctor[] = (data.doctors ?? []).map((d) => ({
    id: String(d.id ?? ""),
    name: d.name ?? "",
    specialty: d.specialty ?? d.name ?? "",
  }));

  const validStatuses: AppointmentStatus[] = [
    "ON_THE_FLY",
    "CONFIRMED",
    "ARRIVED",
    "IN_CHAIR",
    "IN_PAYMENT",
    "PAID",
    "CLOSED",
  ];
  const normalizeStatus = (s: string | undefined): AppointmentStatus => {
    const upper = (s ?? "").toUpperCase().replace(/\s+/g, "_");
    if (validStatuses.includes(upper as AppointmentStatus)) return upper as AppointmentStatus;
    return "CONFIRMED";
  };

  const events: CalendarEvent[] = (data.events ?? [])
    .map((e) => {
      const id = e.id != null ? String(e.id) : "";
      const patientName = e.patientName ?? e.patient_name ?? "";
      const doctorId = String(e.doctorId ?? e.doctor_id ?? "");
      let start = e.start ?? "";
      let end = e.end ?? "";
      const status = normalizeStatus(e.status);
      if (!start || !end) return null;
      const startDate = new Date(start);
      const endDate = new Date(end);
      if (isNaN(startDate.getTime()) || isNaN(endDate.getTime())) return null;
      const startNorm = start.length <= 10 ? start.slice(0, 10) + "T12:00:00" : start;
      const endNorm = end.length <= 10 ? end.slice(0, 10) + "T12:30:00" : end;
      return {
        id,
        patientName,
        doctorId,
        start: startNorm,
        end: endNorm,
        status,
      } as CalendarEvent;
    })
    .filter((e): e is CalendarEvent => e != null);

  return { doctors, events };
}
