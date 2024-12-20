import React, { useState } from "react";
import CitizenApplicationStore from "../stores/CitizienApplicationStore";
import { FiArrowRight, FiArrowLeft, FiSave } from "react-icons/fi";
import Vatandas from "../assets/g.jpg";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFile } from "@fortawesome/free-solid-svg-icons";
import { useNavigate } from 'react-router-dom' // React Router'dan useNavigate import edin
import { toast, ToastContainer } from "react-toastify"; // Toastify importu
import "react-toastify/dist/ReactToastify.css"; // Toastify CSS

const CitizenApplicationPage = () => {
const { createCitizenApplication } = CitizenApplicationStore();
const navigate = useNavigate() // Yönlendirme için useNavigate fonksiyonu

// Form verilerini tutan state
const [formData, setFormData] = useState({
    applicantName: "",
    organizationName:"",
    nationalID: "",
    applicationType: "individual",
    applicationDate: "",
    email: "", 
    address: "",
    phoneNumber: "",
    complaintReason: "",
    documentType: "files", // Varsayılan dosya tipi
    documentSource: "", // Burası eklendi.
    documentUrl: "",
    documentDescription: "",
    documentCategory: "Other", // Varsayılan tür
    links: [], // Link listesi
    files: [],
});

const eventCategoriesOptions = [
    "Aile ve Özel Yaşam Hakkı",
    "Ayrımcılık",
    "Basın Özgürlüğü",
    "Kadına Karşı Şiddet ve Taciz",
    "Çocuğa Karşı Şiddet ve Taciz",
    "Örgütlenme Özgürlüğü",
    "İşkence ve Kötü Muamele",
    "Eğitim Hakkı",
    "Düşünce ve İfade Özgürlüğü",
];

const [isDropdownOpen, setIsDropdownOpen] = useState(false);

const handleCategorySelect = (category) => {
    setFormData((prev) => ({ ...prev, eventCategories: category }));
    setIsDropdownOpen(false); // Dropdown'u kapat
};

const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
    ...prev,
    [name]: value,
    }));
};

const handleAddLink = () => {
setFormData((prev) => ({
    ...prev,
    links: [
    ...prev.links,
    { url: "", description: "", type: "Other" }, // Yeni bir link nesnesi ekleniyor
    ],
}));

};
const handleRemoveLink = (index) => {
  setFormData((prev) => {
    const updatedLinks = [...prev.links];
    updatedLinks.splice(index, 1); // Belirtilen indexteki linki sil
    return { ...prev, links: updatedLinks };
  });
};


const handleLinkChange = (index, key, value) => {
setFormData((prev) => {
    const updatedLinks = [...prev.links];
    updatedLinks[index][key] = value;
    return { ...prev, links: updatedLinks };
});
};

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    console.log("Gönderilen Veri:", formData);

    const response = await createCitizenApplication(formData);

    if (response && response.success) {
      // Başarılı durum
      navigate("/tesekkur");
    } else {
      // Hata kontrolü
      const errorMessage =
        response?.error || "Başvuru sırasında bir hata oluştu. Lütfen tekrar deneyin.";

      // Backend'den gelen nationalID hatasını özel olarak göster
      if (errorMessage.includes("T.C. Kimlik Numarası")) {
        toast.error("Bu T.C. Kimlik Numarası ile zaten bir başvuru yapılmış.", {
          position: "top-right",
          autoClose: 3000,
          style: { marginTop: "50px", right: "20px" },
        });
      } else {
        // Genel hata mesajı
        toast.error(errorMessage, {
          position: "top-right",
          autoClose: 3000,
          style: { marginTop: "50px", right: "20px" },
        });
      }
    }
  } catch (error) {
    console.error("Başvuru oluşturulurken hata oluştu:", error);

    // Backend'den gelen spesifik hata mesajını al ve kontrol et
    const errorMessage =
      error.response?.data?.error || "Başvuru oluşturulurken bir hata oluştu. Lütfen tekrar deneyin.";

    // National ID hatasını kontrol et
    if (errorMessage.includes("T.C. Kimlik Numarası")) {
      toast.error("Bu T.C. Kimlik Numarası ile zaten bir başvuru yapılmış.", {
        position: "top-right",
        autoClose: 3000,
        style: { marginTop: "50px", right: "20px" },
      });
    } else {
      // Genel hata mesajı
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 3000,
        style: { marginTop: "50px", right: "20px" },
      });
    }
  }
};

