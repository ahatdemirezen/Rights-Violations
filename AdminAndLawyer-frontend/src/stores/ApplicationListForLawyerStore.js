import { create } from "zustand";
import axiosInstance from "./axiosInstance";

const apiUrl = import.meta.env.VITE_BE_URL; // API URL'sini .env dosyasından alın
//serverForRedeploy
// Zustand store
const useApplicationListForLawyerStore = create((set) => ({
  applications: [], // Başvuruların listesi
  applicationDetails: null, // Tek bir başvurunun detayları
  loading: false, // Yüklenme durumu
  error: null, // Hata mesajı

  // Başvuruları getirme fonksiyonu
  fetchApplications: async () => {
    set({ loading: true, error: null }); // Yüklenme durumunu başlat

    try {
      const response = await axiosInstance.get(`${apiUrl}/lawyerapplication`, {
        withCredentials: true, // Kimlik doğrulama bilgilerini gönder
      });
      set({ applications: response.data.data, loading: false }); // Gelen veriyi state'e ata
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          "An error occurred while fetching applications",
        loading: false,
      });
    }
  },

  // Belirli bir başvurunun detaylarını getirme fonksiyonu
  fetchApplicationDetails: async (applicationId) => {
    set({ loading: true, error: null }); // Yüklenme durumunu başlat

    try {
      const response = await axiosInstance.get(
        `${apiUrl}/lawyerapplication/${applicationId}`,
        {
          withCredentials: true, // Kimlik doğrulama bilgilerini gönder
        }
      );
      set({ applicationDetails: response.data.data, loading: false }); // Gelen başvuru detaylarını state'e ata
    } catch (err) {
      set({
        error:
          err.response?.data?.message ||
          "An error occurred while fetching application details",
        loading: false,
      });
    }
  },
}));

export default useApplicationListForLawyerStore;
