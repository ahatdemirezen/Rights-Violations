import React from "react";
import { Routes, Route } from "react-router-dom";
import Sidebar from "../components/SideBar";
import Header from "../components/Header";
import ApplicationList from "../pages/applicationList";
import LawyerList from "../pages/LawyerListPage";
import LawsuitDetails from "../pages/LawsuitDetail"; // Yeni detay sayfası
import LawsuitListPage from "../pages/LawsuitListPage"; // Davalar listesi bileşeni
import LawsuitArchive from "../pages/LawsuitArchive"
import CreateApplication from "../pages/CreateApplicationPage"
import DcoumentArchive from "../pages/DocumentArchive"


const AdminPanel = () => {
  return (
    <div className="flex h-screen">
      <Sidebar />
      <div className="flex-grow flex flex-col">
        <Header />
        <div className="flex-grow overflow-y-auto">
          <Routes>
            <Route path="/application" element={<ApplicationList />} />
            <Route path="/lawyers" element={<LawyerList />} />
            <Route path="/lawsuits" element={<LawsuitListPage />} /> {/* Davalar listesi rotası */}
            <Route path="/lawsuit/:lawsuitId" element={<LawsuitDetails />} />
            <Route path="/archive/lawsuits" element={<LawsuitArchive />} />
            <Route path="/new-application" element={<CreateApplication />} />
            <Route path="/archive/documents" element={<DcoumentArchive />} />

            {/* Diğer admin sayfaları */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default AdminPanel;
