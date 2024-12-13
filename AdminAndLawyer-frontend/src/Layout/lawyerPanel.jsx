import React from "react";
import { Routes, Route } from "react-router-dom";
import ApplicationListPage from "../LawyerPanel/pages/ApplicationListForLawyer";
import Sidebar from "../LawyerPanel/components/SideBar";
import ApplicationDetails from "../LawyerPanel/pages/ApplicationDetailForLawyer";
import LawsuitList from "../LawyerPanel/pages/LawsuitListPage"; 
import LawsuitDetails from "../LawyerPanel/pages/LawsuitDetailsForLawyer";
import Header from "../LawyerPanel/components/Header";
import CalendarPage from "../LawyerPanel/pages/CalendarPage";

const LawyerPanel = () => {
  return (
    <div className="flex h-screen">
     <Sidebar />
      <div className="flex-grow flex flex-col">
      <Header />
        <div className="flex-grow overflow-y-auto">
          <Routes>
            <Route path="/applications" element={<ApplicationListPage />} />
            <Route path="/applications/:applicationId" element={<ApplicationDetails />} />
            <Route path="/lawsuits" element={<LawsuitList />} />
            <Route path="/lawsuitdetail/:lawsuitId" element={<LawsuitDetails />} />
            <Route path="/calendar" element={<CalendarPage />} />

            {/* Diğer lawyer sayfaları */}
          </Routes>
        </div>
      </div>
    </div>
  );
};

export default LawyerPanel;