const [currentStep, setCurrentStep] = useState(1);

const handleNextStep = () => {
  // Step 1 doğrulama
  if (currentStep === 1) {
    if (
      !formData.nationalID ||
      !/^\d{11}$/.test(formData.nationalID) ||
      !formData.email ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) ||
      (formData.applicationType === "individual" && !formData.applicantName) ||
      (formData.applicationType === "organization" && !formData.organizationName)
    ) {
      toast.error("Lütfen tüm zorunlu alanları doğru şekilde doldurun.", {
        position: "top-right",
        autoClose: 3000,
        style: { marginTop: "50px", right: "20px" },
      });
      return; // Doğrulama başarısızsa ilerlemeyi engelle
    }
  }

  // Step 2 doğrulama
  if (currentStep === 2) {
    if (!formData.applicationDate || !formData.address || !formData.phoneNumber || !formData.eventCategories) {
      toast.error("Lütfen tüm zorunlu alanları doldurun.", {
        position: "top-right",
        autoClose: 3000,
        style: { marginTop: "50px", right: "20px" },
      });
      return; // Doğrulama başarısızsa ilerlemeyi engelle
    }
  }

  setCurrentStep((prev) => prev + 1); // Doğrulama başarılıysa sonraki adıma geç
};


const handlePreviousStep = () => {
  setCurrentStep((prev) => prev - 1);
};

return (
  
<div
  className="relative w-screen h-screen flex justify-center items-center bg-gradient-to-r from-[#123D3D] to-[#2C7873]"
>
  {/* Arka Plan */}
  <div    
  
  className="absolute top-0 left-0 w-full h-full bg-cover bg-center opacity-40 duration-500 hover:scale-150"

    style={{
      backgroundImage: `url(${Vatandas})`, // Arka plan resmi
      filter: "brightness(0.4)", // Hafif karartma efekti
      //filter: "brightness(0.9)", // Hafif karartma efekti
      backgroundSize: "cover", // Resmi kapsayacak şekilde ayarla
      backgroundPosition: "center", // Ortalayarak hizala
      overflow: "hidden", // Taşmaları gizle
    }}
  ></div>

  {/* Kart */}
  <div
  className="relative z-10 bg-white shadow-lg rounded-lg max-w-lg w-full mx-auto p-8 border-t-4 border-[#D5C4A1] backdrop-filter backdrop-blur-lg"
  style={{
    background: "linear-gradient(145deg, rgba(0, 0, 0, 0.8), rgba(34, 34, 34, 0.6))", // Gradient arka plan
      width: "90%", // Küçük ekranlar için %90 genişlik
      maxWidth: "550px", // Maksimum genişliği küçültüldü
      maxHeight: "100%", // Kartın boyu ekranı aşarsa kırpar
      marginTop: "-200px", // Kart yukarı taşındı
      display: "flex",
      
      flexDirection: "column",
      justifyContent: "center",
      alignItems: "center",
      backdropFilter: "blur(20px)", // Arka plan bulanıklığı
      border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
      borderRadius: "12px", // Daha zarif köşeler
      boxShadow: "0px 4px 15px rgba(0, 0, 0, 0.3)", // Gölge
    }}
  >
    <h1 className="text-3xl font-bold mb-6 text-[#D5C4A1] text-center">
      Vatandaş Başvuru Formu
    </h1>
    <div className="flex items-center justify-between mb-6 w-full">
  <div className="flex-1 h-2 bg-[#123D3D] rounded-full overflow-hidden">
    <div
      className={`h-full bg-[#D5C4A1] rounded-full transition-all duration-300`}
      style={{ width: `${(currentStep / 3) * 100}%` }}
    ></div>
  </div>
  <span className="ml-4 text-sm text-[#D5C4A1]">{currentStep} / 3</span>
</div>

 {/* Scrollable Form Alanı */}
 <form
      onSubmit={handleSubmit}
      className="w-full overflow-y-auto"
      style={{
        maxHeight: "400px", // İçerik için maksimum yükseklik
        paddingRight: "8px", // Scrollbar alanı için padding
        scrollbarWidth: "none", // Tarayıcıda scrollbar'ı gizler

      }}
    >  
{currentStep === 1 && (
  <div className="grid grid-cols-2 gap-4">
   {/* T.C. Kimlik Numarası */}
<div>
  <label className="block text-[#D5C4A1] font-medium mb-2">
    T.C. Kimlik Numarası:
  </label>
  <input
    type="text"
    name="nationalID"
    value={formData.nationalID}
    onChange={handleInputChange}
    maxLength={11}
    required
    className="w-full p-2 rounded-md text-sm placeholder-gray-400"
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)",
      border: "1px solid rgba(213, 196, 161, 0.5)",
      color: "white",
      backdropFilter: "blur(10px)",
    }}
    placeholder="T.C. Kimlik Numaranızı girin*"
  />
  {/* Doğrulama Mesajı */}
  {!/^\d{11}$/.test(formData.nationalID) && formData.nationalID.length > 0 && (
    <p className="text-red-500 text-sm mt-2">T.C. Kimlik Numarası 11 haneli olmalıdır.</p>
  )}
