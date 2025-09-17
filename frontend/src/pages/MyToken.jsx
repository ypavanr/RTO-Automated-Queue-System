// MyToken.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";
import { QRCodeCanvas } from "qrcode.react";

/**
 * MyToken — displays the user's active token with a QR code
 * UI matches the Register / app visual language (gradient background, rounded card, subtle shadow)
 *
 * Requirements:
 *  - axios installed
 *  - qrcode.react installed: npm i qrcode.react
 *
 * Usage:
 *  <MyToken />
 */

export default function MyToken() {
  const [token, setToken] = useState(null);
  const [loading, setLoading] = useState(true);
  const [err, setErr] = useState("");
  const base = process.env.REACT_APP_API_BASE || "";
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setErr("");
      if (!userId) {
        setErr("Not signed in.");
        setLoading(false);
        return;
      }
      try {
        const r = await axios.get(`${base}/tokens/active`, { params: { user_id: userId } });
        setToken(r.data || null);
      } catch (e) {
        console.error(e);
        setToken(null);
        setErr("No active token found or failed to fetch.");
      } finally {
        setLoading(false);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  const handleCopy = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      alert("Copied to clipboard");
    } catch (e) {
      console.error(e);
      alert("Failed to copy");
    }
  };

  const handleRefresh = async () => {
    setLoading(true);
    setErr("");
    try {
      const r = await axios.get(`${base}/tokens/active`, { params: { user_id: userId } });
      setToken(r.data || null);
    } catch (e) {
      console.error(e);
      setToken(null);
      setErr("Failed to refresh token.");
    } finally {
      setLoading(false);
    }
  };

  // small helper to format ISO -> local readable
  const formatSlot = (iso) => {
    try {
      const d = new Date(iso);
      return d.toLocaleString();
    } catch {
      return iso || "—";
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-6 bg-gradient-to-br from-white via-sky-50 to-slate-50 dark:from-slate-900 dark:via-slate-800 dark:to-slate-800">
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-8 items-start">
        {/* Left info card (optional contextual panel) */}
        <div className="hidden md:flex flex-col justify-center px-6">
          <div className="bg-gradient-to-tr from-sky-600 to-indigo-600 text-white rounded-3xl p-8 shadow-xl">
            <h3 className="text-2xl font-semibold mb-2">Your Token</h3>
            <p className="text-sm opacity-90">
              This token confirms your booking and slot. Keep it ready (digital or printed) for verification at the RTO.
            </p>

            <ul className="mt-6 space-y-2 text-sm">
              <li>• Bring original Aadhaar for ID verification</li>
              <li>• Arrive within the slot time window</li>
              <li>• OTP (if issued) will be used to verify your identity</li>
            </ul>
          </div>

          <div className="mt-6 text-xs text-slate-500">Tip: Use the QR code to speed up check-in at the help desk.</div>
        </div>

        {/* Right: Token display */}
        <div className="bg-white rounded-2xl shadow-lg p-6 sm:p-8 dark:bg-slate-900 dark:border dark:border-slate-700">
          <h2 className="text-xl sm:text-2xl font-semibold text-slate-800 dark:text-slate-100 mb-2">My Token</h2>
          <p className="text-sm text-slate-500 dark:text-slate-300 mb-4">Active token details and QR code for quick verification.</p>

          {loading ? (
            <div className="p-6 text-center">Loading token...</div>
          ) : err ? (
            <div className="p-4 bg-red-50 text-red-800 rounded-md">{err}</div>
          ) : !token ? (
            <div className="p-4 text-center text-slate-600">No active token found.</div>
          ) : (
            <>
              <div className="flex flex-col items-center gap-4">
                <div className="text-center">
                  <p className="text-lg">
                    <span className="font-semibold">Token Number: </span>
                    <span className="text-slate-700 dark:text-slate-200">{token.token_no || "—"}</span>
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">Slot Time: </span>
                    <span className="text-slate-600 dark:text-slate-300">{formatSlot(token.slot_ts)}</span>
                  </p>
                  <p className="text-sm mt-1">
                    <span className="font-medium">OTP: </span>
                    <span className="text-slate-600 dark:text-slate-300">{token.otp || "—"}</span>
                  </p>
                  <p className={`text-sm mt-2 font-semibold ${token.status === "ACTIVE" ? "text-green-600" : "text-yellow-600"}`}>
                    {token.status || "—"}
                  </p>
                </div>

                <div className="bg-white p-4 rounded-xl shadow-sm">
                  <QRCodeCanvas value={JSON.stringify({
                    token: token.token_no,
                    slot: token.slot_ts,
                    otp: token.otp,
                    status: token.status
                  })} size={180} bgColor="#ffffff" fgColor="#000000" />
                </div>

                <div className="w-full flex gap-3 justify-center mt-2">
                  <button
                    onClick={() => handleCopy(token.token_no || "")}
                    className="inline-flex items-center gap-2 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white py-2 px-4 text-sm font-medium shadow-sm"
                  >
                    Copy Token
                  </button>

                  <button
                    onClick={() => handleCopy(JSON.stringify({
                      token: token.token_no,
                      slot: token.slot_ts,
                      otp: token.otp,
                      status: token.status
                    }))}
                    className="inline-flex items-center gap-2 rounded-2xl border border-slate-200 bg-white hover:bg-slate-50 text-slate-700 py-2 px-4 text-sm font-medium shadow-sm"
                  >
                    Copy QR Payload
                  </button>

                  <button
                    onClick={handleRefresh}
                    className="inline-flex items-center gap-2 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white py-2 px-4 text-sm font-medium shadow-sm"
                  >
                    Refresh
                  </button>
                </div>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
