import React, { useState } from "react";
import useLawyerListPageStore from "../stores/LawyerListPageStore"; // Zustand store'u içe aktar

const LawyerForm = ({ isOpen, onClose }) => {
  const { createLawyer, loading, error } = useLawyerListPageStore(); // Zustand'dan fonksiyonları al
  const [formData, setFormData] = useState({
    nationalID: "",
    name: "",
    password: "",
    gender: "male",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createLawyer(formData); // Veriyi createLawyer fonksiyonuna gönder
    onClose(); // Pop-up'ı kapat
    setFormData({ nationalID: "", name: "", password: "", gender: "male" }); // Formu sıfırla
  };

  if (!isOpen) return null; // Pop-up kapalıysa hiçbir şey render edilmez

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-white rounded-lg shadow-lg p-6 w-96">
        {/* Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-xl font-bold text-gray-800">Kayıt Formu</h2>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition"
          >
            &times; {/* Kapatma butonu */}
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit}>
          {/* TC Kimlik No */}
          <div className="mb-4">
            <label
              htmlFor="tc"
              className="block text-sm font-medium text-gray-700"
            >
              TC Kimlik No
            </label>
            <input
              type="text"
              id="tc"
              value={formData.nationalID}
              onChange={(e) =>
                setFormData({ ...formData, nationalID: e.target.value })
              }
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="TC Kimlik No"
              required
              maxLength="11"
              pattern="\d{11}"
            />
          </div>

          {/* İsim */}
          <div className="mb-4">
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700"
            >
              İsim
            </label>
            <input
              type="text"
              id="name"
              value={formData.name}
              onChange={(e) =>
                setFormData({ ...formData, name: e.target.value })
              }
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Ad ve Soyad"
              required
            />
          </div>

          {/* Şifre */}
          <div className="mb-4">
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700"
            >
              Şifre
            </label>
            <input
              type="password"
              id="password"
              value={formData.password}
              onChange={(e) =>
                setFormData({ ...formData, password: e.target.value })
              }
              className="mt-1 block w-full p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
              placeholder="Şifre"
              required
            />
          </div>

          {/* Cinsiyet */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700">
              Cinsiyet
            </label>
            <div className="mt-2 flex items-center space-x-4">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="form-radio text-blue-500"
                />
                <span className="ml-2 text-gray-700">Erkek</span>
              </label>
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="female"
                  checked={formData.gender === "female"}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="form-radio text-blue-500"
                />
                <span className="ml-2 text-gray-700">Kadın</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>

        {/* Hata Mesajı */}
        {error && <p className="text-red-500 mt-4">{error}</p>}
      </div>
    </div>
  );
};

export default LawyerForm;
