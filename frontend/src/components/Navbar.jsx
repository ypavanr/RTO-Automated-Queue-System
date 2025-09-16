import { Link, useNavigate } from "react-router-dom";

export default function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");

  const handleLogout = () => {
    setIsLoggedIn(false); // reset login state
    navigate("/"); // redirect to home
  };

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="text-xl font-bold">
        <Link to="/">RTO Queue System</Link>
      </div>
      <div className="flex gap-4">
        <Link to="/">Home</Link>

        {!isLoggedIn && <Link to="/register">Register</Link>}
        {!isLoggedIn && <Link to="/login">Login</Link>}

        {isLoggedIn && <Link to="/book">Book Slot</Link>}
        {isLoggedIn && <Link to="/token">My Token</Link>}
        {isLoggedIn && user?.is_admin && <Link to="/admin">Admin</Link>}

        {isLoggedIn && (
          <button
            onClick={handleLogout}
            className="bg-red-500 px-3 py-1 rounded hover:bg-red-600 transition"
          >
            Logout
          </button>
        )}
      </div>
    </nav>
  );
}