</div>
{/* E-posta Adresi */}
<div>
  <label className="block text-[#D5C4A1] font-medium mb-2">
    E-posta Adresi:
  </label>
  <input
    type="email"
    name="email"
    value={formData.email || ""}
    onChange={handleInputChange}
    className="w-full p-2 rounded-md text-sm placeholder-gray-400"
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam arka plan
      border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
      color: "white", // Yazı rengi
      backdropFilter: "blur(10px)", // Blur efekti
    }}
    placeholder="E-posta adresinizi girin"
    required
  />
  {/* Doğrulama Mesajı */}
  {!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email) && formData.email.length > 0 && (
    <p className="text-red-500 text-sm mt-2">
      Geçerli bir e-posta adresi girin.
    </p>
  )}
</div>



    {/* Başvuru Türü */}
    <div>
      <label className="block text-[#D5C4A1] font-medium mb-2">
        Başvuru Türü:
      </label>
      <select
        name="applicationType"
        value={formData.applicationType}
        onChange={handleInputChange}
        className="w-full p-2 rounded-md text-sm placeholder-gray-400"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam beyaz arka plan
          border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
          color: "white", // Yazı rengi
          backdropFilter: "blur(10px)", // Blur efekti
        }}
              >
                
        <option value="individual"
    className="w-full p-3 rounded-md text-sm"
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam arka plan
      border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
      color: "#D5C4A1", // Altın sarısı yazı rengi
      backdropFilter: "blur(10px)", // Blur efekti
    }}
>Bireysel</option>
        <option value="organization"
    className="w-full p-3 rounded-md text-sm"
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam arka plan
      border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
      color: "#D5C4A1", // Altın sarısı yazı rengi
      backdropFilter: "blur(10px)", // Blur efekti
    }}
>Kurumsal</option>
      </select>
    </div>

    {/* Bireysel veya Kurumsal Başvuru */}
    {formData.applicationType === "individual" ? (
      <div>
        <label className="block text-[#D5C4A1] font-medium mb-2">
          Başvuru Sahibi:
        </label>
        <input
          type="text"
          name="applicantName"
          value={formData.applicantName}
          onChange={handleInputChange}
          className="w-full p-2 rounded-md text-sm placeholder-gray-400"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam beyaz arka plan
            border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
            color: "white", // Yazı rengi
            backdropFilter: "blur(10px)", // Blur efekti
          }}
          placeholder="Adınızı ve Soyadınızı girin"
          required
        />
      </div>
    ) : (
      <div>
        <label className="block text-[#D5C4A1] font-medium mb-2">
          Kurum Adı:
        </label>
        <input
          type="text"
          name="organizationName"
          value={formData.organizationName}
          onChange={handleInputChange}
          className="w-full p-2 rounded-md text-sm placeholder-gray-400"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam beyaz arka plan
            border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
            color: "white", // Yazı rengi
            backdropFilter: "blur(10px)", // Blur efekti
          }}
          placeholder="Kurum adını girin"
          required
        />
      </div>
    )}

    {/* Devam Et Butonu */}
    <div className="col-span-2 flex justify-end mt-4">
      <button
        type="button"
        onClick={handleNextStep}
        className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition"
        style={{
          backgroundColor: "#183D3D", // Buton arka planı
          color: "#D5C4A1", // Yazı rengi
          border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)", // Hafif gölge
        }}
      >      
        Devam Et
        <FiArrowRight className="ml-2" size={16} />
      </button>
    </div>
  </div>
)}


