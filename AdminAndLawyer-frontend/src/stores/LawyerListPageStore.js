import { create } from "zustand";
import axiosInstance from './axiosInstance';

const apiUrl = import.meta.env.VITE_BE_URL;

const useLawyerListPageStore = create((set) => ({
  // State tanımlamaları
  lawyers: [], // Avukatların listesi
  loading: false, // Yüklenme durumu
  error: null, // Hata durumu

  // Avukat oluşturma fonksiyonu
  createLawyer: async (lawyerData) => {
    set({ loading: true, error: null }); // Yüklenme durumunu başlat
    try {
      const response = await axiosInstance.post(`${apiUrl}/lawyer`, lawyerData); // POST isteği
      const newLawyer = response.data.user; // API'den dönen kullanıcı
      set((state) => ({
        lawyers: [...state.lawyers, newLawyer], // Yeni avukatı listeye ekle
        loading: false, // Yüklenme durumunu kapat
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || "Bir hata oluştu", // Hata mesajı
        loading: false, // Yüklenme durumunu kapat
      });
    }
  },

  // Avukatları getirme fonksiyonu
  fetchLawyers: async () => {
    set({ loading: true, error: null }); // Yüklenme durumunu başlat
    try {
      const response = await axiosInstance.get(`${apiUrl}/lawyer`); // GET isteği
      const lawyers = response.data.lawyers; // API'den dönen avukat listesi
      set({ lawyers, loading: false }); // Avukatları state'e kaydet ve yüklenme durumunu kapat
    } catch (error) {
      set({
        error: error.response?.data?.message || "Bir hata oluştu", // Hata mesajı
        loading: false, // Yüklenme durumunu kapat
      });
    }
  },
  deleteLawyer: async (id) => {
    set({ loading: true, error: null }); // Yüklenme durumunu başlat
    try {
      await axiosInstance.delete(`${apiUrl}/lawyer/${id}`); // DELETE isteği
      set((state) => ({
        lawyers: state.lawyers.filter((lawyer) => lawyer.id !== id), // State'teki listeyi güncelle
        loading: false, // Yüklenme durumunu kapat
      }));
    } catch (error) {
      set({
        error: error.response?.data?.message || "Bir hata oluştu", // Hata mesajı
        loading: false, // Yüklenme durumunu kapat
      });
    }
  },
  fetchLawyerById: async (id) => {
    set({ loading: true, error: null }); // Yüklenme durumunu başlat
    try {
      const response = await axiosInstance.get(`${apiUrl}/lawyer/${id}`); // GET isteği
      const lawyer = response.data.lawyer; // API'den dönen tek avukatın bilgisi
      set({ selectedLawyer: lawyer, loading: false }); // Avukat bilgilerini state'e kaydet ve yüklenme durumunu kapat
    } catch (error) {
      set({
        error: error.response?.data?.message || "Bir hata oluştu", // Hata mesajı
        loading: false, // Yüklenme durumunu kapat
      });
    }
  },
}));

export default useLawyerListPageStore;
