import { create } from "zustand";
import axiosInstance from "../stores/axiosInstance";

const apiUrl = import.meta.env.VITE_BE_URL; // .env dosyasından API URL'si alınır

const useDocumentStore = create((set) => ({
  documents: [], // Tüm dökümanları tutan state
  loading: false, // Yüklenme durumu
  error: null, // Hata durumu

  // Tüm dökümanları getiren fonksiyon
  fetchDocuments: async () => {
    set({ loading: true, error: null }); // Yüklenme durumunu başlat
    try {
      const response = await axiosInstance.get(`${apiUrl}/documents`); // GET isteği
      const documents = response.data.documents; // API'den dönen dökümanlar
      set({ documents, loading: false }); // Dökümanları state'e kaydet ve yüklenme durumunu kapat
    } catch (error) {
      set({
        error: error.response?.data?.message || "Dökümanlar alınırken bir hata oluştu.", // Hata mesajı
        loading: false, // Yüklenme durumunu kapat
      });
    }
  },
}));

export default useDocumentStore;