{currentStep === 2 && (
  <div className="grid grid-cols-2 gap-4">
    {/* Başvuru Tarihi */}
    <div>
      <label className="block text-[#D5C4A1] font-medium mb-2">
        Başvuru Tarihi:
      </label>
      <input
        type="date"
        name="applicationDate"
        value={formData.applicationDate}
        onChange={handleInputChange}
        className="w-full p-2 rounded-md text-sm placeholder-gray-400"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam beyaz arka plan
          border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
          color: "white", // Yazı rengi
          backdropFilter: "blur(10px)", // Blur efekti
        }}        required
      />
    </div>

    {/* Adres */}
    <div>
      <label className="block text-[#D5C4A1] font-medium mb-2">Adres:</label>
      <input
        type="text"
        name="address"
        value={formData.address}
        onChange={handleInputChange}
        className="w-full p-2 rounded-md text-sm placeholder-gray-400"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam beyaz arka plan
          border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
          color: "white", // Yazı rengi
          backdropFilter: "blur(10px)", // Blur efekti
        }}
        placeholder="Adresinizi girin"
        required
      />
    </div>

   {/* Telefon Numarası */}
<div>
  <label className="block text-[#D5C4A1] font-medium mb-2">
    Telefon Numarası:
  </label>
  <input
    type="text"
    name="phoneNumber"
    value={formData.phoneNumber}
    onChange={handleInputChange}
    className="w-full p-2 rounded-md text-sm placeholder-gray-400"
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam beyaz arka plan
      border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
      color: "white", // Yazı rengi
      backdropFilter: "blur(10px)", // Blur efekti
    }}
    placeholder="Telefon numaranızı girin"
    required
  />
  {/* Doğrulama Mesajı */}
  {formData.phoneNumber.length > 0 &&
    !/^(\+90|0)?\d{10}$/.test(formData.phoneNumber) && (
      <p className="text-red-500 text-sm mt-2">
        Geçerli bir telefon numarası giriniz. Örn: 5XXXXXXXXX veya +905XXXXXXXXX
      </p>
    )}
</div>


    {/* Yakınma Nedeni */}
    <div>
      <label className="block text-[#D5C4A1] font-medium mb-2">
        Yakınma Nedeni:
      </label>
      <textarea
        name="complaintReason"
        maxLength={250}
        value={formData.complaintReason}
        onChange={handleInputChange}
        className="w-full p-2 rounded-md text-sm placeholder-gray-400"
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam beyaz arka plan
      border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
      color: "rgba(200, 200, 200, 0.8)", // Gri yazı rengi
      backdropFilter: "blur(10px)", // Blur efekti
      height: "40px", // Yüksekliği azaltıldı
      maxHeight: "100px", // Maksimum yükseklik sınırı
      overflowY: "auto", // Dikey scroll ekleme
    }}
    placeholder="Yakınma nedeninizi yazın..."
        rows={4}
      ></textarea>
    </div>

  {/* Olay Kategorileri */}
