// AdminDashboard.jsx
import React, { useEffect, useState } from "react";
import axios from "axios";

/**
 * AdminDashboard
 * - Uses the same visual language as the Register component (simple card, left info panel, right content)
 * - Shows pending applications in a responsive table
 * - Reveal OTP and Verify actions (calls backend)
 *
 * Drop this file into your React project and import it where needed.
 */

export default function AdminDashboard() {
  const [rows, setRows] = useState([]);
  const [otpMap, setOtpMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const base = process.env.REACT_APP_API_BASE || "";
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const r = await axios.get(`${base}/applications`, {
        params: { status: "ACTIVE", limit: 500 },
        headers: { "x-user-id": user?.id },
      });
      setRows(r.data?.rows || []);
    } catch (e) {
      console.error(e);
      setError("Failed to fetch applications");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchApplications();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleRevealOtp = async (userId) => {
    if (!userId) return alert("No user id");
    try {
      await axios.post(
        `${base}/admin/otp/reveal`,
        { user_id: userId },
        { headers: { "x-user-id": user?.id } }
      );
      const g = await axios.get(`${base}/users/${userId}/otp`, {
        headers: { "x-user-id": user?.id },
      });
      const otp = g.data?.otp;
      setOtpMap((m) => ({ ...m, [userId]: otp }));
      alert(`OTP for user ${userId}: ${otp}`);
    } catch (e) {
      console.error(e);
      alert("Failed to reveal OTP");
    }
  };

  const handleVerify = async (userId) => {
    if (!userId) return alert("No user id");
    const otp = window.prompt("Enter OTP to verify:");
    if (!otp) return;
    try {
      await axios.post(
        `${base}/admin/otp/verify`,
        { user_id: userId, otp: String(otp) },
        { headers: { "x-user-id": user?.id } }
      );
      alert("Verified and finished");
      await fetchApplications();
    } catch (e) {
      console.error(e);
      alert("Invalid OTP or error verifying");
    }
  };

  // Simple inline styles that match the Register card aesthetic
  const styles = {
    page: {
      minHeight: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      background: "linear-gradient(180deg, #ffffff 0%, #f0f9ff 50%, #f8fafc 100%)",
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      color: "#0f172a",
    },
    card: {
      width: "100%",
      maxWidth: "1100px",
      display: "grid",
      gridTemplateColumns: "1fr 2fr",
      gap: "28px",
      alignItems: "start",
    },
    info: {
      background: "linear-gradient(135deg, #0ea5e9, #6366f1)",
      color: "white",
      padding: "22px",
      borderRadius: "14px",
      boxShadow: "0 10px 30px rgba(2,6,23,0.12)",
    },
    panel: {
      background: "#fff",
      borderRadius: "14px",
      padding: "18px",
      boxShadow: "0 8px 20px rgba(2,6,23,0.06)",
    },
    tableWrap: { overflowX: "auto" },
    table: { width: "100%", borderCollapse: "collapse" },
    th: {
      textAlign: "left",
      borderBottom: "1px solid #e6eef8",
      padding: "8px 6px",
      fontSize: "13px",
      color: "#334155",
    },
    td: { padding: "8px 6px", fontSize: "14px", color: "#0f172a" },
    btn: {
      padding: "8px 10px",
      borderRadius: "10px",
      border: "none",
      cursor: "pointer",
      fontWeight: 600,
    },
    revealBtn: {
      background: "#0ea5e9",
      color: "#fff",
      marginRight: 8,
    },
    verifyBtn: {
      background: "#6366f1",
      color: "#fff",
    },
    smallMuted: { fontSize: 12, color: "#94a3b8", marginTop: 10 },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        {/* Left info */}
        <div style={styles.info}>
          <h3 style={{ margin: 0, fontSize: 20, fontWeight: 700 }}>Admin console</h3>
          <p style={{ marginTop: 8, opacity: 0.95 }}>
            Manage and verify pending applications. Use OTP reveal & verify for manual confirmation when required.
          </p>

          <ul style={{ marginTop: 12, paddingLeft: 18 }}>
            <li style={{ marginBottom: 8 }}>View active tokens</li>
            <li style={{ marginBottom: 8 }}>Reveal OTP for manual checks</li>
            <li style={{ marginBottom: 8 }}>Mark verification complete</li>
          </ul>

          <div style={styles.smallMuted}>Tip: actions are logged on the server. Make sure you have admin privileges.</div>
        </div>

        {/* Right table */}
        <div style={styles.panel}>
          <h2 style={{ margin: "0 0 8px 0", fontSize: 18 }}>Pending Applications</h2>

          {loading ? (
            <p>Loading applications...</p>
          ) : error ? (
            <p style={{ color: "red" }}>{error}</p>
          ) : rows.length === 0 ? (
            <p>No pending applications.</p>
          ) : (
            <div style={styles.tableWrap}>
              <table style={styles.table}>
                <thead>
                  <tr>
                    <th style={styles.th}>Token</th>
                    <th style={styles.th}>User</th>
                    <th style={styles.th}>Aadhaar</th>
                    <th style={styles.th}>Slot</th>
                    <th style={styles.th}>Rank</th>
                    <th style={styles.th}>Priority</th>
                    <th style={styles.th}>OTP</th>
                    <th style={styles.th}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {rows.map((r) => {
                    const uid = r.user?.id || r.user_id || "";
                    return (
                      <tr key={r.token_id || `${r.token_no}-${uid}`}>
                        <td style={styles.td}>{r.token_no}</td>
                        <td style={styles.td}>{r.user?.full_name || "—"}</td>
                        <td style={styles.td}>{r.user?.aadhar_number || "—"}</td>
                        <td style={styles.td}>{r.slot_ts || "—"}</td>
                        <td style={styles.td}>{r.rank_in_slot ?? "—"}</td>
                        <td style={styles.td}>{r.is_priority ? "Yes" : "No"}</td>
                        <td style={styles.td}>{otpMap[uid] || "—"}</td>
                        <td style={{ ...styles.td, display: "flex", gap: 8 }}>
                          <button
                            style={{ ...styles.btn, ...styles.revealBtn }}
                            onClick={() => handleRevealOtp(uid)}
                          >
                            Reveal OTP
                          </button>
                          <button
                            style={{ ...styles.btn, ...styles.verifyBtn }}
                            onClick={() => handleVerify(uid)}
                          >
                            Verify
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
