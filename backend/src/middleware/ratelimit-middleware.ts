import rateLimit from 'express-rate-limit';

export const resetPasswordLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 dakika
  max: 5, // Maksimum 5 istek
  message: {
    message: "Çok fazla şifre sıfırlama isteği gönderildi. Lütfen 15 dakika sonra tekrar deneyin.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});
