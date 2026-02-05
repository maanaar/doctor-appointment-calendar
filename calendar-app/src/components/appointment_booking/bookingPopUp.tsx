import { useState, useEffect } from "react";
import { BIOPSY_OPTIONS, SEMEN_SOURCE_OPTIONS, DEFAULT_BOOKING_FORM, type BookingFormData } from "../../types/booking";
import { TIME_SLOTS } from "../../utils/time.ts";

interface BookingPopUpProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: BookingFormData) => void;
  initialData?: Partial<BookingFormData>;
  cycles?: { id: number; name: string }[];
  doctors?: { id: number; name: string }[];
  patients?: { id: number; name: string; mobile?: string; mfn?: string; mrn?: string }[];
  mode?: "create" | "edit";
}

export default function BookingPopUp({
  isOpen,
  onClose,
  onSave,
  initialData,
  cycles = [],
  doctors = [],
  patients = [],
  mode = "create",
}: BookingPopUpProps) {
  const [formData, setFormData] = useState<BookingFormData>({
    ...DEFAULT_BOOKING_FORM,
    ...initialData,
  });
  const [activeTab, setActiveTab] = useState<"patient" | "appointment">("patient");

  // Update form data when initialData changes (e.g., when opening a new booking)
  useEffect(() => {
    console.log("BookingPopUp initialData changed:", initialData);
    setFormData({
      ...DEFAULT_BOOKING_FORM,
      ...initialData,
    });
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    const { name, value, type } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
    }));
  };

  const handlePatientChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const val = e.target.value;
    const id = val ? parseInt(val, 10) : undefined;
    const patient = patients.find((p) => p.id === id);
    setFormData((prev) => ({
      ...prev,
      patientId: id,
      patientName: patient?.name || prev.patientName,
      patientPhone: patient?.mobile || prev.patientPhone,
      mfn: patient?.mfn || prev.mfn,
      mrn: patient?.mrn || prev.mrn,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    console.log("Submitting form data:", formData);
    onSave(formData);
  };

  const inputClass =
    "w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent";
  const labelClass = "block text-sm font-medium text-gray-700 mb-1";
  const sectionClass = "bg-gray-50 p-4 rounded-lg mb-4";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black bg-opacity-50"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-lg shadow-xl w-full max-w-3xl max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-emerald-500 px-6 py-4">
          <div className="flex justify-between items-center">
            <h2 className="text-xl font-semibold text-white">
              {mode === "create" ? "New Appointment" : "Edit Appointment"}
            </h2>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tabs */}
          <div className="flex mt-4 space-x-4">
            <button
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeTab === "patient"
                  ? "bg-white text-blue-700"
                  : "text-white hover:bg-emerald-600"
              }`}
              onClick={() => setActiveTab("patient")}
            >
              Patient & Couple
            </button>
            <button
              className={`px-4 py-2 rounded-t-lg text-sm font-medium transition-colors ${
                activeTab === "appointment"
                  ? "bg-white text-blue-700"
                  : "text-white hover:bg-emerald-600"
              }`}
              onClick={() => setActiveTab("appointment")}
            >
              Appointment Details
            </button>
          </div>
        </div>

        {/* Body */}
        <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
          {activeTab === "patient" && (
            <div className="space-y-6">
              {/* Existing Patient Toggle */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="existPatient"
                  name="existPatient"
                  checked={formData.existPatient}
                  onChange={handleChange}
                  className="w-4 h-4 text-blue-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="existPatient" className="text-sm font-medium text-gray-700">
                  Existing Patient
                </label>
              </div>

              {/* Patient Information */}
              <div className={sectionClass}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-pink-100 text-pink-600 rounded-full flex items-center justify-center mr-2 text-sm">
                    ♀
                  </span>
                  Patient Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Patient *</label>
                    <select
                      name="patientId"
                      value={formData.patientId || ""}
                      onChange={handlePatientChange}
                      className={inputClass}
                    >
                      <option value="">Select Patient</option>
                      {patients.map((p) => (
                        <option key={p.id} value={p.id}>
                          {p.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Phone No</label>
                    <input
                      type="text"
                      name="patientPhone"
                      value={formData.patientPhone}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Age</label>
                    <input
                      type="text"
                      name="patientAge"
                      value={formData.patientAge}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>MFN</label>
                    <input
                      type="text"
                      name="mfn"
                      value={formData.mfn}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>MRN</label>
                    <input
                      type="text"
                      name="mrn"
                      value={formData.mrn}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>

              {/* Couple Information */}
              <div className={sectionClass}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4 flex items-center">
                  <span className="w-8 h-8 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mr-2 text-sm">
                    ♂
                  </span>
                  Couple Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Couple Name</label>
                    <input
                      type="text"
                      name="coupleName"
                      value={formData.coupleName}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Phone No</label>
                    <input
                      type="text"
                      name="couplePhone"
                      value={formData.couplePhone}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Age</label>
                    <input
                      type="text"
                      name="coupleAge"
                      value={formData.coupleAge}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>MRN</label>
                    <input
                      type="text"
                      name="coupleMrn"
                      value={formData.coupleMrn}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "appointment" && (
            <div className="space-y-6">
              {/* Appointment Details */}
              <div className={sectionClass}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Appointment Details
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>Cycle Service *</label>
                    <select
                      name="cycleId"
                      value={formData.cycleId || ""}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    >
                      <option value="">Select Cycle</option>
                      {cycles.map((cycle) => (
                        <option key={cycle.id} value={cycle.id}>
                          {cycle.name}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Appointment Date *</label>
                    <input
                      type="date"
                      name="triggerAppDate"
                      value={formData.triggerAppDate}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Appointment Time</label>
                    <select
                      name="trAppointmentTime"
                      value={formData.trAppointmentTime}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Select Time</option>
                      {TIME_SLOTS.map((time) => (
                        <option key={time} value={time}>
                          {time}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Primary Doctor</label>
                    <select
                      name="primaryDoctorId"
                      value={formData.primaryDoctorId || ""}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Select Doctor</option>
                      {doctors.map((doctor) => (
                        <option key={doctor.id} value={doctor.id}>
                          {doctor.name}
                        </option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              {/* Clinical Information */}
              <div className={sectionClass}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">
                  Clinical Information
                </h3>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className={labelClass}>No. of Oocytes</label>
                    <input
                      type="text"
                      name="noOfOocytes"
                      value={formData.noOfOocytes}
                      onChange={handleChange}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Semen Source</label>
                    <select
                      name="semenSource"
                      value={formData.semenSource}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Select Source</option>
                      {SEMEN_SOURCE_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Day</label>
                    <input
                      type="text"
                      name="day"
                      value={formData.day}
                      onChange={handleChange}
                      className={inputClass}
                      placeholder="e.g., 3, 5"
                    />
                  </div>
                  <div>
                    <label className={labelClass}>Biopsy Type</label>
                    <select
                      name="biopsy"
                      value={formData.biopsy}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Select Type</option>
                      {BIOPSY_OPTIONS.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                          {opt.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Retrieval Service</label>
                    <select
                      name="service"
                      value={formData.service}
                      onChange={handleChange}
                      className={inputClass}
                    >
                      <option value="">Select Service</option>
                      <option value="ICSI">ICSI</option>
                      <option value="Accuvit">Accuvit</option>
                    </select>
                  </div>
                  <div>
                    <label className={labelClass}>Status *</label>
                    <select
                      name="onthfState1"
                      value={formData.onthfState1}
                      onChange={handleChange}
                      className={inputClass}
                      required
                    >
                      <option value="onthefly">On The Fly</option>
                      <option value="confirmed">Confirmed</option>
                    </select>
                    {formData.onthfState1 === "onthefly" && (
                      <p className="mt-1 text-xs text-amber-600">
                        ⚠️ This appointment will be created in "On The Fly" status
                      </p>
                    )}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className={sectionClass}>
                <h3 className="text-lg font-semibold text-gray-800 mb-4">Notes</h3>
                <textarea
                  name="notes"
                  value={formData.notes}
                  onChange={handleChange}
                  className={`${inputClass} h-24 resize-none`}
                  placeholder="Additional notes..."
                />
              </div>
            </div>
          )}

          {/* Footer */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 transition-colors"
            >
              {mode === "create" ? "Create Appointment" : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}