import { useEffect, useState } from "react";
import MiniDatePicker from "../components/sidebar/MiniDatePicker";
// import StatusFilter from "../components/sidebar/StatusFilter";
import DoctorFilter from "../components/sidebar/DoctorFilter";
import CalendarHeader from "../components/calendar/calenderHeader";
import CalendarLayout from "../components/calendar/calenderLayout";
import BookingPopUp from "../components/appointment_booking/bookingPopUp";
import { useCalendarStore } from "../store/calendarStore";
import type { BookingFormData } from "../types/booking";
import { createAppointment, fetchBookingMeta } from "../api/odoo";

export default function CalendarPage() {
  const loadData = useCalendarStore((s) => s.loadData);
  const loadWeek = useCalendarStore((s) => s.loadWeek);
  const loading = useCalendarStore((s) => s.loading);
  const loadError = useCalendarStore((s) => s.loadError);
  const doctors = useCalendarStore((s) => s.doctors);
  const events = useCalendarStore((s) => s.events);
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const activeDoctorIds = useCalendarStore((s) => s.activeDoctorIds);
  const activeStatuses = useCalendarStore((s) => s.activeStatuses);
  const view = useCalendarStore((s) => s.view);

  // Popup state
  const showBookingPopup = useCalendarStore((s) => s.showBookingPopup);
  const selectedEvent = useCalendarStore((s) => s.selectedEvent);
  const bookingMode = useCalendarStore((s) => s.bookingMode);
  const closeBookingPopup = useCalendarStore((s) => s.closeBookingPopup);

  // Booking meta (real many2one values from Odoo)
  const [cycleOptions, setCycleOptions] = useState<Array<{ id: number; name: string }>>(
    []
  );
  const [doctorOptions, setDoctorOptions] = useState<Array<{ id: number; name: string }>>(
    []
  );
  const [patientOptions, setPatientOptions] = useState<
    Array<{ id: number; name: string; mobile?: string; mfn?: string; mrn?: string }>
  >([]);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData({ useDefaultDate: true });
  }, [loadData]);

  // Load real cycles & doctors for dropdowns
  useEffect(() => {
    fetchBookingMeta()
      .then((meta) => {
        setCycleOptions(meta.cycles || []);
        setDoctorOptions(meta.doctors || []);
        setPatientOptions(meta.patients || []);
      })
      .catch((e) => {
        console.error("Failed to load booking meta:", e);
      });
  }, []);

  // Debug: log store state
  useEffect(() => {
    console.log("Calendar Store Debug:", {
      selectedDate: selectedDate?.toISOString(),
      doctors,
      events,
      activeDoctorIds,
      activeStatuses,
      view,
    });
  }, [selectedDate, doctors, events, activeDoctorIds, activeStatuses, view]);

  const handleSaveBooking = async (data: BookingFormData) => {
    setSaving(true);
    try {
      console.log("Creating appointment with data:", data);
      
      const result = await createAppointment({
        patientName: data.patientName,
        patientPhone: data.patientPhone,
        coupleName: data.coupleName,
        couplePhone: data.couplePhone,
        cycleId: data.cycleId,
        triggerAppDate: data.triggerAppDate,
        trAppointmentTime: data.trAppointmentTime,
        primaryDoctorId: data.primaryDoctorId,
        noOfOocytes: data.noOfOocytes,
        semenSource: data.semenSource || "",
        day: data.day,
        biopsy: data.biopsy || "",
        service: data.service,
        notes: data.notes,
        onthfState1: data.onthfState1,
        patientId: data.patientId,
      });

      console.log("Appointment created successfully:", result);
      
      closeBookingPopup();
      
      // Reload data based on current view
      if (view === "week") {
        console.log("Reloading week view for date:", selectedDate);
        await loadWeek(selectedDate);
      } else {
        console.log("Reloading day view for date:", selectedDate);
        await loadData({ date: selectedDate });
      }
      
      console.log("Data reloaded successfully");
    } catch (e) {
      console.error("Failed to create appointment:", e);
      alert("Failed to create appointment. Check console for details.");
      // Still close popup on error
      closeBookingPopup();
    } finally {
      setSaving(false);
    }
  };

  // Get initial data for popup from selected event
  const getInitialData = () => {
    if (!selectedEvent) return undefined;
    const cycleId = parseInt(selectedEvent.doctorId);
    return {
      patientName: selectedEvent.patientName,
      triggerAppDate: selectedEvent.start.slice(0, 10),
      trAppointmentTime: formatTimeForPopup(selectedEvent.start),
      cycleId: isNaN(cycleId) ? undefined : cycleId,
      onthfState1: selectedEvent.status === "ON_THE_FLY" ? "onthefly" : "confirmed",
    } as Partial<BookingFormData>;
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Debug panel - remove after testing */}
      <div className="bg-gray-100 px-4 py-2 text-xs border-b">
        <strong>Debug:</strong> Date: {selectedDate?.toLocaleDateString()} |
        View: {view} |
        Doctors: {doctors.length} | Events: {events.length} |
        ActiveDoctors: {activeDoctorIds.length} | ActiveStatuses: {activeStatuses.length}
      </div>
      {loading && (
        <div className="bg-emerald-50 px-4 py-2 text-center text-sm text-emerald-800">
          Loading appointments from Odoo...
        </div>
      )}
      {saving && (
        <div className="bg-blue-50 px-4 py-2 text-center text-sm text-blue-800">
          Creating appointment...
        </div>
      )}
      {loadError && !loading && (
        <div className="bg-amber-50 px-4 py-2 text-center text-sm text-amber-800">
          {loadError} — Using demo data. Ensure Odoo is running and you are logged in.
        </div>
      )}
      <div className="flex flex-1">
        <div className="flex-1 flex flex-col">
          <CalendarHeader />
          <CalendarLayout />
        </div>

        <div className="w-64 border-l bg-white">
          <MiniDatePicker />
          {/* <StatusFilter /> */}
          <DoctorFilter />
        </div>
      </div>

      {/* Booking Popup */}
      <BookingPopUp
        isOpen={showBookingPopup}
        onClose={closeBookingPopup}
        onSave={handleSaveBooking}
        initialData={getInitialData()}
        doctors={doctorOptions}
        patients={patientOptions}
        cycles={cycleOptions}
        mode={bookingMode}
      />
    </div>
  );
}

function formatTimeForPopup(isoString: string): string {
  const timePart = isoString.slice(11, 16); // "08:00"
  const [h, m] = timePart.split(":").map(Number);
  const hour12 = h % 12 || 12;
  const ampm = h < 12 ? "AM" : "PM";
  return `${hour12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
}