<div className="col-span-2">
  <label className="block text-[#D5C4A1] font-medium mb-2">
    Olay Kategorileri:
  </label>
  <div className="relative">
    <button
      type="button"
      onClick={() => setIsDropdownOpen((prev) => !prev)}
      className={`w-full p-2 rounded-md text-sm placeholder-gray-400 ${
        !formData.eventCategories ? "border-red-500" : "border-[#D5C4A1]"
      }`}
      style={{
        backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam beyaz arka plan
        border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
        color: "white", // Yazı rengi
        backdropFilter: "blur(10px)", // Blur efekti
      }}
    >
      {formData.eventCategories || "Kategori Seçin"}
    </button>
    {isDropdownOpen && (
      <div
        className="absolute z-10 w-full border border-[#F8F1E8] bg-[#F8F1E8] shadow-md mt-1 rounded-md"
        style={{
          maxHeight: "200px", // Maksimum yükseklik
          overflowY: "auto", // Scroll ekleme
          scrollbarWidth: "none", // Tarayıcıda scrollbar'ı gizler
        }}
      >
        {eventCategoriesOptions.map((category, index) => (
          <div
            key={index}
            onClick={() => handleCategorySelect(category)}
            className="px-4 py-2 text-sm text-[#123D3D] hover:bg-[#D5C4A1] cursor-pointer rounded-md"
          >
            {category}
          </div>
        ))}
      </div>
    )}
  </div>
</div>


    {/* Geri ve Devam Et Butonları */}
    <div className="col-span-2 flex justify-between mt-4">
      <button
        type="button"
        onClick={handlePreviousStep}
        className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition"
        style={{
          backgroundColor: "#183D3D", // Buton arka planı
          color: "#D5C4A1", // Yazı rengi
          border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)", // Hafif gölge
        }}
      >
        <FiArrowLeft className="mr-2" size={16} />
        Geri
      </button>
      <button
        type="button"
        onClick={handleNextStep}
        className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition"
        style={{
          backgroundColor: "#183D3D", // Buton arka planı
          color: "#D5C4A1", // Yazı rengi
          border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)", // Hafif gölge
        }}
      >
      
        Devam Et
        <FiArrowRight className="ml-2" size={16} />
      </button>
    </div>
  </div>
)}


