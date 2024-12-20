import { useState } from "react";
import axiosInstance from "../stores/axiosInstance";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const apiUrl = import.meta.env.VITE_BE_URL;

const useApplicationStore = () => {
  const [applications, setApplications] = useState([]);
  const [documentTypes, setDocumentTypes] = useState([]);
  const [s3Files, setS3Files] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleError = (err, defaultMessage) => {
    console.error(err);
    setError(defaultMessage || "Bir hata oluştu!");
  };

  const createApplication = async (newApplication) => {
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
      const response = await axiosInstance.post(`${apiUrl}/applications`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true, // Kimlik doğrulama bilgilerini ekler
      });
  
      // Başarılı işlem sonucunu döndür
      return response.data;
    } catch (err) {
      console.error("Başvuru oluşturulamadı:", err);
  
      // Hata durumunu backend'den dönen veriyle ilet
      if (err.response) {
        throw err.response.data; // Backend'den dönen hata mesajını yukarı iletir
      } else {
        throw { error: "Başvuru Oluşturma Sırasında Hata" };
      }
    } finally {
      setLoading(false);
    }
  };
  
  
  
  const fetchApplications = async () => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`${apiUrl}/applications/applications`, {
        withCredentials: true, // Kimlik doğrulama bilgilerini ekler
      });
      setApplications(response.data);
    }catch (err) {
      handleError(err, "Veriler alınırken bir hata oluştu!");
    } finally {
      setLoading(false);
    }
  };

  const fetchApplicationById = async (id) => {
    setLoading(true);
    setError(null);
    try {
      const response = await axiosInstance.get(`${apiUrl}/applications/${id}`, {
        withCredentials: true,
      });
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
          !["files", "links", "lawyer", "eventCategories"].includes(key) &&
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
          formData.append(
            `descriptions[files][${index}]`,
            file.description || `File ${index + 1}`
          ); // Dosya açıklaması
          formData.append(`types[files][${index}]`, file.type || "Other"); // Dosya türü
        });
      }
  
      // Linkleri ekleme
      if (Array.isArray(updatedData.links) && updatedData.links.length > 0) {
        updatedData.links.forEach((link, index) => {
          formData.append(`links[${index}]`, link.url || ""); // Link URL'si
          formData.append(
            `descriptions[links][${index}]`,
            link.description || `Link ${index + 1}`
          ); // Link açıklaması
          formData.append(`types[links][${index}]`, link.type || "Other"); // Link türü
        });
      }
  
      // Lawyer alanını ekleme
      if (updatedData.lawyer) {
        formData.append("lawyer", updatedData.lawyer); // Lawyer ID'sini FormData'ya ekle
      }
  
      // PUT isteği gönder
      const response = await axiosInstance.put(`${apiUrl}/applications/${id}`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
        withCredentials: true, // Kimlik doğrulama bilgilerini ekler
      });
  
      // Başvuru listesini güncelle
      setApplications((prev = []) =>
        Array.isArray(prev)
          ? prev.map((app) => (app._id === id ? response.data : app))
          : []
      );
  
      console.log("Başvuru başarıyla güncellendi:", response.data);
    } catch (err) {
      // Backend'den gelen hatayı kontrol et
      const errorMessage =
        err.response?.data?.error || "Başvuru güncellenirken bir hata oluştu!";
      
      // Toastify ile kullanıcıya hata mesajını göster
      toast.error(errorMessage, {
        position: "top-right",
        autoClose: 10000,
        hideProgressBar: false,
        closeOnClick: true,
        pauseOnHover: true,
        draggable: true,
        theme: "colored",
      });
  
      // Store'un hata state'ini güncelle
      setError(errorMessage);
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
    fetchApplicationById,
    updateApplication,
    createApplication, // Yeni eklenen fonksiyon
  };
};

export default useApplicationStore;
