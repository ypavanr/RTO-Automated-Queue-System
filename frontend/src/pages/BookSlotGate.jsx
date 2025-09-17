import React, { useEffect, useState } from "react";
import axios from "axios";
import BookSlot from "./BookSlot";
import { useNavigate } from "react-router-dom";

export default function BookSlotGate() {
  const navigate = useNavigate();
  const [decision, setDecision] = useState("checking"); // checking | allow | redirect

  useEffect(() => {
    const run = async () => {
      const userId = localStorage.getItem("user_id");
      if (!userId) {
        navigate("/login", { replace: true });
        return;
      }
      try {
        const base = process.env.REACT_APP_API_BASE || "http://localhost:3000";
        const r = await axios.get(`${base}/tokens/active`, { params: { user_id: Number(userId) } });
        if (r?.data?.token_id) {
          navigate("/already-booked", { replace: true });
          setDecision("redirect");
        } else {
          setDecision("allow");
        }
      } catch (e) {
        // 404 (no active token) -> allow
        if (e?.response?.status === 404) {
          setDecision("allow");
        } else {
          // on network error, still allow booking
          setDecision("allow");
        }
      }
    };
    run();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  if (decision === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-slate-600">Checking your booking status…</div>
      </div>
    );
  }

  if (decision === "redirect") return null;

  return <BookSlot />;
}


