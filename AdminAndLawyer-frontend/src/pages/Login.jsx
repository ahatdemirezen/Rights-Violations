import React, { useState } from "react";
import { useAuthStore } from "../stores/LoginStore";
import { useNavigate } from "react-router-dom";
import BackgroundVideo from "../assets/login.mp4"; // Video dosyasını import edin
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import Logo from "../assets/foto.jpeg"; // Logoyu import edin

const Login = () => {
  const [name, setName] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const login = useAuthStore((state) => state.login);
  const error = useAuthStore((state) => state.error);

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(name, password);
      const isAuthenticated = useAuthStore.getState().isAuthenticated;
      const userRole = useAuthStore.getState().userRole;

      if (isAuthenticated) {
        if (userRole.includes("admin")) {
          navigate('/admin/application');
        } else if (userRole.includes("lawyer")) {
          navigate('/lawyer/applications');
        } else {
          console.error("Unknown role:", userRole);
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  return (
    
    <div className="relative h-screen w-screen">
      {/* Arka Plan Videosu */}
      <div className="bg-[#C0D9E5] bg-opacity-70 p-6 rounded-lg shadow-lg w-full max-w-[100%] h-full max-h-[100%]">
      </div>

      <div className="absolute inset-0">
        <video
    className="w-full h-full object-cover"
    src={BackgroundVideo}
          autoPlay
          muted
          loop
        ></video>
         {/* Sol Üst Köşe Logo */}
         <img
          src={Logo}
          alt="Logo"
          className="absolute top-1 left-4 w-40 h-40 object-cover rounded-full"
          />
      </div>

      {/* Login Form */}
<div className="absolute inset-0 flex items-center justify-center z-10">
  <div className="bg-[#1B2B27]/60 backdrop-blur-md p-8 rounded-2xl shadow-2xl w-[90%] md:w-[600px] lg:w-[700px]">
    <h2 className="text-3xl font-bold text-center text-[#C3A47E] mb-8">
      Hoşgeldiniz
    </h2>
    <form onSubmit={handleSubmit}>
      <div className="mb-6">
        <label className="block text-lg text-[#C3A47E] font-semibold mb-2">
          Name Surname
        </label>
        <input
          className="shadow-lg appearance-none border border-[#3E4A42] rounded-lg w-full py-3 px-4 bg-[#28332E]/70 text-[#E0E0E0] leading-tight focus:outline-none focus:border-[#C3A47E]"
          type="text"
          placeholder="Name Surname"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="new-password"

        />
      </div>
      <div className="mb-8 relative">
        <label className="block text-lg text-[#C3A47E] font-semibold mb-2">
          Şifre
        </label>
        <input
          className="shadow-lg appearance-none border border-[#3E4A42] rounded-lg w-full py-3 px-4 bg-[#28332E]/70 text-[#E0E0E0] leading-tight focus:outline-none focus:border-[#C3A47E]"
          type={showPassword ? "text" : "password"}
          placeholder="Şifrenizi girin"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button
        type="button"
        className="mt-2 flex items-center gap-2 text-[#C3A47E] hover:text-[#E0E0E0] focus:outline-none"
        onClick={() => setShowPassword(!showPassword)}
      >
        {showPassword ? (
          <>
            <FontAwesomeIcon icon={faEyeSlash} />
            <span>Şifreyi Gizle</span>
          </>
        ) : (
          <>
            <FontAwesomeIcon icon={faEye} />
            <span>Şifreyi Göster</span> 
          </>
        )}
      </button>
      </div>
      <div className="flex items-center justify-center">
        <button
          className="bg-[#3E4A42] hover:bg-[#4A5A50] text-[#C3A47E] font-semibold py-3 px-6 rounded-lg focus:outline-none focus:shadow-outline w-full text-lg"
          type="submit"
        >
          Devam Et →
        </button>
      </div>
      {error && <p className="text-red-500 text-sm mt-6">{error}</p>}
    </form>
  </div>
</div>

    </div>
  );
};

export default Login;
