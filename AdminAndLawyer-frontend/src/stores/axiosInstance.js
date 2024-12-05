// axiosInstance.js veya axiosConfig.js
import axios from 'axios';
import { useAuthStore } from './LoginStore';

// For Extra Security

const apiUrl = import.meta.env.VITE_BE_URL; // Base URL'niz varsa buraya ekleyin
// Axios instance oluşturun
const axiosInstance = axios.create({
  baseURL: apiUrl, // Tüm istekler için temel URL
  withCredentials: true, // Çerezlerle çalışmak için
});

// Interceptor tanımlıyoruz
axiosInstance.interceptors.response.use(
  (response) => {
    // Başarılı yanıtları olduğu gibi döndür
    return response;
  },
  async (error) => {
    const originalRequest = error.config;
//free commit
    // Eğer 401 döndüyse ve bu istek bir refresh değilse
    if (error.response?.status === 401 && !originalRequest._retry) {
      const authStore = useAuthStore.getState();
      originalRequest._retry = true; // Aynı isteğin tekrar yapılmasını engellemek için flag

      try {
        // Refresh token işlemini yap
        await authStore.refreshToken();

        // Yeni token ile Authorization header'ı güncelle
        originalRequest.headers['Authorization'] = `Bearer ${authStore.token}`;

        // İsteği yeniden gönder
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error("Token yenileme başarısız:", refreshError);
        authStore.logout(); // Refresh başarısızsa çıkış yap
      }
    }

    // Başka bir hata veya 401'e rağmen yenileme başarısızsa hatayı geri döndür
    return Promise.reject(error);
  }
);


export default axiosInstance;
