import { useState } from "react";
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Register from "./pages/Register";
import BookSlot from "./pages/BookSlot";
import MyToken from "./pages/MyToken";
import AdminDashboard from "./pages/AdminDashboard";
import Login from "./pages/Login";

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  return (
    <Router>
      <Navbar isLoggedIn={isLoggedIn} setIsLoggedIn={setIsLoggedIn} />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/register" element={<Register />} />
        <Route path="/login" element={<Login onLogin={() => setIsLoggedIn(true)} />} />

        {/* Protected routes for logged-in users */}
        <Route
          path="/book"
          element={isLoggedIn ? <BookSlot /> : <Navigate to="/login" />}
        />
        <Route
          path="/token"
          element={isLoggedIn ? <MyToken /> : <Navigate to="/login" />}
        />

        {/* Protected admin route */}
        <Route
          path="/admin"
          element={isLoggedIn ? <AdminDashboard /> : <Navigate to="/login" />}
        />

        {/* Catch-all: redirect unknown routes to home */}
        <Route path="*" element={<Navigate to="/" />} />
      </Routes>
    </Router>
  );
}

export default App;