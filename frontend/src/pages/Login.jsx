import { useState } from "react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({
    phone: "",
    password: "",
  });
  const [error, setError] = useState("");

  const handleChange = (e) => {
    setCredentials({ ...credentials, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.phone || !credentials.password) return;

    try {
      // ✅ Call backend API
      const base = process.env.REACT_APP_API_BASE || "";
      const res = await axios.post(`${base}/login`, credentials);

      console.log("Login success:", res.data);

      // Store full user object including is_admin
      if (res.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("user_id", String(res.data.user.id));
      }

      onLogin();
      const isAdmin = !!res.data?.user?.is_admin;
      navigate(isAdmin ? "/admin" : "/book");
    } catch (err) {
      console.error(err);
      setError("❌ Invalid phone or password");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-2xl font-bold mb-6 text-center text-blue-600">
          Login
        </h2>
        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          <input
            name="phone"
            placeholder="Phone Number"
            value={credentials.phone}
            onChange={handleChange}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />
          <input
            name="password"
            type="password"
            placeholder="Password"
            value={credentials.password}
            onChange={handleChange}
            className="border p-2 rounded focus:outline-none focus:ring-2 focus:ring-blue-400"
            required
          />

          {error && <p className="text-red-500 text-sm">{error}</p>}

          <button
            type="submit"
            className="bg-blue-500 text-white p-2 rounded hover:bg-blue-600 transition"
          >
            Login
          </button>
        </form>
      </div>
    </div>
  );
}
