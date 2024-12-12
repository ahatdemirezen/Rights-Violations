import { create } from 'zustand';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_BE_URL; // API URL'sini .env dosyasından alın

const useLawsuitListPageStore = create((set) => ({
  lawsuits: [], // Davaların listesi
  selectedLawsuit: null, // Tek bir dava bilgisi
  loading: false, // Yüklenme durumu
  error: null, // Hata durumu

  // Davaları getirme fonksiyonu
  fetchLawsuits: async () => {
    set({ loading: true, error: null }); // Yüklenme durumunu başlat
    try {
      const response = await axios.get(`${apiUrl}/lawsuittracking`); // GET isteği
      const lawsuits = response.data.lawsuits; // API'den dönen davalar
      set({ lawsuits, loading: false }); // Davaları state'e kaydet ve yüklenme durumunu kapat
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Bir hata oluştu', // Hata mesajı
        loading: false, // Yüklenme durumunu kapat
      });
    }
  },

  // Tek bir davayı getirme fonksiyonu
  fetchLawsuitById: async (lawsuitId) => {
    set({ loading: true, error: null }); // Yüklenme durumunu başlat
    try {
      const response = await axios.get(`${apiUrl}/lawsuittracking/${lawsuitId}`); // GET isteği
      console.log("API'den dönen yanıt:", response.data); // Burada lawyer'ın `name` bilgisi var mı?

      const lawsuit = response.data.lawsuit; // API'den dönen dava bilgisi
      set({ selectedLawsuit: lawsuit, loading: false }); // Dava bilgisini state'e kaydet ve yüklenme durumunu kapat
    } catch (error) {
      set({
        error: error.response?.data?.message || 'Bir hata oluştu', // Hata mesajı
        loading: false, // Yüklenme durumunu kapat
      });
    }
  },

  // Davayı güncelleme fonksiyonu
  updateLawsuit: async (lawsuitId, formData) => {
    set({ loading: true, error: null });
    try {
      const response = await axios.put(`${apiUrl}/lawsuittracking/${lawsuitId}`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      const updatedLawsuit = response.data.lawsuit;
  
      set((state) => ({
        lawsuits: state.lawsuits.map((lawsuit) =>
          lawsuit._id === updatedLawsuit._id ? updatedLawsuit : lawsuit
        ),
        selectedLawsuit: updatedLawsuit,
        loading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || "Bir hata oluştu",
        loading: false,
      });
    }
  },
  createLawsuit: async (applicationId, formData) => {
    set({ loading: true, error: null }); // Yüklenme durumunu başlat
    try {
      const response = await axios.post(
        `${apiUrl}/lawsuittracking/${applicationId}`,
        formData,
        {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        }
      );
  
      const newLawsuit = response.data.lawsuit;
  
      set((state) => ({
        lawsuits: [...state.lawsuits, newLawsuit],
        loading: false,
      }));
    } catch (error) {
      set({
        error:
          error.response?.data?.message ||
          "Dava oluşturulurken bir hata oluştu",
        loading: false,
      });
    }
  },
  updateLawsuitArchiveStatus: async (lawsuitId, archiveStatus) => {
    set({ loading: true, error: null }); // Yüklenme durumunu başlat
    try {
      const response = await axios.put(
        `${apiUrl}/lawsuittracking/${lawsuitId}/archive`,
        { archive: archiveStatus }, // Gönderilecek body
        { withCredentials: true } // Kimlik doğrulama bilgilerini ekle
      );
  
      const updatedLawsuit = response.data.lawsuit;
  
      set((state) => ({
        lawsuits: state.lawsuits.map((lawsuit) =>
          lawsuit._id === updatedLawsuit._id ? updatedLawsuit : lawsuit
        ),
        loading: false,
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || "Arşiv durumu güncellenirken bir hata oluştu",
        loading: false,
      });
    }
  },

}));

export default useLawsuitListPageStore;
