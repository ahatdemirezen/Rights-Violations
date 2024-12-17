import React, { useState } from "react";
import useLawsuitListPageStore from "../stores/LawsuitListPageStore";

const CreateLawsuitModal = ({ application, onClose }) => {
  const { createLawsuit } = useLawsuitListPageStore();
  const [lawsuitData, setLawsuitData] = useState({
    applicationId: application._id,
    applicationNumber: application.applicationNumber || "",
    applicantName: application.applicantName || "",
    organizationName: application.organizationName || "",
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
    setLawsuitData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFileChange = (e) => {
    const selectedFiles = Array.from(e.target.files);
    setFiles((prev) => [...prev, ...selectedFiles]);
    setFileDescription((prev) => [...prev, ...selectedFiles.map(() => "")]);
    setFileType((prev) => [...prev, ...selectedFiles.map(() => "")]);
  };

  const handleFileDescriptionChange = (index, value) => {
    const updatedDescriptions = [...description];
    updatedDescriptions[index] = value;
    setFileDescription(updatedDescriptions);
  };

  const handleFileTypeChange = (index, value) => {
    const updatedTypes = [...fileType];
    updatedTypes[index] = value;
    setFileType(updatedTypes);
  };

  const handleSubmit = async () => {
    try {
      const formData = new FormData();
      Object.entries(lawsuitData).forEach(([key, value]) => {
        formData.append(key, value);
      });
      files.forEach((file) => {
        formData.append("files", file);
      });
      formData.append("fileDescriptions", JSON.stringify(description));
      formData.append("fileTypes", JSON.stringify(fileType));
      await createLawsuit(application._id, formData);
      console.log("Dava başarıyla oluşturuldu!");
      onClose();
    } catch (error) {
      console.error("Dava oluşturma hatası:", error);
    }
  };

  return (
<div className="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50">

      <div className="bg-[#fffdfa] w-3/4 max-w-4xl rounded-lg shadow-lg p-6 relative">
        <h2 className="text-2xl font-bold text-center text-[#123D3D] mb-4">
          Dava Oluştur
        </h2>

        <div className="max-h-[450px] overflow-y-auto p-2 scrollbar-hide">
          {/* Dava Bilgileri */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-[#123D3D] font-semibold">Dava Konusu:</label>
              <input
                type="text"
                name="caseSubject"
                value={lawsuitData.caseSubject}
                onChange={handleInputChange}
                className="w-full p-2 border border-[#D5C4A1] rounded-md focus:ring-2 focus:ring-[#D4AF37] bg-transparent"
              />
            </div>
            <div>
              <label className="block text-[#123D3D] font-semibold">Mahkeme:</label>
              <input
                type="text"
                name="court"
                value={lawsuitData.court}
                onChange={handleInputChange}
                className="w-full p-2 border border-[#D5C4A1] rounded-md focus:ring-2 focus:ring-[#D4AF37] bg-transparent"
              />
            </div>
            <div>
              <label className="block text-[#123D3D] font-semibold">Dosya Numarası:</label>
              <input
                type="text"
                name="fileNumber"
                value={lawsuitData.fileNumber}
                onChange={handleInputChange}
                className="w-full p-2 border border-[#D5C4A1] rounded-md focus:ring-2 focus:ring-[#D4AF37] bg-transparent"
              />
            </div>
            <div>
              <label className="block text-[#123D3D] font-semibold">Dosya Numarası:</label>
              <input
                type="text"
                name="caseNumber"
                value={lawsuitData.caseNumber}
                onChange={handleInputChange}
                className="w-full p-2 border border-[#D5C4A1] rounded-md focus:ring-2 focus:ring-[#D4AF37] bg-transparent"
              />
            </div>
            <div>
              <label className="block text-[#123D3D] font-semibold">Dosya Numarası:</label>
              <input
                type="text"
                name="courtFileNo"
                value={lawsuitData.courtFileNo}
                onChange={handleInputChange}
                className="w-full p-2 border border-[#D5C4A1] rounded-md focus:ring-2 focus:ring-[#D4AF37] bg-transparent"
              />
            </div>
            <div>
              <label className="block text-[#123D3D] font-semibold">Dava Tarihi:</label>
              <input
                type="date"
                name="lawsuitDate"
                value={lawsuitData.lawsuitDate}
                onChange={handleInputChange}
                className="w-full p-2 border border-[#D5C4A1] rounded-md focus:ring-2 focus:ring-[#D4AF37] bg-transparent"
              />
            </div>
          </div>

          {/* Dosya Yükleme */}
          <div className="mt-4">
            <label className="block text-[#123D3D] font-semibold">Dosya Yükleme:</label>
            <input
              type="file"
              multiple
              onChange={handleFileChange}
              className="w-full p-2 border border-[#D5C4A1] rounded-md bg-transparent"
            />
          </div>

          {/* Dosya Listesi */}
          <div className="max-h-[150px] overflow-y-auto mt-4 border border-[#D5C4A1] rounded-md p-2">
            {files.map((file, index) => (
              <div key={index} className="mb-2">
                <p className="text-[#123D3D] font-medium">{file.name}</p>
                <input
                  type="text"
                  placeholder="Dosya Açıklaması"
                  value={description[index]}
                  onChange={(e) => handleFileDescriptionChange(index, e.target.value)}
                  className="w-full mt-1 p-2 border border-[#D5C4A1] rounded-md"
                />
                <select
                  value={fileType[index]}
                  onChange={(e) => handleFileTypeChange(index, e.target.value)}
                  className="w-full mt-1 p-2 border border-[#D5C4A1] rounded-md"
                >
                  <option value="">Dosya Türü Seçin</option>
                  <option value="Hearing Report">Duruşma İzleme Raporu</option>
                  <option value="Petition">Dilekçe</option>
                  <option value="Hearing Minutes">Duruşma Tutanakları</option>
                  <option value="Indictment">İddianame</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        {/* Butonlar */}
        <div className="flex justify-end mt-4 space-x-4">
          <button
            onClick={onClose}
            className="bg-[#D5C4A1] text-[#123D3D] px-4 py-2 rounded-md font-semibold hover:bg-[#D4AF37]"
          >
            Kapat
          </button>
          <button
            onClick={handleSubmit}
            className="bg-[#123D3D] text-white px-4 py-2 rounded-md font-semibold hover:bg-[#D4AF37]"
          >
            Kaydet
          </button>
        </div>
      </div>
    </div>
  );
};

export default CreateLawsuitModal;
