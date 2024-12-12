import React from "react";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import AdminPanel from "./Layout/AdminPanel"; // Admin paneli
import LawyerPanel from "./Layout/lawyerPanel"; // Lawyer paneli
import ProtectedRoute from "./access-control/auth-controller"; // ProtectedRoute bileşenini import et

const App = () => {
  return (
    <Router>
      <Routes>
        {/* Varsayılan yönlendirme */}
        <Route path="/" element={<Navigate to="/login" />} />

        {/* Login rotası */}
        <Route path="/login" element={<Login />} />

        {/* Admin Paneli */}
        <Route
          path="/admin/*"
          element={
            <ProtectedRoute>
              <AdminPanel />
            </ProtectedRoute>
          }
        />

        {/* Lawyer Paneli */}
        <Route
          path="/lawyer/*"
          element={
            <ProtectedRoute>
              <LawyerPanel />
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  );
};

export default App;
