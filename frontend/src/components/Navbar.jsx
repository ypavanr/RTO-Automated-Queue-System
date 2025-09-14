import { Link } from "react-router-dom";

export default function Navbar() {
  return (
    <nav className="p-4 bg-blue-600 text-white flex gap-4">
      <Link to="/">Home</Link>
      <Link to="/register">Register</Link>
      <Link to="/book">Book Slot</Link>
      <Link to="/token">My Token</Link>
      <Link to="/admin">Admin</Link>
    </nav>
  );
}
