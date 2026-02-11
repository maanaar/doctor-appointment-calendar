// Fixed bookingPopUp.tsx - With Undo/Edit button after confirmation

import { useState, useEffect } from "react";
import {
  SEMEN_SOURCE_OPTIONS,
  DEFAULT_BOOKING_FORM,
  type BookingFormData,
} from "../../types/booking";
import OdooMultiSelect from "../input/Odoomultiselect ";

interface BookingPopUpProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BookingFormData) => void;
  onConfirm?: () => void;
  onUndo?: () => void;  // ✅ NEW: Undo handler
  initialData?: Partial<BookingFormData>;
  doctors?: { id: number; name: string }[];
  patients?: { id: number; name: string; mobile?: string; mfn?: string; mrn?: string }[];
  services?: { id: number; name: string }[];
  mode?: "create" | "edit";
  cycles?: { id: number; name: string }[];
}

function generateTimeSlots(cycleName: string): string[] {
  const slots: string[] = [];
  const interval = cycleName === "IUI" ? 20 : 15;
  
  for (let hour = 8; hour <= 14; hour++) {
    const maxMinutes = (hour === 14) ? 45 : 60;
    
    for (let minute = 0; minute < maxMinutes; minute += interval) {
      const hour12 = hour > 12 ? hour - 12 : hour === 0 ? 12 : hour;
      const ampm = hour < 12 ? "AM" : "PM";
      const timeStr = `${hour12.toString().padStart(2, "0")}:${minute.toString().padStart(2, "0")} ${ampm}`;
      slots.push(timeStr);
    }
  }
  
  return slots;
}

