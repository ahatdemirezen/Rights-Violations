import React, { useState } from "react";
import { Link } from "react-router-dom";
import { FaGavel, FaUserTie, FaChevronLeft, FaChevronRight } from "react-icons/fa"; // Yeni ikonlar

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
  };

  return (
    <div
      className={`relative ${
        isOpen ? "w-56" : "w-14"
      } bg-[#6D8B74] text-[#EFEAD8] h-screen flex flex-col transition-all duration-300`}
    >
      {/* Sidebar Aç/Kapat Butonu */}
      <button
        onClick={toggleSidebar}
        className="absolute top-1/2 -right-4 transform -translate-y-1/2 bg-[#2C4E4A] text-[#EFEAD8] hover:text-white p-2 rounded-full shadow-md focus:outline-none"
      >
        {isOpen ? <FaChevronLeft className="text-lg" /> : <FaChevronRight className="text-lg" />}
      </button>

      {/* Kullanıcı Bilgisi */}
      {isOpen && (
        <div className="flex items-center flex-col p-4 border-b border-[#4A766E]">
          <h4 className="mt-2 font-semibold text-lg">Avukat Adı</h4>
          <p className="text-sm text-[#D0C9C0]">Hukuk Uzmanı</p>
        </div>
      )}

      {/* Navigation */}
      <nav className="flex-grow">
        <ul className="mt-4 space-y-2">
          {/* Atanan Vatandaşlar */}
          <li className="px-4 py-2 hover:bg-[#4A766E] rounded flex items-center">
            <FaUserTie className="text-lg mr-3" />
            <Link to="/lawyer/applications" className="block">
              {isOpen ? "Atanan Vatandaşlar" : "A"}
            </Link>
          </li>
          {/* Davalar */}
          <li className="px-4 py-2 hover:bg-[#4A766E] rounded flex items-center">
            <FaGavel className="text-lg mr-3" />
            <Link to="/lawyer/lawsuits" className="block">
              {isOpen ? "Davalar" : "D"}
            </Link>
          </li>
        </ul>
      </nav>

      {/* Footer */}
      <footer className="p-4 text-sm text-[#D0C9C0] border-t border-[#4A766E]">
        {isOpen ? "© 2024 Hukuk Portalı" : "©"}
      </footer>
    </div>
  );
};

export default Sidebar;