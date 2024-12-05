import React, { useState } from "react";
import { Link } from "react-router-dom"; // Link bileşeni
import { FaGavel, FaClipboardList, FaUserTie } from "react-icons/fa"; // İkonlar

const Sidebar = () => {
  const [isOpen, setIsOpen] = useState(true);

  const toggleSidebar = () => {
    setIsOpen(!isOpen);
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
            <Link to="/cases" className="block">
              {isOpen ? "Davalar" : "D"}
            </Link>
          </li>

          {/* Başvurular */}
          <li className="px-4 py-2 hover:bg-gray-700 rounded flex items-center">
            <FaClipboardList className="text-lg mr-3" />
            <Link to="/application" className="block">
              {isOpen ? "Başvuru Listesi" : "B"}
            </Link>
          </li>

          {/* Avukat Listesi */}
          <li className="px-4 py-2 hover:bg-gray-700 rounded flex items-center">
            <FaUserTie className="text-lg mr-3" />
            <Link to="/lawyers" className="block">
              {isOpen ? "Avukat Listesi" : "A"}
            </Link>
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
