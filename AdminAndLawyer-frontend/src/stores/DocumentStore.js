import { create } from "zustand";
import axiosInstance from "../stores/axiosInstance";

const apiUrl = import.meta.env.VITE_BE_URL;

const useDocumentStore = create((set, get) => ({
  documents: [],
  loading: false,
  error: null,
  currentPage: 1,
  totalPages: 1,
  limit: 16,

  setPage: (page) => set({ currentPage: page }),
  setLimit: (limit) => set({ limit }),

  fetchDocuments: async () => {
    const { currentPage, limit } = get();
    set({ loading: true, error: null });
    try {
      const response = await axiosInstance.get(`${apiUrl}/documents`, {
        params: { page: currentPage, limit },
      });
      const { documents, pagination } = response.data;
      set({
        documents,
        totalPages: pagination.totalPages,
        currentPage: pagination.currentPage,
        loading: false,
      });
    } catch (error) {
      set({
        error: error.response?.data?.message || "Dökümanlar alınırken bir hata oluştu.",
        loading: false,
      });
    }
  },
}));

export default useDocumentStore;