{currentStep === 3 && (
  <div className="space-y-6">
    {/* Document Type */}
    <div>
      <label className="block text-[#D5C4A1] font-medium mb-2">
        Document Type:
      </label>
      <select
        name="documentType"
        value={formData.documentType}
        onChange={handleInputChange}
        className="p-2 rounded-md text-sm"
        style={{
          backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam arka plan
          border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
          color: "white", // Yazı rengi
          backdropFilter: "blur(10px)", // Blur efekti
        }}        >
        <option value="files"
         className="w-full p-3 rounded-md text-sm"
         style={{
           backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam arka plan
           border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
           color: "#D5C4A1", // Altın sarısı yazı rengi
           backdropFilter: "blur(10px)", // Blur efekti
         }}>File</option>
        <option value="link"
                        className="px-4 py-2 text-sm text-[#123D3D] hover:bg-[#D5C4A1] cursor-pointer rounded-md"
>Link</option>
      </select>
    </div>

    {/* Links Section */}
    {formData.documentType === "link" && (
      <div>
        <label className="block text-[#D5C4A1] font-medium mb-2">Linkler:</label>
        {formData.links.map((link, index) => (
          <div key={index} className="border border-[#123D3D] rounded-md p-4 mb-4">
            <div className="mb-4">
              <label className="block text-[#D5C4A1] font-medium mb-2">Link URL:</label>
              <input
                type="url"
                value={link.url}
                onChange={(e) => handleLinkChange(index, "url", e.target.value)}
                className="w-full p-2 rounded-md text-sm placeholder-gray-400"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam beyaz arka plan
                  border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
                  color: "white", // Yazı rengi
                  backdropFilter: "blur(10px)", // Blur efekti
                }}
                  placeholder="URL girin"
                required
              />
            </div>
            <div className="mb-4">
              <label className="block text-[#D5C4A1] font-medium mb-2">Açıklama:</label>
              <input
                type="text"
                value={link.description}
                onChange={(e) =>
                  handleLinkChange(index, "description", e.target.value)
                }
                className="w-full p-2 rounded-md text-sm placeholder-gray-400"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam beyaz arka plan
                  border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
                  color: "white", // Yazı rengi
                  backdropFilter: "blur(10px)", // Blur efekti
                }}
                   placeholder="Link açıklaması girin"
              />
            </div>
            <div>
              <label className="block text-[#D5C4A1] font-medium mb-2">Tür:</label>
              <select
                value={link.type}
                onChange={(e) => handleLinkChange(index, "type", e.target.value)}
                className="w-full p-2 rounded-md text-sm placeholder-gray-400"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam beyaz arka plan
                  border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
                  color: "white", // Yazı rengi
                  backdropFilter: "blur(10px)", // Blur efekti
                }}              >
                <option value="Other"
className="w-full p-3 rounded-md text-sm"
style={{
  backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam arka plan
  border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
  color: "#D5C4A1", // Altın sarısı yazı rengi
  backdropFilter: "blur(10px)", // Blur efekti
}}>Diğer
                  
                </option>
                <option value="Media Screening"
                className="w-full p-3 rounded-md text-sm"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam arka plan
                  border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
                  color: "#D5C4A1", // Altın sarısı yazı rengi
                  backdropFilter: "blur(10px)", // Blur efekti
                }}>Medya Tarama</option>
                <option value="NGO Data"
                className="w-full p-3 rounded-md text-sm"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam arka plan
                  border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
                  color: "#D5C4A1", // Altın sarısı yazı rengi
                  backdropFilter: "blur(10px)", // Blur efekti
                }}>STK Verisi</option>
                <option value="Bar Commissions"
                className="w-full p-3 rounded-md text-sm"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam arka plan
                  border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
                  color: "#D5C4A1", // Altın sarısı yazı rengi
                  backdropFilter: "blur(10px)", // Blur efekti
                }}>Baro Komisyonları</option>
                <option value="Public Institutions"
                className="w-full p-3 rounded-md text-sm"
                style={{
                  backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam arka plan
                  border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
                  color: "#D5C4A1", // Altın sarısı yazı rengi
                  backdropFilter: "blur(10px)", // Blur efekti
                }}>Kamu Kurumları</option>
              </select>
            </div>
             {/* Sil Butonu */}
      <button
        type="button"
        onClick={() => handleRemoveLink(index)}
        className="text-red-500 font-medium hover:text-red-700 transition"
      >
        Sil
      </button>
          </div>
        ))}
        <button
          type="button"
          onClick={handleAddLink}
          className="w-full p-2 rounded-md text-sm placeholder-gray-400"
          style={{
            backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam beyaz arka plan
            border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
            color: "white", // Yazı rengi
            backdropFilter: "blur(10px)", // Blur efekti
          }}        >
          Yeni Link Ekle
        </button>
        
      </div>
    )}

   {/* Files Section */}
{formData.documentType === "files" && (
  <div>
    <label className="block text-[#D5C4A1] font-medium mb-2">Dosyalar :</label>
    {formData.files.map((file, index) => (
      <div 
        key={index} 
        className="border border-[#123D3D] rounded-md p-4 mb-4 flex items-center space-x-4"
        style={{
          backgroundColor: "rgba(0, 0, 0, 0.5)", // Arka planı şeffaf siyah
          backdropFilter: "blur(10px)", // Arka plan bulanıklığı
        }}
      >
        {/* Dosya İkonu */}
        <div className="flex items-center justify-center w-12 h-12 bg-[#5C8374] rounded-md">
  <FontAwesomeIcon icon={faFile} className="text-white text-2xl" />
</div>


        <div className="flex-1">
          {/* Dosya Açıklaması */}
          <div className="mb-4">
            <label className="block text-[#D5C4A1] font-medium mb-2">Dosya Açıklaması:</label>
            <input
              type="text"
              name={`file-description-${index}`}
              value={file.description}
              onChange={(e) => {
                const updatedFiles = [...formData.files];
                updatedFiles[index].description = e.target.value;
                setFormData({ ...formData, files: updatedFiles });
              }}
              className="w-full p-2 rounded-md text-sm placeholder-gray-400"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam beyaz arka plan
                border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
                color: "white", // Yazı rengi
                backdropFilter: "blur(10px)", // Blur efekti
              }}
              placeholder="Dosya açıklaması girin"
            />
          </div>

          {/* Dosya Türü */}
          <div>
            <label className="block text-[#D5C4A1] font-medium mb-2">Dosya Türü:</label>
            <select
              name={`file-type-${index}`}
              value={file.type}
              onChange={(e) => {
                const updatedFiles = [...formData.files];
                updatedFiles[index].type = e.target.value;
                setFormData({ ...formData, files: updatedFiles });
              }}
              className="w-full p-3 rounded-md text-sm"
              style={{
                backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam arka plan
                border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
                color: "white", // Yazı rengi
                backdropFilter: "blur(10px)", // Blur efekti
              }}           
               >
              <option value="Other"
    className="w-full p-3 rounded-md text-sm"
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam arka plan
      border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
      color: "#D5C4A1", // Altın sarısı yazı rengi
      backdropFilter: "blur(10px)", // Blur efekti
    }}
>Diğer</option>
              <option value="Media Screening"
    className="w-full p-3 rounded-md text-sm"
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam arka plan
      border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
      color: "#D5C4A1", // Altın sarısı yazı rengi
      backdropFilter: "blur(10px)", // Blur efekti
    }}
