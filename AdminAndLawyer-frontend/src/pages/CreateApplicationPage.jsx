import React, { useState, useEffect } from "react";
import useApplicationStore from "../stores/ApplicationStore";
import { FiSave } from "react-icons/fi"; // React-Icons'dan Kaydet İkonu
import { toast, ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";


const NewApplicationPage = () => {
const { createApplication } = useApplicationStore();

// Form verilerini tutan state
const [formData, setFormData] = useState({
    applicantName: "",
    organizationName:"",
    receivedBy: "", // Başvuruyu alan kişi
    nationalID: "",
    email:"",
    applicationType: "individual",
    applicationDate: "",
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

const navigate = useNavigate(); // Sayfa yönlendirme için hook

const handleSubmit = async (e) => {
  e.preventDefault();
  try {
    console.log("Gönderilen Veri:", formData);
    await createApplication(formData);

    // Başarı mesajı
    toast.success("Başvuru başarıyla oluşturuldu!", {
      position: "top-right",
      autoClose: 3000, // 3 saniye sonra otomatik kapanır
    });

    // Sayfa yönlendirme
    setTimeout(() => {
      navigate("/admin/application");
    }, 3000);
  } catch (error) {
  console.error("Başvuru oluşturulurken hata oluştu:", error);

  let errorMessage = "Başvuru oluşturulamadı. Lütfen tekrar deneyin.";

  // Hata mesajını güvenli bir şekilde al
  if (error ) {
    errorMessage = error.error
  } 
console.log("errorMessage")
  // Kullanıcıya hata mesajını göster
  toast.error(errorMessage, {
    position: "top-right",
    autoClose: 5000,
  });

  res.status(500).json({ error: errorMessage });
}

  
};


return (
    <div className="min-h-screen flex justify-center items-center bg-gray-100">
      <div className="w-full max-w-5xl bg-white rounded-lg shadow-xl p-8 border border-[#621C1F] overflow-hidden relative"
        style={{
            borderColor: "#621C1F", // Bordo kenar rengi
            borderWidth: "4px", // Kenar kalınlığı
            boxShadow: "0px 8px 16px rgba(98, 28, 31, 0.5)", // Gölge efekti
          }}>
        <h1 className="text-2xl font-bold mb-4 pl-2 text-center">Yeni Başvuru</h1>
        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-1 md:grid-cols-2 gap-4 overflow-y-auto h-[calc(100vh-100px)]"
          >
          {/* Başvuruyu Alan Kişi */}
          <div>
            <label className="block text-gray-700">Başvuruyu Alan Kişi:</label>
            <input
              type="text"
              name="receivedBy"
              value={formData.receivedBy}
              onChange={handleInputChange}
              className="w-full border border-[#D5C4A1] rounded-md p-2 mt-2 mb-4 bg-[#FFFFFF] text-[#123D3D]"
              required
            />
          </div>
  {/* T.C. Kimlik Numarası */}
<div>
  <label className="block text-gray-700">T.C. Kimlik Numarası:</label>
  <input
    type="text"
    name="nationalID"
    value={formData.nationalID}
    onChange={(e) => {
      const { value } = e.target;
      // Sadece rakam girişi ve maksimum 11 hane kontrolü
      if (/^\d{0,11}$/.test(value)) {
        handleInputChange(e);
      }
    }}
    placeholder="11 Haneli Kimlik Numarası"
    className="w-full border border-[#D5C4A1] rounded-md p-2 mt-2 mb-4 bg-[#FFFFFF] text-[#123D3D]"
    required
  />
  {/* 11 Hane Kontrolü için Uyarı */}
  {formData.nationalID.length > 0 && formData.nationalID.length < 11 && (
    <p className="text-red-500 text-sm mt-1">
      T.C. Kimlik Numarası 11 hane olmalıdır.
    </p>
  )}
</div>

          <div>
            <label className="block text-gray-700">Email:</label>
            <input
              type="text"
              name="email"
              value={formData.email}
              onChange={handleInputChange}
              className="w-full border border-[#D5C4A1] rounded-md p-2 mt-2 mb-4 bg-[#FFFFFF] text-[#123D3D]"
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
            <label className="block text-gray-700">Başvuru Türü:</label>
            <select
              name="applicationType"
              value={formData.applicationType}
              onChange={handleInputChange}
              className="w-full border border-[#D5C4A1] rounded-md p-2 mt-2 mb-4 bg-[#FFFFFF] text-[#123D3D]"
            >
              <option value="individual">Bireysel</option>
              <option value="organization">Kurumsal</option>
            </select>
          </div>
  
          {/* Başvuru Sahibi veya Kurum Adı */}
          {formData.applicationType === "individual" ? (
            <div>
              <label className="block text-gray-700">Başvuru Sahibi:</label>
              <input
                type="text"
                name="applicantName"
                value={formData.applicantName}
                onChange={handleInputChange}
                className="w-full border border-[#D5C4A1] rounded-md p-2 mt-2 mb-4 bg-[#FFFFFF] text-[#123D3D]"
                required
              />
            </div>
          ) : (
            <div>
              <label className="block text-gray-700">Kurum Adı:</label>
              <input
                type="text"
                name="organizationName"
                value={formData.organizationName}
                onChange={handleInputChange}
                className="w-full border border-[#D5C4A1] rounded-md p-2 mt-2 mb-4 bg-[#FFFFFF] text-[#123D3D]"
                required
              />
            </div>
          )}
  
          {/* Başvuru Tarihi */}
          <div>
            <label className="block text-gray-700">Başvuru Tarihi:</label>
            <input
              type="date"
              name="applicationDate"
              value={formData.applicationDate}
              onChange={handleInputChange}
              className="w-full border border-[#D5C4A1] rounded-md p-2 mt-2 mb-4 bg-[#FFFFFF] text-[#123D3D]"
              required
            />
          </div>
  
          {/* Adres */}
          <div>
            <label className="block text-gray-700">Adres:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full border border-[#D5C4A1] rounded-md p-2 mt-2 mb-4 bg-[#FFFFFF] text-[#123D3D]"
              required
            />
          </div>
  
          {/* Telefon Numarası */}
          <div>
            <label className="block text-gray-700">Telefon Numarası:</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full border border-[#D5C4A1] rounded-md p-2 mt-2 mb-4 bg-[#FFFFFF] text-[#123D3D]"
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
            <label className="block text-gray-700">Yakınma Nedeni:</label>
            <textarea
              name="complaintReason"
              value={formData.complaintReason}
              onChange={handleInputChange}
              className="w-full border border-[#D5C4A1] rounded-md p-2 mt-2 mb-4 bg-[#FFFFFF] text-[#123D3D]"
            ></textarea>
          </div>
  
          {/* Olay Kategorileri */}
<div>
  <label className="block text-gray-700">Olay Kategorileri:</label>
  <select
    name="eventCategories"
    value={formData.eventCategories || ""}
    onChange={handleInputChange}
    className="w-full border border-[#D5C4A1] rounded-md p-2 mt-2 mb-4 bg-[#FFFFFF] text-[#123D3D]"
    required
  >
    <option value="" disabled>
      Lütfen bir kategori seçin
    </option>
    {eventCategoriesOptions.map((category, index) => (
      <option key={index} value={category}>
        {category}
      </option>
    ))}
  </select>
</div>

  
          {/* Document Type */}
          <div>
            <label className="block text-gray-700">Document Type:</label>
            <select
              name="documentType"
              value={formData.documentType}
              onChange={handleInputChange}
              className="w-full border border-[#D5C4A1] rounded-md p-2 mt-2 mb-4 bg-[#FFFFFF] text-[#123D3D]"
            >
              <option value="files">File</option>
              <option value="link">Link</option>
            </select>
          </div>
{/* Linkler Alanı Sadece "link" Seçildiğinde Gösterilecek */}
{formData.documentType === "link" && (
<div>
    <label className="block text-gray-700 pl-7">Linkler:</label>
        <div className="max-h-48 overflow-y-auto border border-[#D5C4A1] rounded-md p-2 mt-2 bg-white">

    {formData.links.map((link, index) => (
    <div key={index} className="border p-2 mb-2">
        <div>
        <label>Link URL:</label>
        <input
            type="url"
            name={`link-url-${index}`}
            value={link.url}
            onChange={(e) => handleLinkChange(index, "url", e.target.value)}
            className="w-[90%] border border-[#D5C4A1] rounded-md p-2 mt-2 mb-4 mx-7 bg-[#FFFFFF] text-[#123D3D]"
            required
        />
        </div>
        <div>
        <label>Açıklama:</label>
        <input
            type="text"
            name={`link-description-${index}`}
            value={link.description}
            onChange={(e) => handleLinkChange(index, "description", e.target.value)}
            className="w-[90%] border border-[#D5C4A1] rounded-md p-2 mt-2 mb-4 mx-7 bg-[#FFFFFF] text-[#123D3D]"
        />
        </div>
        <div>
        <label>Tür:</label>
        <select
            name={`link-type-${index}`}
            value={link.type}
            onChange={(e) => handleLinkChange(index, "type", e.target.value)}
                className="w-[90%]  border border-[#D5C4A1] rounded-md p-2 mt-1 bg-[#FFFFFF] text-[#123D3D]"
        >
            <option value="Other">Diğer</option>
            <option value="Media Screening">Medya Tarama</option>
            <option value="NGO Data">STK Verisi</option>
            <option value="Bar Commissions">Baro Komisyonları</option>
            <option value="Public Institutions">Kamu Kurumları</option>
        </select>
                    {/* Sil Butonu */}
  <button
    type="button"
    onClick={() => handleRemoveLink(index)}
    className="text-red-500 font-medium hover:text-red-700 transition"
  >
    Sil
  </button>
        </div>
    </div>
    ))}
        <button
      type="button"
      onClick={handleAddLink}
      className="flex items-center px-3 py-2 rounded-md text-sm font-medium transition"
      style={{
        backgroundColor: "#183D3D", // Buton arka planı
        color: "#D5C4A1", // Yazı rengi
        border: "1px solid rgba(213, 196, 161, 0.5)", // Altın kenar çizgisi
        boxShadow: "0px 4px 6px rgba(0, 0, 0, 0.2)", // Hafif gölge
      }}        >
      Yeni Link Ekle
    </button>
    </div>
</div>
)}
{/* Dosya Alanı Sadece "files" Seçildiğinde Gösterilecek */}
{formData.documentType === "files" && (
<div>
    <label className="block text-gray-700 pl-7">Dosyalar:</label>
    <p className="text-xs text-gray-500 italic mt-1">
    * Aynı döküman yüklenmemeli.
  </p>
    <div className="max-h-48 overflow-y-auto border border-[#D5C4A1] rounded-md p-2 mt-2 bg-white">

    {/* Yüklenen Dosyalar */}
    {formData.files.map((file, index) => (
    <div key={index} className="border p-2 mb-2">
        <div>
        <label>Dosya Adı:</label>
        <p className="text-gray-800">{file.file.name}</p>
        </div>
        <div>
        <label>Dosya Açıklaması:</label>
        <input
            type="text"
            name={`file-description-${index}`}
            value={file.description}
            onChange={(e) => {
            const updatedFiles = [...formData.files];
            updatedFiles[index].description = e.target.value;
            setFormData({ ...formData, files: updatedFiles });
            }}
            className="w-[90%] border border-[#D5C4A1] rounded-md p-2 mt-2 mb-4 mx-7 bg-[#FFFFFF] text-[#123D3D]"
            placeholder="Dosya açıklaması girin"
        />
        </div>
        <div>
        <label>Dosya Türü:</label>
        <select
            name={`file-type-${index}`}
            value={file.type}
            onChange={(e) => {
            const updatedFiles = [...formData.files];
            updatedFiles[index].type = e.target.value;
            setFormData({ ...formData, files: updatedFiles });
            }}
            className="w-[90%] border border-[#D5C4A1] rounded-md p-2 mt-2 mb-4 mx-7 bg-[#FFFFFF] text-[#123D3D]"
        >
            <option value="Other">Diğer</option>
            <option value="Media Screening">Medya Tarama</option>
            <option value="NGO Data">STK Verisi</option>
            <option value="Bar Commissions">Baro Komisyonları</option>
            <option value="Public Institutions">Kamu Kurumları</option>
        </select>
        </div>
        <div>
        <button
type="button"
onClick={() => {
const updatedFiles = [...formData.files];
updatedFiles.splice(index, 1); // Dosyayı listeden kaldır
setFormData({ ...formData, files: updatedFiles });
}}
className="text-red-500 font-medium hover:text-red-700 transition"
>
Sil
</button>

        </div>
    </div>
    ))}
    {/* Dosya Ekleme */}
    <input
    type="file"
    multiple
    
    onChange={(e) => {
        const uploadedFiles = Array.from(e.target.files).flatMap((file) => ({
        file,
        description: "",
        type: "Other",
        }));
        setFormData((prev) => ({
        ...prev,
        files: [...prev.files, ...uploadedFiles],
        }));
    }}
            className="w-[90%] border border-[#D5C4A1] rounded-md p-2 mt-2 mb-4 mx-7 bg-[#FFFFFF] text-[#123D3D]"
    />
    </div>
</div>
)}
     {/* Kaydet Butonu */}
     <div className="text-center">
      <button
        type="submit"
        className="absolute right-4 bottom-4 flex items-center px-4 py-2 bg-[#183D3D] text-[#D5C4A1] rounded-md text-sm font-medium transition hover:shadow-lg"
      
      >
        Kaydet
        <FiSave className="ml-2" size={16} />
      </button>
    </div>
  </form>
  <ToastContainer />
</div>
</div>
);

};

export default NewApplicationPage;
