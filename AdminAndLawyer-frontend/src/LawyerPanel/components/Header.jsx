import React from "react";
import { FaSignOutAlt } from "react-icons/fa";
import { useAuthStore } from "../../stores/LoginStore"; // Zustand store'u içe aktar
import { useNavigate } from "react-router-dom"; // Yönlendirme için hook

const Header = () => {
  const logout = useAuthStore((state) => state.logout); // Logout fonksiyonunu zustand'dan alın
  const navigate = useNavigate(); // Kullanıcıyı yönlendirmek için hook

  // Çıkış yapma işlemi
  const handleLogout = async () => {
    await logout(); // Logout fonksiyonunu çağır
    navigate("/login"); // Kullanıcıyı login sayfasına yönlendir
  };

  return (
    <header className="bg-[#6D8B74] text-[#EFEAD8] shadow-md">
      <div className="max-w-7xl mx-auto px-4 py-3 flex items-center justify-between">
        {/* Logo Ortada */}
        <div className="flex-1 text-center text-2xl font-bold">Hak İhlalleri</div>

        {/* Logout Button */}
        <div className="flex justify-end">
          <button
            onClick={handleLogout} // Çıkış yapma işlemi
            className="flex items-center space-x-2 bg-[#2C4E4A] hover:bg-red-600 text-white px-4 py-2 rounded-md transition"
          >
            <FaSignOutAlt className="text-xl" /> {/* Logout ikonu */}
            <span>Çıkış Yap</span>
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;
