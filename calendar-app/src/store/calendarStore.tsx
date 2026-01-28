import { create } from "zustand";
import type {
  AppointmentStatus,
  CalendarEvent,
  Doctor,
} from "../types/calendar";

interface CalendarState {
  view: "day" | "week";
  selectedDate: Date;

  // reference data
  statuses: AppointmentStatus[];
  doctors: Doctor[];
  events: CalendarEvent[];

  // filters
  activeStatuses: AppointmentStatus[];
  activeDoctorIds: string[];

  // actions
  setView: (v: "day" | "week") => void;
  setDate: (d: Date) => void;
  toggleStatus: (status: AppointmentStatus) => void;
  selectAllStatuses: () => void;
  clearAllStatuses: () => void;
  toggleDoctor: (id: string) => void;
  selectAllDoctors: () => void;
  clearAllDoctors: () => void;
}

const ALL_STATUSES: AppointmentStatus[] = [
  "ON_THE_FLY",
  "CONFIRMED",
  "ARRIVED",
  "IN_CHAIR",
  "IN_PAYMENT",
  "PAID",
  "CLOSED",
];

const DOCTORS: Doctor[] = [
  {
    id: "d1",
    name: "test new doctor pharmacy",
    specialty: "General Dentist",
  },
  {
    id: "d2",
    name: "Mahmoud Ahmed",
    specialty: "Oral Surgeon",
  },
  {
    id: "d4",
    name: "Mahmoud Saeed",
    specialty: "General Dentist",
  },
];

const EVENTS: CalendarEvent[] = [
  {
    id: "e1",
    patientName: "Mahmoud Ahmed ",
    doctorId: "d1",
    start: "2026-01-25T11:00:00",
    end: "2026-01-25T11:30:00",
    status: "CONFIRMED",
  },
  {
    id: "e2",
    patientName: "Mahmoud Mohamed",
    doctorId: "d1",
    start: "2026-01-25T11:15:00",
    end: "2026-01-25T11:45:00",
    status: "PAID",
  },
  {
    id: "e3",
    patientName: "Mahmoud Mohamed ",
    doctorId: "d2",
    start: "2026-01-25T13:00:00",
    end: "2026-01-25T13:30:00",
    status: "IN_PAYMENT",
  },
];

export const useCalendarStore = create<CalendarState>((set) => ({
  view: "day",
  selectedDate: new Date(),

  statuses: ALL_STATUSES,
  doctors: DOCTORS,
  events: EVENTS,

  activeStatuses: ALL_STATUSES,
  activeDoctorIds: DOCTORS.map((d) => d.id),

  setView: (view) => set({ view }),
  setDate: (selectedDate) => set({ selectedDate }),

  toggleStatus: (status) =>
    set((state) => {
      const isActive = state.activeStatuses.includes(status);
      return {
        activeStatuses: isActive
          ? state.activeStatuses.filter((s) => s !== status)
          : [...state.activeStatuses, status],
      };
    }),

  selectAllStatuses: () => set({ activeStatuses: ALL_STATUSES }),
  clearAllStatuses: () => set({ activeStatuses: [] }),

  toggleDoctor: (id) =>
    set((state) => {
      const isActive = state.activeDoctorIds.includes(id);
      return {
        activeDoctorIds: isActive
          ? state.activeDoctorIds.filter((d) => d !== id)
          : [...state.activeDoctorIds, id],
      };
    }),

  selectAllDoctors: () =>
    set({
      activeDoctorIds: DOCTORS.map((d) => d.id),
    }),
  clearAllDoctors: () => set({ activeDoctorIds: [] }),
}));
