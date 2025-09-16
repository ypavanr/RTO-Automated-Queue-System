export default function AlreadyBooked() {
  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="bg-white p-8 rounded-lg shadow-lg w-full max-w-md text-center">
        <h2 className="text-2xl font-bold mb-4 text-blue-600">You have already booked</h2>
        <p className="mb-6">An active token exists for your account. You cannot book another slot.</p>
        <a href="/token" className="text-blue-600 underline">View my token</a>
      </div>
    </div>
  );
}


