"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPassword = exports.requestPasswordReset = void 0;
const email_service_1 = require("../services/email-service");
const user_model_1 = require("../models/user-model");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const zxcvbn_1 = __importDefault(require("zxcvbn"));
const logger_1 = __importDefault(require("../../utils/logger"));
// Şifre gücü kontrol fonksiyonu
const validatePasswordStrength = (password) => {
    const result = (0, zxcvbn_1.default)(password);
    if (result.score < 3) {
        throw new Error("Şifre çok zayıf. Daha güçlü bir şifre deneyin.");
    }
};
// Şifre sıfırlama isteği
const requestPasswordReset = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { email } = req.body;
    try {
        const user = yield user_model_1.UserModel.findOne({ email });
        if (!user) {
            logger_1.default.warn(`Şifre sıfırlama isteği: E-posta bulunamadı - ${email}`);
            res.status(200).json({ message: "Eğer bu e-posta adresi sistemimizde kayıtlıysa, bir şifre sıfırlama bağlantısı gönderdik." });
            return;
        }
        // JWT token oluşturma (15 dakika geçerli)
        const token = jsonwebtoken_1.default.sign({ userId: user._id }, process.env.JWT_SECRET || 'your-secret-key', { expiresIn: '15m' } // 15 dakika
        );
        // Reset link'i oluştur
        const resetLink = `${process.env.FRONTEND_URL}/reset-password?token=${token}`;
        yield (0, email_service_1.sendPasswordResetEmail)(email, resetLink);
        logger_1.default.info(`Şifre sıfırlama bağlantısı gönderildi: E-posta - ${email}`);
        res.status(200).json({ message: "Şifre sıfırlama e-postası gönderildi." });
    }
    catch (error) {
        console.error(error);
        logger_1.default.error('Şifre sıfırlama isteği sırasında bir hata oluştu:', error);
        res.status(500).json({ message: "Şifre sıfırlama isteği sırasında bir hata oluştu." });
    }
});
exports.requestPasswordReset = requestPasswordReset;
// Şifre sıfırlama işlemi
const resetPassword = (req, res) => __awaiter(void 0, void 0, void 0, function* () {
    const { token, newPassword } = req.body;
    try {
        // Token doğrulama
        const decoded = jsonwebtoken_1.default.verify(token, process.env.JWT_SECRET || 'your-secret-key');
        const user = yield user_model_1.UserModel.findById(decoded.userId);
        if (!user) {
            res.status(404).json({ message: 'Kullanıcı bulunamadı.' });
            return;
        }
        // Şifre gücü kontrolü
        try {
            validatePasswordStrength(newPassword);
        }
        catch (error) {
            res.status(400).json({ message: 'Şifre çok zayıf. Daha güçlü bir şifre deneyin.' });
            return;
        }
        const hashedPassword = yield bcryptjs_1.default.hash(newPassword, 10);
        // Kullanıcının eski şifresini kontrol et 
        if (yield bcryptjs_1.default.compare(newPassword, user.password)) {
            res.status(400).json({ message: "Yeni şifre eski şifreyle aynı olamaz." });
            return;
        }
        // Şifreyi güncelle ve kaydet
        user.password = hashedPassword;
        yield user.save();
        if (!user.email) {
            res.status(500).json({ message: "Kullanıcı e-posta adresi bulunamadı." });
            return;
        }
        // E-posta gönderimi
        yield (0, email_service_1.sendPasswordChangedEmail)(user.email);
        // Log kaydı
        logger_1.default.info(`Şifre değiştirildi: Kullanıcı ID - ${user._id}`);
        res.status(200).json({ message: 'Şifre başarıyla sıfırlandı.' });
    }
    catch (error) {
        console.error(error);
        res.status(400).json({ message: 'Şifre sıfırlama bağlantısı geçersiz veya süresi dolmuş.' });
    }
});
exports.resetPassword = resetPassword;
