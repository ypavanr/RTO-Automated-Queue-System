// src/components/BookSlot.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

/**
 * BookSlot
 * - UI matches the Register page (Tailwind-based card, rounded inputs, gradients)
 * - Date validation: no weekends, only up to 5 days in advance
 * - 30-minute slots between 10:00 and 16:30 (skips 13:00 hour)
 * - Pre-check for an active token and redirects to /already-booked if found
 * - Posts to /slots and /tokens/issue on submit
 */

export default function BookSlot() {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Pre-check: redirect if an active token already exists
  useEffect(() => {
    const run = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;
      try {
        const base = process.env.REACT_APP_API_BASE || "http://localhost:3000";
        const r = await axios.get(`${base}/tokens/active`, { params: { user_id: Number(userId) } });
        if (r?.data?.token_id) navigate("/already-booked", { replace: true });
      } catch (e) {
        // 404 => no active token (expected), ignore other errors in console
        // console.debug("tokens/active check:", e?.response?.status || e.message);
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate slots dynamically (10:00 - 16:30 excluding 13:00)
  const generateSlots = () => {
    const slots = [];
    for (let hour = 10; hour < 17; hour++) {
      if (hour === 13) continue; // lunch break
      slots.push(`${hour.toString().padStart(2, "0")}:00`);
      slots.push(`${hour.toString().padStart(2, "0")}:30`);
    }
    return slots;
  };
  const availableSlots = generateSlots();

  // Date validation: no weekends, only up to 5 days ahead, not past
  const handleDateChange = (e) => {
    const value = e.target.value;
    if (!value) {
      setDate("");
      setError("");
      return;
    }

    const selectedDate = new Date(value + "T00:00:00");
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 5);
    maxDate.setHours(0, 0, 0, 0);

    if (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) {
      setError("Office is closed on Saturdays and Sundays.");
      setDate("");
      return;
    }
    if (selectedDate > maxDate) {
      setError("You can only book up to 5 days in advance.");
      setDate("");
      return;
    }
    if (selectedDate < today) {
      setError("Please pick today or a future date.");
      setDate("");
      return;
    }

    setError("");
    setDate(value);
  };

  // Submit booking -> create slot then issue token
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!date) {
      setError("Please select a valid date.");
      return;
    }
    if (!slot) {
      setError("Please select a slot.");
      return;
    }

    setError("");
    setLoading(true);

    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setError("Please login first");
      setLoading(false);
      return;
    }

    try {
      const base = process.env.REACT_APP_API_BASE || "";
      const slotTs = new Date(`${date}T${slot}:00+05:30`).toISOString();

      await axios.post(`${base}/slots`, { applicant_id: Number(userId), slot_ts: slotTs });
      await axios.post(`${base}/tokens/issue`, { applicant_id: Number(userId), prefix: "T" });

      localStorage.setItem("bookedDate", date);
      localStorage.setItem("bookedSlot", slot);

      navigate("/token");
    } catch (err) {
      // If server responds 409 -> already booked
      if (err?.response?.status === 409) {
        navigate("/already-booked", { replace: true });
        setLoading(false);
        return;
      }
      console.error(err);
      setError("Failed to book slot or issue token");
    } finally {
      setLoading(false);
    }
  };

  // min/max dates for date input
  const todayStr = new Date().toISOString().split("T")[0];
  const maxDay = new Date();
  maxDay.setDate(new Date().getDate() + 5);
  const maxDateStr = maxDay.toISOString().split("T")[0];

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-white via-sky-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-800">
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8 bg-white rounded-2xl shadow-lg p-8 sm:p-10 dark:bg-slate-900 dark:border dark:border-slate-700">
        {/* Left Info (hidden on small screens) */}
        <div className="hidden md:flex flex-col justify-center">
          <h3 className="text-2xl font-semibold mb-2 text-sky-700 dark:text-sky-400">Book a Slot</h3>
          <p className="text-sm text-slate-600 dark:text-slate-300">
            Choose a date and an available time slot. Office hours are 10:00 – 16:30 (lunch break 13:00).
          </p>

          <ul className="mt-4 space-y-2 text-sm text-slate-500 dark:text-slate-400 list-disc list-inside">
            <li>Slots available for the next 5 days</li>
            <li>Office closed on Saturdays & Sundays</li>
            <li>Keep your Aadhaar and DL/RC handy during verification</li>
          </ul>

          <p className="mt-4 text-xs text-slate-400">
            Tip: If you already have an active token, you'll be redirected to the token page.
          </p>
        </div>

        {/* Right Form */}
        <div>
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Book a slot</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300 mb-4">
            Select a date and pick a time slot. Slots are 30 minutes each.
          </p>

          {error && (
            <div className="bg-red-50 text-red-800 dark:bg-red-900/30 p-3 rounded-lg text-sm mb-4" role="alert">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label htmlFor="date" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                Select a Date
              </label>
              <input
                id="date"
                type="date"
                value={date}
                min={todayStr}
                max={maxDateStr}
                onChange={handleDateChange}
                className="w-full rounded-xl border py-2.5 px-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
              />
            </div>

            {date && (
              <div>
                <label htmlFor="slot" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
                  Select a Time Slot
                </label>
                <select
                  id="slot"
                  value={slot}
                  onChange={(e) => setSlot(e.target.value)}
                  className="w-full rounded-xl border py-2.5 px-4 text-sm shadow-sm focus:outline-none focus:ring-2 focus:ring-sky-400 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
                >
                  <option value="">-- Choose a Slot --</option>
                  {availableSlots.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white py-2.5 font-medium shadow-md transition disabled:opacity-60"
            >
              {loading ? "Booking..." : "Book Slot"}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
  