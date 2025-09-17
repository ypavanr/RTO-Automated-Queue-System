import React from "react";
 

// AlreadyBooked page styled in the same UI style as AdminDashboard / Register card
export default function AlreadyBooked() {
  const styles = {
    page: {
      minHeight: "80vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      padding: "1.5rem",
      background:
        "linear-gradient(180deg, #ffffff 0%, #f0f9ff 50%, #f8fafc 100%)",
      fontFamily:
        'Inter, ui-sans-serif, system-ui, -apple-system, "Segoe UI", Roboto, "Helvetica Neue", Arial',
      color: "#0f172a",
    },
    card: {
      background: "#fff",
      borderRadius: "14px",
      padding: "28px",
      boxShadow: "0 8px 20px rgba(2,6,23,0.06)",
      width: "100%",
      maxWidth: "480px",
      textAlign: "center",
    },
    title: {
      fontSize: "22px",
      fontWeight: 700,
      marginBottom: "12px",
      color: "#0ea5e9",
    },
    paragraph: {
      marginBottom: "20px",
      fontSize: "15px",
      color: "#334155",
    },
    link: {
      color: "#0ea5e9",
      textDecoration: "underline",
      fontWeight: 600,
    },
  };

  return (
    <div style={styles.page}>
      <div style={styles.card}>
        <h2 style={styles.title}>You have already booked</h2>
        <p style={styles.paragraph}>
          An active token exists for your account. You cannot book another slot.
        </p>
        <a href="/token" style={styles.link}>
          View my token
        </a>
      </div>
    </div>
  );
}