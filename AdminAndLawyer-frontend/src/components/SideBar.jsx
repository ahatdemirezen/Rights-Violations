import React, { useState } from "react";
import { Link } from "react-router-dom"; // Link bileşeni
import { FaGavel, FaClipboardList, FaUserTie, FaArchive } from "react-icons/fa"; // İkonlar

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
      className={`${
        isOpen ? "w-56" : "w-14"
      } bg-gray-800 text-white h-screen flex flex-col transition-all duration-300`}
    >
      {/* Sidebar Aç/Kapat Butonu */}
      <button
        onClick={toggleSidebar}
        className="p-4 text-gray-300 hover:text-white focus:outline-none"
      >
        {isOpen ? "Kapat" : "Aç"}
      </button>

      {/* Navigation */}
      <nav className="flex-grow">
        <ul className="mt-4 space-y-2">
          {/* Davalar */}
          <li className="px-4 py-2 hover:bg-gray-700 rounded flex items-center">
            <FaGavel className="text-lg mr-3" />
            <Link to="/admin/lawsuits" className="block">
              {isOpen ? "Davalar" : "D"}
            </Link>
          </li>

          {/* Başvurular */}
          <li className="px-4 py-2 hover:bg-gray-700 rounded flex items-center">
            <FaClipboardList className="text-lg mr-3" />
            <Link to="/admin/application" className="block">
              {isOpen ? "Başvuru Listesi" : "B"}
            </Link>
          </li>

          {/* Avukat Listesi */}
          <li className="px-4 py-2 hover:bg-gray-700 rounded flex items-center">
            <FaUserTie className="text-lg mr-3" />
            <Link to="/admin/lawyers" className="block">
              {isOpen ? "Avukat Listesi" : "A"}
            </Link>
          </li>
         {/* Arşiv */}
         <li className="px-4 py-2 hover:bg-gray-700 rounded flex flex-col">
            <div
              className="flex items-center cursor-pointer"
              onClick={toggleArchiveMenu}
            >
              <FaArchive className="text-lg mr-3" />
              <span>{isOpen ? "Arşiv" : "A"}</span>
            </div>
            {isArchiveOpen && (
              <ul className="mt-2 ml-4 space-y-2">
                {/* Dava Arşivi */}
                <li className="px-2 py-1 hover:bg-gray-600 rounded">
                  <Link to="/admin/archive/lawsuits" className="block">
                    {isOpen ? "Dava Arşivi" : "DA"}
                  </Link>
                </li>
                {/* Hak İhlali Dökümantasyon Arşivi */}
                <li className="px-2 py-1 hover:bg-gray-600 rounded">
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
      <footer className="p-4 text-sm text-gray-400">
        {isOpen ? "© 2024 My App" : "©"}
      </footer>
    </div>
  );
};

export default Sidebar;
