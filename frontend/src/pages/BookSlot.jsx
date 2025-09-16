import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function BookSlot() {
  const navigate = useNavigate();
  const [date, setDate] = useState("");
  const [slot, setSlot] = useState("");
  const [error, setError] = useState("");

  // Pre-check: redirect if an active token already exists
  useEffect(() => {
    const run = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;
      try {
        const base = process.env.REACT_APP_API_BASE || "";
        const r = await axios.get(`${base}/tokens/active`, { params: { user_id: Number(userId) } });
        if (r?.data?.token_id) navigate("/already-booked", { replace: true });
      } catch (e) {
        // 404 => no active token
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Generate slots dynamically
  const generateSlots = () => {
    let slots = [];
    for (let hour = 10; hour < 17; hour++) {
      if (hour === 13) continue; // skip lunch break (1 PM)
      slots.push(`${hour}:00`);
      slots.push(`${hour}:30`);
    }
    return slots;
  };

  const availableSlots = generateSlots();

  // Handle Date Selection
  const handleDateChange = (e) => {
    const selectedDate = new Date(e.target.value);
    const today = new Date();
    const maxDate = new Date();
    maxDate.setDate(today.getDate() + 5); // only 5 days in advance

    // Check weekend
    if (selectedDate.getDay() === 0 || selectedDate.getDay() === 6) {
      setError("Office is closed on Saturdays and Sundays.");
      setDate("");
      return;
    }

    // Check beyond 5 days
    if (selectedDate > maxDate) {
      setError("You can only book up to 5 days in advance.");
      setDate("");
      return;
    }

    setError("");
    setDate(e.target.value);
  };

  // Handle Submit
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

    const userId = localStorage.getItem("user_id");
    if (!userId) {
      setError("Please login first");
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
      console.error(err);
      if (err?.response?.status === 409) {
        navigate("/already-booked", { replace: true });
        return;
      }
      setError("Failed to book slot or issue token");
    }
  };

  // Generate min/max date for input
  const today = new Date().toISOString().split("T")[0];
  const maxDay = new Date();
  maxDay.setDate(new Date().getDate() + 5);
  const maxDateStr = maxDay.toISOString().split("T")[0];

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">Book a Slot</h2>
        
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          
          {/* Date Picker */}
          <label className="font-semibold">Select a Date:</label>
          <input
            type="date"
            value={date}
            min={today}
            max={maxDateStr}
            onChange={handleDateChange}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
          />

          {/* Time Slot Dropdown */}
          {date && (
            <>
              <label className="font-semibold">Select a Time Slot:</label>
              <select
                value={slot}
                onChange={(e) => setSlot(e.target.value)}
                className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
              >
                <option value="">-- Choose a Slot --</option>
                {availableSlots.map((s, i) => (
                  <option key={i} value={s}>{s}</option>
                ))}
              </select>
            </>
          )}

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Book Slot
          </button>
        </form>
      </div>
    </div>
  );
}
