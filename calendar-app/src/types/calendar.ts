export type AppointmentStatus =
  | "ON_THE_FLY"
  | "CONFIRMED"
  | "ARRIVED"
  | "IN_CHAIR"
  | "IN_PAYMENT"
  | "PAID"
  | "CLOSED";

export interface CalendarEvent {
  id: string;
  patientName: string;
  doctorId: string;
  start: string; // ISO datetime string
  end: string; // ISO datetime string
  status: AppointmentStatus;
  _raw?: {
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