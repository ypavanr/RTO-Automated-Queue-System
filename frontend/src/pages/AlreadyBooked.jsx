// AlreadyBooked.jsx
import React from "react";
import { Link } from "react-router-dom";

/**
 * Enhanced AlreadyBooked page
 * - Matches the same visual language used across the app (Register / Admin Dashboard)
 * - Improved layout, typography, accessible buttons/links, and subtle microcopy
 * - Does NOT change the original functionality (still only informs the user and links to /token)
 *
 * Drop this file into your components folder and route it at "/already-booked".
 */

export default function AlreadyBooked() {
  // read booked info (optional, read-only; doesn't change any server state)
  const bookedDate = localStorage.getItem("bookedDate");
  const bookedSlot = localStorage.getItem("bookedSlot");
  const tokenNo = localStorage.getItem("token_no") || null; // optional if you store token locally

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-white via-sky-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-800">
      <div className="w-full max-w-xl bg-white dark:bg-slate-900 rounded-2xl shadow-lg p-8 sm:p-10">
        <div className="flex items-start gap-4">
          {/* Decorative icon */}
          <div className="flex-none bg-sky-100 text-sky-700 dark:bg-sky-900/30 dark:text-sky-300 rounded-xl p-3">
            <svg
              className="w-6 h-6"
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              aria-hidden="true"
              focusable="false"
            >
              <path d="M12 2a10 10 0 100 20 10 10 0 000-20z" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
              <path d="M9.5 12.5l1.75 1.75L15 10.5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          </div>

          <div className="flex-1">
            <h2 className="text-2xl font-semibold text-slate-800 dark:text-slate-100">You have already booked</h2>
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              An active token exists for your account. You cannot book another slot while that token is active.
            </p>

            {/* Optional local details (helpful to users) */}
            {(bookedDate || bookedSlot || tokenNo) && (
              <div className="mt-4 bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-700 rounded-lg p-3 text-sm">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-xs text-slate-500">Booked date</div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{bookedDate || "—"}</div>
                  </div>
                  <div>
                    <div className="text-xs text-slate-500">Slot</div>
                    <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{bookedSlot || "—"}</div>
                  </div>
                  {tokenNo && (
                    <div>
                      <div className="text-xs text-slate-500">Token</div>
                      <div className="text-sm font-medium text-slate-700 dark:text-slate-200">{tokenNo}</div>
                    </div>
                  )}
                </div>
              </div>
            )}

            <div className="mt-6 flex flex-col sm:flex-row gap-3">
              <Link
                to="/token"
                className="inline-flex items-center justify-center gap-2 rounded-2xl bg-gradient-to-r from-sky-600 to-indigo-600 hover:from-sky-700 hover:to-indigo-700 text-white px-4 py-2 text-sm font-semibold shadow-md transition"
              >
                {/* small arrow icon */}
                <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" aria-hidden focusable="false">
                  <path d="M5 12h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M12 5l7 7-7 7" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
                View my token
              </Link>

              <Link
                to="/"
                className="inline-flex items-center justify-center gap-2 rounded-2xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-100 px-4 py-2 text-sm font-medium shadow-sm transition"
              >
                Back to home
              </Link>
            </div>

            <p className="mt-4 text-xs text-slate-400">
              If you think this is a mistake, contact the RTO office or check your registered mobile/email for token details.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
