import { create } from "zustand";
import type {
  AppointmentStatus,
  CalendarEvent,
  Doctor,
} from "../types/calendar";
import { fetchAppointments, fetchDefaultDate } from "../api/odoo";

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

  // loading
  loading: boolean;
  loadError: string | null;

  // actions
  setView: (v: "day" | "week") => void;
  setDate: (d: Date) => void;
  toggleStatus: (status: AppointmentStatus) => void;
  selectAllStatuses: () => void;
  clearAllStatuses: () => void;
  toggleDoctor: (id: string) => void;
  selectAllDoctors: () => void;
  clearAllDoctors: () => void;
  updateEventTime: (eventId: string, newStart: Date, newEnd: Date) => void;
  loadData: (options?: { date?: Date; useDefaultDate?: boolean }) => Promise<void>;
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

const DEMO_DATE = new Date("2026-01-25T12:00:00");

export const useCalendarStore = create<CalendarState>((set, get) => ({
  view: "day",
  selectedDate: DEMO_DATE,

  statuses: ALL_STATUSES,
  doctors: DOCTORS,
  events: EVENTS,

  activeStatuses: ALL_STATUSES,
  activeDoctorIds: DOCTORS.map((d) => d.id),

  loading: false,
  loadError: null,

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
    set((state) => ({
      activeDoctorIds: state.doctors.map((d) => d.id),
    })),
  clearAllDoctors: () => set({ activeDoctorIds: [] }),

  updateEventTime: (eventId, newStart, newEnd) =>
    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId
          ? { ...e, start: newStart.toISOString(), end: newEnd.toISOString() }
          : e
      ),
    })),

  loadData: async (options?: { date?: Date; useDefaultDate?: boolean }) => {
    const state = get();
    if (state.loading) return;
    set({ loading: true, loadError: null });

    try {
      let targetDate = options?.date ?? state.selectedDate;
      if (options?.useDefaultDate) {
        targetDate = await fetchDefaultDate();
      }

      const { doctors, events } = await fetchAppointments(targetDate);

      const hasEvents = events.length > 0;
      const useEvents = hasEvents ? events : EVENTS;
      const useDate = hasEvents ? targetDate : DEMO_DATE;
      let useDoctors = (doctors.length > 0 ? doctors : DOCTORS).slice();
      const doctorIds = new Set(useDoctors.map((d) => d.id));
      for (const e of useEvents) {
        if (e.doctorId && !doctorIds.has(e.doctorId)) {
          doctorIds.add(e.doctorId);
          useDoctors = [
            ...useDoctors,
            { id: e.doctorId, name: `Doctor ${e.doctorId}`, specialty: "" },
          ];
        }
      }
      if (useDoctors.length === 0) useDoctors = DOCTORS;
      set({
        selectedDate: useDate,
        doctors: useDoctors,
        events: useEvents,
        activeDoctorIds: useDoctors.map((d) => d.id),
        activeStatuses: ALL_STATUSES,
        loading: false,
        loadError: hasEvents ? null : "No appointments for this date — showing demo data.",
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load appointments";
      set({
        loading: false,
        loadError: msg,
        selectedDate: DEMO_DATE,
        doctors: DOCTORS,
        events: EVENTS,
        activeDoctorIds: DOCTORS.map((d) => d.id),
        activeStatuses: ALL_STATUSES,
      });
    }
  },
}));
