// Navbar.jsx
import React, { useState } from "react";
import { NavLink, Link, useNavigate } from "react-router-dom";

/**
 * Props:
 *  - isLoggedIn: boolean
 *  - setIsLoggedIn: function
 *
 * Keeps minimal external dependencies (Tailwind + lucide-react).
 */

export default function Navbar({ isLoggedIn, setIsLoggedIn }) {
  const navigate = useNavigate();
  const user = JSON.parse(localStorage.getItem("user") || "null");
  const [open, setOpen] = useState(false);

  const handleLogout = () => {
    // clear relevant local data (adjust to your app's needs)
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    setIsLoggedIn(false);
    navigate("/");
  };

  const navLinkClass = ({ isActive }) =>
    `px-3 py-2 rounded-lg text-sm font-medium transition ${
      isActive
        ? "bg-wh  ite/20 text-white shadow-sm"
        : "text-white/90 hover:bg-white/10"
    }`;

  return (
    <header className="sticky top-0 z-40 bg-gradient-to-r from-sky-600 to-indigo-600/95 backdrop-blur-sm shadow-md">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-16 items-center justify-between">
          {/* Left: brand */}
          <div className="flex items-center gap-3">
            <Link to="/" className="flex items-center gap-3">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-white/20">
                {/* small badge / logo */}
                <svg
                  className="w-6 h-6 text-white"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path d="M3 12h18" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M6 6h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                  <path d="M6 18h12" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              </div>
              <div className="text-white">
                <div className="text-lg font-semibold leading-none">RTO Queue</div>
                <div className="text-xs opacity-90 -mt-0.5">Smart appointments</div>
              </div>
            </Link>
          </div>

          {/* Desktop nav */}
          <nav className="hidden md:flex items-center gap-2">
            <NavLink to="/" className={navLinkClass}>
              Home
            </NavLink>

            {!isLoggedIn && (
              <>
                <NavLink to="/register" className={navLinkClass}>
                  Register
                </NavLink>
                <NavLink to="/login" className={navLinkClass}>
                  Login
                </NavLink>
              </>
            )}

            {isLoggedIn && (
              <>
                <NavLink to="/book" className={navLinkClass}>
                  Book Slot
                </NavLink>
                <NavLink to="/token" className={navLinkClass}>
                  My Token
                </NavLink>
                {user?.is_admin && (
                  <NavLink to="/admin" className={navLinkClass}>
                    Admin
                  </NavLink>
                )}
              </>
            )}
          </nav>

          {/* Right: user / actions */}
          <div className="flex items-center gap-3">
            {/* user display for desktop */}
            {isLoggedIn ? (
              <div className="hidden md:flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/6 rounded-xl py-1 px-2">
                  <svg
                    className="w-6 h-6 text-white/90"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path d="M15 6v12a3 3 0 103-3H6a3 3 0 103 3V6a3 3 0 10-3 3h12a3 3 0 10-3-3" />
                  </svg>
                  <div className="text-sm text-white/95 font-medium">
                    {user?.full_name || user?.name || "User"}
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 bg-white/10 text-white px-3 py-1 rounded-lg hover:bg-white/20 transition"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    aria-hidden
                  >
                    <path d="M15 6v12a3 3 0 103-3H6a3 3 0 103 3V6a3 3 0 10-3 3h12a3 3 0 10-3-3" />
                  </svg>
                  <span className="text-sm">Logout</span>
                </button>
              </div>
            ) : null}

            {/* Mobile hamburger */}
            <button
              onClick={() => setOpen((s) => !s)}
              aria-expanded={open}
              aria-label={open ? "Close menu" : "Open menu"}
              className="md:hidden inline-flex items-center justify-center p-2 rounded-lg text-white hover:bg-white/10 focus:outline-none focus:ring-2 focus:ring-white/30"
            >
              {open ? (
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path d="M18 6L6 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                  <path d="M6 6l12 12" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              ) : (
                <svg
                  className="w-6 h-6"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  aria-hidden
                >
                  <path d="M4 6h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4 12h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                  <path d="M4 18h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/10">
          <div className="px-4 pb-4 pt-3 space-y-2">
            <NavLink to="/" onClick={() => setOpen(false)} className={({ isActive }) => `block ${navLinkClass({ isActive })}`}>
              Home
            </NavLink>

            {!isLoggedIn && (
              <>
                <NavLink to="/register" onClick={() => setOpen(false)} className={({ isActive }) => `block ${navLinkClass({ isActive })}`}>
                  Register
                </NavLink>
                <NavLink to="/login" onClick={() => setOpen(false)} className={({ isActive }) => `block ${navLinkClass({ isActive })}`}>
                  Login
                </NavLink>
              </>
            )}

            {isLoggedIn && (
              <>
                <NavLink to="/book" onClick={() => setOpen(false)} className={({ isActive }) => `block ${navLinkClass({ isActive })}`}>
                  Book Slot
                </NavLink>
                <NavLink to="/token" onClick={() => setOpen(false)} className={({ isActive }) => `block ${navLinkClass({ isActive })}`}>
                  My Token
                </NavLink>
                {user?.is_admin && (
                  <NavLink to="/admin" onClick={() => setOpen(false)} className={({ isActive }) => `block ${navLinkClass({ isActive })}`}>
                    Admin
                  </NavLink>
                )}

                <div className="pt-2">
                  <button
                    onClick={() => {
                      setOpen(false);
                      handleLogout();
                    }}
                    className="w-full text-left flex items-center gap-2 px-3 py-2 rounded-lg text-white bg-red-500 hover:bg-red-600 transition"
                  >
                    <svg
                      className="w-4 h-4"
                      viewBox="0 0 24 24"
                      fill="none"
                      xmlns="http://www.w3.org/2000/svg"
                      aria-hidden
                    >
                      <path d="M15 6v12a3 3 0 103-3H6a3 3 0 103 3V6a3 3 0 10-3 3h12a3 3 0 10-3-3" />
                    </svg>
                    Logout
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
