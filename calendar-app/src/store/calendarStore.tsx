import { create } from "zustand";
import { getWeekDays } from "../utils/date";
import type {
  AppointmentStatus,
  CalendarEvent,
  Doctor,
} from "../types/calendar";
import { fetchAppointments, fetchDefaultDate, updateAppointment } from "../api/odoo";
import { toLocalIso } from "../utils/datetime";

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

  // popup state
  selectedEvent: CalendarEvent | null;
  showBookingPopup: boolean;
  bookingMode: "create" | "edit";

  // actions
  setView: (v: "day" | "week") => void;
  setDate: (d: Date) => void;
  toggleStatus: (status: AppointmentStatus) => void;
  selectAllStatuses: () => void;
  clearAllStatuses: () => void;
  toggleDoctor: (id: string) => void;
  selectAllDoctors: () => void;
  clearAllDoctors: () => void;
  updateEventTime: (eventId: string, newStart: Date, newEnd: Date, newDoctorId?: string) => void;
  loadData: (options?: { date?: Date; useDefaultDate?: boolean }) => Promise<void>;
  loadWeek: (date: Date) => Promise<void>;
  openEventPopup: (event: CalendarEvent) => void;
  openNewBooking: (date?: string, time?: string) => void;
  closeBookingPopup: () => void;
  updating: boolean;
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

  // popup state
  selectedEvent: null,
  showBookingPopup: false,
  bookingMode: "create",
  updating: false,

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

  // store/calendarStore.ts
  updateEventTime: (eventId, newStart, newEnd, newDoctorId) => {
    // 1️⃣ Optimistic UI update
    set((state) => ({
      events: state.events.map((e) =>
        e.id === eventId
          ? {
              ...e,
              start: toLocalIso(newStart),
              end: toLocalIso(newEnd),
              ...(newDoctorId ? { doctorId: newDoctorId } : {}),
            }
          : e
      ),
      updating: true, // ← Show loading
    }));

    // 2️⃣ Backend update
    updateAppointment({
      appointment_id: eventId,
      start: toLocalIso(newStart),
      end: toLocalIso(newEnd),
      ...(newDoctorId ? { cycle_id: newDoctorId } : {}),
    })
      .then(async (res) => {
        if (!res.success) {
          alert(res.error || "Update failed");
          const { view, selectedDate, loadData, loadWeek } = get();
          if (view === "week") {
            await loadWeek(selectedDate);
          } else {
            await loadData({ date: selectedDate });
          }
          set({ updating: false });
        } else {
          const { view, selectedDate, loadData, loadWeek } = get();
          if (view === "week") {
            await loadWeek(selectedDate);
          } else {
            await loadData({ date: selectedDate });
          }
          set({ updating: false }); // ← Clear loading
        }
      })
      .catch(async (err) => {
        console.error("Update failed:", err);
        alert("Failed to update appointment");
        const { view, selectedDate, loadData, loadWeek } = get();
        if (view === "week") {
          await loadWeek(selectedDate);
        } else {
          await loadData({ date: selectedDate });
        }
        set({ updating: false });
      });
  },

  
  openEventPopup: (event) =>
    set({ selectedEvent: event, showBookingPopup: true, bookingMode: "edit" }),

  openNewBooking: (dateTime, _time) => {
    const state = get();
    const startStr = dateTime || state.selectedDate.toISOString().slice(0, 10) + "T08:00:00";
    // Calculate end time (30 min after start)
    const startDate = new Date(startStr);
    const endDate = new Date(startDate.getTime() + 30 * 60000);
    const endStr = 
      endDate.getFullYear() +
      "-" +
      String(endDate.getMonth() + 1).padStart(2, "0") +
      "-" +
      String(endDate.getDate()).padStart(2, "0") +
      "T" +
      String(endDate.getHours()).padStart(2, "0") +
      ":" +
      String(endDate.getMinutes()).padStart(2, "0") +
      ":00";
    
    const newEvent: CalendarEvent = {
      id: "",
      patientName: "",
      doctorId: "",
      start: startStr,
      end: endStr,
      status: "ON_THE_FLY", // ✅ This sets the initial status
    };
    console.log("Opening new booking with event:", newEvent);
    set({ selectedEvent: newEvent, showBookingPopup: true, bookingMode: "create" });
  },

  closeBookingPopup: () =>
    set({ showBookingPopup: false, selectedEvent: null }),

  loadData: async (options?: { date?: Date; useDefaultDate?: boolean }) => {
    const state = get();
    if (state.loading) return;
    set({ loading: true, loadError: null });

    try {
      let targetDate = options?.date ?? state.selectedDate;
      if (options?.useDefaultDate) {
        targetDate = await fetchDefaultDate();
      }

      console.log("Loading data for date:", targetDate);
      const { doctors, events } = await fetchAppointments(targetDate);
      console.log("Fetched doctors:", doctors.length, "events:", events.length);

      let useDoctors = (doctors.length > 0 ? doctors : DOCTORS).slice();
      const doctorIds = new Set(useDoctors.map((d) => d.id));
      for (const e of events) {
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
        selectedDate: targetDate,
        doctors: useDoctors,
        events,
        activeDoctorIds: useDoctors.map((d) => d.id),
        activeStatuses: ALL_STATUSES,
        loading: false,
        loadError: events.length === 0 ? "No appointments for this date." : null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load appointments";
      console.error("Load data error:", err);
      set({
        loading: false,
        loadError: msg,
        // keep current selectedDate, but restore demo data so UI isn't blank
        doctors: DOCTORS,
        events: EVENTS,
        activeDoctorIds: DOCTORS.map((d) => d.id),
        activeStatuses: ALL_STATUSES,
      });
    }
  },

  loadWeek: async (date: Date) => {
    const state = get();
    if (state.loading) return;
    set({ loading: true, loadError: null });

    try {
      console.log("Loading week for date:", date);
      const weekDays = getWeekDays(date);
      console.log("Week days:", weekDays);
      
      const results = await Promise.all(
        weekDays.map((d) => fetchAppointments(d))
      );

      const allDoctorsMap = new Map<string, Doctor>();
      const allEvents: CalendarEvent[] = [];

      for (const { doctors, events } of results) {
        for (const d of doctors) {
          if (!allDoctorsMap.has(d.id)) {
            allDoctorsMap.set(d.id, d);
          }
        }
        allEvents.push(...events);
      }

      let useDoctors = Array.from(allDoctorsMap.values());
      if (useDoctors.length === 0) useDoctors = DOCTORS;

      console.log("Week loaded - doctors:", useDoctors.length, "events:", allEvents.length);

      set({
        selectedDate: date,
        doctors: useDoctors,
        events: allEvents,
        activeDoctorIds: useDoctors.map((d) => d.id),
        activeStatuses: ALL_STATUSES,
        loading: false,
        loadError: allEvents.length === 0 ? "No appointments for this week." : null,
      });
    } catch (err) {
      const msg = err instanceof Error ? err.message : "Failed to load week appointments";
      console.error("Load week error:", err);
      set({
        loading: false,
        loadError: msg,
      });
    }
  },
}));