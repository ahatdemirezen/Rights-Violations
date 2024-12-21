import React, { useState } from "react";
import { useAuthStore } from "../stores/LoginStore";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faEye, faEyeSlash } from "@fortawesome/free-solid-svg-icons";
import BackgroundImage from "../assets/ff.jpg"; // Resim dosyasını import edin
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom"; // Yönlendirme için

const ResetPassword = () => {
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordStrength, setPasswordStrength] = useState("");
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const token = new URLSearchParams(window.location.search).get("token");
  const navigate = useNavigate(); // Yönlendirme için

  const resetPassword = useAuthStore((state) => state.resetPassword);

  const checkPasswordStrength = (password) => {
    if (password.length < 8) return "Zayıf";
    if (/[A-Z]/.test(password) && /[0-9]/.test(password) && /[@$!%*?&]/.test(password))
      return "Güçlü";
    return "Orta";
  };

  const generateStrongPassword = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@$!%*?&";
    let password = "";
    for (let i = 0; i < 12; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setNewPassword(password);
    setPasswordStrength("Güçlü");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (newPassword !== confirmPassword) {
      toast.error("Şifreler eşleşmiyor.");
      return;
    }

    try {
      await resetPassword(token, newPassword);
      toast.success("Şifre başarıyla sıfırlandı!");
      
      // 2 saniye bekleyip giriş sayfasına yönlendir
      setTimeout(() => {
        navigate("/login"); // Giriş sayfasına yönlendirme
      }, 2000); // 2 saniye
    } catch (error) {
      toast.error("Bir hata oluştu: " + error.message);
    }
  };

  const handlePasswordChange = (e) => {
    const value = e.target.value;
    setNewPassword(value);
    setPasswordStrength(checkPasswordStrength(value));
  };

  return (
    <div
      className="min-h-screen flex items-center justify-start pl-64"
      style={{
        backgroundImage: `url(${BackgroundImage})`,
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
      }}
    >
      <div className="max-w-lg w-full bg-[#D4E6D1]/10 rounded-2xl shadow-xl p-8 backdrop-blur-2xl">
        <h2 className="text-3xl font-bold text-gray-800 text-center mb-6">Şifre Sıfırla</h2>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
              Yeni Şifre
            </label>
            <div className="relative mt-1">
              <input
                type={showNewPassword ? "text" : "password"}
                id="newPassword"
                placeholder="Yeni Şifre"
                value={newPassword}
                onChange={handlePasswordChange}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-600"
                onClick={() => setShowNewPassword((prev) => !prev)}
              >
                <FontAwesomeIcon icon={showNewPassword ? faEyeSlash : faEye} />
              </button>
            </div>
            <p
              className={`text-sm mt-2 ${
                passwordStrength === "Güçlü"
                  ? "text-green-600"
                  : passwordStrength === "Orta"
                  ? "text-yellow-600"
                  : "text-red-600"
              }`}
            >
              Şifre Gücü: {passwordStrength}
            </p>
            <button
              type="button"
              onClick={generateStrongPassword}
              className="text-sm text-green-700 hover:underline mt-2"
            >
              Güçlü Şifre Öner
            </button>
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
              Şifreyi Onayla
            </label>
            <div className="relative mt-1">
              <input
                type={showConfirmPassword ? "text" : "password"}
                id="confirmPassword"
                placeholder="Şifreyi Onayla"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                className="block w-full px-4 py-3 border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-green-500 focus:border-green-500"
              />
              <button
                type="button"
                className="absolute inset-y-0 right-3 flex items-center text-gray-600"
                onClick={() => setShowConfirmPassword((prev) => !prev)}
              >
                <FontAwesomeIcon icon={showConfirmPassword ? faEyeSlash : faEye} />
              </button>
            </div>
          </div>
          <button
            type="submit"
            className="w-full bg-green-600 text-white py-3 px-4 rounded-lg shadow-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
          >
            Şifreyi Sıfırla
          </button>
        </form>
      </div>
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
};

export default ResetPassword;
