import React from "react";
import Login from "./pages/Login";
import { BrowserRouter as Router, Route, Routes, Navigate } from "react-router-dom";
import ApplicationList from "./pages/applicationList";
import Sidebar from "./components/SideBar";
import Header from "./components/Header";
import LawyerList from "./pages/LawyerListPage"; // Avukat listesi bileşeni

const App = () => {
  return (
    <Router>
      <div className="flex h-screen">
        {/* Sidebar */}
        <Sidebar />

        {/* Main Content */}
        <div className="flex-grow flex flex-col">
          {/* Header */}
          <Header />

          {/* Routes */}
          <div className="flex-grow overflow-y-auto">
            <Routes>
              <Route path="/" element={<Navigate to="/login" />} /> {/* Ana yönlendirme */}
              <Route path="/login" element={<Login />} /> {/* Login rotası */}
              <Route path="/application" element={<ApplicationList />} /> {/* Application listesi rotası */}
              <Route path="/lawyers" element={<LawyerList />} /> {/* Avukat listesi rotası */}
            </Routes>
          </div>
        </div>
      </div>
    </Router>
  );
};

export default App;
