import { create } from "zustand";
import axiosInstance from "./axiosInstance";

// API URL'sini çevresel değişkenlerden alın
const apiUrl = import.meta.env.VITE_BE_URL;

const useLawsuitListForLawyerStore = create((set) => ({
  lawsuits: [], // Davaların listesi
  selectedLawsuit: null, // Tek bir dava bilgisi
  loading: false, // Yüklenme durumu
  error: null, // Hata mesajı
  calendarEvents: [], // Takvim etkinlikleri
  loading: false,
  error: null,
  // Davaları getirme fonksiyonu
  fetchLawsuits: async () => {
    set({ loading: true, error: null }); // Yüklenme durumunu başlat

    try {
      const response = await axiosInstance.get(`${apiUrl}/lawyer-lawsuits`, {
        withCredentials: true, // Kimlik doğrulama bilgilerini gönder
      });
      set({ lawsuits: response.data.data, loading: false }); // Gelen davaları state'e ata
    } catch (err) {
      set({
        error:
          err.response?.data?.message || "An error occurred while fetching lawsuits",
        loading: false,
      });
    }
  },
  // Tek bir davayı getirme fonksiyonu
  fetchLawsuitById: async (lawsuitId) => {
    set({ loading: true, error: null }); // Yüklenme durumunu başlat
    try {
      const response = await axiosInstance.get(`${apiUrl}/lawyer-lawsuits/${lawsuitId}`); // GET isteği
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
      const response = await axiosInstance.put(`${apiUrl}/lawyer-lawsuits/${lawsuitId}`, formData, {
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
  // Takvim etkinliklerini getir
  fetchCalendarEvents: async () => {
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`${apiUrl}/lawyer-lawsuits/calendar`);
      console.log("API'den gelen veriler:", response.data.events); // Gelen verileri kontrol edin
  
      // `formattedEvents` değişkenini tanımlayın
      const formattedEvents = response.data.events.map((event) => ({
        ...event,
      
        start: new Date(event.start), // Tarihi doğru formata çevir
        end: new Date(event.end), // Tarihi doğru formata çevir
      }));
  
      console.log("Formatlanmış eventler:", formattedEvents); // Formatlanmış verileri kontrol edin
  
      set({ calendarEvents: formattedEvents, loading: false });
    } catch (err) {
      set({
        error: err.response?.data?.message || "Takvim verileri alınırken bir hata oluştu.",
        loading: false,
      });
    }
  },
  
}));

export default useLawsuitListForLawyerStore;
