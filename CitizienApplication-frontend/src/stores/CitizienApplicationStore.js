import { useState } from "react";
import axios from "axios";

const apiUrl = import.meta.env.VITE_BE_URL;
//trycom
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
  
      const response = await axios.post(`${apiUrl}/citizen/create`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
  
      console.log("Başarılı Yanıt:", response);
      return response.data; // API yanıtını geri döndür
  
    } catch (err) {
      console.error("Başvuru oluşturulamadı:", err);
      throw err; // Hata durumunda hatayı geri fırlat
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
    createCitizenApplication, // Yeni eklenen fonksiyon
  };
};

export default CitizenApplicationStore;