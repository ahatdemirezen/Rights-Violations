import { Request, Response } from 'express';
import { sendPasswordChangedEmail, sendPasswordResetEmail } from '../services/email-service';
import { UserModel } from '../models/user-model';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import zxcvbn from 'zxcvbn';
import logger from '../../utils/logger';


// Şifre gücü kontrol fonksiyonu
const validatePasswordStrength = (password: string) => {
    const result = zxcvbn(password);
    if (result.score < 3) {
      throw new Error("Şifre çok zayıf. Daha güçlü bir şifre deneyin.");
    }
  };

// Şifre sıfırlama isteği
export const requestPasswordReset = async (req: Request, res: Response): Promise<void> => {
    const { email } = req.body;
  
    try {
      const user = await UserModel.findOne({ email });
      if (!user) {
        logger.warn(`Şifre sıfırlama isteği: E-posta bulunamadı - ${email}`);
        res.status(200).json({ message: "Eğer bu e-posta adresi sistemimizde kayıtlıysa, bir şifre sıfırlama bağlantısı gönderdik." });
        return;
      }
  
        // JWT token oluşturma (15 dakika geçerli)
    const token = jwt.sign(
        { userId: user._id }, 
        process.env.JWT_SECRET || 'your-secret-key', 
        { expiresIn: '15m' } // 15 dakika
      );
  
      // Reset link'i oluştur
      const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
      await sendPasswordResetEmail(email, resetLink);
  
      logger.info(`Şifre sıfırlama bağlantısı gönderildi: E-posta - ${email}`);
      res.status(200).json({ message: "Şifre sıfırlama e-postası gönderildi." });
    } catch (error) {
      console.error(error);
      logger.error('Şifre sıfırlama isteği sırasında bir hata oluştu:', error);
      res.status(500).json({ message: "Şifre sıfırlama isteği sırasında bir hata oluştu." });
    }
  };

// Şifre sıfırlama işlemi
export const resetPassword = async (req: Request, res: Response): Promise<void> => {
  const { token, newPassword } = req.body;

  try {
    // Token doğrulama
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'your-secret-key') as { userId: string };
    const user = await UserModel.findById(decoded.userId);
    if (!user) {
      res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
      return;
    }

     // Şifre gücü kontrolü
     try {
        validatePasswordStrength(newPassword);
      } catch (error) {
        res.status(400).json({message: 'Şifre çok zayıf. Daha güçlü bir şifre deneyin.'});
        return;
      }

    const hashedPassword = await bcrypt.hash(newPassword, 10);


     // Kullanıcının eski şifresini kontrol et 
     if (await bcrypt.compare(newPassword, user.password)) {
        res.status(400).json({ message: "Yeni şifre eski şifreyle aynı olamaz." });
        return;
      }

     // Şifreyi güncelle ve kaydet
    user.password = hashedPassword;
    await user.save();


    if (!user.email) {
        res.status(500).json({ message: "Kullanıcı e-posta adresi bulunamadı." });
        return;
      }
      
      // E-posta gönderimi
      await sendPasswordChangedEmail(user.email);
      

    // Log kaydı
    logger.info(`Şifre değiştirildi: Kullanıcı ID - ${user._id}`);
    res.status(200).json({ message: 'Şifre başarıyla sıfırlandı.' });
  } catch (error) {
    console.error(error);
    res.status(400).json({ message: 'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.' });
  }
};