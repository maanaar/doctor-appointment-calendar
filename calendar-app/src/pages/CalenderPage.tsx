// FULL DEBUG VERSION - CalendarPage.tsx
// This will show us exactly what's happening

import { useEffect, useState } from "react";
import MiniDatePicker from "../components/sidebar/MiniDatePicker";
import DoctorFilter from "../components/sidebar/DoctorFilter";
import CalendarHeader from "../components/calendar/calenderHeader";
import CalendarLayout from "../components/calendar/calenderLayout";
import BookingPopUp from "../components/appointment_booking/bookingPopUp";
import { useCalendarStore } from "../store/calendarStore";
import type { BookingFormData } from "../types/booking";
import { 
  createAppointment, 
  fetchBookingMeta,
  confirmAppointment,
  fetchServices,
} from "../api/odoo";

export default function CalendarPage() {
  const loadData = useCalendarStore((s) => s.loadData);
  const loadWeek = useCalendarStore((s) => s.loadWeek);
  const loading = useCalendarStore((s) => s.loading);
  const doctors = useCalendarStore((s) => s.doctors);
  // const events = useCalendarStore((s) => s.events);
  const selectedDate = useCalendarStore((s) => s.selectedDate);
  // const activeDoctorIds = useCalendarStore((s) => s.activeDoctorIds);
  // const activeStatuses = useCalendarStore((s) => s.activeStatuses);
  const view = useCalendarStore((s) => s.view);

  const showBookingPopup = useCalendarStore((s) => s.showBookingPopup);
  const selectedEvent = useCalendarStore((s) => s.selectedEvent);
  const bookingMode = useCalendarStore((s) => s.bookingMode);
  const closeBookingPopup = useCalendarStore((s) => s.closeBookingPopup);

  const [cycleOptions, setCycleOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [doctorOptions, setDoctorOptions] = useState<Array<{ id: number; name: string }>>([]);
  const [patientOptions, setPatientOptions] = useState<
    Array<{ id: number; name: string; mobile?: string; mfn?: string; mrn?: string }>
  >([]);
  const [serviceOptions, setServiceOptions] = useState<Array<{ id: number; name: string }>>([]);
  
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    loadData({ useDefaultDate: true });
  }, [loadData]);

  useEffect(() => {
    const loadMetaData = async () => {
      try {
        console.log("🔄 Fetching metadata...");
        const [meta, services] = await Promise.all([
          fetchBookingMeta(),
          fetchServices(),
        ]);

        setCycleOptions(meta.cycles || []);
        setDoctorOptions(meta.doctors || []);
        setPatientOptions(meta.patients || []);
        setServiceOptions(services || []);

        console.log("✅ Metadata loaded");
      } catch (e) {
        console.error("❌ Failed to load metadata:", e);
      }
    };

    loadMetaData();
  }, []);

  const handleSaveBooking = async (data: BookingFormData) => {
    setSaving(true);
    try {
      let finalDate: string;
      
      if (data.triggerAppDate) {
        finalDate = data.triggerAppDate;
      } else if (selectedDate) {
        finalDate = selectedDate.toISOString().slice(0, 10);
      } else {
        throw new Error("Appointment date is missing");
      }

      if (typeof finalDate !== 'string') {
        finalDate = String(finalDate).slice(0, 10);
      }

      const payload = {
        patientId: data.patientId || null,
        patientName: data.patientName || "",
        patientPhone: data.patientPhone || "",
        coupleId: data.coupleId || null,
        coupleName: data.coupleName || "",
        couplePhone: data.couplePhone || "",
        cycleId: data.cycleId || null,
        triggerAppDate: finalDate,
        trAppointmentTime: data.trAppointmentTime || "",
        primaryDoctorId: data.primaryDoctorId || null,
        requestedServices: data.requestedServices || [],
        additionalServices: data.additionalServices || "",
        noOfOocytes: data.noOfOocytes || "",
        semenSource: data.semenSource || "",
        day: data.day || "",
        biopsy: data.biopsy || "",
        service: data.service || "",
        notes: data.notes || "",
        onthfState1: data.onthfState1 || "onthefly",
      };

      const result = await createAppointment(payload);

      if (!result.success) {
        throw new Error(result.error || "Creation failed");
      }

      closeBookingPopup();

      if (view === "week") {
        await loadWeek(selectedDate);
      } else {
        await loadData({ date: selectedDate });
      }
    } catch (e) {
      console.error("❌ Failed:", e);
      alert(`Failed to create appointment:\n${e instanceof Error ? e.message : e}`);
    } finally {
      setSaving(false);
    }
  };

  const handleConfirmAppointment = async () => {
    if (!selectedEvent) {
      alert("No appointment selected");
      return;
    }

    try {
      await confirmAppointment(selectedEvent.id);
      closeBookingPopup();

      if (view === "week") {
        await loadWeek(selectedDate);
      } else {
        await loadData({ date: selectedDate });
      }
    } catch (e) {
      console.error("❌ Failed to confirm:", e);
      alert(`Failed to confirm appointment:\n${e instanceof Error ? e.message : e}`);
    }
  };
