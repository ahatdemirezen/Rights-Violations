import React, { useState } from "react";
import { useAuthStore } from "../stores/LoginStore";
import { useNavigate } from "react-router-dom";
import BackgroundVideo from "../assets/video.mp4"; // Video dosyasını import edin

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

      <div className="absolute inset-4">
        <video
className="w-[100%] h-[100%] object-contain"    
          src={BackgroundVideo}
          autoPlay
          muted
          loop
        ></video>
        
      </div>

      {/* Login Formu */}
      <div className="absolute inset-0 flex items-center justify-center z-10">
        <div className="bg-black bg-opacity-60 p-6 rounded-lg shadow-lg w-[350px] md:w-[400px]">
          <h2 className="text-xl font-semibold text-center text-gray-300 mb-4">
            Hoşgeldiniz
          </h2>
          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-sm text-gray-400 font-medium mb-2">
                Name Surname
              </label>
              <input
                className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-800 text-gray-300 leading-tight focus:outline-none focus:border-gray-500"
                type="text"
                placeholder="Name Surname"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="mb-6 relative">
              <label className="block text-sm text-gray-400 font-medium mb-2">
                Password
              </label>
              <input
                className="shadow appearance-none border border-gray-600 rounded w-full py-2 px-3 bg-gray-800 text-gray-300 leading-tight focus:outline-none focus:border-gray-500"
                type={showPassword ? "text" : "password"}
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
              <button
                type="button"
                className="absolute inset-y-0 right-0 px-3 py-2 text-gray-500 hover:text-gray-300 focus:outline-none"
                onClick={() => setShowPassword(!showPassword)}
              >
                {showPassword ? "Gizle" : "Göster"}
              </button>
              <div className="text-right mt-2">
                <a
                  href="#"
                  className="text-xs text-gray-500 hover:text-gray-300"
                >
                  Şifremi Unuttum
                </a>
              </div>
            </div>
            <div className="flex items-center justify-center">
              <button
                className="bg-gray-700 hover:bg-gray-600 text-gray-300 font-medium py-2 px-4 rounded focus:outline-none focus:shadow-outline w-full text-sm"
                type="submit"
              >
                Giriş Yap
              </button>
            </div>
            {error && <p className="text-red-500 text-xs mt-4">{error}</p>}
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;
