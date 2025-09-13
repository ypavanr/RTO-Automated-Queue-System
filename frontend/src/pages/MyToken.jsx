import { QRCodeCanvas } from "qrcode.react";

export default function MyToken() {
  const bookedSlot = localStorage.getItem("bookedSlot") || "10:30 AM";
  const randomNum = Math.floor(100 + Math.random() * 900);
  const tokenNumber = `QM-${randomNum}`;

  const tokenData = {
    token: tokenNumber,
    slot: bookedSlot,
    status: "Confirmed",
  };

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="p-6 max-w-md mx-auto bg-white shadow-lg rounded-lg">
        <h2 className="text-2xl font-bold mb-4 text-center text-blue-600">My Token</h2>

        <div className="flex flex-col gap-2 mb-4 text-center">
          <p className="text-lg"><span className="font-semibold">Token Number:</span> {tokenData.token}</p>
          <p className="text-lg"><span className="font-semibold">Slot Time:</span> {tokenData.slot}</p>
          <p className="text-lg text-green-600 font-semibold">{tokenData.status}</p>
        </div>

        <div className="flex justify-center">
          <QRCodeCanvas value={JSON.stringify(tokenData)} size={180} bgColor="#ffffff" fgColor="#000000" />
        </div>
      </div>
    </div>
  );
}