export default function BookingPopUp({
  isOpen,
  onClose,
  onSave,
  onConfirm,
  onUndo,  // ✅ NEW
  initialData,
  doctors = [],
  patients = [],
  services = [],
  mode = "create",
  // cycles = [],
}: BookingPopUpProps) {
  const [formData, setFormData] = useState<BookingFormData>(
    DEFAULT_BOOKING_FORM
  );

  const [isConfirmed, setIsConfirmed] = useState(false);
  const [isConfirming, setIsConfirming] = useState(false);
  const [isUndoing, setIsUndoing] = useState(false);  // ✅ NEW
  const [timeSlots, setTimeSlots] = useState<string[]>([]);

  useEffect(() => {
    if (!isOpen) {
      setIsConfirmed(false);
      setIsConfirming(false);
      setIsUndoing(false);
      return;
    }

    const merged: BookingFormData = {
      ...DEFAULT_BOOKING_FORM,
      ...initialData,
      triggerAppDate:
        initialData?.triggerAppDate ||
        new Date().toISOString().split("T")[0],
    };

    setFormData(merged);

    const alreadyConfirmed = !!(initialData?.wlUndoId);
    setIsConfirmed(alreadyConfirmed);
  }, [initialData, isOpen]);

  useEffect(() => {
    const cycleName = formData.cycleName || "";
    const slots = generateTimeSlots(cycleName);
    setTimeSlots(slots);
  }, [formData.cycleName]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value, type } = e.target;

    setFormData((prev) => ({
      ...prev,
      [name]:
        type === "checkbox"
          ? (e.target as HTMLInputElement).checked
          : value,
    }));
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value);
    const patient = patients.find((p) => p.id === id);

    setFormData((prev) => ({
      ...prev,
      patientId: id,
      patientName: patient?.name || "",
      patientPhone: patient?.mobile || "",
      mfn: patient?.mfn || "",
      mrn: patient?.mrn || "",
    }));
  };

  // const handleCycleChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  //   const id = parseInt(e.target.value);
  //   const cycle = cycles.find((c) => c.id === id);

  //   setFormData((prev) => ({
  //     ...prev,
  //     cycleId: id,
  //     cycleName: cycle?.name || "",
  //     trAppointmentTime: "",
  //   }));
  // };

  const handleServicesChange = (ids: number[]) => {
    setFormData((prev) => ({
      ...prev,
      requestedServices: ids,
    }));
  };

  const handleSubmit = (e?: React.FormEvent) => {
    e?.preventDefault();

    if (!formData.triggerAppDate) {
      alert("Appointment date is required");
      return;
    }

    if (!formData.patientId && !formData.patientName) {
      alert("Please select a patient or enter patient name");
      return;
    }

    if (!formData.primaryDoctorId) {
      alert("Please select a doctor");
      return;
    }

    if (!formData.cycleId) {
      alert("Cycle is missing. Please create appointment from calendar slot.");
      return;
    }

    if (!formData.trAppointmentTime) {
      alert("Please select a time slot");
      return;
    }

    onSave(formData);
  };

  const handleConfirm = async () => {
    if (!onConfirm) return;

    const confirmed = window.confirm(
      "Are you sure you want to confirm this appointment?\n\n" +
      "This will trigger day_handling and create follow-up appointments if applicable.\n\n" +
      "This action can be undone later if needed."
    );

    if (!confirmed) return;

    setIsConfirming(true);

    try {
      await onConfirm();
      setIsConfirmed(true);
      alert("✅ Appointment confirmed successfully!\n\nDay handling has been triggered.");
    } catch (error) {
      console.error("Confirmation error:", error);
      alert("❌ Failed to confirm appointment. Please try again.");
    } finally {
      setIsConfirming(false);
    }
  };

  // ✅ NEW: Undo handler
  const handleUndo = async () => {
    if (!onUndo) return;

    const confirmed = window.confirm(
      "Are you sure you want to undo this confirmation?\n\n" +
      "This will:\n" +
      "• Delete the worklist entry\n" +
      "• Delete all follow-up appointments\n" +
      "• Reset the appointment to 'On The Fly' status\n\n" +
      "Continue?"
    );

    if (!confirmed) return;

    setIsUndoing(true);

    try {
      await onUndo();
      setIsConfirmed(false);
      alert("✅ Confirmation undone successfully!\n\nAppointment is now editable again.");
      onClose();  // Close and refresh
    } catch (error) {
      console.error("Undo error:", error);
      alert("❌ Failed to undo confirmation. Please try again.");
    } finally {
      setIsUndoing(false);
    }
  };

  const inputClass =
    "w-full px-3 py-2.5 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 disabled:bg-gray-100 disabled:cursor-not-allowed";

  const labelClass =
    "block text-sm font-medium text-gray-700 mb-1.5";

  const isReadOnly = isConfirmed && mode === "edit";
  // const interval =s formData.cycleName === "IUI" ? 20 : 15;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/60"
        onClick={onClose}
      />

      <div className="relative bg-white rounded-xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden flex flex-col">

        <div className={`px-6 py-4 text-white flex justify-between items-center ${
          isConfirmed ? 'bg-green-600' : 'bg-emerald-600'
        }`}>
          <div>
            <h2 className="text-lg font-semibold">
              {mode === "create"
                ? "New Appointment"
                : isConfirmed
                ? "Confirmed Appointment"
                : "Edit Appointment"}
            </h2>
            {isConfirmed && (
              <p className="text-sm text-white/90 mt-1">
                ✓ Day handling has been triggered
              </p>
            )}
          </div>

          <button 
            onClick={onClose}
            className="text-white hover:text-gray-200 text-2xl leading-none"
          >
            ✕
          </button>
        </div>

        {isConfirmed && (
          <div className="bg-green-50 border-b border-green-200 px-6 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-green-800">
                <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="font-medium">
                  This appointment has been confirmed and worklist entries have been created.
                </span>
              </div>
              
              {/* ✅ NEW: Undo button in banner */}
              {onUndo && (
                <button
                  onClick={handleUndo}
                  disabled={isUndoing}
                  className="text-sm px-3 py-1 bg-white text-green-700 border border-green-300 rounded hover:bg-green-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isUndoing ? "Undoing..." : "Undo Confirmation"}
                </button>
              )}
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto">
          <form
            onSubmit={handleSubmit}
            className="p-6 space-y-6"
          >
            {/* Patient */}
            <div>
              <label className={labelClass}>Patient *</label>
              <select
                name="patientId"
                value={formData.patientId || ""}
                onChange={handlePatientChange}
                className={inputClass}
                required
                disabled={isReadOnly}
              >
                <option value="">Select Patient</option>
                {patients.map((p) => (
                  <option key={p.id} value={p.id}>
                    {p.name} {p.mfn ? `(${p.mfn})` : ''}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className={labelClass}>Medical File Number (MFN)</label>
              <input
                type="text"
                name="mfn"
                value={formData.mfn || ""}
                onChange={handleChange}
                className={inputClass}
                placeholder="Medical File Number"
                disabled={isReadOnly}
              />
            </div>

            {/* Doctor */}
            <div>
              <label className={labelClass}>Doctor *</label>
              <select
                name="primaryDoctorId"
                value={formData.primaryDoctorId || ""}
                onChange={handleChange}
                className={inputClass}
                required
                disabled={isReadOnly}
              >
                <option value="">Select Doctor</option>
                {doctors.map((d) => (
                  <option key={d.id} value={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Cycle/Service
            <div>
              <label className={labelClass}>Cycle / Service *</label>
              <select
                name="cycleId"
                value={formData.cycleId || ""}
                onChange={handleCycleChange}
                className={inputClass}
                required
                disabled={isReadOnly}
              >
                <option value="">Select Cycle/Service</option>
                {cycles.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </select>
            </div> */}

            {/* Requested Services */}
            <OdooMultiSelect
              services={services}
              selectedIds={formData.requestedServices}
              onChange={handleServicesChange}
              disabled={isReadOnly}
              label="Requested Services"
              placeholder="Select services..."
            />

            {/* Appointment Date */}
            <div>
              <label className={labelClass}>Appointment Date *</label>
              <input
                type="date"
                name="triggerAppDate"
                value={formData.triggerAppDate}
                onChange={handleChange}
                className={inputClass}
                required
                disabled={isReadOnly}
              />
            </div>

            {/* Time Slot */}
            <div>
              <label className={labelClass}>Time Slot *</label>
              <select
                name="trAppointmentTime"
                value={formData.trAppointmentTime}
                onChange={handleChange}
                className={inputClass}
                required
                disabled={isReadOnly || !formData.cycleId}
              >
                <option value="">
                  {formData.cycleId ? "Select time slot" : "Please select a cycle first"}
                </option>
                {timeSlots.map((slot) => (
                  <option key={slot} value={slot}>
                    {slot}
                  </option>
                ))}
              </select>
            </div>

            {/* Semen Source */}
            <div>
              <label className={labelClass}>Semen Source</label>
              <select
                name="semenSource"
                value={formData.semenSource}
                onChange={handleChange}
                className={inputClass}
                disabled={isReadOnly}
              >
                <option value="">Select</option>
                {SEMEN_SOURCE_OPTIONS.map((opt) => (
                  <option key={opt.value} value={opt.value}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Number of Oocytes */}
            <div>
              <label className={labelClass}>Number of Oocytes</label>
              <input
                type="text"
                name="noOfOocytes"
                value={formData.noOfOocytes}
                onChange={handleChange}
                className={inputClass}
                placeholder="e.g., 10"
                disabled={isReadOnly}
              />
            </div>

            {/* Notes */}
            <div>
              <label className={labelClass}>Notes</label>
              <textarea
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                className={inputClass}
                rows={3}
                placeholder="Add any additional notes..."
                disabled={isReadOnly}
              />
            </div>

            {/* Actions */}
            <div className="flex justify-end gap-3 pt-4 border-t">
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition"
              >
                {isReadOnly ? "Close" : "Cancel"}
              </button>

              {/* ✅ Confirm button - only when NOT confirmed */}
              {mode === "edit" && !isConfirmed && onConfirm && (
                <button
                  type="button"
                  onClick={handleConfirm}
                  disabled={isConfirming}
                  className="px-4 py-2 bg-rose-600 text-white rounded-lg hover:bg-rose-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isConfirming ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Confirming...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Confirm Appointment
                    </>
                  )}
                </button>
              )}

              {/* ✅ NEW: Undo button - only when confirmed */}
              {mode === "edit" && isConfirmed && onUndo && (
                <button
                  type="button"
                  onClick={handleUndo}
                  disabled={isUndoing}
                  className="px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 transition disabled:bg-gray-400 disabled:cursor-not-allowed flex items-center gap-2"
                >
                  {isUndoing ? (
                    <>
                      <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                      </svg>
                      Undoing...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
                      </svg>
                      Undo & Edit
                    </>
                  )}
                </button>
              )}

              {/* Save button - only when NOT read-only */}
              {!isReadOnly && (
                <button
                  type="submit"
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition"
                >
                  {mode === "create" ? "Create Appointment" : "Save Changes"}
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}