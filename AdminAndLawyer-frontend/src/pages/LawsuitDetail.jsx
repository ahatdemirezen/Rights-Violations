import React, { useEffect, useState } from "react";
import { useParams , useNavigate } from "react-router-dom";
import useLawsuitListPageStore from "../stores/LawsuitListPageStore";
import { FaFolder, FaFileAlt } from "react-icons/fa"; // Simge için ikonlar
import { toast, ToastContainer } from "react-toastify";

const LawsuitDetails = () => {
  const { lawsuitId } = useParams(); // URL'den davanın ID'sini al
  const {
    selectedLawsuit,
    fetchLawsuitById,
    updateLawsuit,
    loading,
    error,
  } = useLawsuitListPageStore();

  const navigate = useNavigate(); // Navigate hook'u kullanılır
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
        organizationName: selectedLawsuit.organizationName,
        lawyer: selectedLawsuit.applicationId?.lawyer?.name || "Bilinmiyor", // Avukat bilgisini kontrol et
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
  
  const handleNavigateToFile = (fileUrl) => {
    navigate(fileUrl); // URL'yi navigate ile yönlendir
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
  
    try {
      await updateLawsuit(lawsuitId, formDataObj); // Zustand store'daki updateLawsuit fonksiyonunu çağır
      await fetchLawsuitById(lawsuitId); // Güncellenmiş verileri yeniden getir
  
      toast.success("Dava başarıyla güncellendi!", {
        position: "top-right",
        autoClose: 3000,
        theme: "colored",
      });
  
      setIsEditing(false);
      setNewFiles([]);
      setNewDescriptions([]);
      setNewFileTypes([]);
    } catch (err) {
      console.error("Güncelleme sırasında hata:", err.response?.data || err.message);
  
      // Hata mesajı kontrolü: Error nesnesinden detaylı mesaj al
      const errorMessage =
        err.response?.data?.error ||
        err.response?.data?.message || // Backend "message" alanı
        "Dava güncellenirken bir hata oluştu. Bu isimde bir dosya mevcut olabilir."; // Varsayılan hata mesajı
  
      // Toast ile kullanıcıya hatayı göster
      toast.error(`Hata: ${errorMessage}`, {
        position: "top-right",
        autoClose: 5000,
        theme: "colored",
      });
  
      // Düzenleme modu açık kalacak, pop-up kapanmayacak
    }
  };
  
  
  

  const filteredFiles =
  selectedFileType && selectedLawsuit?.files
    ? selectedLawsuit.files.filter((file) => file.fileType === selectedFileType)
    : selectedLawsuit?.files;

  if (loading) return <p>Yükleniyor...</p>;

  return (
    <div className="flex justify-center bg-[#F0F0F0] min-h-screen py-6">
      <div className="max-w-5xl w-full p-6 bg-[#fdf8f0] rounded-lg shadow-lg">
        <h1 className="text-3xl font-bold text-[#123D3D] mb-6 text-center">
          Dava Detayları
        </h1>
        {selectedLawsuit ? (
          <div className="bg-[#fffefd] shadow-md rounded-lg p-6">
            <div className="flex justify-end mb-4">
              <button
                onClick={() => setIsEditing((prev) => !prev)}
                className="bg-[#123D3D] text-[#fdf8f0] px-4 py-2 rounded-md shadow hover:bg-[#D4AF37] hover:text-[#123D3D] transition"
              >
                {isEditing ? "Düzenlemeyi İptal Et" : "Düzenle"}
              </button>
            </div>
            <form>
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-[#123D3D]">
                    Başvuru Numarası
                  </label>
                  <input
                    type="text"
                    name="applicationNumber"
                    value={formData.applicationNumber || ""}
                    disabled
                    className="w-full border border-[#D5C4A1] rounded-md p-2 mt-1 bg-[#ededed] text-[#123D3D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#123D3D]">
                    Başvuran Adı
                  </label>
                  <input
                    type="text"
                    name="applicantName"
                    value={formData.applicantName || ""}
                    disabled
                    className="w-full border border-[#D5C4A1] rounded-md p-2 mt-1 bg-[#ededed] text-[#123D3D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#123D3D]">
                    Kurum Adı
                  </label>
                  <input
                    type="text"
                    name="organizationName"
                    value={formData.organizationName || ""}
                    disabled
                    className="w-full border border-[#D5C4A1] rounded-md p-2 mt-1 bg-[#ededed] text-[#123D3D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#123D3D]">
                    Mahkeme Dosya No
                  </label>
                  <input
                    type="text"
                    name="courtFileNo"
                    value={formData.courtFileNo || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full border border-[#D5C4A1] rounded-md p-2 mt-1 bg-[#FFFFFF] text-[#123D3D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#123D3D]">
                    Dava Konusu
                  </label>
                  <input
                    type="text"
                    name="caseSubject"
                    value={formData.caseSubject || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full border border-[#D5C4A1] rounded-md p-2 mt-1 bg-[#FFFFFF] text-[#123D3D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#123D3D]">
                    Avukat
                  </label>
                  <input
                    type="text"
                    name="lawyer"
                    value={formData.lawyer || "Bilinmiyor"}
                    disabled
                    className="w-full border border-[#D5C4A1] rounded-md p-2 mt-1 bg-[#ededed] text-[#123D3D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#123D3D]">
                    Dosya Numarası
                  </label>
                  <input
                    type="text"
                    name="fileNumber"
                    value={formData.fileNumber || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full border border-[#D5C4A1] rounded-md p-2 mt-1 bg-[#FFFFFF] text-[#123D3D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#123D3D]">
                    Mahkeme
                  </label>
                  <input
                    type="text"
                    name="court"
                    value={formData.court || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full border border-[#D5C4A1] rounded-md p-2 mt-1 bg-[#FFFFFF] text-[#123D3D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#123D3D]">
                    Esas Numarası
                  </label>
                  <input
                    type="text"
                    name="caseNumber"
                    value={formData.caseNumber || ""}
                    onChange={handleInputChange}
                    disabled={!isEditing}
                    className="w-full border border-[#D5C4A1] rounded-md p-2 mt-1 bg-[#FFFFFF] text-[#123D3D]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[#123D3D]">
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
                    className="w-full border border-[#D5C4A1] rounded-md p-2 mt-1 bg-[#FFFFFF] text-[#123D3D]"
                  />
                </div>
              </div>
            </form>
            <div className="mt-4">
            <label className="block text-sm font-medium text-[#123D3D]">
              Sonuç Açıklaması
            </label>
            <input
              type="text"
              name="resultDescription"
              value={formData.resultDescription || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full border border-[#D5C4A1] rounded-md p-2 mt-1 bg-[#FFFFFF] text-[#123D3D]"
            />
          </div>
          <div className="mt-4">
            <label className="block text-sm font-medium text-[#123D3D]">
              Sonuç Aşaması
            </label>
            <input
              type="text"
              name="resultStage"
              value={formData.resultStage || ""}
              onChange={handleInputChange}
              disabled={!isEditing}
              className="w-full border border-[#D5C4A1] rounded-md p-2 mt-1 bg-[#FFFFFF] text-[#123D3D]"
            />
          </div>

          {/* Dosya Tipi Filtreleme */}
          <div className="mb-4 mt-6">
            <label className="block text-sm font-medium text-[#123D3D]">
              Dosya Tipine Göre Filtrele
            </label>
            <select
              value={selectedFileType}
              onChange={(e) => setSelectedFileType(e.target.value)}
              className="w-full border border-[#D5C4A1] rounded-md p-2 mt-1 bg-[#fffbf4] text-[#123D3D]"
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
  <h2 className="text-lg font-semibold text-[#123D3D] mb-4">Dosyalar</h2>
  {filteredFiles && filteredFiles.length > 0 ? (
    <div className="grid grid-cols-3 gap-4">
      {filteredFiles.map((file, index) => (
        <div
          key={file._id || index}
          className="relative flex flex-col items-center bg-[#fffbf4] p-4 rounded-lg shadow-md border border-[#D5C4A1] hover:shadow-lg hover:border-[#123D3D] transition"
        >
          {/* Dosya İkonu */}
          <div className="text-[#e2be47] text-5xl mb-2">
            {file.fileType === "Folder" ? <FaFolder /> : <FaFileAlt />}
          </div>
          {/* Dosya Bilgileri */}
          <div className="text-center">
            <p className="text-sm font-semibold text-[#123D3D]">
              {file.description || "Açıklama Yok"}
            </p>
            <p className="text-xs text-[#123D3D] mt-1">
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
            Görmek için tıklayın
          </a>
        </div>
      ))}
    </div>
  ) : (
    <p className="text-sm text-[#123D3D]">Yüklü dosya bulunamadı.</p>
  )}
</div>

          {/* Yeni Dosya Yükleme */}
          {isEditing && (
            <div className="mt-6">
            <h2 className="text-lg font-semibold text-[#123D3D] mb-2">
  Yeni Dosya Ekle
</h2>
<input
  type="file"
  multiple
  onChange={handleFileChange}
  className="w-full border border-[#D5C4A1] rounded-md p-2 mt-1 bg-[#F8F1E8] text-[#123D3D]"
/>

              {newFiles.map((file, index) => (
                <div key={file.name || index} className="mt-4">
                  <label className="block text-sm font-medium text-[#123D3D]">
                    Açıklama ({file.name})
                  </label>
                  <input
                    type="text"
                    value={newDescriptions[index] || ""}
                    onChange={(e) =>
                      handleDescriptionChange(index, e.target.value)
                    }
                    className="w-full border border-[#D5C4A1] rounded-md p-2 mt-1 bg-[#FFFFFF] text-[#123D3D]"
                  />
                <label className="block text-sm font-medium text-[#123D3D] mt-2">
  Dosya Tipi
</label>
<select
  value={newFileTypes[index] || ""}
  onChange={(e) => handleFileTypeChange(index, e.target.value)}
  className="w-full border border-[#D5C4A1] rounded-md p-2 mt-1 bg-[#F8F1E8] text-[#123D3D]"
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
            <div className="mt-6 flex justify-end">
              <button
                onClick={handleSave}
                className="bg-[#123D3D] text-[#D4AF37] px-6 py-2 rounded-md shadow-md hover:bg-[#D5C4A1] hover:text-[#123D3D] transition"
              >
                Kaydet
              </button>
            </div>
          )}
        </div>
      ) : (
        <p className="text-center text-[#123D3D]">
          Dava bilgisi bulunamadı.
        </p>
      )}
              <ToastContainer />
    </div>
  </div>
 );
};

export default LawsuitDetails;