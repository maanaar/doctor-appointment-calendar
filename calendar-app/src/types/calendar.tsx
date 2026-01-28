export type AppointmentStatus =
  | "ON_THE_FLY"
  | "CONFIRMED"
  | "ARRIVED"
  | "IN_CHAIR"
  | "IN_PAYMENT"
  | "PAID"
  | "CLOSED";

export interface Doctor {
  id: string;
  name: string;
  specialty: string;
}

export interface CalendarEvent {
  id: string;
  patientName: string;
  doctorId: string;
  start: string;
  end: string;
  status: AppointmentStatus;
}
