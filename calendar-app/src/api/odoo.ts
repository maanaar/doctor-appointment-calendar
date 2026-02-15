// Fixed api/odoo.ts

/**
 * Odoo 17 calendar API integration.
 * Fetches appointments from /agial/calendar/appointments (same data as modified_calendar.js).
 */

import type { AppointmentStatus, CalendarEvent, Doctor } from "../types/calendar";

const baseUrl = import.meta.env.VITE_ODOO_URL ?? "";

// ─── Types ────────────────────────────────────────────────────────────────────

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
    _raw?: {
      couple?: string;
      oocyte?: string;
      service?: string;
      service2?: string;
      trigger_date?: string;
      day?: string;
      biopsy?: string;
      doctor?: string;
      wl_undo_id?: any;
      onthf_undo_ids?: any;
      patient_id?: any;
      couple_id?: any;
      primary_doctor?: any;
      requested_services?: any;
      requested_services_ids?: number[];
      requested_services_names?: string[];
      additional_services?: string;
      amount?: any;
      actual_trigger_date?: string;
      no_of_oocytes?: string;
      semen_source?: string;
    };
  }>;
  error?: string;
}

export interface OdooDefaultDateResponse {
  day: string;
}

export interface BookingMetaResponse {
  cycles: Array<{ id: number; name: string }>;
  doctors: Array<{ id: number; name: string }>;
  patients: Array<{ id: number; name: string; mobile?: string; mfn?: string; mrn?: string }>;
}

export interface AvailableSlotsResponse {
  all: string[];
  available: string[];
  step: number;
  service: string;
  error?: string;
}

export interface CreateAppointmentPayload {
  patientName: string;
  patientPhone: string;
  coupleName: string;
  couplePhone: string;
  cycleId?: number | null;
  triggerAppDate: string;
  trAppointmentTime: string;
  primaryDoctorId?: number | null;
  noOfOocytes: string;
  semenSource: string;
  day: string;
  biopsy: string;
  service: string;
  notes: string;
  onthfState1: "onthefly" | "confirmed";
  patientId?: number | null;
  requestedServices?: number[];
}

export interface UpdateAppointmentPayload {
  appointment_id: string;
  start: string;
  end: string;
  cycle_id?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    method: "GET",
    credentials: "include",
    headers: { Accept: "application/json", ...(options?.headers || {}) },
    ...options,
  });
  if (!res.ok) throw new Error(`Odoo API error: ${res.status} ${res.statusText}`);
  return res.json();
}

function unwrapOdooResponse<T>(raw: T | { result?: T }): T {
  if (raw && typeof raw === "object" && "result" in raw) {
    return (raw as { result: T }).result as T;
  }
  return raw as T;
}

/**
 * Call an Odoo type="json" (JSON-RPC 2.0) endpoint.
 * Odoo wraps params in { jsonrpc, method, params } and returns { result: ... }.
 */
async function callJsonRpc<T>(url: string, params: Record<string, unknown>): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({
      jsonrpc: "2.0",
      method: "call",
      id: Date.now(),
      params,
    }),
  });
  if (!res.ok) throw new Error(`Odoo API error: ${res.status} ${res.statusText}`);
  const raw = await res.json();
  // Unwrap JSON-RPC envelope: { jsonrpc, id, result: { ... } }
  return (raw?.result ?? raw) as T;
}

/**
 * Call an Odoo type="http" endpoint with a plain JSON body.
 */
async function callHttpJson<T>(url: string, body: Record<string, unknown>): Promise<T> {
  const res = await fetch(url, {
    method: "POST",
    credentials: "include",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(body),
  });
  if (!res.ok) throw new Error(`Odoo API error: ${res.status} ${res.statusText}`);
  return res.json();
}

// ─── Public API ───────────────────────────────────────────────────────────────

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

  if (data.error) throw new Error(data.error);

  const doctors: Doctor[] = (data.doctors ?? []).map((d) => ({
    id: String(d.id ?? ""),
    name: d.name ?? "",
    specialty: d.specialty ?? d.name ?? "",
  }));

  const validStatuses: AppointmentStatus[] = [
    "ON_THE_FLY", "CONFIRMED", "ARRIVED", "IN_CHAIR", "IN_PAYMENT", "PAID", "CLOSED",
  ];
  const normalizeStatus = (s: string | undefined): AppointmentStatus => {
    const upper = (s ?? "").toUpperCase().replace(/\s+/g, "_");
    return validStatuses.includes(upper as AppointmentStatus)
      ? (upper as AppointmentStatus)
      : "CONFIRMED";
  };

  const events: CalendarEvent[] = (data.events ?? [])
    .map((e) => {
      const id = e.id != null ? String(e.id) : "";
      const patientName = e.patientName ?? e.patient_name ?? "";
      const doctorId = String(e.doctorId ?? e.doctor_id ?? "");
      const start = e.start ?? "";
      const end   = e.end   ?? "";
      const status = normalizeStatus(e.status);
      if (!start || !end) return null;
      if (isNaN(new Date(start).getTime()) || isNaN(new Date(end).getTime())) return null;
      const startNorm = start.length <= 10 ? start.slice(0, 10) + "T12:00:00" : start;
      const endNorm   = end.length   <= 10 ? end.slice(0, 10)   + "T12:30:00" : end;
      return { id, patientName, doctorId, start: startNorm, end: endNorm, status, _raw: e._raw || {} } as CalendarEvent;
    })
    .filter((e): e is CalendarEvent => e != null);

  return { doctors, events };
}

