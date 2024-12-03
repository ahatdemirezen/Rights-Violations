import { useAuthStore } from '../stores/LoginStore'; // Store'u içe aktarıyoruz
import { Navigate } from 'react-router-dom';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated } = useAuthStore(); // State'den isAuthenticated değerini alıyoruz

  if (!isAuthenticated) {
    return <Navigate to="/login" />; // Eğer giriş yapılmamışsa login sayfasına yönlendir
  }

  return children; // Eğer giriş yapılmışsa korunan bileşeni render et
};

export default ProtectedRoute;