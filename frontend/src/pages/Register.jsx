// Register.jsx
import React, { useState } from "react";
import axios from "axios";
// Replacing external icon components with simple text/icons to avoid runtime issues

// Modern RTO Registration form (Tailwind CSS)
// - Rounded inputs & buttons
// - Service Type dropdown with common RTO services in India
// - Better accessibility, responsive layout, and form feedback

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    aadhar: "",
    llNumber: "",
    phone: "",
    password: "",
    llType: "",
    disabilities: "",
    serviceType: "",
  });

  const [message, setMessage] = useState("");
  const [messageType, setMessageType] = useState("info"); // 'info' | 'success' | 'error'
  const [errorFields, setErrorFields] = useState({});
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

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
    if (!form.llNumber || String(form.llNumber).trim() === "") errs.llNumber = "LL/Application Number required.";
    if (!form.name || form.name.trim().length < 2) errs.name = "Please enter your full name.";
    if (!form.password || form.password.length < 6) errs.password = "Password must be at least 6 characters.";
    const phoneDigits = String(form.phone || "").replace(/\D/g, "");
    if (phoneDigits && phoneDigits.length < 10) errs.phone = "Phone number seems too short.";

    return { valid: Object.keys(errs).length === 0, errs, aadhaarDigits };
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const { valid, errs, aadhaarDigits } = validate();
    if (!valid) {
      setErrorFields(errs);
      setMessage("Please fix the highlighted fields.");
      setMessageType("error");
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
      service_type: form.serviceType,
    };

    try {
      setLoading(true);
      setMessage("");
      // adjust endpoint as needed
      const res = await axios.post("http://localhost:3000/users", payload);
      setMessage("Registration successful — check your SMS/Email for details.");
      setMessageType("success");
      setForm({ name: "", aadhar: "", llNumber: "", phone: "", password: "", llType: "", disabilities: "", serviceType: "" });
      setErrorFields({});
      console.log("response:", res.data);
    } catch (err) {
      console.error(err);
      const serverMsg = err?.response?.data?.error || err?.response?.data?.message || err.message;
      setMessage(`Registration failed: ${serverMsg}`);
      setMessageType("error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-white via-sky-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-800">
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: Illustration / Info */}
        <div className="hidden md:flex flex-col justify-center px-6">
          <div className="bg-gradient-to-tr from-sky-600 to-indigo-600 text-white rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-semibold mb-2">RTO Services — Quick & Simple</h3>
            <p className="text-sm opacity-90">Choose the service you need, fill in the required details and submit. We'll guide you through the next steps.</p>

            <ul className="mt-6 space-y-2 text-sm">
              <li className="flex items-start gap-2"><span aria-hidden>✓</span> Verified processes</li>
              <li className="flex items-start gap-2"><span aria-hidden>✓</span> Secure Aadhaar-based identification</li>
              <li className="flex items-start gap-2"><span aria-hidden>✓</span> Fast appointment scheduling</li>
            </ul>
          </div>

          <div className="mt-6 text-xs text-slate-500">Tip: Keep your Aadhaar, DL/RC numbers and proof of address handy to speed up the process.</div>
        </div>

        {/* Right: Form */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 dark:bg-slate-900 dark:border dark:border-slate-700">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100">Create your account</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300 mb-4">Register for RTO services in a few simple steps.</p>

          {/* Message */}
          {message && (
            <div
              role="status"
              aria-live="polite"
              className={`flex items-center gap-2 text-sm p-3 rounded-lg mb-4 ${
                messageType === "success" ? "bg-green-50 text-green-800 dark:bg-green-900/30" : "bg-red-50 text-red-800 dark:bg-red-900/30"
              }`}
            >
              <span aria-hidden>{messageType === "success" ? "✓" : "!"}</span>
              <span>{message}</span>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>
            {/* Name */}
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Full name</label>
              <input
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your full name"
                aria-required="true"
                className={`w-full rounded-xl border py-2.5 px-4 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition ${
                  errorFields.name ? "border-red-300" : "border-slate-200"
                } dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100`}
              />
              {errorFields.name && <p className="text-xs text-red-500 mt-1">{errorFields.name}</p>}
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
                aria-describedby="aadhar-help"
                className={`w-full rounded-xl border py-2.5 px-4 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition ${
                  errorFields.aadhar ? "border-red-300" : "border-slate-200"
                } dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100`}
              />
              <p id="aadhar-help" className="text-xs text-slate-400 mt-1">Enter 12 digits — spaces allowed.</p>
              {errorFields.aadhar && <p className="text-xs text-red-500 mt-1">{errorFields.aadhar}</p>}
            </div>

            {/* LL + Phone grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="llNumber" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">LL / App. #</label>
                <input
                  id="llNumber"
                  name="llNumber"
                  value={form.llNumber}
                  onChange={handleChange}
                  placeholder="LL123456"
                  className={`w-full rounded-xl border py-2.5 px-4 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition ${
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
                  className={`w-full rounded-xl border py-2.5 px-4 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition ${
                    errorFields.phone ? "border-red-300" : "border-slate-200"
                  } dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100`}
                />
                {errorFields.phone && <p className="text-xs text-red-500 mt-1">{errorFields.phone}</p>}
              </div>
            </div>

            {/* Password */}
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
                  aria-required="true"
                  className={`w-full rounded-xl border py-2.5 px-4 pr-12 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition ${
                    errorFields.password ? "border-red-300" : "border-slate-200"
                  } dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100`}
                />

                <button
                  type="button"
                  onClick={() => setShowPassword((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-1 rounded-full hover:bg-slate-100/60 dark:hover:bg-slate-700/40"
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  <span className="text-xs" aria-hidden>{showPassword ? "🙈" : "👁️"}</span>
                </button>
              </div>
              {errorFields.password && <p className="text-xs text-red-500 mt-1">{errorFields.password}</p>}
            </div>

            {/* Vehicle class + Disability */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="llType" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Vehicle class</label>
                <select
                  id="llType"
                  name="llType"
                  value={form.llType}
                  onChange={handleChange}
                  className="w-full rounded-xl border py-2.5 px-4 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
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
                  className="w-full rounded-xl border py-2.5 px-4 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                >
                  <option value="">None</option>
                  <option value="mobility">Mobility</option>
                  <option value="vision">Vision</option>
                  <option value="hearing">Hearing</option>
                </select>
              </div>
            </div>

            {/* Service Type */}
            <div>
              <label htmlFor="serviceType" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">Service type</label>
              <select
                id="serviceType"
                name="serviceType"
                value={form.serviceType}
                onChange={handleChange}
                className="w-full rounded-xl border py-2.5 px-4 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                aria-describedby="service-help"
              >
                <option value="">Select a service</option>
                <option value="new_dl">New Driver's License</option>
                <option value="renewal_dl">Renewal of Driver's License</option>
                <option value="vehicle_registration">Vehicle Registration</option>
                <option value="vehicle_transfer">Vehicle Transfer</option>
                <option value="address_change">Address Change</option>
                <option value="duplicate_rc">Duplicate RC</option>
                <option value="noc">No Objection Certificate (NOC)</option>
                <option value="permit">Commercial Permit / Other</option>
              </select>
              <p id="service-help" className="text-xs text-slate-400 mt-1">Common RTO services — pick the one you need.</p>
            </div>

            {/* Submit */}
            <div className="pt-2">
              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-3 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 active:scale-95 focus:outline-none focus:ring-4 focus:ring-sky-300 text-white py-3 font-semibold shadow-lg transition disabled:opacity-60"
              >
                {loading ? (
                  <svg
                    className="h-4 w-4 animate-spin"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                  </svg>
                ) : (
                  "Create account"
                )}
              </button>

              {message && (
                <p className="mt-3 text-sm text-center text-slate-700 dark:text-slate-200">{message}</p>
              )}
            </div>
          </form>

          <div className="mt-5 text-xs text-center text-slate-400">
            By creating an account you agree to our <span className="underline">Terms</span> & <span className="underline">Privacy</span>.
          </div>
        </div>
      </div>
    </div>
  );
}