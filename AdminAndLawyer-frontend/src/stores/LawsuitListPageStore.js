import { create } from 'zustand';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_BE_URL; // API URL'sini .env dosyasından alın

const useLawsuitListPageStore = create((set) => ({
  lawsuits: [], // Davaların listesi
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
}));

export default useLawsuitListPageStore;
