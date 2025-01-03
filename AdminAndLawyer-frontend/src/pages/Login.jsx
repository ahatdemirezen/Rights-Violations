import React, { useState } from "react";
import { useAuthStore } from "../stores/LoginStore";
import { useNavigate } from "react-router-dom";
import BackgroundVideo from "../assets/login.mp4"; // Video dosyasını import edin
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash, faFish } from "@fortawesome/free-solid-svg-icons";
import Logo from "../assets/foto.jpeg"; // Logoyu import edin

const Login = () => {
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState("");
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [feedbackMessage, setFeedbackMessage] = useState("");

  const login = useAuthStore((state) => state.login);
  const forgotPassword = useAuthStore((state) => state.forgotPassword);
  const error = useAuthStore((state) => state.error);
  const navigate = useNavigate();

  // Login işlemi
  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      await login(name, password);
      const isAuthenticated = useAuthStore.getState().isAuthenticated;
      const userRole = useAuthStore.getState().userRole;

      if (isAuthenticated) {
        if (userRole.includes("admin")) {
          navigate("/admin/application");
        } else if (userRole.includes("lawyer")) {
          navigate("/lawyer/applications");
        } else {
          console.error("Unknown role:", userRole);
        }
      }
    } catch (error) {
      console.error("Login failed:", error);
    }
  };

  // Şifre sıfırlama işlemi
  const handleForgotPassword = async () => {
    try {
      const message = await forgotPassword(email);
      setFeedbackMessage(`Başarılı: ${message}`);
    } catch (error) {
      setFeedbackMessage(`Hata: ${error.message}`);
    }
  };

  return (
    <div className="relative h-screen w-screen">
      {/* Arka Plan Videosu */}
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
            <div className="flex items-center justify-center mt-4">
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-[#C3A47E] hover:underline focus:outline-none"
              >
                <FontAwesomeIcon icon={faFish} className="text-[#C3A47E]" />
                Şifremi Unuttum
              </button>
            </div>
          </form>

          {/* Şifremi Unuttum Modal */}
          {showForgotPasswordModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
              <div className="bg-[#1B2B27]/80 backdrop-blur-md rounded-2xl shadow-2xl p-8 w-[90%] md:w-[600px] lg:w-[700px]">
                <h2 className="text-3xl font-bold text-center text-[#C3A47E] mb-6">
                  Şifrenizi Sıfırlayın
                </h2>
                <p className="text-lg text-center text-[#C3A47E] mb-8">
                Lütfen sistemimize kayıtlı avukat e-posta adresinizi girin. Şifre sıfırlama bağlantısını göndereceğiz.
                </p>
                <input
                  type="email"
                  placeholder="E-posta adresinizi girin"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="shadow-lg appearance-none border border-[#3E4A42] rounded-lg w-full py-3 px-4 bg-[#28332E] text-[#E0E0E0] placeholder-[#C3A47E] focus:outline-none focus:border-[#C3A47E] mb-6"
                />
                <button
                  className="bg-[#3E4A42] hover:bg-[#4A5A50] text-[#C3A47E] font-semibold py-3 px-6 rounded-lg w-full mb-4 focus:outline-none focus:shadow-outline"
                  onClick={handleForgotPassword}
                >
                  Gönder
                </button>
                <button
                  className="bg-[#3E4A42] hover:bg-red-600 text-[#C3A47E] font-semibold py-3 px-6 rounded-lg w-full focus:outline-none focus:shadow-outline"
                  onClick={() => setShowForgotPasswordModal(false)}
                >
                  Kapat
                </button>
                {feedbackMessage && (
                  <p
                    className={`text-center mt-6 text-lg ${
                      feedbackMessage.includes("Başarılı")
                        ? "text-green-500"
                        : "text-red-500"
                    }`}
                  >
                    {feedbackMessage}
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Login;
