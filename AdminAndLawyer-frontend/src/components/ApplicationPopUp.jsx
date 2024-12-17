import React, { useState, useEffect } from "react";
import useApplicationStore from "../stores/ApplicationStore";
import useLawyerListPageStore from "../stores/LawyerListPageStore"; // Avukat listesini getiren store
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faFileAlt } from "@fortawesome/free-solid-svg-icons";

const ApplicationEditModal = ({ application,applicationId, onClose, onSave }) => {
  const [formData, setFormData] = useState({
    
    ...application,
    applicationDate: application.applicationDate // Başvuru tarihini düzenleme sırasında girili olarak getiriyoruz
    ? new Date(application.applicationDate).toISOString().split("T")[0]
    : "", // Eğer tarih yoksa boş bırak
    documents: application.documents || [],
    links: application.links || "",
    files: [], // Yeni dosyalar için
    documentType: "files", // Varsayılan olarak "files"
    documentUrl: "", // Link seçilirse kullanılacak
    documentDescription: "", // Açıklama alan
    lawyer: application.lawyer || "", // Avukat alanı (ID)
    eventCategories: application.eventCategories || "", // Event kategorisi (string)
    organizationName: application.organizationName || "", // Kurum adı
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

   // Event kategori seçimi için değişiklik işlemi
   const handleEventCategoriesChange = (e) => {
    const selectedCategory = e.target.value; // Seçilen kategori
    setFormData((prev) => ({
      ...prev,
      eventCategories: selectedCategory, // Tek bir kategori olarak ayarla
    }));
  };
  

  const handleInputChange = (e) => {
    const { name, value } = e.target;
  
    setFormData((prev) => ({
      ...prev,
      [name]: value, // lawyer alanı _id olarak ayarlanır
    }));
  };
  

  const handleFileUpload = (e) => {
    const files = Array.from(e.target.files).map((file,index) => ({
      file,
      description: `Açıklama ${formData.files.length + index + 1}`, // Dinamik açıklama numarası
      type: "",
    }));
    setFormData((prev) => ({
      ...prev,
      files: [...prev.files, ...files],
    }));
  };

  const handleSave = () => {
    const updatedApplication = { ...formData };
  
    // Link ekleme
     if (formData.documentType === "link" && formData.documentUrl) {
    updatedApplication.links = [
      ...(updatedApplication.links || []),
      {
        url: formData.documentUrl,
        description: formData.documentDescription || `Link Açıklaması`,
      },
    ];
  }
   // Dosya ekleme
   if (formData.files && formData.files.length > 0) {
    updatedApplication.files = formData.files.map((file) => ({
      file: file.file,
      description: file.description || "No Description",
      type: file.type || "Other",
    }));
  }
    console.log("Saving application:", updatedApplication);
    onSave(updatedApplication);
    onClose();
  };
  


const { fetchDocumentTypes } = useApplicationStore();

useEffect(() => {
  fetchDocumentTypes(); // Store'dan çağırıyoruz
}, []);


const { fetchApplicationById, s3Files } = useApplicationStore();

useEffect(() => {
  if (applicationId) {
    fetchApplicationById(applicationId); // Store'dan çağırıyoruz
  }
}, [applicationId]);


  
  const { fetchLawyers, lawyers } = useLawyerListPageStore(); // Lawyer store'dan fonksiyonu al
  console.log("lawyers" , lawyers)
  useEffect(() => {
    fetchLawyers(); // Avukatları store'dan al
  }, []);
  console.log("Avukatlar:", lawyers);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white w-3/4 rounded shadow-lg p-6">
      <h2 className="text-2xl font-bold mb-6 text-[#8B0000] border-b-4 border-[#D4AF37] pb-2">
        Başvuru Düzenle
      </h2>        
      <div className="grid grid-cols-2 gap-4">
           {/* TC Kimlik Numarası */}
           <div>
            <label className="block text-gray-700">T.C. Kimlik Numarası:</label>
            <input
              type="text"
              name="nationalID"
              value={formData.nationalID}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>

          {/* Başvuru Tarihi */}
          <div>
            <label className="block text-gray-700">Başvuru Tarihi:</label>
            <input
              type="date"
              name="applicationDate"
              value={formData.applicationDate || ""}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
           {/* Olay Kategorisi */}
           <div>
            <label className="block text-gray-700">Olay Kategorisi:</label>
            <select
              name="eventCategories"
              value={formData.eventCategories || ""}
              onChange={handleEventCategoriesChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="">Kategori Seçin</option>
              {eventCategoriesOptions.map((category, index) => (
                <option key={index} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </div>


          {/* Başvuruyu Alan Kişi */}
          {application && (
            <div>
              <label className="block text-gray-700">Başvuruyu Alan:</label>
              <input
                type="text"
                name="receivedBy"
                value={formData.receivedBy || ""}
                onChange={handleInputChange}
                className="w-full p-2 border border-gray-300 rounded"
              />
            </div>
          )}

          <div>
            <label className="block text-gray-700">Tür:</label>
            <select
              name="applicationType"
              value={formData.applicationType}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="organization">Organization</option>
              <option value="individual">Individual</option>
            </select>
          </div>
           {/* Başvuru Türüne Göre Alan */}
           {formData.applicationType === "individual" ? (
  <div>
    <label className="block text-gray-700">Başvuru Sahibi (İsim Soyisim):</label>
    <input
      type="text"
      name="applicantName"
      value={formData.applicantName || ""}
      onChange={handleInputChange}
      className="w-full p-2 border border-gray-300 rounded"
    />
  </div>
) : (
  <div>
    <label className="block text-gray-700">Kurum Adı:</label>
    <input
      type="text"
      name="organizationName"
      value={formData.organizationName || ""}
      onChange={(e) =>
        setFormData((prev) => ({
          ...prev,
          organizationName: e.target.value,
        }))
      }
      className="w-full p-2 border border-gray-300 rounded"
    />
  </div>
)}

          <div>
            <label className="block text-gray-700">Başvuru Durumu:</label>
            <select
              name="status"
              value={formData.status}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            >
              <option value="pending">Beklemede</option>
              <option value="approved">Onaylandı</option>
              <option value="rejected">Reddedildi</option>
            </select>
          </div>
          <div>
            <label className="block text-gray-700">Adres:</label>
            <input
              type="text"
              name="address"
              value={formData.address}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
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
            <input
              type="text"
              name="complaintReason"
              value={formData.complaintReason}
              onChange={handleInputChange}
              className="w-full p-2 border border-gray-300 rounded"
            />
          </div>
          <div>
                {/* Lawyer seçimi */}
                <div>
  <label className="block text-gray-700">Avukat:</label>
  <select
    name="lawyer"
    value={formData.lawyer} // Lawyer ID (ObjectId formatında) kullanılır
    onChange={handleInputChange}
    className="w-full p-2 border border-gray-300 rounded"
  >
    <option value="">Avukat Seçin</option>
    {lawyers?.map((lawyer) => (
      <option key={lawyer._id} value={lawyer?.id}>
        {lawyer.name}
      </option>
    ))}
  </select>
</div>

          </div>    
          {formData.files.map((file, index) => (
    <div key={index} className="border p-2 my-2 rounded bg-gray-100">
        <label className="block text-gray-700">Dosya Açıklaması:</label>
        <input
            type="text"
            value={file.description}
            onChange={(e) => {
                const updatedFiles = [...formData.files];
                updatedFiles[index] = { ...updatedFiles[index], description: e.target.value };
                setFormData({ ...formData, files: updatedFiles });
            }}
            placeholder={`Açıklama ${index + 1}`}
            className="w-full p-2 border border-gray-300 rounded"
        />
        <label className="block text-gray-700 mt-2">Dosya Türü:</label>
        <select
            value={file.type}
            onChange={(e) => {
                const updatedFiles = [...formData.files];
                updatedFiles[index] = { ...updatedFiles[index], type: e.target.value };
                setFormData({ ...formData, files: updatedFiles });
            }}
            className="w-full p-2 border border-gray-300 rounded"
        >
            <option value="">Tür Seçin</option>
            <option value="Media Screening">Media Screening</option>
            <option value="NGO Data">NGO Data</option>
            <option value="Bar Commissions">Bar Commissions</option>
            <option value="Public Institutions">Public Institutions</option>
            <option value="Other">Other</option>
        </select>
    </div>
))}

<div className="max-h-[200px] overflow-y-auto border border-gray-300 rounded p-2 mt-2 bg-white">
  {Array.isArray(s3Files) && s3Files.length > 0 ? (
    s3Files.map((file, index) => (
      <div
        key={index}
        className="my-2 p-4 border rounded bg-[#FFFBF0] flex flex-col shadow-sm"
      >
        {/* Açıklama ve Tür Alanı */}
        <div className="flex justify-between">
          <div>
            <p className="text-gray-700 font-medium">
              Açıklama: {file.documentDescription || `Açıklama ${index + 1}`}
            </p>
            <p className="text-gray-500 text-sm">
              Tür:{" "}
              <select
                value={file.type || ""}
                onChange={(e) => {
                  const updatedFiles = [...s3Files];
                  updatedFiles[index] = {
                    ...updatedFiles[index],
                    type: e.target.value,
                  };
                  setFormData((prev) => ({
                    ...prev,
                    documents: updatedFiles, // documents içine güncellenmiş dosyaları koy
                  }));
                }}
                className="border p-1 rounded text-sm"
              >
                <option value="">Tür Seçin</option>
                <option value="Media Screening">Media Screening</option>
                <option value="NGO Data">NGO Data</option>
                <option value="Bar Commissions">Bar Commissions</option>
                <option value="Public Institutions">Public Institutions</option>
                <option value="Other">Other</option>
              </select>
            </p>
          </div>
        </div>

        {/* Dosya Linki */}
        {file.documentSource ? (
          <a
            href={file.documentSource}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline mt-2"
          >
            Linki Görüntüle
          </a>
        ) : file.documentUrl ? (
          <a
            href={file.documentUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="text-blue-500 hover:underline mt-2"
          >
            Dosyayı Görüntüle
          </a>
        ) : (
          <span className="text-red-500">URL Bulunamadı</span>
        )}
      </div>
    ))
  ) : (
    <p className="text-gray-500">Mevcut dosya veya link bulunamadı.</p>
  )}
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

{/* Dosya Yükleme */}
{formData.documentType === "files" && (
  <div>
    <label className="block text-gray-700">Dosya Yükleme:</label>
    
    <input
      type="file"
      multiple
      onChange={handleFileUpload}
      className="w-full p-2 border border-gray-300 rounded"
    />
  </div>
)}

{/* Link Girişi */}
{formData.documentType === "link" && (
  <div>
    <label className="block text-gray-700">Link:</label>
    <input
      type="text"
      name="documentUrl"
      value={formData.documentUrl}
      onChange={handleInputChange}
      className="w-full p-2 border border-gray-300 rounded"
    />

    <label className="block text-gray-700 mt-2">Link Açıklaması:</label>
    <input
      type="text"
      name="documentDescription"
      value={formData.documentDescription}
      onChange={handleInputChange}
      placeholder="Açıklama ekleyin"
      className="w-full p-2 border border-gray-300 rounded"
    />

    <label className="block text-gray-700 mt-2">Dosya Türü:</label>
    <select
      name="documentType"
      value={formData.type || ""}
      onChange={(e) =>
        setFormData({ ...formData, type: e.target.value })
      }
      className="w-full p-2 border border-gray-300 rounded"
    >
 
    </select>
  </div>
)}

      </div>
        <div className="mt-6 flex justify-end space-x-4">
          <button
            onClick={onClose}
            className="bg-[#8B0000] text-white px-4 py-2 rounded font-medium hover:bg-[#D4AF37] transition"
            >
            Kapat
          </button>
          <button
            onClick={handleSave}
            className=" px-4 py-2 bg-[#183D3D] text-[#D5C4A1] rounded-md text-sm font-medium transition hover:shadow-lg"
            >
            Kaydet 
          </button>
        </div>
      </div>
    </div>
    
  );
  
};

export default ApplicationEditModal;
