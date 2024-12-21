import React, { useState } from "react";
import useLawyerListPageStore from "../stores/LawyerListPageStore";

const LawyerForm = ({ isOpen, onClose }) => {
  const { createLawyer, loading, error } = useLawyerListPageStore();
  const [formData, setFormData] = useState({
    nationalID: "",
    name: "",
    password: "",
    gender: "male",
    email: "",
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    await createLawyer(formData);
    onClose();
    setFormData({ nationalID: "", name: "", password: "", gender: "male", email:"" });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-50 z-50">
      <div className="bg-[#fffcf8] rounded-lg shadow-lg p-6 w-96 border border-[#f7f1eb]">
        {/* Header */}
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-[#123D3D]">Avukat Kayıt</h2>
          <button
            onClick={onClose}
            className="text-[#123D3D] hover:text-[#D4AF37] transition text-2xl"
          >
            &times;
          </button>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* TC Kimlik No */}
          <div>
            <label
              htmlFor="tc"
              className="block text-sm font-medium text-[#123D3D]"
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
              className="mt-1 block w-full p-2 border border-[#D5C4A1] rounded-md bg-[#F8F1E8] text-[#123D3D] focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              placeholder="TC Kimlik No"
              required
              maxLength="11"
              pattern="\d{11}"
            />
              {/* Doğrulama Mesajı */}
           {!/^\d{11}$/.test(formData.nationalID) && formData.nationalID.length > 0 && (
           <p className="text-red-500 text-sm mt-2">T.C. Kimlik Numarası 11 haneli olmalıdır.</p>
            )}
          </div>

          {/* İsim */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-[#123D3D]"
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
              className="mt-1 block w-full p-2 border border-[#D5C4A1] rounded-md bg-[#F8F1E8] text-[#123D3D] focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              placeholder="Ad ve Soyad"
              required
            />
          </div>
          
          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-[#123D3D]"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              value={formData.email}
              onChange={(e) =>
                setFormData({ ...formData, email: e.target.value })
              }
              className="mt-1 block w-full p-2 border border-[#D5C4A1] rounded-md bg-[#F8F1E8] text-[#123D3D] focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              placeholder="Email"
              required
            />
            {/* Email doğrulama */}
            {!/^[\w-]+(\.[\w-]+)*@([\w-]+\.)+[a-zA-Z]{2,7}$/.test(formData.email) && formData.email.length > 0 && (
              <p className="text-red-500 text-sm mt-2">Geçerli bir email adresi girin.</p>
            )}
          </div>

          {/* Şifre */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-[#123D3D]"
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
              className="mt-1 block w-full p-2 border border-[#D5C4A1] rounded-md bg-[#F8F1E8] text-[#123D3D] focus:ring-[#D4AF37] focus:border-[#D4AF37]"
              placeholder="Şifre"
              required
            />
          </div>

          {/* Cinsiyet */}
          <div>
            <label className="block text-sm font-medium text-[#123D3D]">
              Cinsiyet
            </label>
            <div className="mt-2 flex items-center space-x-6">
              <label className="flex items-center">
                <input
                  type="radio"
                  name="gender"
                  value="male"
                  checked={formData.gender === "male"}
                  onChange={(e) =>
                    setFormData({ ...formData, gender: e.target.value })
                  }
                  className="form-radio text-[#123D3D] focus:ring-[#D4AF37]"
                />
                <span className="ml-2 text-[#123D3D]">Erkek</span>
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
                  className="form-radio text-[#123D3D] focus:ring-[#D4AF37]"
                />
                <span className="ml-2 text-[#123D3D]">Kadın</span>
              </label>
            </div>
          </div>

          {/* Submit Button */}
          <div className="mt-6">
            <button
              type="submit"
              disabled={loading}
              className="w-full bg-[#123D3D] text-[#F8F1E8] py-2 px-4 rounded-md hover:bg-[#D4AF37] hover:text-[#123D3D] transition"
            >
              {loading ? "Kaydediliyor..." : "Kaydet"}
            </button>
          </div>
        </form>

        {/* Hata Mesajı */}
        {error && <p className="text-red-500 mt-4 text-center">{error}</p>}
      </div>
    </div>
  );
};

export default LawyerForm;