>Medya Tarama</option>
              <option value="NGO Data"
    className="w-full p-3 rounded-md text-sm"
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam arka plan
      border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
      color: "#D5C4A1", // Altın sarısı yazı rengi
      backdropFilter: "blur(10px)", // Blur efekti
    }}
>STK Verisi</option>
              <option value="Bar Commissions"
    className="w-full p-3 rounded-md text-sm"
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam arka plan
      border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
      color: "#D5C4A1", // Altın sarısı yazı rengi
      backdropFilter: "blur(10px)", // Blur efekti
    }}
>Baro Komisyonları</option>
              <option value="Public Institutions"
    className="w-full p-3 rounded-md text-sm"
    style={{
      backgroundColor: "rgba(255, 255, 255, 0.1)", // Hafif saydam arka plan
      border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
      color: "#D5C4A1", // Altın sarısı yazı rengi
      backdropFilter: "blur(10px)", // Blur efekti
    }}
>Kamu Kurumları</option>
            </select>
          </div>
        </div>

        {/* Dosya Sil Butonu */}
        <button
          type="button"
          onClick={() => {
            const updatedFiles = [...formData.files];
            updatedFiles.splice(index, 1);
            setFormData({ ...formData, files: updatedFiles });
          }}
          className="text-red-500 font-medium hover:text-red-700 transition"
        >
          Sil
        </button>
      </div>
    ))}
    {/* Dosya Yükleme Alanı */}
    <input
      type="file"
      multiple
      onChange={(e) => {
        const uploadedFiles = Array.from(e.target.files).map((file) => ({
          file,
          description: "",
          type: "Other",
        }));
        setFormData((prev) => ({
          ...prev,
          files: [...prev.files, ...uploadedFiles],
        }));
      }}
      className="w-full p-2 border border-[#123D3D] rounded-md focus:outline-none focus:ring focus:ring-[#5C8374] text-sm mt-4"
    />
  </div>
)}  


    {/* Geri ve Kaydet Butonları */}
    <div className="flex justify-between mt-4">
      <button
        type="button"
        onClick={handlePreviousStep}
        className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition"
        style={{
          backgroundColor: "#183D3D", // Buton arka planı
          color: "#D5C4A1", // Yazı rengi
          border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)", // Hafif gölge
        }}
      >      
        <FiArrowLeft className="mr-2" size={16} />
        Geri
      </button>
      <button
        type="submit"
        className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition"
        style={{
          backgroundColor: "#183D3D", // Buton arka planı
          color: "#D5C4A1", // Yazı rengi
          border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
          boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)", // Hafif gölge
        }}
      >      
        Kaydet
        <FiSave className="ml-2" size={16} />
      </button>
    </div>
  </div>
)}
    </form>
    <ToastContainer
  position="top-right"
  autoClose={3000}
  hideProgressBar={false}
  closeOnClick
  pauseOnHover
  draggable
  style={{ marginTop: "50px" }} // Mesajı biraz aşağı taşı
/>
  </div>
  </div>
);


};

export default CitizenApplicationPage;