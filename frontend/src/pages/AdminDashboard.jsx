import { useEffect, useState } from "react";
import axios from "axios";

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
    try {
      await axios.post(`${base}/admin/otp/reveal`, { user_id: userId }, { headers: { "x-user-id": user?.id } });
      const g = await axios.get(`${base}/users/${userId}/otp`);
      const otp = g.data?.otp;
      setOtpMap((m) => ({ ...m, [userId]: otp }));
      alert(`OTP for user ${userId}: ${otp}`);
    } catch (e) {
      console.error(e);
      alert("Failed to reveal OTP");
    }
  };

  const handleVerify = async (userId) => {
    const otp = window.prompt("Enter OTP to verify:");
    if (!otp) return;
    try {
      await axios.post(`${base}/admin/otp/verify`, { user_id: userId, otp: String(otp) }, { headers: { "x-user-id": user?.id } });
      alert("Verified and finished");
      await fetchApplications();
    } catch (e) {
      console.error(e);
      alert("Invalid OTP or error verifying");
    }
  };

  if (loading) return <p>Loading applications...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Admin Dashboard</h2>
      <h3>Pending Applications</h3>
      {rows.length === 0 ? (
        <p>No pending applications.</p>
      ) : (
        <div style={{ overflowX: "auto" }}>
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Token</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>User</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Aadhaar</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Slot</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Rank</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Priority</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>OTP</th>
                <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={`${r.token_id}`}>
                  <td style={{ padding: "6px 4px" }}>{r.token_no}</td>
                  <td style={{ padding: "6px 4px" }}>{r.user?.full_name}</td>
                  <td style={{ padding: "6px 4px" }}>{r.user?.aadhar_number}</td>
                  <td style={{ padding: "6px 4px" }}>{r.slot_ts}</td>
                  <td style={{ padding: "6px 4px" }}>{r.rank_in_slot}</td>
                  <td style={{ padding: "6px 4px" }}>{r.is_priority ? "Yes" : "No"}</td>
                  <td style={{ padding: "6px 4px" }}>{otpMap[r.user?.id] || "—"}</td>
                  <td style={{ padding: "6px 4px", display: "flex", gap: 8 }}>
                    <button onClick={() => handleRevealOtp(r.user?.id)}>Reveal OTP</button>
                    <button onClick={() => handleVerify(r.user?.id)}>Verify</button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}