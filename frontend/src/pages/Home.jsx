// Home.jsx
import React from "react";
import { Link } from "react-router-dom";

/**
 * Home page — matching the same visual language as the Register page (Tailwind)
 * - Centered card, soft gradient background
 * - Rounded corners, subtle shadow, condensed typography
 * - Primary CTA matches button style used across the app
 */

export default function Home() {
  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-white via-sky-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-800">
      <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
        {/* Left: Hero card */}
        <div className="bg-gradient-to-tr from-sky-600 to-indigo-600 text-white rounded-3xl p-8 shadow-xl">
          <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-2">Queue Master</h1>
          <p className="text-sm sm:text-base opacity-90 mb-6">
            Smart RTO Queue Management — book your slot, get a token, and skip long lines.
          </p>

          <ul className="text-sm space-y-2">
            <li>• Book a convenient slot in advance</li>
            <li>• Receive a token and estimated waiting time</li>
            <li>• Faster verification with Aadhaar integration</li>
          </ul>

          <div className="mt-6">
            <small className="text-xs opacity-90">Tip: Keep your Aadhaar and DL/RC handy when you visit the RTO.</small>
          </div>
        </div>

        {/* Right: Actions / Quick links */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 dark:bg-slate-900 dark:border dark:border-slate-700">
          <h2 className="text-xl font-semibold text-slate-800 dark:text-slate-100 mb-2">Welcome</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300 mb-6">
            Use Queue Master to reserve slots, view your token, and manage your appointments.
          </p>

          <div className="space-y-4">
            <Link
              to="/book-slot"
              className="w-full inline-flex items-center justify-center rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white py-2.5 font-medium shadow-md transition"
            >
              Book a slot
            </Link>

            <Link
              to="/token"
              className="w-full inline-flex items-center justify-center rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 py-2.5 font-medium shadow-sm transition"
            >
              View my token
            </Link>

            <Link
              to="/register"
              className="w-full inline-flex items-center justify-center rounded-2xl bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-800 dark:text-slate-100 py-2.5 font-medium shadow-sm transition"
            >
              Register / Update profile
            </Link>
          </div>

          <div className="mt-6 text-xs text-slate-400">
            Need help? Visit the help center or contact your local RTO office.
          </div>
        </div>
      </div>
    </div>
  );
}
