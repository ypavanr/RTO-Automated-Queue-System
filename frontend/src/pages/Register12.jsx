import React, { useState } from "react";
import axios from "axios";


// Modern, single-file Register component using Tailwind CSS
// - Rounded inputs & buttons
// - Clear validation and UI states (loading / success / error)
// - Accessible labels and helper text
// - Password visibility toggle

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    aadhar: "",
    llNumber: "",
    phone: "",
    password: "",
    llType: "",
    disabilities: "",
    serviceType: "", // New state for the RTO Service Type dropdown
  });

  const [message, setMessage] = useState("");
  const [errorFields, setErrorFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const rtoServices = [
    "New Driver's License",
    "Renewal of Driver's License",
    "Vehicle Registration",
    "Vehicle Transfer",
    "Address Change",
    "Duplicate RC",
    "No Objection Certificate (NOC)",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((p) => ({ ...p, [name]: value }));
    setErrorFields((p) => ({ ...p, [name]: "" }));
    setMessage("");
  };

  const validate = () => {
    const errs = {};
    const aadhaarDigits = String(form.aadhar || "").replace(/\D/g, "");
    if (!aadhaarDigits || aadhaarDigits.length !== 12) errs.aadhar = "Aadhaar must be 12 digits.";
    if (!form.llNumber || String(form.llNumber).trim() === "") errs.llNumber = "LL Application Number required.";
    if (!form.name || form.name.trim().length < 2) errs.name = "Please enter your full name.";
    if (!form.password || form.password.length < 6) errs.password = "Password must be 6+ characters.";
    const phoneDigits = String(form.phone || "").replace(/\D/g, "");
    if (phoneDigits && phoneDigits.length < 10) errs.phone = "Phone seems too short.";
    if (!form.serviceType) errs.serviceType = "Please select a service type.";

    return { valid: Object.keys(errs).length === 0, errs, aadhaarDigits };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { valid, errs, aadhaarDigits } = validate();
    if (!valid) {
      setErrorFields(errs);
      setMessage("Please fix the highlighted fields.");
      return;
    }

    const payload = {
      full_name: form.name.trim(),
      aadhar_number: aadhaarDigits,
      ll_application_number: form.llNumber.trim(),
      phone: form.phone.trim(),
      password: form.password,
      vehicle_classes: form.llType ? [form.llType] : [],
      disabilities: form.disabilities ? [form.disabilities] : [],
      service_type: form.serviceType, // Added to the payload
    };

    try {
      setLoading(true);
      setMessage("");
      // Replace with your actual API endpoint
      // const res = await axios.post("http://localhost:3000/users", payload);
      // For demonstration, we'll simulate a successful response
      await new Promise(resolve => setTimeout(resolve, 1500));
      setMessage("✅ Registration successful!");
      setForm({ name: "", aadhar: "", llNumber: "", phone: "", password: "", llType: "", disabilities: "", serviceType: "" });
      setErrorFields({});
      console.log("Payload:", payload);
    } catch (err) {
      console.error(err);
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message || err.message;
      setMessage(`❌ Registration failed: ${serverMsg}`);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-gray-50 to-blue-50 dark:from-slate-900 dark:to-slate-800">
      <div className="w-full max-w-lg bg-white/90 dark:bg-slate-900/80 backdrop-blur-sm shadow-lg rounded-2xl p-6 sm:p-10">
        <h2 className="text-3xl font-bold text-center mb-1 text-slate-800 dark:text-slate-100">RTO Service Portal</h2>
        <p className="text-sm text-center text-slate-500 dark:text-slate-300 mb-6">Create your account to apply for a service.</p>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div>
            <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Full name</label>
            <input
              id="name"
              name="name"
              value={form.name}
              onChange={handleChange}
              placeholder="Your full name"
              className={`w-full rounded-xl border py-2.5 px-4 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
                errorFields.name ? "border-red-300" : "border-slate-200"
              } dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100`}
              aria-invalid={!!errorFields.name}
              aria-describedby={errorFields.name ? "name-error" : null}
            />
            {errorFields.name && <p id="name-error" className="text-xs text-red-500 mt-1">{errorFields.name}</p>}
          </div>

          {/* Aadhaar */}
          <div>
            <label htmlFor="aadhar" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Aadhaar number</label>
            <input
              id="aadhar"
              name="aadhar"
              value={form.aadhar}
              onChange={handleChange}
              placeholder="1234 5678 9123"
              inputMode="numeric"
              maxLength={14}
              className={`w-full rounded-xl border py-2.5 px-4 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
                errorFields.aadhar ? "border-red-300" : "border-slate-200"
              } dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100`}
              aria-describedby="aadhar-help"
            />
            <p id="aadhar-help" className="text-xs text-slate-400 mt-1">Enter 12 digits — spaces allowed.</p>
            {errorFields.aadhar && <p className="text-xs text-red-500 mt-1">{errorFields.aadhar}</p>}
          </div>

          {/* LL Number + Phone (grid) */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="llNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">LL Application #</label>
              <input
                id="llNumber"
                name="llNumber"
                value={form.llNumber}
                onChange={handleChange}
                placeholder="LL123456"
                className={`w-full rounded-xl border py-2.5 px-4 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
                  errorFields.llNumber ? "border-red-300" : "border-slate-200"
                } dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100`}
              />
              {errorFields.llNumber && <p className="text-xs text-red-500 mt-1">{errorFields.llNumber}</p>}
            </div>
            <div>
              <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Phone</label>
              <input
                id="phone"
                name="phone"
                value={form.phone}
                onChange={handleChange}
                placeholder="10-digit mobile"
                inputMode="tel"
                className={`w-full rounded-xl border py-2.5 px-4 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
                  errorFields.phone ? "border-red-300" : "border-slate-200"
                } dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100`}
              />
              {errorFields.phone && <p className="text-xs text-red-500 mt-1">{errorFields.phone}</p>}
            </div>
          </div>

          {/* Password with toggle */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Password</label>
            <div className="relative">
              <input
                id="password"
                name="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Create a password"
                type={showPassword ? "text" : "password"}
                className={`w-full rounded-xl border py-2.5 px-4 pr-12 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
                  errorFields.password ? "border-red-300" : "border-slate-200"
                } dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((s) => !s)}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-slate-500 dark:text-slate-400 rounded-full hover:bg-slate-100/60 dark:hover:bg-slate-700/40"
                aria-label={showPassword ? "Hide password" : "Show password"}
              >
                <span className="text-xs" aria-hidden>{showPassword ? "🙈" : "👁️"}</span>
              </button>
            </div>
            {errorFields.password && <p className="text-xs text-red-500 mt-1">{errorFields.password}</p>}
          </div>

          {/* Service Type */}
          <div>
            <label htmlFor="serviceType" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Service Type</label>
            <select
              id="serviceType"
              name="serviceType"
              value={form.serviceType}
              onChange={handleChange}
              className={`w-full rounded-xl border py-2.5 px-4 text-sm shadow-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
                errorFields.serviceType ? "border-red-300" : "border-slate-200"
              }`}
            >
              <option value="">Select a service</option>
              {rtoServices.map((service, index) => (
                <option key={index} value={service}>{service}</option>
              ))}
            </select>
            {errorFields.serviceType && <p className="text-xs text-red-500 mt-1">{errorFields.serviceType}</p>}
          </div>

          {/* Selects */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label htmlFor="llType" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Vehicle class</label>
              <select
                id="llType"
                name="llType"
                value={form.llType}
                onChange={handleChange}
                className="w-full rounded-xl border py-2.5 px-4 text-sm shadow-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              >
                <option value="">Select vehicle class</option>
                <option value="MC">Motorcycle / Scooter (MC)</option>
                <option value="LMV">Car / Jeep (LMV)</option>
                <option value="HMV">Truck / Bus (HMV)</option>
              </select>
            </div>
            <div>
              <label htmlFor="disabilities" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Disability (optional)</label>
              <select
                id="disabilities"
                name="disabilities"
                value={form.disabilities}
                onChange={handleChange}
                className="w-full rounded-xl border py-2.5 px-4 text-sm shadow-sm bg-white dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
              >
                <option value="">None</option>
                <option value="mobility">Mobility</option>
                <option value="vision">Vision</option>
                <option value="hearing">Hearing</option>
              </select>
            </div>
          </div>

          {/* Submit */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 hover:bg-blue-700 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300 text-white py-3 font-semibold shadow-lg transition-all duration-300 disabled:opacity-60"
            >
              {loading ? (
                <>
                  <svg
                    className="h-5 w-5 animate-spin text-white"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                  Processing...
                </>
              ) : (
                "Create account"
              )}
            </button>
            {message && (
              <p className={`mt-3 text-sm text-center font-medium ${message.startsWith("✅") ? "text-green-600" : "text-red-500"}`}>
                {message}
              </p>
            )}
          </div>
        </form>

        <div className="mt-8 text-xs text-center text-slate-400">
          By creating an account you agree to our <a href="#" className="underline hover:text-blue-500 transition">Terms</a> & <a href="#" className="underline hover:text-blue-500 transition">Privacy</a>.
        </div>
      </div>
    </div>
  );
}