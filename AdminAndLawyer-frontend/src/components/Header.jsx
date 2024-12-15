import React from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { useAuthStore } from "../stores/LoginStore"; // Zustand store'u içe aktar
import { useNavigate } from "react-router-dom"; // Yönlendirme için

const Header = () => {
  const logout = useAuthStore((state) => state.logout); // Logout fonksiyonunu zustand'dan alın
  const navigate = useNavigate(); // Kullanıcıyı yönlendirmek için hook

  // Çıkış yapma işlemi
  const handleLogout = async () => {
    await logout(); // Logout fonksiyonunu çağır
    navigate("/login"); // Kullanıcıyı login sayfasına yönlendir
  };

  return (
    <header className="bg-[#123D3D] text-[#F8F1E8] shadow-lg">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo */}
        <div className="text-2xl font-bold text-[#F8F1E8]">
          Hak İhlalleri
        </div>

        {/* Logout Button */}
        <button
          onClick={handleLogout} // Çıkış yapma işlemi
          className="flex items-center space-x-2 bg-[#D4AF37] hover:bg-[#D5C4A1] text-[#123D3D] px-4 py-2 rounded-md font-medium transition duration-300 shadow-md"
        >
          <FaSignOutAlt /> {/* Logout ikonu */}
          <span>Çıkış Yap</span>
        </button>
      </div>
    </header>
  );
};

export default Header;
