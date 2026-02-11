export type AppointmentStatus =
  | "ON_THE_FLY"
  | "CONFIRMED"
  | "ARRIVED"
  | "IN_CHAIR"
  | "IN_PAYMENT"
  | "PAID"
  | "CLOSED";

// types/calendar.ts
export interface CalendarEvent {
  id: string;
  patientName: string;
  doctorId: string;
  start: string;
  end: string;
  status: AppointmentStatus;
  _raw?: {  // ✅ Add this
    couple?: string;
    oocyte?: string;
    service?: string;
    service2?: string;
    trigger_date?: string;
    day?: string;
    biopsy?: string;
    doctor?: string;
  };
}

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
}