// const handleUndoAppointment = async () => {
//   if (!selectedEvent) {
//     alert("No appointment selected");
//     return;
//   }

//   try {
//     console.log("=== Undoing Appointment Confirmation ===");
//     console.log("Appointment ID:", selectedEvent.id);

//     await undoAppointment(selectedEvent.id);

//     console.log("✅ Appointment confirmation undone successfully");

//     closeBookingPopup();

//     // Refresh to show updated status
//     if (view === "week") {
//       await loadWeek(selectedDate);
//     } else {
//       await loadData({ date: selectedDate });
//     }
//   } catch (e) {
//     console.error("❌ Failed to undo:", e);
//     alert(
//       `Failed to undo confirmation:\n${
//         e instanceof Error ? e.message : e
//       }`
//     );
//   }
// };
  // ✅ SUPER DETAILED DEBUG VERSION
  const getInitialData = (): Partial<BookingFormData> => {
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
    console.log("🔍 getInitialData() called");
    console.log("  bookingMode:", bookingMode);
    console.log("  selectedEvent:", selectedEvent);
    
    if (!selectedEvent) {
      console.log("  → No event selected, returning empty data");
      console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");
      return {
        triggerAppDate: selectedDate?.toISOString().slice(0, 10),
      };
    }

    console.log("📊 Selected Event Details:");
    console.log("  - id:", selectedEvent.id);
    console.log("  - patientName:", selectedEvent.patientName);
    console.log("  - doctorId:", selectedEvent.doctorId);
    console.log("  - start:", selectedEvent.start);
    console.log("  - status:", selectedEvent.status);
    console.log("  - _raw:", selectedEvent._raw);

    const rawData = (selectedEvent as any)._raw || {};
    console.log("📋 Raw Data Fields:");
    console.log("  - patient_id:", rawData.patient_id);
    console.log("  - primary_doctor:", rawData.primary_doctor);
    console.log("  - requested_services_ids:", rawData.requested_services_ids);
    console.log("  - no_of_oocytes:", rawData.no_of_oocytes);
    console.log("  - semen_source:", rawData.semen_source);
    console.log("  - wl_undo_id:", rawData.wl_undo_id);

    // Extract cycle
    const doctorIdStr = selectedEvent.doctorId;
    console.log("🔄 Extracting Cycle:");
    console.log("  - doctorId (string):", doctorIdStr);
    
    const cycleId = doctorIdStr ? parseInt(doctorIdStr) : undefined;
    console.log("  - cycleId (parsed):", cycleId);
    
    const cycleFromDoctors = doctors.find(d => d.id === doctorIdStr);
    console.log("  - Found in doctors array:", cycleFromDoctors);
    
    const cycleName = cycleFromDoctors?.name || "";
    console.log("  - cycleName:", cycleName);

    // Extract primary doctor
    const primaryDoctorId = rawData.primary_doctor ? parseInt(rawData.primary_doctor) : undefined;
    console.log("👨‍⚕️ Primary Doctor:");
    console.log("  - raw primary_doctor:", rawData.primary_doctor);
    console.log("  - parsed primaryDoctorId:", primaryDoctorId);

    // Extract patient
    const patientId = rawData.patient_id ? parseInt(rawData.patient_id) : undefined;
    console.log("👤 Patient:");
    console.log("  - raw patient_id:", rawData.patient_id);
    console.log("  - parsed patientId:", patientId);
    console.log("  - patientName:", selectedEvent.patientName);

    // Extract services
    let requestedServices: number[] = [];
    if (Array.isArray(rawData.requested_services_ids)) {
      requestedServices = rawData.requested_services_ids;
    } else if (Array.isArray(rawData.requested_services)) {
      requestedServices = rawData.requested_services;
    }
    console.log("📦 Services:");
    console.log("  - requestedServices:", requestedServices);

    // Extract time
    const timeFormatted = formatTimeForPopup(selectedEvent.start);
    console.log("⏰ Time:");
    console.log("  - start (raw):", selectedEvent.start);
    console.log("  - timeFormatted:", timeFormatted);

    const initialData: Partial<BookingFormData> = {
      patientId: patientId,
      patientName: selectedEvent.patientName || "",
      patientPhone: rawData.patient_phone || "",
      mfn: rawData.mfn || "",
      mrn: rawData.mrn || "",
      
      cycleId: cycleId,
      cycleName: cycleName,
      
      primaryDoctorId: primaryDoctorId,
      primaryDoctorName: rawData.doctor || "",
      
      triggerAppDate: selectedEvent.start ? selectedEvent.start.slice(0, 10) : selectedDate?.toISOString().slice(0, 10),
      trAppointmentTime: timeFormatted,
      
      requestedServices: requestedServices,
      
      noOfOocytes: rawData.no_of_oocytes || rawData.oocyte || "",
      semenSource: rawData.semen_source || "",
      notes: rawData.notes || "",
      
      wlUndoId: rawData.wl_undo_id,
      onthfUndoIds: rawData.onthf_undo_ids,
      
      onthfState1: selectedEvent.status === "ON_THE_FLY" ? "onthefly" : "confirmed",
    };

    console.log("📤 Final Initial Data:");
    console.log(JSON.stringify(initialData, null, 2));
    console.log("━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━");

    return initialData;
  };

  return (
    <div className="flex h-screen flex-col">
      {/* <div className="bg-gray-100 px-4 py-2 text-xs border-b">
        <strong>Debug:</strong> Date: {selectedDate?.toLocaleDateString()} |
        View: {view} | Events: {events.length} |
        <span className="ml-2 font-bold text-blue-600">
          Options: C:{cycleOptions.length} D:{doctorOptions.length} P:{patientOptions.length} S:{serviceOptions.length}
        </span>
        {selectedEvent && (
          <span className="ml-2 font-bold text-purple-600">
            | Selected: {selectedEvent.id} ({selectedEvent.patientName})
          </span>
        )}
      </div> */}

      {loading && (
        <div className="bg-emerald-50 px-4 py-2 text-center text-sm text-emerald-800">
          Loading appointments
        </div>
      )}

      {saving && (
        <div className="bg-blue-50 px-4 py-2 text-center text-sm text-blue-800">
          Creating appointment...
        </div>
      )}

      <div className="flex flex-1">
        <div className="flex-1 flex flex-col">
          <CalendarHeader />
          <CalendarLayout />
        </div>

        <div className="w-64 border-l bg-white">
          <MiniDatePicker />
          <DoctorFilter />
        </div>
      </div>

      <BookingPopUp
        isOpen={showBookingPopup}
        onClose={closeBookingPopup}
        onSave={handleSaveBooking}
        onConfirm={handleConfirmAppointment}
        initialData={getInitialData()}
        doctors={doctorOptions}
        patients={patientOptions}
        cycles={cycleOptions}
        services={serviceOptions}
        mode={bookingMode}
      />
    </div>
  );
}

function formatTimeForPopup(isoString: string): string {
  if (!isoString || isoString.length < 16) return "";
  
  try {
    const timePart = isoString.slice(11, 16);
    const [h, m] = timePart.split(":").map(Number);
    
    if (isNaN(h) || isNaN(m)) return "";
    
    const hour12 = h % 12 || 12;
    const ampm = h < 12 ? "AM" : "PM";
    return `${hour12.toString().padStart(2, "0")}:${m.toString().padStart(2, "0")} ${ampm}`;
  } catch (e) {
    console.error("Error formatting time:", e);
    return "";
  }
}