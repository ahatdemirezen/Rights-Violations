import express from 'express';
import { requestPasswordReset, resetPassword } from '../controllers/auth-controller';
import { resetPasswordLimiter } from '../middleware/ratelimit-middleware'; // Middleware ayrı dosyada olabilir.

const router = express.Router();

// Şifre sıfırlama isteği için route
router.post('/forgot-password',resetPasswordLimiter, requestPasswordReset);

// Şifre sıfırlama işlemi için route
router.put('/reset-password', resetPassword);

export default router;
