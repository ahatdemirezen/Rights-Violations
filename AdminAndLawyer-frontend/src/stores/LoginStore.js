import { create } from 'zustand';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_BE_URL;

export const useAuthStore = create((set) => ({
  token: null,
  isAuthenticated: localStorage.getItem("auth") === "true",
  error: null,
  userRole: null, // Kullanıcı rolü için state
  userName: null, // Kullanıcı adı için state

  login: async (name, password) => {
    try {
      const response = await axios.post(`${apiUrl}/login`, { name, password }, { withCredentials: true });

      if (response) {
        localStorage.setItem("auth", true);
      }

      // Kullanıcı verisini state'e kaydet
      set({
        isAuthenticated: true,
        error: null,
        userRole: response.data.role, // Backend'den gelen role bilgisini kaydedin
        userName: response.data.name, // Backend'den gelen name bilgisini kaydedin
      });

      console.log("Set Role in Zustand:", response.data.role);
      console.log("Set Name in Zustand:", response.data.name);

    } catch (error) {
      const errorMessage = error.response && error.response.data.message 
        ? error.response.data.message 
        : 'An unexpected error occurred. Please try again.';
      
      // Hata durumunda kullanıcıya gösterilecek mesajı state'e kaydedin
      set({
        token: null,
        isAuthenticated: false,
        error: errorMessage,
        userRole: null, // Hata varsa rol bilgisini sıfırla
        userName: null, // Hata varsa name bilgisini sıfırla
      });
    }
  },

  refreshToken: async () => {
    try {
      const response = await axios.get(`${apiUrl}/login/refresh-token`, { withCredentials: true });
      
      if (response.status === 200) {
        set({
          isAuthenticated: true,
          error: null,
        });
      }
    } catch (error) {
      set({
        token: null,
        isAuthenticated: false,
        error: "Failed to refresh access token",
      });
      await useAuthStore.getState().logout(); // Refresh token geçersizse kullanıcıyı çıkış yaptır
    }
  },

  logout: async () => {
    try {
      await axios.post(`${apiUrl}/login/logout`, {}, { withCredentials: true });

      localStorage.removeItem("auth");

      set({
        isAuthenticated: false,
        error: null,
        userRole: null, // Çıkış yapıldığında rol bilgisini sıfırla
        userName: null, // Çıkış yapıldığında name bilgisini sıfırla
      });
    } catch (error) {
      set({
        error: "Logout failed. Please try again.",
      });
    }
  },
}));
