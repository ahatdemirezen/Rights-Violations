import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import useLawsuitListPageStore from "../../stores/LawsuitListForLawyerStore";
import { FaFolder, FaFileAlt } from "react-icons/fa"; // Simge için ikonlar

const LawsuitDetails = () => {
  const { lawsuitId } = useParams(); // URL'den davanın ID'sini al
  const {
    selectedLawsuit,
    fetchLawsuitById,
    updateLawsuit,
    loading,
    error,
  } = useLawsuitListPageStore();

  const [isEditing, setIsEditing] = useState(false); // Düzenleme modunu kontrol eder
  const [formData, setFormData] = useState({}); // Formdaki güncellenen veriler
  const [newFiles, setNewFiles] = useState([]); // Yeni yüklenen dosyalar
  const [newDescriptions, setNewDescriptions] = useState([]); // Yeni dosya açıklamaları
  const [newFileTypes, setNewFileTypes] = useState([]); // Yeni dosya tipleri
  const [selectedFileType, setSelectedFileType] = useState(""); // Filtreleme için dosya tipi

  useEffect(() => {
    if (lawsuitId) {
      fetchLawsuitById(lawsuitId); // Davanın detaylarını getir
    }
  }, [lawsuitId, fetchLawsuitById]);

  useEffect(() => {
    if (selectedLawsuit) {
      setFormData({
        applicationNumber: selectedLawsuit.applicationNumber,
        applicantName: selectedLawsuit.applicantName,
        lawyer: selectedLawsuit.applicationId?.lawyer.name || "Bilinmiyor", // İlk lawyer
        courtFileNo: selectedLawsuit.courtFileNo,
        caseSubject: selectedLawsuit.caseSubject,
        fileNumber: selectedLawsuit.fileNumber,
        court: selectedLawsuit.court,
        lawsuitDate: selectedLawsuit.lawsuitDate,
        caseNumber: selectedLawsuit.caseNumber,
        resultDescription: selectedLawsuit.resultDescription,
        resultStage: selectedLawsuit.resultStage,
      });
    }
  }, [selectedLawsuit]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files); // Dosyaları al
    console.log("Seçilen dosyalar:", files); // Seçilen dosyaları kontrol et
    setNewFiles(files); // Dosyaları güncelle
  
    // Açıklamaları sıfırla veya dosya sayısına göre boş bir dizi oluştur
    setNewDescriptions(Array(files.length).fill(""));
  };
  
  const handleDescriptionChange = (index, value) => {
    // Yeni açıklamalar dizisini oluştur
    const updatedDescriptions = [...newDescriptions];
    updatedDescriptions[index] = value; // Belirtilen indeksi güncelle
    setNewDescriptions(updatedDescriptions); // State'i güncelle
  };
  

  const handleFileTypeChange = (index, value) => {
    const updatedFileTypes = [...newFileTypes];
    updatedFileTypes[index] = value; // Belirtilen indeksi güncelle
    setNewFileTypes(updatedFileTypes); // State'i güncelle
  };
  const handleSave = async () => {
    const formDataObj = new FormData();
  
    // React state olan formData içeriğini FormData'ya ekle
    Object.entries(formData).forEach(([key, value]) => {
      if (value !== null && value !== undefined) {
        formDataObj.append(key, value);
      }
    });
  
    // Dosyaları ve açıklamalarını ekle
    newFiles.forEach((file, index) => {
      formDataObj.append("files", file); // Dosyayı ekle
      formDataObj.append("description", newDescriptions[index] || ""); // Açıklamayı ekle
      formDataObj.append("fileType", newFileTypes[index] || ""); // Dosya tipini ekle
    });
    
  
    console.log("FormData içeriği:", [...formDataObj.entries()]); // FormData içeriğini kontrol et
  
    try {
      await updateLawsuit(lawsuitId, formDataObj); // Zustand store'daki updateLawsuit fonksiyonunu çağır
      await fetchLawsuitById(lawsuitId); // Güncellenmiş verileri yeniden getir
      setIsEditing(false);
      setNewFiles([]);
      setNewDescriptions([]);
      setNewFileTypes([]);
    } catch (err) {
      console.error("Güncelleme sırasında hata:", err.response?.data || err.message);
    }
  };
  

  const filteredFiles =
  selectedFileType && selectedLawsuit?.files
    ? selectedLawsuit.files.filter((file) => file.fileType === selectedFileType)
    : selectedLawsuit?.files;

  if (loading) return <p>Yükleniyor...</p>;
  if (error) return <p>Hata: {error}</p>;

  return (
    <div className="max-w-4xl mx-auto p-6 bg-[#E8EAE6] text-black shadow-lg rounded-lg">
<h1 className="text-2xl font-bold text-gray-800 mb-6 text-center">
        Dava Detayları
      </h1>
      {selectedLawsuit ? (
        <div className="bg-white shadow rounded p-6">
          <div className="flex justify-end mb-4">
            <button
              onClick={() => setIsEditing((prev) => !prev)}
              className="bg-[#2C4E4A] text-white px-4 py-2 rounded-md hover:bg-[#5C8374] transition"
            >
              {isEditing ? "Düzenlemeyi İptal Et" : "Düzenle"}
            </button>
          </div>
          <form>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Başvuru Numarası
                </label>
                <input
                  type="text"
                  name="applicationNumber"
                  value={formData.applicationNumber || ""}
                  disabled={true} // Güncellenemez
                  className="w-full border border-gray-700 rounded p-2 mt-1 bg-gray-300"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Başvuran Adı
                </label>
                <input
                  type="text"
                  name="applicantName"
                  value={formData.applicantName || ""}
                  disabled={true} // Güncellenemez
                  className="w-full border border-gray-700 rounded p-2 mt-1 bg-gray-300"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Mahkeme Dosya No
                </label>
                <input
                  type="text"
                  name="courtFileNo"
                  value={formData.courtFileNo || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-700 rounded p-2 mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Dava Konusu
                </label>
                <input
                  type="text"
                  name="caseSubject"
                  value={formData.caseSubject || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-700 rounded p-2 mt-1"
                />
              </div>
              <div>
                 <label className="block text-sm font-medium text-gray-600">
                      Avukat
                 </label>
                 <input
                  type="text"
                  name="lawyer"
                  value={formData.lawyer || "Bilinmiyor"} // Avukat ismi veya "Bilinmiyor"
                  disabled={true} // Güncellenemez
                  className="w-full border border-gray-700 rounded p-2 mt-1 bg-gray-300"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Dosya Numarası
                </label>
                <input
                  type="text"
                  name="fileNumber"
                  value={formData.fileNumber || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-700 rounded p-2 mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Mahkeme
                </label>
                <input
                  type="text"
                  name="court"
                  value={formData.court || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-700 rounded p-2 mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Esas Numarası
                </label>
                <input
                  type="text"
                  name="caseNumber"
                  value={formData.caseNumber || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-700 rounded p-2 mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Dava Tarihi
                </label>
                <input
                  type="date"
                  name="lawsuitDate"
                  value={
                    formData.lawsuitDate
                      ? new Date(formData.lawsuitDate)
                          .toISOString()
                          .substring(0, 10)
                      : ""
                  }
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-700 rounded p-2 mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Sonuç Açıklaması
                </label>
                <input
                  type="text"
                  name="resultDescription"
                  value={formData.resultDescription || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-700 rounded p-2 mt-1"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-600">
                  Sonuç Aşaması
                </label>
                <input
                  type="text"
                  name="resultStage"
                  value={formData.resultStage || ""}
                  onChange={handleInputChange}
                  disabled={!isEditing}
                  className="w-full border border-gray-700 rounded p-2 mt-1"
                />
              </div>
            </div>
          </form>
       {/* Filtreleme */}
       <div className="mb-4">
            <label className="block text-sm font-medium text-gray-600">
              Dosya Tipine Göre Filtrele
            </label>
            <select
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
              className="w-full border border-gray-700 rounded p-2 mt-1"
            >
              <option value="">Tümü</option>
              <option value="Hearing Report">Duruşma İzleme Raporu</option>
              <option value="Petition">Dilekçeler</option>
              <option value="Hearing Minutes">Duruşma Tutanakları</option>
              <option value="Indictment">İddianame</option>
            </select>
          </div>
{/* Dosyalar */}
<div className="mt-6">
  <h2 className="text-lg font-semibold text-gray-700 mb-4">
    Dosyalar
  </h2>
  {filteredFiles && filteredFiles.length > 0 ? (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
      {filteredFiles.map((file, index) => (
        <div
          key={file._id || index}
          className="relative flex flex-col items-center bg-[#F3F4ED] p-4 rounded-lg shadow-md hover:shadow-lg transition-transform transform hover:scale-105 border border-[#6D8B74]"
          >
          {/* Dosya İkonu */}
          <div className="text-[#6D8B74] text-6xl mb-2">
            {file.fileType === "Folder" ? (
              <FaFolder />
            ) : (
              <FaFileAlt />
            )}
          </div>
          {/* Dosya Bilgileri */}
          <div className="text-center">
            <p className="text-sm font-semibold text-gray-800">
              {file.description || "Açıklama Yok"}
            </p>
            <p className="text-xs text-gray-600">
              {file.fileType || "Bilinmiyor"}
            </p>
          </div>
          {/* Hover Efekti */}
          <a
            href={file.fileUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="absolute inset-0 flex items-center justify-center bg-black bg-opacity-50 opacity-0 hover:opacity-100 text-white font-medium text-sm rounded-lg transition-opacity"
          >
            Görmek İçin Tıklayın
          </a>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-gray-600">Yüklü dosya bulunamadı.</p>
  )}
</div>



          {/* Yeni Dosya Yükleme */}
          {isEditing && (
          <div className="mt-6">
          <h2 className="text-lg font-semibold text-[#2C4E4A] mb-4">
            Yeni Dosya Ekle
          </h2>
          <input
            type="file"
            multiple
            onChange={handleFileChange}
            className="w-full border border-[#6D8B74] rounded p-2 mt-1 bg-[#F3F4ED]"
          />
          {newFiles.map((file, index) => (
            <div key={file.name || index} className="mt-2">
              <label className="block text-sm font-medium text-[#2C4E4A]">
                Açıklama ({file.name})
              </label>
              <input
                type="text"
                value={newDescriptions[index] || ""}
                onChange={(e) => handleDescriptionChange(index, e.target.value)}
                className="w-full border border-[#6D8B74] rounded p-2 mt-1 bg-[#F3F4ED]"
              />
              <label className="block text-sm font-medium text-[#2C4E4A] mt-2">
                Dosya Tipi
              </label>
              <select
                value={newFileTypes[index] || ""}
                onChange={(e) => handleFileTypeChange(index, e.target.value)}
                className="w-full border border-[#6D8B74] rounded p-2 mt-1 bg-[#F3F4ED]"
              >
                <option value="">Seçiniz</option>
                <option value="Hearing Report">Duruşma İzleme Raporu</option>
                <option value="Petition">Dilekçeler</option>
                <option value="Hearing Minutes">Duruşma Tutanakları</option>
                <option value="Indictment">İddianame</option>
              </select>
            </div>
          ))}
        </div>
        
          )}

          {isEditing && (
            <div className="mt-4 flex justify-end">
              <button
                onClick={handleSave}
                className="bg-[#6D8B74] text-white px-4 py-2 rounded-md shadow-md hover:bg-[#4A766E] transition"
                >
                Kaydet
              </button>
              
            </div>
            
          )}
        </div>
      ) : (
        <p>Dava bilgisi bulunamadı.</p>
      )}
    </div>
    
  );
};

export default LawsuitDetails;
