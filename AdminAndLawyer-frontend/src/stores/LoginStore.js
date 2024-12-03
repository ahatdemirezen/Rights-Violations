import { create } from 'zustand';
import axios from 'axios';

const apiUrl = import.meta.env.VITE_BE_URL;

export const useAuthStore = create((set) => ({
  token: null,
  isAuthenticated: localStorage.getItem("auth") === "true",
  error: null,
  
  login: async (email, password) => {
    try {
      const response = await axios.post(`${apiUrl}/login`, { email, password }, { withCredentials: true });

      if (response) {
        localStorage.setItem("auth", true);
      }
      
      set({
        isAuthenticated: true,
        error: null,
      });
    } catch (error) {
      set({
        token: null,
        isAuthenticated: false,
        error: error.response ? error.response.data.message : 'An error occurred',
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
      });
    } catch (error) {
      set({
        error: "Logout failed. Please try again.",
      });
    }
  },
}));
