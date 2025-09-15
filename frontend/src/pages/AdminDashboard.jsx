import { useEffect, useState } from "react";
import axios from "axios";

export default function AdminDashboard() {
  const [pendingUsers, setPendingUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch data when component loads
  useEffect(() => {
    axios
      .get("http://localhost:3000/users/pending")
      .then((response) => {
        setPendingUsers(response.data); // assumes backend sends an array
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setError("Failed to fetch pending users");
        setLoading(false);
      });
  }, []);

  if (loading) return <p>Loading pending users...</p>;
  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Admin Dashboard</h2>
      <h3>Pending Applicants</h3>
      {pendingUsers.length === 0 ? (
        <p>No pending applicants.</p>
      ) : (
        <ul>
          {pendingUsers.map((user, index) => (
            <li key={index}>
              {user.name} — {user.aadharNumber}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}