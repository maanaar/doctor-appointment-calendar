import { useEffect } from "react";
import MiniDatePicker from "../components/sidebar/MiniDatePicker";
import StatusFilter from "../components/sidebar/StatusFilter";
import DoctorFilter from "../components/sidebar/DoctorFilter";
import CalendarHeader from "../components/calendar/calenderHeader";
import CalendarLayout from "../components/calendar/calenderLayout";
import BookingPopUp from "../components/appointment_booking/bookingPopUp";
import { useCalendarStore } from "../store/calendarStore";
import type { BookingFormData } from "../types/booking";

export default function CalendarPage() {
  const loadData = useCalendarStore((s) => s.loadData);
  const loading = useCalendarStore((s) => s.loading);
  const loadError = useCalendarStore((s) => s.loadError);
  const doctors = useCalendarStore((s) => s.doctors);
  const events = useCalendarStore((s) => s.events);
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  const activeDoctorIds = useCalendarStore((s) => s.activeDoctorIds);
  const activeStatuses = useCalendarStore((s) => s.activeStatuses);

  // Popup state
  const showBookingPopup = useCalendarStore((s) => s.showBookingPopup);
  const selectedEvent = useCalendarStore((s) => s.selectedEvent);
  const bookingMode = useCalendarStore((s) => s.bookingMode);
  const closeBookingPopup = useCalendarStore((s) => s.closeBookingPopup);

  useEffect(() => {
    loadData({ useDefaultDate: true });
  }, [loadData]);

  // Debug: log store state
  useEffect(() => {
    console.log("Calendar Store Debug:", {
      selectedDate: selectedDate?.toISOString(),
      doctors,
      events,
      activeDoctorIds,
      activeStatuses,
    });
  }, [selectedDate, doctors, events, activeDoctorIds, activeStatuses]);

  const handleSaveBooking = (data: BookingFormData) => {
    console.log("Save booking:", data);
    // TODO: Call Odoo API to save appointment
    closeBookingPopup();
    // Reload data after save
    loadData({ date: selectedDate });
  };

  // Convert doctors to popup format
  const doctorOptions = doctors.map((d) => ({
    id: parseInt(d.id) || 0,
    name: d.name,
  }));

  // Get initial data for popup from selected event
  const getInitialData = () => {
    if (!selectedEvent) return undefined;
    return {
      patientName: selectedEvent.patientName,
      triggerAppDate: selectedEvent.start.slice(0, 10),
      trAppointmentTime: formatTimeForPopup(selectedEvent.start),
      primaryDoctorId: parseInt(selectedEvent.doctorId) || undefined,
      onthfState1: selectedEvent.status === "ON_THE_FLY" ? "onthefly" : "confirmed",
    } as Partial<BookingFormData>;
  };

  return (
    <div className="flex h-screen flex-col">
      {/* Debug panel - remove after testing */}
      <div className="bg-gray-100 px-4 py-2 text-xs border-b">
        <strong>Debug:</strong> Date: {selectedDate?.toLocaleDateString()} |
        Doctors: {doctors.length} | Events: {events.length} |
        ActiveDoctors: {activeDoctorIds.length} | ActiveStatuses: {activeStatuses.length}
      </div>
      {loading && (
        <div className="bg-emerald-50 px-4 py-2 text-center text-sm text-emerald-800">
          Loading appointments from Odoo...
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
          <StatusFilter />
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
        cycles={[
          { id: 1, name: "Retrieval" },
          { id: 2, name: "ICSI" },
          { id: 3, name: "FET" },
          { id: 4, name: "Biopsy" },
        ]}
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
