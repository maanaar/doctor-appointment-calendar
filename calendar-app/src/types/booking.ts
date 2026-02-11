// Fixed types/booking.ts
// Types for the booking popup that match Odoo's ivf.inpatient.onthf model

export interface BookingFormData {
  // Patient Info
  existPatient: boolean;
  patientId?: number;
  patientName: string;
  patientPhone: string;
  patientAge: string;
  mfn: string;
  mrn: string;

  // Couple Info
  coupleId?: number;
  coupleName: string;
  couplePhone: string;
  coupleAge: string;
  coupleMrn: string;

  // Appointment Info
  cycleId?: number;
  cycleName: string;
  triggerAppDate: string;
  trAppointmentTime: string;
  primaryDoctorId?: number;
  primaryDoctorName: string;
  requestedServices: number[];

  // ✅ ADDED: Additional services field
  additionalServices?: string;

  // Clinical
  noOfOocytes: string;
  semenSource: SemenSource | "";
  day: string;
  biopsy: BiopsyType | "";
  service: string; // Retrieval service (ICSI/Accuvit)

  // ✅ ADDED: Retrieval / Financial fields
  serviceForRetrieval?: string;
  amount?: string;

  // ✅ ADDED: Trigger dates
  triggerDate?: string;
  actualTriggerDate?: string;

  notes: string;

  // State
  onthfState1: "onthefly" | "confirmed";

  // ✅ ADDED: Confirmation tracking fields
  wlUndoId?: number;
  onthfUndoIds?: string;
  confirmService?: boolean;
}

export type SemenSource =
  | "semen_fresh"
  | "semen_frozen"
  | "tese_fresh"
  | "tese_frozen";

export type BiopsyType = "PGD" | "PGT-A" | "PGT-M";

export interface CycleOption {
  id: number;
  name: string;
}

export interface DoctorOption {
  id: number;
  name: string;
}

export interface ServiceOption {
  id: number;
  name: string;
}

export interface PatientSearchResult {
  id: number;
  name: string;
  mobile: string;
  age: string;
  mfn: string;
  mrn: string;
  coupleId?: number;
  coupleName?: string;
}

export const SEMEN_SOURCE_OPTIONS: { value: SemenSource; label: string }[] = [
  { value: "semen_fresh", label: "Semen Fresh" },
  { value: "semen_frozen", label: "Semen Frozen" },
  { value: "tese_fresh", label: "Tese Fresh" },
  { value: "tese_frozen", label: "Tese Frozen" },
];

export const BIOPSY_OPTIONS: { value: BiopsyType; label: string }[] = [
  { value: "PGD", label: "PGD" },
  { value: "PGT-A", label: "PGT-A" },
  { value: "PGT-M", label: "PGT-M" },
];

export const DEFAULT_BOOKING_FORM: BookingFormData = {
  existPatient: true,
  patientName: "",
  patientPhone: "",
  patientAge: "",
  mfn: "",
  mrn: "",

  coupleName: "",
  couplePhone: "",
  coupleAge: "",
  coupleMrn: "",

  cycleName: "",
  triggerAppDate: "",
  trAppointmentTime: "",
  primaryDoctorName: "",
  requestedServices: [],
  additionalServices: "",

  noOfOocytes: "",
  semenSource: "",
  day: "",
  biopsy: "",
  service: "",

  serviceForRetrieval: "",
  amount: "",
  triggerDate: "",
  actualTriggerDate: "",

  notes: "",
  onthfState1: "confirmed",

  // ✅ ADDED: Default values for new fields
  wlUndoId: undefined,
  onthfUndoIds: "",
  confirmService: false,
};