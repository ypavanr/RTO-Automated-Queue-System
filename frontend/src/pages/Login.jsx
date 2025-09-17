// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import axios from "axios";

/**
 * Login page — UI matches the Register / app visual language (Tailwind)
 * - Gradient background, rounded card, subtle shadow
 * - Accessible labels, inline error, loading state
 *
 * Usage:
 *  <Login onLogin={() => setIsLoggedIn(true)} />
 */

export default function Login({ onLogin }) {
  const navigate = useNavigate();
  const [credentials, setCredentials] = useState({ phone: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setCredentials((c) => ({ ...c, [name]: value }));
    setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!credentials.phone || !credentials.password) {
      setError("Please enter phone and password.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      const base = process.env.REACT_APP_API_BASE || "";
      const res = await axios.post(`${base}/login`, credentials);

      if (res.data?.user) {
        localStorage.setItem("user", JSON.stringify(res.data.user));
        localStorage.setItem("user_id", String(res.data.user.id));
      }

      if (typeof onLogin === "function") onLogin();
      const isAdmin = !!res.data?.user?.is_admin;
      navigate(isAdmin ? "/admin" : "/book");
    } catch (err) {
      console.error(err);
      setError("❌ Invalid phone or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-white via-sky-50 to-slate-50">
      <div className="w-full max-w-md bg-white/95 rounded-2xl shadow-lg p-8 sm:p-10 dark:bg-slate-900/90">
        <h2 className="text-2xl sm:text-3xl font-semibold text-slate-800 dark:text-slate-100 text-center">
          Welcome back
        </h2>
        <p className="text-sm text-slate-500 dark:text-slate-300 text-center mt-1 mb-6">
          Sign in to manage your slots and tokens
        </p>

        {error && (
          <div
            role="alert"
            className="mb-4 rounded-lg p-3 text-sm bg-red-50 text-red-800 dark:bg-red-900/30"
          >
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4" noValidate>
          <div>
            <label htmlFor="phone" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Phone number
            </label>
            <input
              id="phone"
              name="phone"
              type="tel"
              inputMode="tel"
              value={credentials.phone}
              onChange={handleChange}
              placeholder="10-digit mobile"
              required
              className="w-full rounded-xl border py-2.5 px-4 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-slate-700 dark:text-slate-200 mb-1">
              Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              value={credentials.password}
              onChange={handleChange}
              placeholder="Enter your password"
              required
              className="w-full rounded-xl border py-2.5 px-4 text-sm shadow-sm placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-400 transition dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100"
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white py-2.5 font-medium shadow-md transition disabled:opacity-60"
          >
            {loading ? (
              <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
              </svg>
            ) : (
              "Login"
            )}
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-500 dark:text-slate-400">
          Don't have an account?{" "}
          <Link to="/register" className="text-sky-600 hover:underline">
            Register here
          </Link>
        </div>
      </div>
    </div>
  );
}
