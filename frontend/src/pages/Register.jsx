import React, { useState } from "react";
import axios from "axios";

export default function Register() {
  const [form, setForm] = useState({
    name: "",
    aadhar: "",
    llNumber: "",
    phone: "",
    password: "",
    llType: "", // for vehicle_classes
    disabilities: "",
  });

  const [message, setMessage] = useState("");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // ✅ Match backend payload format
    const payload = {
      full_name: form.name,
      aadhar_number: form.aadhar,
      ll_application_number: form.llNumber,
      phone: form.phone,
      password: form.password,
      vehicle_classes: form.llType ? [form.llType] : [],
      disabilities: form.disabilities ? [form.disabilities] : [],
    };

    try {
      const res = await axios.post("http://localhost:3000/users", payload);
      setMessage("✅ Registration successful!");
      console.log("Response:", res.data);
    } catch (err) {
      console.error(err);
      setMessage("❌ Registration failed.");
    }
  };

  return (
    <div>
      <h2>Register</h2>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={form.name}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="aadhar"
          placeholder="Aadhar Number"
          value={form.aadhar}
          onChange={handleChange}
          required
        />
        <input
          type="text"
          name="llNumber"
          placeholder="LL Application Number"
          value={form.llNumber}
          onChange={handleChange}
        />
        <input
          type="text"
          name="phone"
          placeholder="Phone Number"
          value={form.phone}
          onChange={handleChange}
          required
        />
        <input
          type="password"
          name="password"
          placeholder="Password"
          value={form.password}
          onChange={handleChange}
          required
        />
        <select
          name="llType"
          value={form.llType}
          onChange={handleChange}
        >
          <option value="">Select Vehicle Class</option>
          <option value="MC">Motorcycle / Scooter (MC)</option>
          <option value="LMV">Car / Jeep (LMV)</option>
          <option value="HMV">Truck / Bus (HMV)</option>
        </select>

        <select
          name="disabilities"
          value={form.disabilities}
          onChange={handleChange}
        >
          <option value="">Select Disability (if any)</option>
          <option value="mobility">Mobility</option>
          <option value="vision">Vision</option>
          <option value="hearing">Hearing</option>
        </select>

        <button type="submit">Register</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}
