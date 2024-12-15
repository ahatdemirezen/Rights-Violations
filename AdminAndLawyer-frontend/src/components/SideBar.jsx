import React, { useState } from "react";
import { Link } from "react-router-dom";
import {
  FaGavel,
  FaClipboardList,
  FaUserTie,
  FaArchive,
  FaChevronLeft,
  FaChevronRight,
} from "react-icons/fa";
import BaroLogo from "../assets/sanliurfa-barosu.png"; // Logo için

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);
  const [isArchiveOpen, setIsArchiveOpen] = useState(false); // Arşiv alt menüsü kontrolü

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  const toggleArchiveMenu = () => {
    setIsArchiveOpen(!isArchiveOpen);
  };

  return (
    <div
      className={`relative ${
        isOpen ? "w-56" : "w-14"
      } bg-[#123D3D] text-[#F8F1E8] h-screen flex flex-col transition-all duration-300`}
    >
      {/* Sidebar Aç/Kapat Butonu */}
      <button
        onClick={toggleSidebar}
        className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-[#D4AF37] text-[#123D3D] hover:bg-[#F8F1E8] hover:text-[#D4AF37] p-2 rounded-full shadow-md focus:outline-none"
      >
        {isOpen ? (
          <FaChevronLeft className="text-lg" />
        ) : (
          <FaChevronRight className="text-lg" />
        )}
      </button>

      {/* Kullanıcı Bilgisi */}
      {isOpen && (
        <div className="flex items-center flex-col p-4 border-b border-[#D5C4A1]">
          <div className="w-20 h-20 rounded-full bg-white overflow-hidden shadow-md">
            {/* Logo */}
            <img
              src={BaroLogo}
              alt="Sanlıurfa Barosu"
              className="object-cover w-full h-full"
            />
          </div>
          <h4 className="mt-2 font-semibold text-lg">Admin Panel</h4>
          <p className="text-sm text-[#D5C4A1]">Yönetim</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-grow">
        <ul className="mt-4 space-y-2">
          {/* Davalar */}
          <li className="px-4 py-2 hover:bg-[#D5C4A1] hover:text-[#123D3D] rounded flex items-center transition duration-200">
            <FaGavel className="text-lg mr-3 text-[#D4AF37]" />
            <Link to="/admin/lawsuits" className="block">
              {isOpen ? "Davalar" : "D"}
            </Link>
          </li>

          {/* Başvurular */}
          <li className="px-4 py-2 hover:bg-[#D5C4A1] hover:text-[#123D3D] rounded flex items-center transition duration-200">
            <FaClipboardList className="text-lg mr-3 text-[#D4AF37]" />
            <Link to="/admin/application" className="block">
              {isOpen ? "Başvuru Listesi" : "B"}
            </Link>
          </li>

          {/* Avukat Listesi */}
          <li className="px-4 py-2 hover:bg-[#D5C4A1] hover:text-[#123D3D] rounded flex items-center transition duration-200">
            <FaUserTie className="text-lg mr-3 text-[#D4AF37]" />
            <Link to="/admin/lawyers" className="block">
              {isOpen ? "Avukat Listesi" : "A"}
            </Link>
          </li>

          {/* Arşiv */}
          <li className="px-4 py-2 hover:bg-[#D5C4A1] hover:text-[#123D3D] rounded flex flex-col">
            <div
              className="flex items-center cursor-pointer"
              onClick={toggleArchiveMenu}
            >
              <FaArchive className="text-lg mr-3 text-[#D4AF37]" />
              <span>{isOpen ? "Arşiv" : "A"}</span>
            </div>
            {isArchiveOpen && (
              <ul className="mt-2 ml-4 space-y-2">
                {/* Dava Arşivi */}
                <li className="px-2 py-1 hover:bg-[#F8F1E8] text-[#123D3D] rounded">
                  <Link to="/admin/archive/lawsuits" className="block">
                    {isOpen ? "Dava Arşivi" : "DA"}
                  </Link>
                </li>
                {/* Hak İhlali Dökümantasyon Arşivi */}
                <li className="px-2 py-1 hover:bg-[#F8F1E8] text-[#123D3D] rounded">
                  <Link to="/admin/archive/documents" className="block">
                    {isOpen ? "Hak İhlali Arşivi" : "HA"}
                  </Link>
                </li>
              </ul>
            )}
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <footer className="p-4 text-sm text-[#D5C4A1] border-t border-[#D4AF37]">
        {isOpen ? "© 2024 Hukuk Portalı" : "©"}
      </footer>
    </div>
  );
};

export default Sidebar;
