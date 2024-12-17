import React, { useState } from "react";
import { FaTwitter, FaGoogle, FaInstagram } from "react-icons/fa"; // İkonlar için
import { MdKeyboardArrowDown } from "react-icons/md"; // Açılır menü için ikon
import { useNavigate } from "react-router-dom"; // Sayfa içi yönlendirme için
import AtaturkPhoto from "../assets/ataturk.png"; // Atatürk fotoğrafının yolu
import UrfaLogo from "../assets/baro.jpeg"; // Logo için görüntü yolu

const Header = () => {
  const [isSSSOpen, setSSSOpen] = useState(false); // SSS menü durumu
  const [isContactOpen, setContactOpen] = useState(false); // İletişim menü durumu

  const navigate = useNavigate(); // Sayfa içi yönlendirme için useNavigate

  const handleExternalLink = (url) => {
    window.open(url, "_blank", "noopener,noreferrer");
  };

  return (
    <header className="w-full bg-[#EAEAEA] shadow-md">
      <div className="max-w-7xl mx-auto flex items-center justify-between py-4 px-6">
        {/* Logo ve Başlık */}
        <div className="flex items-center">
          <img
            src={UrfaLogo}
            alt="Şanlıurfa Barosu Logosu"
            className="h-16 mr-4"
          />
          <div>
            <h1 className="text-2xl font-bold text-[#123D3D]">ŞANLIURFA BAROSU</h1>
            <p className="text-sm text-[#555]">Sanlıurfa Bar Association</p>
          </div>
        </div>

        {/* Menü ve Sosyal Medya İkonları */}
        <div className="flex items-center space-x-8">
          {/* Menü */}
          <div className="flex space-x-6 font-semibold relative">
            {/* SSS Menüsü */}
            <div className="relative">
              <button
                onClick={() => setSSSOpen(!isSSSOpen)}
                className="flex items-center hover:text-[#555] transition"
              >
                SSS <MdKeyboardArrowDown className="ml-1 text-xl" />
              </button>
              {isSSSOpen && (
                <ul className="absolute bg-black bg-opacity-80 backdrop-blur-md text-white border border-gray-600 rounded-md shadow-lg mt-2 py-2 w-48 text-left z-10">
                  <li
                    onClick={() => navigate("/sss/soru1")}
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer rounded-md"
                  >
                    Soru 1
                  </li>
                  <li
                    onClick={() => navigate("/sss/soru2")}
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer rounded-md"
                  >
                    Soru 2
                  </li>
                  <li
                    onClick={() => navigate("/sss/soru3")}
                    className="px-4 py-2 hover:bg-gray-700 cursor-pointer rounded-md"
                  >
                    Soru 3
                  </li>
                </ul>
              )}
            </div>

            {/* İletişim Menüsü */}
            <div className="relative">
              <button
                onClick={() => setContactOpen(!isContactOpen)}
                className="flex items-center hover:text-[#555] transition"
              >
                İletişim <MdKeyboardArrowDown className="ml-1 text-xl" />
              </button>
              {isContactOpen && (
                <ul className="absolute bg-black bg-opacity-80 backdrop-blur-md text-white border border-gray-600 rounded-md shadow-lg mt-2 py-2 w-48 text-left z-10">
                  <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer rounded-md">
                    Telefon: +90 123 456 78 90
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer rounded-md">
                    E-Posta: info@sanliurfabaro.org
                  </li>
                  <li className="px-4 py-2 hover:bg-gray-700 cursor-pointer rounded-md">
                    Adres: Şanlıurfa, Türkiye
                  </li>
                </ul>
              )}
            </div>
          </div>

          {/* Sosyal Medya İkonları */}
          <div className="flex items-center space-x-6">
            <button onClick={() => handleExternalLink("https://twitter.com")}>
              <FaTwitter className="text-[#555] text-2xl hover:text-[#123D3D] transition" />
            </button>
            <button onClick={() => handleExternalLink("https://google.com")}>
              <FaGoogle className="text-[#555] text-2xl hover:text-[#123D3D] transition" />
            </button>
            <button onClick={() => handleExternalLink("https://instagram.com")}>
              <FaInstagram className="text-[#555] text-2xl hover:text-[#123D3D] transition" />
            </button>
          </div>
        </div>

        {/* Sağ: Atatürk Fotoğrafı */}
        <div className="text-center">
          <img
            src={AtaturkPhoto}
            alt="Atatürk"
            className="h-20 rounded-full object-cover mx-auto"
          />
          <p className="mt-2 text-lg italic font-serif text-[#123D3D]">
            “Adalet mülkün temelidir”
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