export async function fetchBookingMeta(): Promise<BookingMetaResponse> {
  const url = `${baseUrl}/agial/calendar/meta`;
  const raw = await fetchJson<BookingMetaResponse | { result?: BookingMetaResponse }>(url);
  return unwrapOdooResponse(raw) as BookingMetaResponse;
}

// ✅ FIX: Improved createAppointment with proper payload handling
export async function createAppointment(payload: any): Promise<any> {
  console.log("📤 createAppointment called with payload:", payload);

  // ✅ FIX: Convert null values properly for form data
  const formData: Record<string, string> = {};
  
  for (const [key, value] of Object.entries(payload)) {
    if (value === null || value === undefined) {
      // ✅ FIX: Send empty string for null/undefined Many2one fields
      // Odoo will interpret "" as False for Many2one fields
      formData[key] = "";
    } else if (Array.isArray(value)) {
      // ✅ FIX: Convert arrays to JSON string
      formData[key] = JSON.stringify(value);
    } else {
      formData[key] = String(value);
    }
  }

  console.log("📤 Form data to be sent:", formData);

  const res = await fetch(`${baseUrl}/agial/calendar/appointment`, {
    method: "POST",
    credentials: "include",
    headers: { 
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: new URLSearchParams(formData).toString(),
  });

  if (!res.ok) {
    const errorText = await res.text();
    console.error("❌ Server error response:", errorText);
    throw new Error(`Odoo API error: ${res.status} ${res.statusText} - ${errorText}`);
  }

  const result = await res.json();
  console.log("✅ Server response:", result);
  
  return result;
}

/**
 * Fetch available slots.
 * Endpoint is type="json" → must use JSON-RPC 2.0 envelope.
 */
export async function fetchAvailableSlots(
  date: Date,
  cycleId?: number,
  cycleName?: string
): Promise<AvailableSlotsResponse> {
  const dateStr =
    date.getFullYear() +
    "-" +
    String(date.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(date.getDate()).padStart(2, "0");

  console.log("📅 fetchAvailableSlots →", { dateStr, cycleId, cycleName });

  const data = await callJsonRpc<AvailableSlotsResponse>(
    `${baseUrl}/agial/calendar/available-slots`,
    { date: dateStr, cycle_id: cycleId ?? null, cycle_name: cycleName ?? null }
  );

  console.log("✅ fetchAvailableSlots →", data);

  if ((data as any)?.error) throw new Error((data as any).error);
  return data;
}

/**
 * Update appointment time / cycle.
 * Endpoint is type="http" → plain JSON body (no JSON-RPC envelope).
 */
export async function updateAppointment(payload: UpdateAppointmentPayload): Promise<any> {
  return callHttpJson(`${baseUrl}/agial/calendar/appointment/update`, payload as any);
}

/**
 * Confirm appointment (day_handling).
 * Endpoint is type="http" → plain JSON body.
 */
export async function confirmAppointment(appointmentId: string): Promise<any> {
  console.log("📤 Confirming appointment:", appointmentId);
  const result = await callHttpJson(`${baseUrl}/agial/calendar/appointment/confirm`, {
    appointment_id: appointmentId,
  });
  console.log("✅ Confirm result:", result);
  return result;
}

/**
 * Undo appointment confirmation (undo_day_handling).
 * Endpoint is type="http" → plain JSON body.
 */
export async function undoAppointment(appointmentId: string): Promise<any> {
  console.log("📤 Undoing appointment:", appointmentId);
  const result = await callHttpJson(`${baseUrl}/agial/calendar/appointment/undo`, {
    appointment_id: appointmentId,
  });
  console.log("✅ Undo result:", result);
  return result;
}

export async function fetchServices(): Promise<{ id: number; name: string }[]> {
  const url = `${baseUrl}/agial/calendar/services`;
  const res = await fetchJson<{ services: Array<{ id: number; name: string }> }>(url);
  return res.services || [];
}

/**
 * Create a new patient in Odoo
 * Endpoint is type="json" → JSON-RPC 2.0 envelope
 */
export async function createPatient(name: string, mobile?: string): Promise<{
  success: boolean;
  patient_id?: number;
  patient_name?: string;
  mfn?: string;
  mrn?: string;
  mobile?: string;
  error?: string;
}> {
  console.log("📤 Creating patient:", { name, mobile });
  const result = await callJsonRpc<any>(`${baseUrl}/agial/calendar/patient/create`, {
    name,
    mobile: mobile || "",
  });
  console.log("✅ Create patient result:", result);
  return result;
}