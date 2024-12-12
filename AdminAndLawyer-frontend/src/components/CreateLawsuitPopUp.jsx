import React, { useState } from "react";
import useLawsuitListPageStore from "../stores/LawsuitListPageStore"; // zustand dosyası

const CreateLawsuitModal = ({ application, onClose }) => {
  const { createLawsuit } = useLawsuitListPageStore(); // zustand fonksiyonunu al
  const [lawsuitData, setLawsuitData] = useState({
    applicationId: application._id,
    applicationNumber: application.applicationNumber || "",
    applicantName: application.applicantName || "",
    caseSubject: "",
    court: "",
    fileNumber: "",
    courtFileNo: "",
    caseNumber: "",
    lawsuitDate: "",
  });
  const [files, setFiles] = useState([]);
  const [description, setFileDescription] = useState([]);
  const [fileType, setFileType] = useState([]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setLawsuitData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
    setFileDescription((prev) => [...prev, ...selectedFiles.map(() => "")]);
    setFileType((prev) => [...prev, ...selectedFiles.map(() => "")]);
  };

  const handleFileDescriptionChange = (index, description) => {
    const updatedDescriptions = [...description];
    updatedDescriptions[index] = description;
    setFileDescription(updatedDescriptions);
  };

  const handleFileTypeChange = (index, type) => {
    const updatedTypes = [...fileType];
    updatedTypes[index] = type;
    setFileType(updatedTypes);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
  
      // Dava bilgilerini FormData'ya ekle
      Object.entries(lawsuitData).forEach(([key, value]) => {
        formData.append(key, value); // Değerleri düz bir şekilde ekle
      });
  
      // Dosyaları ve açıklamalarını FormData'ya ekle
      files.forEach((file, index) => {
        formData.append("files", file); // Dosyanın kendisi
      });
  
      // Tüm açıklamaları ve türleri JSON string olarak gönder
      formData.append("fileDescriptions", JSON.stringify(description));
      formData.append("fileTypes", JSON.stringify(fileType));
  
      console.log("Gönderilen FormData:", ...formData.entries()); // FormData'yı kontrol et
      await createLawsuit(application._id, formData); // Direkt olarak FormData gönder
      console.log("Dava başarıyla oluşturuldu!");
      onClose(); // Modalı kapat
    } catch (error) {
      console.error("Dava oluşturma hatası:", error);
    }
  };
  
  
  
  

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-3/4 rounded shadow-lg p-6">
        <h2 className="text-xl font-bold mb-4">Dava Oluştur</h2>
        <div className="mb-4">
          <label className="block text-gray-700">Dava Konusu:</label>
          <input
            type="text"
            name="caseSubject"
            value={lawsuitData.caseSubject}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Mahkeme:</label>
          <input
            type="text"
            name="court"
            value={lawsuitData.court}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Dosya Numarası:</label>
          <input
            type="text"
            name="fileNumber"
            value={lawsuitData.fileNumber}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Mahkeme Dosya No:</label>
          <input
            type="text"
            name="courtFileNo"
            value={lawsuitData.courtFileNo}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Esas Numarası:</label>
          <input
            type="text"
            name="caseNumber"
            value={lawsuitData.caseNumber}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Dava Tarihi:</label>
          <input
            type="date"
            name="lawsuitDate"
            value={lawsuitData.lawsuitDate}
            onChange={handleInputChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        <div className="mb-4">
          <label className="block text-gray-700">Dosya Yükleme:</label>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full p-2 border border-gray-300 rounded"
          />
        </div>
        {files.map((file, index) => (
          <div key={index} className="mb-4">
            <label className="block text-gray-700">
              Açıklama (Dosya {index + 1}):
            </label>
            <input
              type="text"
              value={description[index]}
              onChange={(e) => handleFileDescriptionChange(index, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            />
            <label className="block text-gray-700 mt-2">Dosya Türü:</label>
            <select
              value={fileType[index]}
              onChange={(e) => handleFileTypeChange(index, e.target.value)}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Tür Seçin</option>
              <option value="Hearing Report">Duruşma İzleme Raporu</option>
              <option value="Petition">Dilekçe</option>
              <option value="Hearing Minutes">Duruşma Tutanakları</option>
              <option value="Indictment">İddianame</option>
            </select>
          </div>
        ))}
        <div className="flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-gray-500 text-white px-4 py-2 rounded"
          >
            Kapat
          </button>
          <button
            onClick={handleSubmit}
            className="bg-blue-500 text-white px-4 py-2 rounded"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateLawsuitModal;
