import { useState } from "react";
import axios from "axios";

const apiUrl = import.meta.env.VITE_BE_URL;

const CitizenApplicationStore = () => {
  const [applications, setApplications] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [s3Files, setS3Files] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleError = (err, defaultMessage) => {
    console.error(err);
    setError(defaultMessage || "Bir hata oluştu!");
  };

  const createCitizenApplication = async (newApplication) => {
    setLoading(true);
    try {
      const formData = new FormData();
  
      Object.entries(newApplication).forEach(([key, value]) => {
        if (key === "files") {
          value.forEach((file) => {
            formData.append("files", file.file);
            formData.append("descriptions", file.description || "Belge");
            formData.append("types", file.type || "Other");
          });
        } else if (key === "links" && Array.isArray(value) && value.length > 0) {
          value.forEach((link, index) => {
            formData.append(`links[${index}][documentSource]`, link.url || "");
            formData.append(
              `links[${index}][documentDescription]`,
              link.description || ""
            );
            formData.append(`links[${index}][type]`, link.type || "Other");
          });
        } else if (Array.isArray(value)) {
          value.forEach((item) => {
            formData.append(key, item);
          });
        } else {
          formData.append(key, value);
        }
      });
  
      // FormData'nın içeriğini logla
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
  
      await axios.post(`${apiUrl}/applications`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      alert("Başvuru başarıyla oluşturuldu!");
    } catch (err) {
      console.error("Başvuru oluşturulamadı:", err);
      alert("Başvuru oluşturulurken hata oluştu.");
    } finally {
      setLoading(false);
    }
  };
  
  
  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
        const response = await axios.get(`${apiUrl}/applications/applications`);
        setApplications(response.data);
    } catch (err) {
      handleError(err, "Veriler alınırken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };


  const fetchDocumentTypes = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${apiUrl}/applications/api/document-types`);
      setDocumentTypes(response.data.documentTypes || []);
    } catch (err) {
      handleError(err, "Dosya türleri alınırken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axios.get(`${apiUrl}/applications/${id}`);
      setS3Files(response.data.s3Files || []);
      return response.data;
    } catch (err) {
      handleError(err, "Başvuru verisi alınırken bir hata oluştu!");
      return null;
    } finally {
      setLoading(false);
    }
  };

  const updateApplication = async (id, updatedData) => {
    setLoading(true);
    setError(null);
    try {
      const formData = new FormData();
  
      // Text alanlarını ekleme
      Object.entries(updatedData).forEach(([key, value]) => {
        if (
          !["files", "links", "lawyer" , "eventCategories" ].includes(key) &&
          value !== undefined &&
          value !== null
        ) {
          formData.append(key, value);
        }
      });
  
        // EventCategories alanını string olarak ekleme
    if (updatedData.eventCategories) {
      const eventCategory =
        Array.isArray(updatedData.eventCategories) &&
        updatedData.eventCategories.length > 0
          ? updatedData.eventCategories[0] // Array ise ilk elemanı al
          : updatedData.eventCategories; // Değilse doğrudan ekle
      formData.append("eventCategories", eventCategory);
    }

      // Dosyaları ekleme
      if (Array.isArray(updatedData.files) && updatedData.files.length > 0) {
        updatedData.files.forEach((file, index) => {
          formData.append("files", file.file || file); // Dosya nesnesi
          formData.append(`descriptions[files][${index}]`, file.description || `File ${index + 1}`); // Dosya açıklaması
          formData.append(`types[files][${index}]`, file.type || "Other"); // Dosya türü
        });
      }
  
      // Linkleri ekleme
      if (Array.isArray(updatedData.links) && updatedData.links.length > 0) {
        updatedData.links.forEach((link, index) => {
          formData.append(`links[${index}]`, link.url || ""); // Link URL'si
          formData.append(`descriptions[links][${index}]`, link.description || `Link ${index + 1}`); // Link açıklaması
          formData.append(`types[links][${index}]`, link.type || "Other"); // Link türü
        });
      }
  
      // Lawyer alanını ekleme
      if (updatedData.lawyer) {
        formData.append("lawyer", updatedData.lawyer); // Lawyer ID'sini FormData'ya ekle
      }
  
      // FormData'yı logla
      for (let pair of formData.entries()) {
        console.log(pair[0], pair[1]);
      }
  
      // PUT isteği gönder
      const response = await axios.put(`${apiUrl}/applications/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      // Başvuru listesini güncelle
      setApplications((prev = []) =>
        Array.isArray(prev)
          ? prev.map((app) => (app._id === id ? response.data : app))
          : []
      );
  
      console.log("Başvuru başarıyla güncellendi:", response.data);
    } catch (err) {
      handleError(err, "Başvuru güncellenirken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };
  
  

  return {
    applications,
    documentTypes,
    s3Files,
    loading,
    error,
    fetchApplications,
    fetchDocumentTypes,
    fetchApplicationById,
    updateApplication,
    createCitizenApplication, // Yeni eklenen fonksiyon
  };
};

export default CitizenApplicationStore;