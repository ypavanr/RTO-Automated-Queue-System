import { useEffect, useState } from "react";
import { QRCodeCanvas } from "qrcode.react";
import axios from "axios";

export default function MyToken() {
  const [token, setToken] = useState(null);
  const base = process.env.REACT_APP_API_BASE || "";
  const userId = localStorage.getItem("user_id");

  useEffect(() => {
    const load = async () => {
      if (!userId) return;
      try {
        const r = await axios.get(`${base}/tokens/active`, { params: { user_id: userId } });
        setToken(r.data);
      } catch (e) {
        console.error(e);
      }
    };
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [userId]);

  if (!token) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-lg">
          <p>No active token found.</p>
        </div>
      </div>
    );
  }

  const tokenData = {
    token: token.token_no,
    slot: token.slot_ts,
    otp: token.otp,
    status: token.status,
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">My Token</h2>

        <div className="flex flex-col gap-2 mb-4 text-center">
          <p className="text-lg"><span className="font-semibold">Token Number:</span> {tokenData.token}</p>
          <p className="text-lg"><span className="font-semibold">Slot Time:</span> {tokenData.slot}</p>
          <p className="text-lg"><span className="font-semibold">OTP:</span> {tokenData.otp || "—"}</p>
          <p className="text-lg text-green-600 font-semibold">{tokenData.status}</p>
        </div>

        <div className="flex justify-center">
          <QRCodeCanvas value={JSON.stringify(tokenData)} size={180} bgColor="#ffffff" fgColor="#000000" />
        </div>
      </div>
    </div>
  );
}
