import React, { useState, useEffect } from "react";
import useApplicationStore from "../stores/ApplicationStore";

const NewApplicationPage = () => {
  const { createApplication } = useApplicationStore();

  // Form verilerini tutan state
  const [formData, setFormData] = useState({
    applicantName: "",
    receivedBy: "", // Başvuruyu alan kişi
    nationalID: "",
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
const handleFileUpload = (e) => {
  const uploadedFiles = Array.from(e.target.files).map((file) => ({
    file,
    description: prompt(`Dosya için açıklama girin:`, `Dosya ${file.name}`) || "Açıklama yok",
    type: prompt(`Dosya türünü seçin:`, "Other") || "Other",
  }));

  setFormData((prev) => ({
    ...prev,
    files: [...prev.files, ...uploadedFiles],
  }));
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
      await createApplication(formData);
      alert("Başvuru başarıyla oluşturuldu!");
    } catch (error) {
      console.error("Başvuru oluşturulurken hata oluştu:", error);
      alert("Başvuru oluşturulamadı!");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Yeni Başvuru</h1>
      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-gray-700">Başvuru Sahibi:</label>
            <input
              type="text"
              name="applicantName"
              value={formData.applicantName}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label>Başvuruyu Alan Kişi:</label>
            <input
              type="text"
              name="receivedBy"
              value={formData.receivedBy}
              onChange={handleInputChange}
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">T.C. Kimlik Numarası:</label>
            <input
              type="text"
              name="nationalID"
              value={formData.nationalID}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Başvuru Türü:</label>
            <select
              name="applicationType"
              value={formData.applicationType}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="individual">Bireysel</option>
              <option value="organization">Kurumsal</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Başvuru Tarihi:</label>
            <input
              type="date"
              name="applicationDate"
              value={formData.applicationDate}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Adres:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
              required
            />
          </div>
          <div>
            <label className="block text-gray-700">Telefon Numarası:</label>
            <input
              type="text"
              name="phoneNumber"
              value={formData.phoneNumber}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
            <label className="block text-gray-700">Yakınma Nedeni:</label>
            <textarea
              name="complaintReason"
              value={formData.complaintReason}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            ></textarea>
          </div>
          

<div>
  <label className="block text-gray-700">Document Type:</label>
  <select
    name="documentType"
    value={formData.documentType}
    onChange={handleInputChange}
    className="w-full p-2 border border-gray-300 rounded"
  >
    <option value="files">File</option>
    <option value="link">Link</option>
  </select>
</div>

{/* Linkler Alanı Sadece "link" Seçildiğinde Gösterilecek */}
{formData.documentType === "link" && (
  <div>
    <label className="block text-gray-700">Linkler:</label>
    {formData.links.map((link, index) => (
      <div key={index} className="border p-2 mb-2">
        <div>
          <label>Link URL:</label>
          <input
            type="url"
            name={`link-url-${index}`}
            value={link.url}
            onChange={(e) => handleLinkChange(index, "url", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
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
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div>
          <label>Tür:</label>
          <select
            name={`link-type-${index}`}
            value={link.type}
            onChange={(e) => handleLinkChange(index, "type", e.target.value)}
            className="w-full p-2 border border-gray-300 rounded"
          >
            <option value="Other">Diğer</option>
            <option value="Media Screening">Medya Tarama</option>
            <option value="NGO Data">STK Verisi</option>
            <option value="Bar Commissions">Baro Komisyonları</option>
            <option value="Public Institutions">Kamu Kurumları</option>
          </select>
        </div>
      </div>
    ))}
    <button
      type="button"
      onClick={handleAddLink}
      className="bg-green-500 text-white px-4 py-2 rounded mt-2"
    >
      Yeni Link Ekle
    </button>
  </div>
)}
{/* Dosya Alanı Sadece "files" Seçildiğinde Gösterilecek */}
{formData.documentType === "files" && (
  <div>
    <label className="block text-gray-700">Dosyalar:</label>
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
            className="w-full p-2 border border-gray-300 rounded"
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
            className="w-full p-2 border border-gray-300 rounded"
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
            className="bg-red-500 text-white px-4 py-2 rounded mt-2"
          >
            Dosyayı Kaldır
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
      className="w-full p-2 border border-gray-300 rounded mt-2"
    />
  </div>
)}

        </div>

        <button
          type="submit"
          className="bg-blue-500 text-white px-4 py-2 mt-4 rounded"
        >
          Kaydet
        </button>
      </form>
    </div>
  );
};

export default NewApplicationPage;
